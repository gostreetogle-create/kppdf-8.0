# PROMPT — WAVE-KP-STUDIO-CHROME (параллельно Table Editor)

Скопируй агенту-исполнителю. **Не** пересекайся с WAVE-KP-TABLE-EDITOR на `proposal-create.page.ts`.

---

## Промпт (копировать)

Ты — исполнитель kppdf-8.0. Читай: `GEMINI.md`, `kppdf-executor-continuous`, `OrchestratorKit/AGENTS.md`, `docs/PO-DIARY.md` §1–§4.

**Канон:** `docs/audits/2026-08-12-kp-studio-flyout-chrome-audit.md`  
**Волна:** `tasks/_backlog/kp-vitrine/WAVE-KP-STUDIO-CHROME.md`

Deploy только по явному «деплой». Не трогай `desktop/**`, `ruvector.db`.

### Параллель (важно)

Сейчас другой агент делает **WAVE-KP-TABLE-EDITOR** (359→361) и **владеет**  
`proposal-create.page.ts` + composition/table-studio/table-editor.

Ты **сейчас** делаешь только **TZ-SALES-363** (child panels).  
**TZ-SALES-362** (ширины S/L + смена иконки Условий) — **только после** того, как 359 снят с `_active` / смержен (проверь `_active/` и STATUS). Если page.ts ещё в работе у коллеги — **не** начинай 362, отчитайся «363 DONE, 362 waiting».

### TZ-SALES-363 (делай сразу)

CONFLICT KEYS — только:

- `proposal-create-terms.component.ts` (+ spec если есть)
- `proposal-create-recipient.component.ts`
- `proposal-create-template-picker.component.ts`
- `proposal-create-inspector.component.ts` (параметры; не восстанавливай старый tableOnly UI)
- `proposal-product-rail.component.ts` (плотность, **не** ширина flyout)
- `docs/pages/proposals-create.page.md` (строка про chrome)

Убрать дубли хинтов, лишний chrome, сохранить Paper & Ink.  
`git diff` не должен содержать `proposal-create.page.ts`.

Gates: FE tsc + точечные тесты. Claim → code → archive → commit/push.

### TZ-SALES-362 (потом)

Токены `--kp-flyout-s` / `--kp-flyout-l`:  
S = template, params, terms; L = products, table, recipient.  
Иконка Условий ≠ FileText (ScrollText/NotebookText).  
Спека page. Commit/push. Не деплой.

Team Room: join / claim / heartbeat. Начинай с **363**.

## Промпт (конец)
