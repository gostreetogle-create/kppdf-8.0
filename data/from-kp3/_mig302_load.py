#!/usr/bin/env python3
"""TZ-MIG-302 scoped load: KP3 staging → Synology SoT (LAN = prod Mongo).

Cursor user-kppdf MCP discovery is down; Desktop config pointed at 127.0.0.1:3000.
This script uses the same REST endpoints MCP tools wrap, against LAN
http://192.168.1.103:3000 (wipe+seed SoT behind kppdf-crm.ru).

Scope: categories → counterparties (no email/photo; skip isOurCompany) →
products (no photoIds) → quotation drafts. No wipe/deploy.
"""
from __future__ import annotations

import json
import pathlib
import re
import time
import urllib.error
import urllib.request
from collections import Counter
from typing import Any

ROOT = pathlib.Path(r"D:\kppdf-8.0")
RAW = ROOT / "data" / "from-kp3" / "raw"
OUT_MAP = ROOT / "data" / "from-kp3" / "id-map.json"
REPORT = ROOT / "docs" / "audits" / "2026-08-12-kp3-mcp-load-report.md"
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


def api(method: str, path: str, token: str, body: Any | None = None, retries: int = 8) -> tuple[int, Any]:
    url = f"{BASE}{path}"
    data = None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
    headers = {
        "Accept": "application/json",
        "X-Access-Token": token,
    }
    if data is not None:
        headers["Content-Type"] = "application/json"
    attempt = 0
    while True:
        attempt += 1
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read().decode("utf-8")
                # gentle pacing to avoid throttler
                time.sleep(0.12)
                return resp.status, (json.loads(raw) if raw else None)
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", errors="replace")
            try:
                parsed = json.loads(err)
            except Exception:
                parsed = err[:500]
            if e.code == 429 and attempt < retries:
                wait = min(2 ** attempt, 20)
                print(f"THROTTLE {method} {path} wait {wait}s (attempt {attempt})")
                time.sleep(wait)
                continue
            return e.code, parsed
        except Exception as e:
            if attempt < retries:
                time.sleep(min(2 ** attempt, 10))
                continue
            return 0, str(e)

def slugify(name: str) -> str:
    # Cyrillic → translit-ish slug: keep alnum, map spaces
    table = str.maketrans(
        {
            "а": "a",
            "б": "b",
            "в": "v",
            "г": "g",
            "д": "d",
            "е": "e",
            "ё": "e",
            "ж": "zh",
            "з": "z",
            "и": "i",
            "й": "y",
            "к": "k",
            "л": "l",
            "м": "m",
            "н": "n",
            "о": "o",
            "п": "p",
            "р": "r",
            "с": "s",
            "т": "t",
            "у": "u",
            "ф": "f",
            "х": "h",
            "ц": "ts",
            "ч": "ch",
            "ш": "sh",
            "щ": "sch",
            "ъ": "",
            "ы": "y",
            "ь": "",
            "э": "e",
            "ю": "yu",
            "я": "ya",
        }
    )
    s = name.lower().translate(table)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return (s or "cat")[:64]


def sku_prefix_from_name(name: str) -> str:
    letters = re.sub(r"[^A-Za-zА-Яа-я0-9]", "", name.upper())
    if not letters:
        return "PRD"
    # Prefer Latin; else take first 3 unicode letters and ascii-fallback
    latin = re.sub(r"[^A-Z0-9]", "", slugify(name).upper().replace("-", ""))
    if len(latin) >= 2:
        return latin[:6]
    return "PRD"


def norm_unit(u: str | None) -> str:
    if not u:
        return "шт"
    x = u.strip().lower().replace(".", "")
    mapping = {
        "шт": "шт",
        "шт ": "шт",
        "мп": "м.п.",
        "м/п": "м.п.",
        "метр": "м",
        "м": "м",
        "компл": "комплект",
        "комплект": "комплект",
        "комп": "комплект",
    }
    for k, v in mapping.items():
        if x.startswith(k):
            return v
    return u.strip()[:16] or "шт"


