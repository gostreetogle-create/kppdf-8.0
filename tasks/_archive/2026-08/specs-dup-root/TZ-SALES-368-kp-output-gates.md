═══════════════════════════════════════════════════════════════
TZ-SALES-368: Create КП — Печать без гейта «фирма/save»; PDF/Архив отдельно
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-12-kp-output-gates-canon.md

РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: 367 DONE (rail Вывод)
LAYER: 3
CONFLICT KEYS:
  frontend/src/app/pages/commercial/proposals/proposal-create.page.ts ;
  frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts ;
  docs/pages/proposals-create.page.md ;
  docs/agent-checklists/_active-map.md

Проверено: `requestOutput` для print|pdf|archive одинаково требует `canSaveDraft()`
(шаблон + organizationId + preview ready) и затем `saveDraft` → тост
«Дождитесь готового превью и выберите нашу фирму.» даже когда на экране уже лист.
`printCurrentPreview()` сам умеет печатать из `previewHtmlSource`.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Развести ветки в `requestOutput`**
   - **`print`:** сразу `printCurrentPreview()` (или после закрытия flyout).  
     **Не** вызывать `canSaveDraft`, **не** ставить `pendingOutput` + save.  
     Если нет HTML превью — один RU toast вроде «Превью листа ещё не готово» /
     «Выберите шаблон» (коротко, без «фирмы»).
   - **`pdf` / `archive`:** нужен сохранённый draft id.  
     - Если id уже есть → выполнить PDF/архив без лишнего тоста про фирму.  
     - Если id нет и `canSaveDraft()` → save затем PDF/архив (как сейчас pending).  
     - Если id нет и нельзя сохранить → **свой** текст: для файла/архива нужны
       шаблон, превью и наша фирма — **не** копипаста сообщения печати.

2. **Спеки**
   - Jest: print при готовом превью **без** organizationId не показывает тост про фирму
     и зовёт print path; pdf без firm/id — отдельное сообщение.
   - page.md: одна строка канона вывода (печать свободная; PDF/архив — сохранённая сущность).

3. **Не делать в этой TZ**
   - Авто-PDF на статусе «Принято/Оплачено» (записать known_limitation / successor
     в page.md одной строкой).
   - Менять BE puppeteer / статусы / Все КП.
   - Deploy.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Autosave write-path (кроме того что print его больше не форсит)
- Rail UI 367
- TZ-366 print helper (temp iframe) — только вызов

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Печать при готовом превью работает без выбранной фирмы и без предварительного save
- [ ] Тост «Дождитесь готового превью и выберите нашу фирму» **не** показывается на Печать
- [ ] PDF/Архив без draft: понятное отдельное сообщение (фирма/шаблон), не общий тост печати
- [ ] FE tsc + proposal-create.page.spec.ts PASS
- [ ] page.md обновлён

Gates:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern=proposal-create.page --no-coverage
```

Archive + lock + Checkpoint + commit/push. Deploy НЕ.

HANDOFF prompt: `tasks/_backlog/kp-vitrine/PROMPT-KP-OUTPUT-GATES-368.md`
