#!/usr/bin/env python3
"""TZ-MIG-304/307: PATCH Counterparty.email for 10 KP3 CPs with email.

Transport: prod first (kppdf-crm.ru), then LAN fallback. Probe persist before bulk.
No wipe/deploy.
"""
from __future__ import annotations

import json
import pathlib
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any

ROOT = pathlib.Path(r"D:\kppdf-8.0")
RAW = ROOT / "data" / "from-kp3" / "raw" / "counterparties.json"
OUT_MAP = ROOT / "data" / "from-kp3" / "id-map.json"
REPORT = ROOT / "docs" / "audits" / "2026-08-12-kp3-cp-email-person-report.md"

PROD_BASE = "https://kppdf-crm.ru"
LAN_BASE = "http://192.168.1.103:3000"
BASE = PROD_BASE
MIG307 = True  # prod-first + probe gate


def load_admin_password() -> str:
    cfg: dict[str, str] = {}
    for line in (ROOT / "deploy" / "synology" / "config.env").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        cfg[k] = v
    return cfg["ADMIN_PASSWORD"]


def ping_health(base: str, timeout: float = 15) -> bool:
    url = f"{base}/api/health"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"}, method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except Exception:
        return False


def pick_base() -> tuple[str, str | None]:
    """Return (base_url, blocked_reason). blocked_reason set if neither reachable."""
    if ping_health(PROD_BASE):
        return PROD_BASE, None
    if ping_health(LAN_BASE, timeout=20):
        return LAN_BASE, None
    return PROD_BASE, (
        f"SoT unreachable — health failed on `{PROD_BASE}` and `{LAN_BASE}`"
    )


def api(method: str, path: str, token: str, body: Any | None = None, retries: int = 6) -> tuple[int, Any]:
    url = f"{BASE}{path}"
    data = None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
    headers = {"Accept": "application/json", "X-Access-Token": token}
    if data is not None:
        headers["Content-Type"] = "application/json"
    attempt = 0
    while True:
        attempt += 1
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                raw = resp.read().decode("utf-8")
                time.sleep(0.1)
                return resp.status, (json.loads(raw) if raw else None)
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", errors="replace")
            try:
                parsed = json.loads(err)
            except Exception:
                parsed = err[:500]
            if e.code == 429 and attempt < retries:
                time.sleep(min(2 ** attempt, 15))
                continue
            return e.code, parsed
        except Exception as e:
            if attempt < retries:
                time.sleep(min(2 ** attempt, 10))
                continue
            return 0, str(e)


def login() -> str:
    pw = load_admin_password()
    st, res = api("POST", "/api/auth/login", "", {"username": "admin", "password": pw})
    if st != 200 or not isinstance(res, dict):
        raise RuntimeError(f"login failed {st} {res}")
    token = res.get("access") or res.get("accessToken") or res.get("token")
    if not token:
        raise RuntimeError("no token in login response")
    return str(token)


def norm_email(value: str) -> str:
    return value.strip().lower()


def find_cp_by_inn(token: str, inn: str) -> str | None:
    st, res = api("GET", f"/api/counterparties?search={inn}&limit=50", token)
    if st != 200 or not isinstance(res, dict):
        return None
    for item in res.get("items") or []:
        if str(item.get("inn", "")).strip() == inn:
            return str(item.get("_id") or item.get("id"))
    return None


def maybe_patch_person(token: str, cp: dict[str, Any], email: str, row: dict[str, Any]) -> None:
    person_id = cp.get("contactPersonId")
    if not person_id:
        row["personNote"] = "только фирма"
        return
    pid = str(person_id)
    st, person = api("GET", f"/api/persons/{pid}", token)
    if st != 200 or not isinstance(person, dict):
        row["personNote"] = f"person {pid} unreadable ({st})"
        return
    if (person.get("email") or "").strip():
        row["personId"] = pid
        row["personNote"] = "person уже с email — не затирали"
        return
    pst, pres = api("PATCH", f"/api/persons/{pid}", token, {"email": email})
    row["personId"] = pid
    row["personNote"] = "person email дополнен" if pst in (200, 201) else f"person PATCH fail {pst} {pres}"


def probe_email_persist(token: str, cp_id: str, probe_email: str) -> tuple[bool, str]:
    """PATCH probe email, GET back. Return (persisted, note)."""
    tag = f"__mig307_probe_{int(time.time())}@probe.kppdf.local"
    pst, pres = api("PATCH", f"/api/counterparties/{cp_id}", token, {"email": tag})
    if pst not in (200, 201):
        detail = pres.get("message") if isinstance(pres, dict) else str(pres)[:200]
        if pst == 400 and "email should not exist" in str(detail).lower():
            return False, f"property email rejected by prod DTO ({detail}) — нужен кати BE da01f1e5"
        return False, f"probe PATCH failed {pst}: {detail}"
    gst, got = api("GET", f"/api/counterparties/{cp_id}", token)
    if gst != 200 or not isinstance(got, dict):
        return False, f"probe GET failed {gst}"
    returned = norm_email(str(got.get("email") or ""))
    if returned != norm_email(tag):
        return False, f"email not persisted (got {got.get('email')!r}, need deploy ≥ da01f1e5)"
    # restore original if probe used a real target
    if probe_email:
        api("PATCH", f"/api/counterparties/{cp_id}", token, {"email": probe_email})
    else:
        api("PATCH", f"/api/counterparties/{cp_id}", token, {"email": ""})
    return True, "probe ok"


