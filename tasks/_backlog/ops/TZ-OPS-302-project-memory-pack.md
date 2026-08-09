═══════════════════════════════════════════════════════════════
TZ-OPS-302: Project Memory Pack — тонкий склад знаний для агентов
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: docs/process executor (не product coder)
ЗАВИСИМОСТИ: нет (первая в WAVE-PROJECT-KNOWLEDGE)
LAYER: 1
CONFLICT KEYS: docs/PROJECT-MEMORY.md; docs/AI-AGENT-GUIDE.md; GEMINI.md; docs/how-to-connect-ai.md; docs/agent-checklists/TZ-OPS-302.md; docs/agent-checklists/_active-map.md; tasks/_active/TZ-OPS-302.md; progress.md; tasks/_archive/2026-08/TZ-OPS-302.done.md

Проверено: docs/audits/2026-08-09-project-knowledge-integrity-analysis.md §3 P0;
  docs/AI-AGENT-GUIDE.md §1.2; GEMINI.md §цикл; docs/how-to-connect-ai.md;
  tasks/_backlog/ops/WAVE-PROJECT-KNOWLEDGE.md
Domain preflight: N/A (нет сущностей ERP; process/docs only).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Порядок чтения агента в `AI-AGENT-GUIDE` §1.2 длинный: GUIDE → PO-DIARY → ARCHITECTURE → patterns → STACK → data-model → pages… — **нет одного ≤120-строчного пакета**, который отвечает «где правда / что не потерять».
2. `GEMINI.md` требует много файлов сразу; слабый агент либо пропускает канон, либо тонет.
3. Анализ 2026-08-09: зрелость knowledge-sync ~45%; процесс CLAIM уже есть.
4. Файла `docs/PROJECT-MEMORY.md` **нет** (grep 2026-08-09).

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Создать `docs/PROJECT-MEMORY.md`

Объём: **80–120 строк** (не больше 140). Структура строго:

1. **Зачем** (3–5 строк): склад истины для агентов; не читать весь репо.
2. **Ритуал 60 сек** — нумерованный список: workspace `D:\kppdf-8.0` → pull/status → CLAIM → этот файл → TZ.
3. **Где правда (таблица)** — минимум строки:
   - Онбординг → `AI-AGENT-GUIDE.md`
   - PO / качество → `PO-DIARY.md` §1–§4
   - Архитектура → `ARCHITECTURE.md` (только при нужде зоны)
   - Домен сущности → `data-model.md` + живой schema в `backend/src/modules/<x>/`
   - UI страница → `docs/pages/<name>.page.md`
   - Готовность раздела → `SECTION-READINESS.md`
   - Не забыть списки → `FEATURE-INTEGRATION-CHECKLIST.md`
   - Очередь агентов → `_active-map.md` + `tasks/_active/`
   - Север продаж→цех → `docs/audits/2026-08-08-sales-to-shop-flow-canon.md`
   - После OPS-303/304: ссылки-заглушки на `DOCS-INTEGRITY.md` и `DOMAIN-MAP.md` с пометкой `(появится в OPS-303/304)` — **не** создавать эти файлы в 302.
4. **Не потерять при DONE** — короткий чеклист-буллеты: page.md; PAGE-TZ-INDEX; FIC A–E по типу; SECTION-READINESS если менялся user contour; progress; Executor report; не коммитить чужой WIP.
5. **Не ломать** — BAN-буллеты: silent SoT write через MCP; FE-only deploy; worktree `.freebuff`; Graphify как замена SoT; правка чужих `_active`.
6. **Куда идти по задаче** — 6–8 строк if/then: UI page → page.md; новое право → FIC B + RBAC; склад qty → StorageItem; КП → sales-to-shop + proposals page; builder → builder.page.md + не трогать чужой DOC-*; desktop import → MCP.md + journal.

Язык: русский. Без эмодзи-спама. Без копипасты целых глав из ARCHITECTURE.

### ШАГ 2 — Проводка входа

1. `docs/AI-AGENT-GUIDE.md` §1.2: **сразу после** пункта про `how-to-connect-ai` / GUIDE вставь шаг  
   `docs/PROJECT-MEMORY.md ← тонкий склад: где правда, что не потерять (читать до ARCHITECTURE)`.  
   Не раздувай §1.2 новыми главами.
2. `GEMINI.md`: в блок «Перед началом прочитай…» добавь **`docs/PROJECT-MEMORY.md`** сразу после `PO-DIARY` (или явным предложением «после PO-DIARY — PROJECT-MEMORY, затем релевантные page.md»).
3. `docs/how-to-connect-ai.md`: после ритуала старта / CLAIM — **1–2 строки** со ссылкой на PROJECT-MEMORY.

### ШАГ 3 — Closeout дисциплины

1. Checklist `docs/agent-checklists/TZ-OPS-302.md` по `_TEMPLATE.md` с Claim slot.
2. `progress.md` — запись «Завершено: TZ-OPS-302».
3. Checkpoint в `_active-map.md` (коротко).
4. Archive → `tasks/_archive/2026-08/TZ-OPS-302.done.md` + удалить `_active`.
5. `## Executor report (auto)` ≤15 строк в checklist **до** archive.

---

## ИЗМЕНЯТЬ

- `docs/PROJECT-MEMORY.md` (new)
- `docs/AI-AGENT-GUIDE.md` (точечная проводка §1.2)
- `GEMINI.md` (точечная проводка чтения)
- `docs/how-to-connect-ai.md` (1–2 строки)
- checklist / `_active` / `_active-map` / `progress.md` / archive

## НЕ ИЗМЕНЯТЬ

- Любой `frontend/**`, `backend/**`, `desktop/**` product code
- `ARCHITECTURE.md`, `docs/data-model.md` (целиком)
- `docs/FEATURE-INTEGRATION-CHECKLIST.md` (это OPS-303)
- `docs/agent-checklists/_TEMPLATE.md` (это OPS-303)
- Активные SALES/DOC TZ и их keys
- Не создавать `DOCS-INTEGRITY.md` / `DOMAIN-MAP.md` здесь

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] `docs/PROJECT-MEMORY.md` существует; строк ≤140; есть все 6 секций из ШАГ 1
- [ ] В GUIDE §1.2 есть явная ссылка на PROJECT-MEMORY **до** ARCHITECTURE
- [ ] В GEMINI.md PROJECT-MEMORY в обязательном чтении
- [ ] how-to-connect-ai ссылается на PROJECT-MEMORY
- [ ] Нет правок product `*.ts` / `*.html` / `*.css`
- [ ] Checklist + Executor report (auto) + archive + progress + `_active` удалён
- [ ] `git diff --stat` scoped только к CONFLICT KEYS (+ lock если создаёте)

Verification:

```text
# docs-only
rg -n "PROJECT-MEMORY" docs/AI-AGENT-GUIDE.md GEMINI.md docs/how-to-connect-ai.md
powershell -Command "(Get-Content docs/PROJECT-MEMORY.md).Count"   # ≤140
git status --short
```

---

## known_limitation

- DOMAIN-MAP и DOCS-INTEGRITY — OPS-303/304.
- Не доказывает актуальность data-model vs schema.

ARCHIVE: root → `tasks/_archive/2026-08/` + GEMINI.md closeout.  
Review: Cursor/PO может skim PROJECT-MEMORY; archive после self-check AC если PO не сказал ждать visual (docs-only → self-archive OK после зелёных AC).
