> **STATUS: DONE** — 2026-09-14. Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM.md`. Evidence: `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM.txt`. Wave: `docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` (3.1).

# TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM: цена из каталога + колонка «Сумма»

**РОЛЬ АГЕНТА:** Executor (frontend-nx + studio-data-resolver) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE` DONE; `TZ-NX-DOCSTUDIO-TABLE-LINE-QTY` DONE  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`backend/src/modules/studio-document/studio-data-resolver.ts` ;  
`backend/src/modules/studio-document/studio-data-resolver.spec.ts` (создать/дополнить) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.spec.ts` ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** `docs/PO-CANON.md`; `docs/TZ-AUTHORING.md`; `docs/pages/document-studio.page.md` (LINE-QTY); `docs/audits/2026-09-13-docstudio-table-price-sum.md`; `backend/.../studio-data-resolver.ts` (`COLUMN_ALIASES`, `lineValue`, catalog price); `frontend-nx/.../studio-table-defaults.ts` (`STUDIO_STANDARD_COLUMN_FIELDS`); `frontend-nx/.../studio-table-properties.component.ts` (quick-add)
- **Key Constraints:** Mode A handoff → executor; FIC N/A (no new route); UX: chip «+ Сумма», не второй write-path цены
- **Planned Deliverable:** aliases + quick-add sum + label heal + specs + page note
- **Validation Path:** FIC §A N/A; gates ниже + `nx build kppdf-web`

### Domain preflight
- Проверено: Product.`listPrice`/`basePrice`; Material.`pricePerUnit`; ProductModule — **нет** цены (known_limitation: модули → 0, не выдумывать поле в этом TZ).
- Цена строки каталога = snapshot из каталога (read-only на холсте); qty override уже есть (LINE-QTY); сумма = `price * qty`, не ручной ввод.
- «Сумма» ≠ вторая «Цена»; Counterparty/Organization не затронуты.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. PO-скрин: колонки «Цена» пустая + «Цена»=`0`; qty живой. Аудит: `docs/audits/2026-09-13-docstudio-table-price-sum.md`.

2. Проблемы:
   - `lineValue` смотрит только `column.key` (+ aliases). Label «Цена» при битом key → пустая ячейка.
   - `COLUMN_ALIASES.price` без `listprice`/`list_price`/`baseprice` — ключи из реестра/ручного ввода молча пустые.
   - Quick-add (`STUDIO_STANDARD_COLUMN_FIELDS`) даёт «+ Цена», **не** «+ Сумма» — оператор не видит кнопку для суммы.
   - Дубль заголовка «Цена» на sum-колонке путает PO; канон пресета КП: `unitPrice`→«Цена», `sum`→«Сумма».

3. Уже работает (не ломать): `total = price * quantity` при known keys; footer по sum; LINE-QTY overrides.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Aliases (FE+BE parity)

- В `COLUMN_ALIASES.price` (BE) и `STUDIO_STANDARD_COLUMN_ALIASES.price` (FE) добавить: `listprice`, `list_price`, `baseprice`, `base_price`, `priceperunit`, `price_per_unit`.
- В FE aliases добавить группу `sum: ['sum','total','amount','сумма']` (как BE) — нужна для missingStandard / createStandard.

ШАГ 2: Quick-add «+ Сумма»

- В `STUDIO_STANDARD_COLUMN_FIELDS` добавить `{ key: 'sum', label: 'Сумма', type: 'currency', align: 'right' }`.
- `createStandardStudioTableColumn('sum')` → key=`sum`, label=`Сумма`.
- Chip появляется только если ни один existing key не в sum-aliases (как для price).

ШАГ 3: Heal заголовков при add/rehydrate (минимум)

- При quick-add / после смены структуры колонок (тот же путь, что S47 rehydrate): если key ∈ price-aliases и label пустой или case-insensitive «цена»/дубль — нормализовать label **«Цена»**; если key ∈ sum-aliases — label **«Сумма»** (не «Цена»).
- Не массово мигрировать все старые документы в Mongo; heal при открытии/смене колонок блока достаточно (как STALE-LIVEROWS-HEAL scope).
- Опционально тонко: если key не в aliases, а label нормализуется к «цена»/«сумма» — canonicalize key к `price`/`sum` **только** когда это однозначный match (один label → один canonical), иначе не трогать.

ШАГ 4: Type-select — не операторский рычаг (necessity)

PO: зачем `text`/`number`/`currency` если данные уже структурированы key’ем.

Факт: hydrate (`lineValue`) **игнорирует** `column.type`; на FE type почти только сохраняется в settings. BE использует type лишь как редкий hint (`sum`/`vat` для footer) — этих значений **нет** в FE-select.

Сделать одно:
- Для key из стандартных aliases (sku/photo/name/qty/price/sum/…) — **скрыть или disabled** select type; type выставлять каноном при create/heal (`qty`→number, `price`/`sum`→currency, остальное→text).
- Select оставить только у колонок с неизвестным key (ручная «+ Колонка»), с короткой подсказкой: «не влияет на подстановку из каталога».
- Не удалять поле из схемы (шаблоны реестра могут хранить type).

ШАГ 5: Specs + docs

- BE: `mapLineItemsToRows` — key `listPrice` и `сумма` заполняют цену/сумму; `sum` = price*qty при qty override.
- FE: `missingStandardColumnFields` предлагает `sum`; type select locked для known keys.
- `docs/pages/document-studio.page.md` — цена из каталога; сумма = qty×цена; chip «+ Сумма»; type не управляет подстановкой; modules без цены = 0.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: CONFLICT KEYS выше + audit уже есть.

НЕ ИЗМЕНЯТЬ:
- Product/Module schema (не добавлять listPrice модулям в этом TZ)
- Inline-edit цены на холсте (каталог read-only)
- Второй select «источник» / wipe / deploy
- Чужие TZ волны 1–2

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Изделие с `listPrice=100`, qty override 5 → колонка price/unitPrice/listPrice показывает `100`, колонка sum/total/сумма показывает `500`.
2. В Свойствах при отсутствии sum-колонки виден chip **«+ Сумма»**; клик добавляет key=`sum`, label=`Сумма`; liveRows пересчитываются.
3. Две колонки с label «Цена» после heal sum-ключа: price→«Цена», sum→«Сумма» (на пути add/rehydrate).
4. Module catalog без поля цены: price/sum остаются `0` (documented), не падают.
5. У колонки `qty`/`listPrice`/`price` select type не крутится оператором (hidden/disabled); смена type у known key не требуется для появления цены/суммы.
6. Gates:

```bash
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test -- studio-data-resolver
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-table-defaults
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-table-properties
cd frontend-nx && pnpm exec nx build kppdf-web
```

(если testPathPattern/project flags иные в репо — эквивалент focused; **build последним**.)

6. Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM.done.md` + WAVE checkpoint + commit/push per GEMINI.md.

### Claim slot (executor)

```
agent_id:
claimed_at:
branch:
baseline_sha:
```