def write_report(
    rows: list[dict[str, Any]],
    blocked: str | None,
    *,
    task: str = "MIG-307",
    probe_note: str | None = None,
) -> None:
    ok = sum(1 for r in rows if r.get("status") == "ok")
    skipped = sum(1 for r in rows if r.get("status") == "skipped")
    target = sum(1 for r in rows if r.get("status") != "skipped")
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        f"# KP3 → KP8 counterparty email load ({task})",
        "",
        f"> Generated: {ts} · transport: REST `{BASE}` · MCP: offline",
        "",
    ]
    if blocked:
        lines += [
            f"**Load BLOCKED:** {blocked}",
            "",
        ]
        if "da01f1e5" in blocked or (probe_note and "da01f1e5" in probe_note):
            lines += [
                "Schema + UI in git (`da01f1e5`); prod needs warm deploy before load.",
                "",
            ]
        else:
            lines += [
                "Schema + UI shipped; re-run `_mig304_cp_email_load.py` when SoT is up.",
                "",
            ]
    if probe_note:
        lines += [f"**Probe:** {probe_note}", ""]
    lines += [
        f"**Summary:** {ok}/{target} CP emails written ({skipped} skipped isOurCompany)",
        "",
        "| inn | name | email | cpId | person | status |",
        "|-----|------|-------|------|--------|--------|",
    ]
    for r in rows:
        lines.append(
            f"| {r.get('inn','')} | {r.get('name','')[:40]} | {r.get('email','')} "
            f"| {r.get('cpId') or '—'} | {r.get('personNote') or r.get('personId') or '—'} | {r.get('status')} |"
        )
    lines += [
        "",
        "Notes:",
        "- 5 CP have id-map from MIG-302; others resolve via INN search.",
        "- 1 row (`2310181417`) is `isOurCompany` — email belongs to Organization, not Counterparty.",
        "- Person.email backfill only when `contactPersonId` set and Person.email empty.",
    ]
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("WROTE", REPORT, "ok=", ok)


def main() -> None:
    global BASE

    cps = json.loads(RAW.read_text(encoding="utf-8"))
    id_map = json.loads(OUT_MAP.read_text(encoding="utf-8"))
    cp_map: dict[str, str] = id_map.get("counterparties") or {}

    with_email = [c for c in cps if (c.get("email") or "").strip()]
    print(f"KP3 CP with email: {len(with_email)}")

    base, health_blocked = pick_base()
    BASE = base
    print("BASE", BASE)

    if health_blocked:
        print("BLOCKED health:", health_blocked)
        write_report([], blocked=health_blocked)
        return

    try:
        token = login()
    except Exception as e:
        print("BLOCKED login:", e)
        write_report([], blocked=str(e))
        return

    # Build row plan (resolve CP ids first)
    rows: list[dict[str, Any]] = []
    loadable: list[tuple[dict[str, Any], dict[str, Any], str]] = []

    for src in with_email:
        kid = str(src.get("_id"))
        inn = (src.get("inn") or "").strip()
        email = norm_email(str(src.get("email")))
        name = src.get("name") or ""
        row: dict[str, Any] = {
            "kp3Id": kid,
            "inn": inn,
            "name": name,
            "email": email,
            "cpId": None,
            "status": "pending",
            "personNote": "",
        }
        if src.get("isOurCompany"):
            row["status"] = "skipped"
            row["personNote"] = "isOurCompany — не Counterparty"
            rows.append(row)
            continue

        cp_id = cp_map.get(kid) or find_cp_by_inn(token, inn)
        if not cp_id:
            row["status"] = "no_cp"
            row["personNote"] = "CP не найден в SoT"
            rows.append(row)
            continue

        row["cpId"] = cp_id
        loadable.append((src, row, cp_id))
        rows.append(row)

    if not loadable:
        write_report(rows, blocked="no loadable CP rows")
        return

    # Probe persist on first loadable CP
    probe_src, probe_row, probe_cp_id = loadable[0]
    probe_email = norm_email(str(probe_src.get("email")))
    persisted, probe_note = probe_email_persist(token, probe_cp_id, "")
    print("PROBE", persisted, probe_note)

    if not persisted:
        blocked = f"нужен кати BE `da01f1e5` — {probe_note}"
        for r in rows:
            if r.get("status") == "pending":
                r["status"] = "BLOCKED"
        write_report(rows, blocked=blocked, probe_note=probe_note)
        return

    # Bulk load (idempotent)
    for src, row, cp_id in loadable:
        email = norm_email(str(src.get("email")))
        gst, existing = api("GET", f"/api/counterparties/{cp_id}", token)
        if gst == 200 and isinstance(existing, dict):
            current = norm_email(str(existing.get("email") or ""))
            if current == email:
                row["status"] = "ok"
                row["personNote"] = "already set — skip"
                print("skip", row["inn"], email)
                continue

        st, res = api("PATCH", f"/api/counterparties/{cp_id}", token, {"email": email})
        if st in (200, 201) and isinstance(res, dict):
            got = norm_email(str(res.get("email") or ""))
            if got == email:
                row["status"] = "ok"
                maybe_patch_person(token, res, email, row)
            else:
                row["status"] = "BLOCKED"
                row["personNote"] = f"PATCH ok but email stripped (got {res.get('email')!r})"
        else:
            row["status"] = f"fail {st}"
            row["personNote"] = str(res)[:200]
        print(row["status"], row["inn"], email, cp_id)

    write_report(rows, blocked=None, probe_note=probe_note)


if __name__ == "__main__":
    main()
