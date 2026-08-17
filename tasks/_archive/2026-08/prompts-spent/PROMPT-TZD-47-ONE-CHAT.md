# TZ-UX-371 skipped (archive existed). TZD-56 DONE `07593970`.
# Этот чат = только TZD-47.

Скопируй блок ниже в **новый** чат Freebuff.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
docs/PO-CANON.md · docs/GIT-POLICY.md
TZ: tasks/_backlog/desktop/TZD-47-mcp-photo-upload.md
Сеть рвётся: ОДНА TZ. Mid-commit зелёного куска. Не начинай MIG-302 в этом чате.

git fetch origin && git checkout main && git pull --ff-only
Чужой WIP не стейджить. Deploy/wipe запрещены. _park/** не трогать.
Skip если уже есть tasks/_archive/**/TZD-47.done.md.

ЦЕЛЬ TZD-47:
MCP tool: загрузить 1 файл → сущность Photo (существующий REST /photos, не второе хранилище)
+ bind к Product.photoIds (опционально Counterparty).
Паттерн HITL как materials: kppdf_propose_* + confirm (или userOk). RU errors.
Не лить 690 файлов — tool + 1–2 smoke.

CONFLICT KEYS: desktop/mcp/src/** ; при необходимости backend photo / product-photo.
НЕ: MIG-303 bulk; schema Product; deploy; wipe; Desktop NSIS/ai-runner (56 уже DONE).

ЕСЛИ MCP/Desktop offline → BLOCKED, напиши PO «подключи MCP», не имитируй upload.

ЦИКЛ: CLAIM checklist docs/agent-checklists/TZD-47.md (создай если нет)
→ код по AC → mcp tests + tsc (BE tsc если трогал BE)
→ archive tasks/_archive/2026-08/TZD-47.done.md + lock + _NOW
→ commit+push только свои пути.

Конец: TZD-47 | DONE/BLOCKED | archive | SHA
Фраза: «следующий чат = MIG-302 (тот же стиль: одна TZ)».
```
