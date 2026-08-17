#!/usr/bin/env python3
"""TZ-MIG-303: attach KP3 product photos to SoT via REST.

Uses the same endpoints as TZD-47 MCP tools:
  POST /api/photos/upload (multipart field `file`)
  POST /api/products/:id/photos { photoId, isMain?, sortOrder? }

Transport: REST admin JWT (MCP :9743 optional; LAN may be down).
Target default: https://kppdf-crm.ru (prod tunnel). Override with KPPDF_API_BASE.

Idempotent: skips products that already have >=1 photoId.
"""
from __future__ import annotations

import json
import mimetypes
import os
import pathlib
import sys
import time
from typing import Any

import requests

ROOT = pathlib.Path(__file__).resolve().parents[1]
STAGING = ROOT / "data" / "from-kp3"
PHOTOS_INDEX = STAGING / "photos-index.json"
ID_MAP = STAGING / "id-map.json"
MEDIA = STAGING / "media"
ORPHANS = STAGING / "orphan-media.txt"
PREFIX_MISMATCH = STAGING / "media-prefix-mismatch.txt"
REPORT = ROOT / "docs" / "audits" / "2026-08-17-kp3-photos-attach-report.md"
STATE = STAGING / "_mig303_state.json"

BASE = os.environ.get("KPPDF_API_BASE", "https://kppdf-crm.ru").rstrip("/")
SESSION = requests.Session()


def load_admin_password() -> str:
    cfg_path = ROOT / "deploy" / "synology" / "config.env"
    cfg: dict[str, str] = {}
    for line in cfg_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        cfg[k] = v
    return cfg["ADMIN_PASSWORD"]


def login() -> str:
    pw = load_admin_password()
    for attempt in range(1, 10):
        r = SESSION.post(
            f"{BASE}/api/auth/login",
            json={"username": "admin", "password": pw},
            timeout=60,
        )
        if r.status_code == 429:
            time.sleep(min(2**attempt, 20))
            continue
        r.raise_for_status()
        return r.json()["access"]
    raise RuntimeError("login failed after retries")


def api(
    method: str,
    path: str,
    token: str,
    *,
    json_body: Any | None = None,
    files: Any | None = None,
    retries: int = 8,
) -> tuple[int, Any]:
    headers = {"Accept": "application/json", "X-Access-Token": token}
    url = f"{BASE}{path}"
    for attempt in range(1, retries + 1):
        try:
            r = SESSION.request(
                method,
                url,
                headers=headers,
                json=json_body,
                files=files,
                timeout=120,
            )
            if r.status_code == 429 and attempt < retries:
                wait = min(2**attempt, 20)
                print(f"THROTTLE {method} {path} wait {wait}s")
                time.sleep(wait)
                continue
            body: Any
            if r.content:
                try:
                    body = r.json()
                except Exception:
                    body = r.text[:500]
            else:
                body = None
            time.sleep(0.15)
            return r.status_code, body
        except requests.RequestException as e:
            if attempt < retries:
                time.sleep(min(2**attempt, 10))
                continue
            return 0, str(e)
    return 0, "retries exhausted"


def resolve_media_path(url: str) -> pathlib.Path | None:
    rel = url.strip().lstrip("/")
    if rel.startswith("media/"):
        rel = rel[len("media/") :]
    candidate = MEDIA / rel
    if candidate.is_file():
        return candidate
    # bare filename under products/
    name = pathlib.Path(rel).name
    alt = MEDIA / "products" / name
    if alt.is_file():
        return alt
    return None


def load_prefix_fixes() -> dict[str, str]:
    fixes: dict[str, str] = {}
    if not PREFIX_MISMATCH.exists():
        return fixes
    for line in PREFIX_MISMATCH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if " :: " not in line:
            continue
        kp3_id, rest = line.split(" :: ", 1)
        if " -> " in rest:
            bad, good = rest.split(" -> ", 1)
            fixes[kp3_id.strip()] = good.strip()
    return fixes


