# TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT: Выбрано → вставить клиент/поставщик текстом на A4

**РОЛЬ АГЕНТА:** Executor (frontend-nx studio) — claude или freebuff  
**ЗАВИСИМОСТИ:** D52 Insert table; SELECTED-REPLACE-JUMP; TOKEN-EDITOR-CHIP (токены на холсте)  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-*.spec.ts` (новый focused spec OK) ;  
`docs/pages/document-studio.page.md`

IMPLICIT CONFLICT: nx build kppdf-web  
Sequential vs TEXT-PROPS / REVISION если editor.page claimed.

### Domain (PO)
Как «Вставить таблицу «изделия»» из Выбрано, но для **Клиент / Поставщик (/ Плательщик)**:  
на лист → **новый текстовый слой** с подстановочными `{{…}}`, дальше правка как обычный текст (Свойства / dblclick).

Не путать с «Изменить» (прыжок в Данные).

### Канон токенов (уже в page.md)

| Чип | Токены в новом блоке (минимум) |
|-----|--------------------------------|
| Клиент | `{{counterparty.name}}` (+ опц. строка `ИНН {{counterparty.inn}}`) |
| Поставщик | `{{anchor.supplier.name}}` (+ опц. inn) |
| Плательщик (если есть в буфере) | `{{anchor.payer.name}}` |

HTML: простой `<p>…</p>` / перенос строк; токены plain или сразу atomic — migrate на холсте уже есть.

### ЧТО ДЕЛАТЬ

1. **UI Выбрано:** под чипами якорей (или у каждого чипа) CTA  
   `data-test="studio-insert-party-<key>"`  
   **«Вставить на лист»** / **«Вставить «Клиент»»** — рядом с блоком insert-suggest таблиц.  
   Не заменять «Изменить».

2. **Editor:** `insertPartyText(key)`:
   - нет entityId для роли → toast «Сначала выберите … в Данные»;
   - иначе `createTextLayer` (тот же revision queue, что create text) с `content` = пресет токенов;
   - activate layer + открыть Свойства текста (как после add text);
   - toast коротко.

3. **Hint:** если есть якоря, но нет catalog chips — не disabled «только товары»; показать party CTA. Disabled «Вставить на лист» только когда пусто совсем.

4. Specs + live: Выбрано клиент → клик → на A4 текстовый блок с `{{counterparty…}}`; Просмотр/Значения показывают имя.

### НЕ

- Вставлять в таблицу / менять catalog insert
- Автоподстановка во все тексты без клика
- Новый entity type
- Дублировать Поле ERP picker целиком

### AC

1. Клиент в буфере → кнопка вставки → text block на текущей странице с токенами клиента.
2. Поставщик аналогично `anchor.supplier`.
3. Без выбора — честный toast, без пустого блока.
4. После вставки блок редактируется как обычный текст.
5. Gates: data-panel + editor focused specs + `nx build kppdf-web`.

### Claim
```
agent_id: claude
claimed_at: 2026-09-14T07:53:35Z
branch: main
baseline_sha: 0d42b7ec
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verification:
  - acceptance criteria: PASS (all 5, including live smoke — see checklist Gates section)
  - typecheck: PASS
  - tests: PASS
  - lint: PASS (0 new errors vs pre-existing baseline of 38, verified via git-stash -u A/B)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT.md)
  - progress.md: N/A (redirected to docs/agent-checklists/_NOW.md per repo convention)
  - status synchronization: PASS
