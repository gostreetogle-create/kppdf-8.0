> **STATUS: DONE** — 2026-09-14. Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP.md`. Evidence: `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP.txt`. Wave: `docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` (3.2, WAVE3_DONE).

# TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP: токены на холсте + переключатель «Токены / Значения»

**РОЛЬ АГЕНТА:** Executor (frontend-nx; BE только если нет готового bag для resolve) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-S44` DONE; `S45` spacing DONE  
**LAYER:** 3 · **SIZE:** S→M (если понадобится тонкий resolve API)  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (session signal / wire toggle) ;  
`frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/substitution-token.extension.ts` ;  
`frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/pi-rich-text-editor.component.ts` ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** `studio-blocks-canvas` `textHtml` (raw, no migrate); `migratePlainTokensToNodes`; RTE chip CSS; editor `viewMode` preview = полный серверный HTML (другой режим)
- **Key Constraints:** default = токены-чипы; toggle в Свойствах; values = display-only, не пишет в content
- **Planned Deliverable:** chip migrate + session toggle Токены|Значения
- **Validation Path:** specs + `nx build kppdf-web`

### Domain (решение PO 2026-09-13)
- По умолчанию на холсте редактора видны **подстановочные** `{{…}}` (чипы, не как body text).
- В **Свойствах** — кнопка/сегмент: **«Токены»** | **«Значения»** («как будет на бланке» / подставленный вид).
- Полный режим «Просмотр» в chrome остаётся; этот toggle — лёгкий взгляд на A4 **не уходя** из редактора.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `textHtml()` без migrate → plain `{{organization.shortName}}` чёрный.
2. S44 CSS на `.substitution-token` бесполезен без span.
3. Нет UI «показать значения на холсте редактора» — только отдельный viewMode=preview.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Чипы токенов (default path)

- `textHtml`: `migratePlainTokensToNodes` до bypass.
- Стиль editor-only chip (mono + фон/бордер + info) на canvas + RTE; PDF/server preview **без** chip-краски.

ШАГ 2: Toggle в Свойствах текста

- В `studio-text-properties` (верх панели, всегда видно при text-блоке): сегмент  
  `data-test="studio-token-display-mode"`  
  **Токены** | **Значения**.
- Состояние — **на документ/сессию редактора** (signal в `studio-editor.page`), не per-block и не в Mongo: все текстовые блоки на холсте переключаются вместе.
- **Default = Токены.**
- Не путать с chrome «Просмотр» / PDF.

ШАГ 3: Режим «Значения» (display-only)

- Canvas показывает **подставленный** текст вместо `{{token}}` (обычный ink, без chip).
- **Не** менять `block.content` / не PATCH токены→строки.
- Источник bag (порядок предпочтения):
  1. Уже загруженный context редактора (org / client / anchors / quotation fields), если хватает для типичных `{{organization.*}}` / `{{counterparty.*}}` / `{{anchor.*}}`;
  2. Иначе — один существующий preview/resolve путь (reuse `documents.preview` bag или тонкий helper), без второго write-path.
- Нерезолвнутый токен: оставить chip или «—» + title с именем токена (выбрать одно, задокументировать).
- При dblclick/edit блока RTE всегда редактирует **токены** (source), даже если холст в режиме Значения — после закрытия RTE холст снова по режиму.

ШАГ 4: Insert + docs

- Insert ERP/formula → atomic token; optional migrate on save.
- `document-studio.page.md`: default Токены; Значения = превью на холсте; Просмотр/PDF = финальная подстановка.

═══════════════════════════════════════════════════════════════
НЕ
═══════════════════════════════════════════════════════════════

- Сохранять режим в БД (session only OK)
- Красить PDF chip’ами
- Подменять content значениями при save
- TABLE-PRICE-SUM / type-select / issuer

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Default: на A4 `{{organization.shortName}}` = заметный chip, не body text.
2. Свойства → **Значения**: на холсте видно короткое имя org (если org в контексте); content в API по-прежнему с `{{…}}`.
3. Снова **Токены** → chip’ы возвращаются без reload документа.
4. Режим переживает смену выбранного блока в той же сессии; F5 → снова default Токены (OK).
5. Просмотр/PDF без editor-chip стилей.
6. Gates:

```bash
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-blocks-canvas
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-text-properties
cd frontend-nx && pnpm exec nx build kppdf-web
```

7. Archive + WAVE checkpoint.

### Claim slot

```
agent_id:
claimed_at:
branch:
baseline_sha:
```