def fetch_product_photo_map(token: str, target_ids: set[str]) -> dict[str, int]:
    """Return kp8 productId -> len(photoIds)."""
    out: dict[str, int] = {}
    page = 1
    limit = 100
    while True:
        st, data = api("GET", f"/api/products?page={page}&limit={limit}", token)
        if st != 200 or not isinstance(data, dict):
            raise RuntimeError(f"products list failed page={page} status={st} body={data}")
        items = data.get("items") or data.get("data") or []
        if not items:
            break
        for p in items:
            pid = str(p.get("id") or p.get("_id"))
            if pid not in target_ids:
                continue
            photos = p.get("photoIds") or []
            out[pid] = len(photos) if isinstance(photos, list) else (1 if photos else 0)
        if len(items) < limit:
            break
        page += 1
    return out


def upload_and_bind(
    token: str,
    product_id: str,
    file_path: pathlib.Path,
    *,
    is_main: bool,
    sort_order: int,
) -> tuple[bool, str | None]:
    mime, _ = mimetypes.guess_type(str(file_path))
    mime = mime or "application/octet-stream"
    with file_path.open("rb") as fh:
        st, body = api(
            "POST",
            "/api/photos/upload",
            token,
            files={"file": (file_path.name, fh, mime)},
        )
    if st not in (200, 201) or not isinstance(body, dict):
        return False, f"upload status={st} body={body}"
    photo_id = str(body.get("id") or body.get("_id") or "")
    if not photo_id:
        return False, f"upload missing id body={body}"
    st2, body2 = api(
        "POST",
        f"/api/products/{product_id}/photos",
        token,
        json_body={"photoId": photo_id, "isMain": is_main, "sortOrder": sort_order},
    )
    if st2 not in (200, 201):
        return False, f"bind status={st2} photoId={photo_id} body={body2}"
    return True, photo_id


