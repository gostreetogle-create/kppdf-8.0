# /proposals/create — Создать КП

**Route:** `/proposals/create` (вход из «Сделки» → КП по умолчанию ведёт сюда; «Все КП» остаётся `/proposals`)
**TZ:** **310–317 DONE** · **319 + 321 DONE** · wave-2 **323/324/325** · витрина **326–328 READY** (318→328) · **320/322 PARK**  
**Spec LOCK:** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md) §0 FROZEN  
**Аудит:** layout + overlay · [`preview-wave2`](../audits/2026-08-09-kp-create-preview-wave2.md) · [`product-vitrine`](../audits/2026-08-09-kp-create-product-vitrine.md)

## Зафиксировано (не менять без PO)

- Центр = только A4; flyout **overlay** (grid rails|center|rails fixed)
- Left rail: **Шаблон** + **Товары**; Right: **Параметры** + **Таблица** (взаимоисключающие overlay-инструменты, TZ-SALES-332)
- Под chips нет ghost tools-strip; `flushBody` — студия вплотную к жёлтым chips
- CTA «Добавить шаблон»; pick закрывает панель шаблона
- `draftLines` in-memory до Save; Save создаёт/обновляет draft Quotation с items, templateId и non-null templateSnapshot, а `kp.create.lastDraftId`/`lastTemplateId` используются только для resume
- 338: вход из списка «Редактировать» использует `/proposals/create?id=...` и гидратирует тот же editable draft; «Создать» использует `?new=1` и не открывает второй form-редактор. User-visible подсказки — на русском.
- 339: «Сохранить КП» заменено русским статусом автосохранения «Сохранено»; после выбора шаблона и нашей фирмы draft сохраняется автоматически, а F5 восстанавливает товары, шаблон и клиента; удалённый КП не возрождается.
- 334: «Клиент» — searchable `PiOverflowSelect` по всем активным Counterparty без фильтра роли; выбранный клиент входит в autosave и resume.
- 349: индексы `quotations` приводит в порядок стартовая миграция, потому что в production `autoIndex` выключен; это предотвращает старые уникальные индексы и E11000 при создании нового черновика после удаления КП.
- 335: в экземпляр выбранной line-items таблицы можно добавить «Кол-во», «Цена» и «Сумма» без изменения общего шаблона; количество редактируется в панели «Товары», а существующая колонка «Рисунок» получает thumb товара.
- Empty table-template with declared columns renders a blank skeleton (`thead` + one empty row), not a plain empty-state paragraph (324).
- 325: preview request carries `previewLines`; the assigned `settings.kpLineItems`/`role: line-items` table is filled by canonical `column.key` aliases. Without an explicit target, exactly one live table is eligible; snapshots and other live tables stay untouched.
- 330/332: the right-flyout «Таблица» is a copy-on-write `kpTableLayout` for this КП, synced from the selected template's actual live line-items table columns: ←/→ and «Видна/Скрыта» rebuild the A4 table; the shared TableTemplate is never patched. «Открыть шаблон таблицы» uses the existing Documents tables route.
- 331: «Наценка %» changes only request `previewLines.unitPrice` (rounded to kopecks, clamped −100…1000); the catalog is never updated. «НДС %» defaults to **20** and is whole-deal, with prices treated as VAT-inclusive: footer VAT is extracted as `sum × vat / (100 + vat)`; VAT 0 hides the VAT row. No «Скидка» column.

## Center preview (TZ-SALES-319)

- При выборе шаблона или добавлении изделия: `DocumentTemplatesService.build(id, { previewLines, tableLayout, dealTotals, organizationId? })`; all three are request-only
- Лист = sandboxed `iframe` `srcdoc` (`data-test="kp-tpl-html-preview"`); без имени / «упрощённое» / bullet draftLines
- Смена шаблона или org из inspector `stateChange` → rebuild (debounce ~200ms)
- Loading / error — короткий RU на листе
- `<base href="{origin}/">` и absolute app-origin rewrite для `/uploads/...`; iframe `sandbox="allow-same-origin"` без scripts
- A4 iframe имеет intrinsic 794×1123px, `transform: scale(contain)` через ResizeObserver; sheet и документ `overflow: hidden` без H/V scroll; документ — единый A4 page box

## Дальше

- **WAVE-KP-COMPLETE** (аудит полноты [`…-kp-builder-completeness-audit.md`](../audits/2026-08-09-kp-builder-completeness-audit.md),
  волна [`WAVE-KP-COMPLETE.md`](../../tasks/_backlog/kp-vitrine/WAVE-KP-COMPLETE.md)) — после WAVE-KP-USABLE:
  **340** панель «Состав КП» → **341** коммерческие поля (номер/дата/срок, НДС persist, скидка,
  предоплата, сроки, Итого) → **345** «Скачать ▾» PDF/Печать/В архив → **343** панель «Получатель»
  (реквизиты клиента на бланке) → **344** панель «Условия» (заготовки + переменные) → **342** свои
  строки (доставка/монтаж, описание, скидка строки, «не входит в стоимость») → **346** многостраничный
  лист + перенос строк + размер/обрезка фото → **347** статус/версии/«Создать заказ» в верхней строке →
  **348** витрина: «уже в КП», кол-во при добавлении, модули/материалы.
  IA закреплена аудитом §3: верхняя строка = документ и вывод; левый рейл = Шаблон · Товары · Получатель;
  правый рейл = Состав · Параметры · Таблица · Условия; «Параметры» разложены секциями
  Документ / Стороны / Деньги / Сроки / Вид листа.
- **323–325** — fit / empty skeleton / draftLines bind (wave-2)
- **326** — products flyout **36–40rem** (≈×2) + transparent backdrop dismiss вне панели (вкл. iframe); A4 center/rails не сжимаются
- **327** — PiShowcaseCard md equal-height (эталон; sm/md/lg уже есть)
- **328** — visual trial: `PiShowcaseCard md` grid **3-col** in the wider ~58rem products flyout (narrow fallback 2→1), slightly compact rail spacing, search + category + pager, `Добавить` / `Редактировать` / `Создать изделие` без выхода из студии
- **332** — таблица синхронизируется с реальными columns выбранного бланка; right rail разделён на Параметры/Таблица, CTA = «Открыть шаблон таблицы», flyouts имеют воздух и content-height, витрина не клипается.
- **337** — Параметры содержит только фирму/наценку/НДС/оценку/клиента; columns и CTA «Открыть шаблон таблицы» доступны только в rail «Таблица».
- Persist Quotation / snapshot → later · **322 PARK** · Печать → **320 PARK**
- **318** cascade — SUPERSEDED by 328
- **WAVE-KP-TABLE-CONFIG** (канон [`…-kp-table-config-canon.md`](../audits/2026-08-09-kp-table-config-canon.md)): **307** пресет → **330** layout → **331** наценка/НДС
- **TZ-SALES-332** (audit [`…-kp-create-flyout-polish-audit.md`](../audits/2026-08-09-kp-create-flyout-polish-audit.md)): sync колонок панели=лист; ←→; rail Параметры·Таблица; pride padding; витрина без клипа