def legal_type(form: str | None) -> str:
    f = (form or "").upper()
    if "ООО" in f:
        return "ooo"
    if "ИП" in f:
        return "ip"
    if "ПАО" in f:
        return "pao"
    if re.search(r"\bАО\b", f) or f.startswith("АО"):
        return "ao"
    return "other"


def map_roles(roles: list[str] | None) -> list[str]:
    out: list[str] = []
    for r in roles or []:
        if r in ("client", "customer", "покупатель"):
            out.append("client")
        elif r in ("supplier", "поставщик"):
            out.append("supplier")
        # company / isOurCompany skipped at caller
    return list(dict.fromkeys(out)) or ["client"]


def main() -> None:
    products = json.loads((RAW / "products.json").read_text(encoding="utf-8"))
    cps = json.loads((RAW / "counterparties.json").read_text(encoding="utf-8"))
    kps = json.loads((RAW / "kps.json").read_text(encoding="utf-8"))

    id_map: dict[str, Any] = {
        "products": {},
        "counterparties": {},
        "kps": {},
        "categories": {},
        "organizationCandidates": [],
    }
    if OUT_MAP.exists():
        prev = json.loads(OUT_MAP.read_text(encoding="utf-8"))
        for k in ("products", "counterparties", "kps", "categories"):
            if isinstance(prev.get(k), dict):
                id_map[k].update(prev[k])
        if isinstance(prev.get("organizationCandidates"), list):
            id_map["organizationCandidates"] = prev["organizationCandidates"]
        print("RESUME id-map products", len(id_map["products"]), "cps", len(id_map["counterparties"]))

    pw = load_admin_password()
    token = None
    me: dict[str, Any] = {}
    for attempt in range(1, 10):
        req = urllib.request.Request(
            f"{BASE}/api/auth/login",
            data=json.dumps({"username": "admin", "password": pw}).encode(),
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                login = json.loads(resp.read().decode())
            token = login["access"]
            me = login.get("user") or {}
            break
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = min(2**attempt, 30)
                print(f"LOGIN_THROTTLE wait {wait}s")
                time.sleep(wait)
                continue
            raise
    if not token:
        raise SystemExit("FATAL: login failed")
    org_id = me.get("organizationId")
    print("LOGIN_OK", "org", org_id, "user", me.get("username"))

    if not org_id:
        st, orgs = api("GET", "/api/organizations?limit=5", token)
        items = orgs.get("items") if isinstance(orgs, dict) else orgs
        if isinstance(items, list) and items:
            org_id = items[0].get("id") or items[0].get("_id")
        print("ORG_FALLBACK", org_id)
    if not org_id or not re.fullmatch(r"[0-9a-fA-F]{24}", str(org_id)):
        raise SystemExit(f"FATAL: no valid organizationId ({org_id!r})")
    org_id = str(org_id)

    report: dict[str, Any] = {
        "target": BASE,
        "orgId": org_id,
        "categories": {"created": 0, "existing": 0, "failed": []},
        "counterparties": {"created": 0, "skipped": 0, "failed": []},
        "products": {"created": 0, "skipped": 0, "failed": []},
        "quotations": {"created": 0, "skipped": 0, "failed": []},
        "deferred": ["photoIds (TZD-47/MIG-303)", "Counterparty.email (MIG-304)", "branding (MIG-305 PARK)"],
        "samples": {},
    }

    # --- categories ---
    cat_names = sorted({(p.get("category") or "").strip() for p in products if (p.get("category") or "").strip()})
    st, cat_list = api("GET", "/api/categories?type=product&limit=200", token)
    existing = {}
    if isinstance(cat_list, dict):
        for c in cat_list.get("items") or cat_list.get("data") or []:
            existing[(c.get("name") or "").strip()] = c.get("id") or c.get("_id")
    elif isinstance(cat_list, list):
        for c in cat_list:
            existing[(c.get("name") or "").strip()] = c.get("id") or c.get("_id")

    cat_id_by_name: dict[str, str] = {}
    used_slugs: set[str] = set()
    for name in cat_names:
        if name in existing and existing[name]:
            cat_id_by_name[name] = str(existing[name])
            report["categories"]["existing"] += 1
            continue
        base_slug = slugify(name)
        slug = base_slug
        i = 2
        while slug in used_slugs:
            slug = f"{base_slug}-{i}"[:64]
            i += 1
        used_slugs.add(slug)
        prefix = sku_prefix_from_name(name)
        body = {"name": name, "slug": slug, "type": "product", "skuPrefix": prefix, "isActive": True}
        st, res = api("POST", "/api/categories", token, body)
        if st in (200, 201) and isinstance(res, dict):
            cid = str(res.get("id") or res.get("_id"))
            cat_id_by_name[name] = cid
            id_map["categories"][name] = cid
            report["categories"]["created"] += 1
        else:
            report["categories"]["failed"].append({"name": name, "status": st, "body": res})
            print("CAT_FAIL", name, st, res)

    print("CATEGORIES", report["categories"])

    # --- counterparties ---
    # discover role slugs
    st, roles_payload = api("GET", "/api/counterparty-roles?limit=50", token)
    role_slugs = set()
    if isinstance(roles_payload, dict):
        for r in roles_payload.get("items") or roles_payload.get("data") or []:
            role_slugs.add(r.get("slug") or r.get("name"))
    # fallback common
    if not role_slugs:
        role_slugs = {"client", "supplier"}

    for cp in cps:
        kid = str(cp.get("_id"))
        if kid in id_map["counterparties"]:
            report["counterparties"]["skipped"] += 1
            continue
        if cp.get("isOurCompany"):
            if not any(x.get("kp3Id") == kid for x in id_map["organizationCandidates"]):
                id_map["organizationCandidates"].append({"kp3Id": kid, "name": cp.get("name")})
            report["counterparties"]["skipped"] += 1
            continue
        inn = (cp.get("inn") or "").strip()
        if not inn or not re.fullmatch(r"\d{10}|\d{12}", inn):
            report["counterparties"]["skipped"] += 1
            report["counterparties"]["failed"].append({"kp3Id": kid, "reason": "bad/missing inn", "inn": inn})
            continue
        roles = [r for r in map_roles(cp.get("role")) if r in role_slugs or True]
        # prefer client if available
        if "client" in role_slugs:
            roles = [r if r in role_slugs else "client" for r in roles]
            roles = [r for r in roles if r in role_slugs] or ["client"]
        body: dict[str, Any] = {
            "name": cp.get("name") or "Без названия",
            "inn": inn,
            "roles": roles,
        }
        for src, dst in [
            ("shortName", "shortName"),
            ("legalForm", "legalForm"),
            ("kpp", "kpp"),
            ("ogrn", "ogrn"),
            ("bankName", "bankName"),
            ("bik", "bankBik"),
            ("checkingAccount", "bankAccount"),
            ("correspondentAccount", "bankCorrAccount"),
            ("phone", "phone"),
            ("website", "website"),
            ("founderName", "signerName"),
            ("founderNameShort", "directorName"),
        ]:
            if cp.get(src):
                body[dst] = cp[src]
        body["legalType"] = legal_type(cp.get("legalForm"))
        body["isActive"] = (cp.get("status") or "active") == "active"
        # NO email
        st, res = api("POST", "/api/counterparties", token, body)
        if st in (200, 201) and isinstance(res, dict):
            nid = str(res.get("id") or res.get("_id"))
            id_map["counterparties"][kid] = nid
            report["counterparties"]["created"] += 1
            if report["counterparties"]["created"] <= 3:
                report["samples"].setdefault("counterparties", []).append(nid)
        else:
            # duplicate inn → skip
            msg = str(res)
            if st == 409 or "duplicate" in msg.lower() or "уже" in msg.lower() or "E11000" in msg:
                report["counterparties"]["skipped"] += 1
            else:
                report["counterparties"]["failed"].append({"kp3Id": kid, "status": st, "body": res})
                print("CP_FAIL", cp.get("name"), st, res)

    print("COUNTERPARTIES", {k: report["counterparties"][k] for k in ("created", "skipped", "failed")})

    # --- products ---
    for i, p in enumerate(products):
        kid = str(p.get("_id"))
        if kid in id_map["products"]:
            report["products"]["skipped"] += 1
            continue
        code = (p.get("code") or "").strip()
        if not code:
            report["products"]["skipped"] += 1
            report["products"]["failed"].append({"kp3Id": kid, "reason": "empty code"})
            continue
        kind = "good"
        if (p.get("kind") or "").upper() == "SERVICE":
            kind = "service"
        elif (p.get("kind") or "").upper() == "WORK":
            kind = "work"
        body = {
            "name": (p.get("name") or code)[:256],
            "sku": code[:64],
            "kind": kind,
            "unit": norm_unit(p.get("unit")),
            "listPrice": float(p.get("price") or 0),
            "isActive": bool(p.get("isActive", True)),
            "status": "active" if p.get("isActive", True) else "archived",
        }
        if p.get("description"):
            body["description"] = str(p["description"])[:4000]
        if p.get("notes"):
            body["notes"] = str(p["notes"])[:4000]
        # overflow name → notes tip
        full_name = p.get("name") or code
        if len(full_name) > 256:
            tip = f"[KP3 full name] {full_name}"
            body["notes"] = ((body.get("notes") or "") + "\n" + tip).strip()[:4000]
        if p.get("costRub") is not None:
            try:
                body["costPrice"] = float(p["costRub"])
            except Exception:
                pass
        cat = (p.get("category") or "").strip()
        if cat and cat in cat_id_by_name:
            body["categoryId"] = cat_id_by_name[cat]
        if p.get("subcategory"):
            body["subcategory"] = str(p["subcategory"])[:128]
        # NO photoIds
        st, res = api("POST", "/api/products", token, body)
        if st in (200, 201) and isinstance(res, dict):
            nid = str(res.get("id") or res.get("_id"))
            id_map["products"][kid] = nid
            report["products"]["created"] += 1
            if report["products"]["created"] <= 3:
                report["samples"].setdefault("products", []).append({"sku": code, "id": nid})
        else:
            msg = str(res)
            if st == 409 or "duplicate" in msg.lower() or "E11000" in msg:
                report["products"]["skipped"] += 1
            else:
                report["products"]["failed"].append({"kp3Id": kid, "sku": code, "status": st, "body": res})
                if len(report["products"]["failed"]) <= 10:
                    print("PROD_FAIL", code, st, res)
        if (i + 1) % 100 == 0:
            print(f"products progress {i+1}/{len(products)} created={report['products']['created']} mapped={len(id_map['products'])}")
            OUT_MAP.write_text(json.dumps(id_map, ensure_ascii=False, indent=2), encoding="utf-8")

    print("PRODUCTS", {k: report["products"][k] for k in ("created", "skipped", "failed")})

    # --- quotations ---
    status_map = {
        "draft": "draft",
        "sent": "sent",
        "accepted": "accepted",
        "rejected": "rejected",
        "cancelled": "cancelled",
        "converted": "converted",
    }
    for kp in kps:
        kid = str(kp.get("_id"))
        if kid in id_map["kps"]:
            report["quotations"]["skipped"] += 1
            continue
        items_in = kp.get("items") or []
        lines = []
        for idx, it in enumerate(items_in):
            src_pid = str(it.get("productId") or "")
            new_pid = id_map["products"].get(src_pid)
            if not new_pid:
                continue
            qty = float(it.get("qty") or it.get("quantity") or 0)
            price = float(it.get("price") or it.get("unitPrice") or 0)
            lines.append(
                {
                    "lineKind": "catalog",
                    "productId": new_pid,
                    "productName": it.get("name"),
                    "productSku": it.get("code"),
                    "quantity": qty,
                    "unit": norm_unit(it.get("unit")),
                    "unitPrice": price,
                    "markupPercent": float(it.get("markupPercent") or 0),
                    "discountPercent": float(it.get("discountPercent") or 0),
                    "sortOrder": idx,
                }
            )
        if not lines:
            report["quotations"]["skipped"] += 1
            report["quotations"]["failed"].append({"kp3Id": kid, "reason": "no mapped product lines"})
            continue
        cp_src = str(kp.get("counterpartyId") or "")
        cp_new = id_map["counterparties"].get(cp_src)
        body = {
            "organizationId": org_id,
            "items": lines,
            "title": kp.get("title") or "КП из КП3",
            "status": "draft",  # force draft per MCP tool canon; manager publishes in UI
            "vatPercent": float(kp.get("vatPercent") or 20),
        }
        if cp_new:
            body["counterpartyId"] = cp_new
        st, res = api("POST", "/api/quotations", token, body)
        if st in (200, 201) and isinstance(res, dict):
            nid = str(res.get("id") or res.get("_id"))
            id_map["kps"][kid] = nid
            report["quotations"]["created"] += 1
            if report["quotations"]["created"] <= 3:
                report["samples"].setdefault("quotations", []).append(nid)
        else:
            report["quotations"]["failed"].append({"kp3Id": kid, "status": st, "body": res})
            print("KP_FAIL", kid, st, res)

    print("QUOTATIONS", {k: report["quotations"][k] for k in ("created", "skipped", "failed")})

    # counts readback
    for path, key in [
        ("/api/products?limit=1", "products"),
        ("/api/counterparties?limit=1", "counterparties"),
        ("/api/quotations?limit=1", "quotations"),
    ]:
        st, res = api("GET", path, token)
        total = None
        if isinstance(res, dict):
            total = res.get("total") or res.get("meta", {}).get("total")
        report.setdefault("readback", {})[key] = {"status": st, "total": total}

    OUT_MAP.write_text(json.dumps(id_map, ensure_ascii=False, indent=2), encoding="utf-8")

    # markdown report
    lines_md = [
        "# KP3 → KP8 load report (MIG-302 scoped)",
        "",
        f"> Дата: {time.strftime('%Y-%m-%d %H:%M')} · Target SoT: `{BASE}` (Synology LAN = prod Mongo)",
        "> Cursor `user-kppdf` MCP discovery was down; Desktop was paired to `127.0.0.1:3000`.",
        "> Load used the **same REST** endpoints MCP tools wrap (admin JWT). No wipe/deploy.",
        "",
        "## Counts",
        "",
        f"| Axis | created | skipped | failed |",
        f"|------|---------|---------|--------|",
        f"| Categories | {report['categories']['created']} (+existing {report['categories']['existing']}) | — | {len(report['categories']['failed'])} |",
        f"| Counterparties | {report['counterparties']['created']} | {report['counterparties']['skipped']} | {len(report['counterparties']['failed'])} |",
        f"| Products | {report['products']['created']} | {report['products']['skipped']} | {len(report['products']['failed'])} |",
        f"| Quotations (draft) | {report['quotations']['created']} | {report['quotations']['skipped']} | {len(report['quotations']['failed'])} |",
        "",
        "## Deferred (gap-block)",
        "",
    ]
    for d in report["deferred"]:
        lines_md.append(f"- {d}")
    lines_md += [
        "",
        "## Samples",
        "",
        "```json",
        json.dumps(report.get("samples"), ensure_ascii=False, indent=2),
        "```",
        "",
        "## Readback",
        "",
        "```json",
        json.dumps(report.get("readback"), ensure_ascii=False, indent=2),
        "```",
        "",
        "## Failures (truncated)",
        "",
        "```json",
        json.dumps(
            {
                "categories": report["categories"]["failed"][:10],
                "counterparties": report["counterparties"]["failed"][:10],
                "products": report["products"]["failed"][:10],
                "quotations": report["quotations"]["failed"][:10],
            },
            ensure_ascii=False,
            indent=2,
        ),
        "```",
        "",
        f"Id-map: `data/from-kp3/id-map.json` (gitignore).",
        "",
        "Organization candidates from isOurCompany (not loaded as Counterparty):",
        "```json",
        json.dumps(id_map["organizationCandidates"], ensure_ascii=False, indent=2),
        "```",
    ]
    REPORT.write_text("\n".join(lines_md), encoding="utf-8")
    print("WROTE", OUT_MAP, REPORT)
    print("DONE", json.dumps({k: report[k] for k in ("categories", "counterparties", "products", "quotations", "readback")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
