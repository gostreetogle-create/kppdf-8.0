# TZD-47 DONE `d158c112`. Этот чат = только TZ-MIG-302.
# MCP должен быть online. Если ping FAIL — BLOCKED, не лей данные.

Скопируй блок ниже в **новый** чат Freebuff. Desktop/MCP включи **до** старта.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
docs/PO-CANON.md · docs/GIT-POLICY.md
TZ: tasks/_backlog/migrate-kp3/TZ-MIG-302-kp3-mcp-load.md
Audit map: docs/audits/2026-08-12-kp3-to-kp8-field-map.md §6
Сеть рвётся: ОДНА TZ. Не начинай MIG-306/304/303 в этом чате.

git fetch origin && git checkout main && git pull --ff-only
Чужой WIP не стейджить. Deploy/wipe/mongorestore запрещены. _park/** не трогать.
Skip если уже есть tasks/_archive/**/TZ-MIG-302.done.md.

ШАГ 0 — MCP:
kppdf_ping (Desktop user-kppdf). FAIL → BLOCKED: «подключи MCP», код/заливку не делай.
Target = MCP-connected SoT (local, не prod).

SCOPE LOCK:
В scope: Categories (14) → Counterparties (без email/photo, skip isOurCompany) → Products (без photoIds) → Quotations+items (remap ids).
ВНЕ: photoIds; Counterparty.email; branding; schema; wipe; deploy; TZD-47 re-work; MIG-303 bulk photos.

Порядок: categories → CP → products → quotations. Дубликаты sku/INN: skip+log, не overwrite.
Photos в отчёте: «ожидает MIG-303» (tool 47 уже есть, bulk не в этой TZ).

Артефакты:
- data/from-kp3/id-map.json (gitignore ok — dumps не коммитить)
- docs/audits/2026-08-12-kp3-mcp-load-report.md: created/skipped/failed + 3 sample ids
- checklist docs/agent-checklists/TZ-MIG-302.md (создай если нет)

ЦИКЛ: CLAIM → load по AC → report → archive tasks/_archive/2026-08/TZ-MIG-302.done.md
+ lock + _NOW → commit+push только docs/checklist/archive (не dumps, не чужой WIP).

Конец: TZ-MIG-302 | DONE/BLOCKED | archive | SHA
Фраза: «следующий чат = MIG-306 (одна TZ)».
```
