# TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON: эталон панели текста

**РОЛЬ АГЕНТА:** Executor (frontend-nx studio text props + canvas display) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP` DONE; желательно после `TZ-NX-DOCSTUDIO-REVISION-RACE-UX` (оба трогают studio-editor)  
**LAYER:** 3 · **SIZE:** M  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-token-display.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-block-helpers.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts` ;  
`frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/pi-rich-text-editor.component.ts` (скрыть TipTap-align в compact studio) ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/STREAM-QUEUE.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-13-docstudio-text-props-canon.md`; `studio-text-properties.component.ts`; `studio-block-helpers.ts` (`renderStudioTokensAsValues`); `pi-rich-text-editor` toolbar; canvas `[style.text-align]="block.style?.align"`
- **Key Constraints:** PO default = **Значения**; один блок настроек текста; block.style.align = SoT выравнивания на листе
- **Planned Deliverable:** fix values UX + default + compact typography IA
- **Validation Path:** specs + live Playwright + `nx build`

### Domain (PO 2026-09-13)
1. Переключатель Токены|Значения: по умолчанию **Значения**; на холсте разница должна быть видна.
2. Дубль выравнивания (TipTap toolbar vs низ typo) → один ряд; туда же размер и цвет; без второго align.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Default mode = `tokens` (TZ CHIP). PO теперь хочет `values`.
2. Unresolved token в mode=values остаётся `.substitution-token` chip → клик «Значения» часто **не меняет картинку**.
3. TipTap: B/I/U + paragraph textAlign; отдельно `patchStyle({ align })` на блок — два UX-пути.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Default + честные «Значения»

- `tokenDisplayMode` default → `'values'`.
- В `renderStudioTokensAsValues`: нерезолвнутый токен **не** маскировать под обычный chip Токенов. Вариант канона:
  - plain ink с классом `substitution-token--unresolved` (пунктир/muted + title=имя токена), **или**
  - текст «—» / пусто с title=`{{path}}`.
  Главное: mode=values визуально ≠ mode=tokens даже без данных в bag.
- Если в тексте есть `{{counterparty.*}}` / `{{organization.*}}`, а соответствующей сущности нет в bag — при переключении на Значения один тихий hint (toast или строка под сегментом): «Выберите клиента / исполнителя в Данные — иначе поля пустые».
- Не писать resolved values в `block.content`.

ШАГ 2: Bag надёжность (тонко)

- Убедиться, что list counterparties/orgs реально содержит поля пикера (`inn`, `shortName`, …). Если list thin — `getById` выбранного client/issuer в bag (только display).
- Spec: client с inn в bag → values показывает inn цифрами; без client → unresolved-стиль, не идентичный tokens-chip.

ШАГ 3: Эталон typography IA (одна зона)

Единый блок «Оформление» (над или сразу под RTE, один visual group):

| Контрол | SoT |
|---------|-----|
| B / I / U | inline TipTap marks (оставить) |
| Выравнивание L/C/R/(J?) | **только** `block.style.align` → canvas/PDF |
| Размер pt, Цвет | `block.style` (перенести из нижнего ряда сюда) |
| Шрифт, межстр. | остаются рядом компактно |
| Поле ERP, Формула | ниже, без дубля align |

Убрать:
- нижний ряд `text-props__align` (дубль);
- кнопки TipTap **textAlign** в compact studio RTE (чтобы не было второго выравнивания внутри HTML). Justify: если нужен — только в block.style; если TipTap justify не мапится на style — либо добавить в ALIGN_OPTIONS, либо не показывать.

Не трогать библиотеку категорий / удалить слой / Токены|Значения сегмент (кроме default+hint).

ШАГ 4: Docs + specs

- `document-studio.page.md`: default Значения; один toolbar; align = стиль блока.
- Обновить token-display specs (default values).
- Live: переключение Токены↔Значения видно глазом; одно выравнивание двигает текст на A4.

═══════════════════════════════════════════════════════════════
НЕ
═══════════════════════════════════════════════════════════════

- REVISION-RACE (отдельный TZ, если ещё в работе — не смешивать claim)
- Снимать сегмент Токены|Значения
- Менять server PDF substitute regex
- Legacy `frontend/**`

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. После open редактора active = **Значения**; на холсте с выбранным клиентом `{{counterparty.inn}}` → цифры ИНН (не `{{…}}`).
2. Без клиента: Значения ≠ визуальный clone Токенов (unresolved-стиль или «—»).
3. В Свойствах текста **один** ряд выравнивания; нет второго внизу; нет TipTap-align в compact.
4. Размер и цвет в том же компактном блоке, что B/I/U + align.
5. Gates: focused studio-text / studio-editor-token / studio-blocks-canvas specs + `nx build kppdf-web`.
6. Archive + STREAM.

### Claim slot

```
agent_id: claude
claimed_at: 2026-09-14T04:45:00Z
branch: main
baseline_sha: 9df85a70
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verification:
  - acceptance criteria: PASS (all 6, including live smoke — see checklist Gates section)
  - typecheck: PASS
  - tests: PASS
  - lint: PASS (0 new errors vs pre-existing baseline of 38, verified via git-stash A/B)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON.md)
  - progress.md: N/A (redirected to docs/agent-checklists/_NOW.md per repo convention)
  - status synchronization: PASS