def main() -> int:
    if not PHOTOS_INDEX.is_file():
        print("BLOCKED: missing photos-index.json", file=sys.stderr)
        return 2
    if not ID_MAP.is_file():
        print("BLOCKED: missing id-map.json (run MIG-302 first)", file=sys.stderr)
        return 2

    photos_index: dict[str, list[dict[str, Any]]] = json.loads(
        PHOTOS_INDEX.read_text(encoding="utf-8")
    )
    id_map_doc = json.loads(ID_MAP.read_text(encoding="utf-8"))
    product_map: dict[str, str] = id_map_doc.setdefault("products", {})
    prefix_fixes = load_prefix_fixes()

    orphan_lines = []
    if ORPHANS.is_file():
        orphan_lines = [
            ln.strip()
            for ln in ORPHANS.read_text(encoding="utf-8").splitlines()
            if ln.strip()
        ]

    print("LOGIN", BASE)
    try:
        token = login()
    except Exception as e:
        print(f"BLOCKED: SoT unreachable — login failed: {e}", file=sys.stderr)
        return 2

    target_kp8: dict[str, str] = {}
    for kp3_id in photos_index:
        kp8 = product_map.get(kp3_id)
        if kp8:
            target_kp8[kp3_id] = str(kp8)

    photo_counts = fetch_product_photo_map(token, set(target_kp8.values()))
    print("READBACK mapped", len(target_kp8), "with_photoIds", sum(1 for v in photo_counts.values() if v > 0))

    stats = {
        "target": BASE,
        "transport": "REST (MCP offline)",
        "products_in_index": len(photos_index),
        "mapped": len(target_kp8),
        "unmapped_kp3": len(photos_index) - len(target_kp8),
        "uploaded": 0,
        "skipped_has_photo": 0,
        "skipped_missing_file": 0,
        "failed": [],
        "photo_ids_added": {},
    }

    for kp3_id, entries in photos_index.items():
        kp8 = target_kp8.get(kp3_id)
        if not kp8:
            stats["failed"].append({"kp3Id": kp3_id, "reason": "no id-map"})
            continue
        if photo_counts.get(kp8, 0) > 0:
            stats["skipped_has_photo"] += 1
            continue

        ordered = sorted(entries, key=lambda e: (not e.get("isMain"), e.get("sortOrder", 0)))
        uploaded_any = False
        for entry in ordered:
            url = entry.get("url") or ""
            if kp3_id in prefix_fixes:
                url = prefix_fixes[kp3_id]
            path = resolve_media_path(url)
            if not path:
                stats["skipped_missing_file"] += 1
                stats["failed"].append({"kp3Id": kp3_id, "kp8Id": kp8, "reason": "missing file", "url": url})
                continue
            ok, detail = upload_and_bind(
                token,
                kp8,
                path,
                is_main=bool(entry.get("isMain")),
                sort_order=int(entry.get("sortOrder") or 0),
            )
            if ok:
                stats["uploaded"] += 1
                uploaded_any = True
                stats["photo_ids_added"].setdefault(kp3_id, []).append(detail)
                photo_counts[kp8] = photo_counts.get(kp8, 0) + 1
                break  # AC: >=1 photoId; one main is enough
            stats["failed"].append(
                {"kp3Id": kp3_id, "kp8Id": kp8, "reason": "upload/bind", "detail": detail}
            )
        if not uploaded_any and photo_counts.get(kp8, 0) == 0:
            pass  # already logged

    with_photo_after = sum(1 for kp3_id in target_kp8 if photo_counts.get(target_kp8[kp3_id], 0) > 0)
    coverage_pct = round(100.0 * with_photo_after / len(target_kp8), 2) if target_kp8 else 0.0
    stats["with_photo_after"] = with_photo_after
    stats["coverage_pct"] = coverage_pct
    stats["orphans_logged"] = len(orphan_lines)
    stats["ac_pass"] = coverage_pct >= 95.0

    # optional id-map photo section (local gitignore ok)
    if stats["photo_ids_added"]:
        id_map_doc.setdefault("photos", {}).update(stats["photo_ids_added"])
        ID_MAP.write_text(json.dumps(id_map_doc, ensure_ascii=False, indent=2), encoding="utf-8")

    STATE.write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# KP3 photos attach report (MIG-303)",
        "",
        f"> Date: {time.strftime('%Y-%m-%d %H:%M')} · Target SoT: `{BASE}`",
        "> Transport: REST admin JWT (`POST /api/photos/upload` + `POST /api/products/:id/photos`).",
        "> MCP `:9743` healthz offline; Synology LAN `:3000` unreachable from executor host.",
        "",
        "## Summary",
        "",
        f"| Metric | Value |",
        f"|--------|------:|",
        f"| Products in photos-index | {stats['products_in_index']} |",
        f"| Mapped to SoT | {stats['mapped']} |",
        f"| With >=1 photoId (after run) | {with_photo_after} ({coverage_pct}%) |",
        f"| Uploaded this run | {stats['uploaded']} |",
        f"| Skipped (already had photo) | {stats['skipped_has_photo']} |",
        f"| Skipped (missing staging file) | {stats['skipped_missing_file']} |",
        f"| Failures | {len(stats['failed'])} |",
        f"| Orphans logged (not deleted) | {stats['orphans_logged']} |",
        f"| AC >=95% coverage | {'PASS' if stats['ac_pass'] else 'FAIL'} |",
        "",
        "## Orphans (staging files without product ref — not deleted)",
        "",
        "See `data/from-kp3/orphan-media.txt` ({n} lines).".format(n=len(orphan_lines)),
        "",
        "## Prefix mismatch fixes applied",
        "",
        f"{len(prefix_fixes)} entries in `data/from-kp3/media-prefix-mismatch.txt`.",
        "",
        "## Failures (truncated)",
        "",
        "```json",
        json.dumps(stats["failed"][:30], ensure_ascii=False, indent=2),
        "```",
        "",
        "## Samples uploaded this run",
        "",
        "```json",
        json.dumps(dict(list(stats["photo_ids_added"].items())[:5]), ensure_ascii=False, indent=2),
        "```",
        "",
        "State: `data/from-kp3/_mig303_state.json` (gitignore). Id-map optional `photos` section updated when uploads occur.",
    ]
    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print("WROTE", REPORT)
    print("STATS", json.dumps({k: stats[k] for k in stats if k != "photo_ids_added"}, ensure_ascii=False))
    return 0 if stats["ac_pass"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
