#!/usr/bin/env python3
"""TZ-MIG-304: PATCH Counterparty.email for 10 KP3 CPs with email.

Transport: REST (same as MIG-302) when MCP offline. No wipe/deploy.
"""
from __future__ import annotations

import json
import pathlib
import re
import time
import urllib.error
import urllib.request
from typing import Any

ROOT = pathlib.Path(r"D:\kppdf-8.0")
RAW = ROOT / "data" / "from-kp3" / "raw" / "counterparties.json"
OUT_MAP = ROOT / "data" / "from-kp3" / "id-map.json"
REPORT = ROOT / "docs" / "audits" / "2026-08-12-kp3-cp-email-person-report.md"
BASE = "http://192.168.1.103:3000"


def load_admin_password() -> str:
    cfg: dict[str, str] = {}
    for line in (ROOT / "deploy" / "synology" / "config.env").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        cfg[k] = v
    return cfg["ADMIN_PASSWORD"]


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
    st, res = api("POST", "/api/auth/login", "", {"email": "admin@kppdf.ru", "password": load_admin_password()})
    if st != 200 or not isinstance(res, dict):
        raise RuntimeError(f"login failed {st} {res}")
    token = res.get("accessToken") or res.get("token")
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


def main() -> None:
    cps = json.loads(RAW.read_text(encoding="utf-8"))
    id_map = json.loads(OUT_MAP.read_text(encoding="utf-8"))
    cp_map: dict[str, str] = id_map.get("counterparties") or {}

    with_email = [c for c in cps if (c.get("email") or "").strip()]
    print(f"KP3 CP with email: {len(with_email)}")

    try:
        token = login()
    except Exception as e:
        print("BLOCKED login:", e)
        write_report([], blocked=str(e))
        return

    rows: list[dict[str, Any]] = []
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
            row["personNote"] = "CP не найден в SoT (нет id-map и search по ИНН)"
            rows.append(row)
            continue

        row["cpId"] = cp_id
        st, res = api("PATCH", f"/api/counterparties/{cp_id}", token, {"email": email})
        if st in (200, 201) and isinstance(res, dict):
            row["status"] = "ok"
            maybe_patch_person(token, res, email, row)
        else:
            row["status"] = f"fail {st}"
            row["personNote"] = str(res)[:200]
        rows.append(row)
        print(row["status"], inn, email, cp_id)

    write_report(rows, blocked=None)


def write_report(rows: list[dict[str, Any]], blocked: str | None) -> None:
    ok = sum(1 for r in rows if r.get("status") == "ok")
    lines = [
        "# KP3 → KP8 counterparty email load (MIG-304)",
        "",
        f"> Generated: 2026-08-17 · transport: REST `{BASE}` · MCP: offline",
        "",
    ]
    if blocked:
        lines += [
            f"**Load BLOCKED:** {blocked}",
            "",
            "Schema + UI shipped; re-run `_mig304_cp_email_load.py` when SoT is up.",
            "",
        ]
    lines += [
        f"**Summary:** {ok}/{len(rows)} emails written to Counterparty.email",
        "",
        "| inn | name | email | cpId | person | status |",
        "|-----|------|-------|------|--------|--------|",
    ]
    for r in rows:
        lines.append(
            f"| {r.get('inn','')} | {r.get('name','')[:40]} | {r.get('email','')} "
            f"| {r.get('cpId') or '—'} | {r.get('personNote') or r.get('personId') or '—'} | {r.get('status')} |"
        )
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("WROTE", REPORT, "ok=", ok)


if __name__ == "__main__":
    main()
