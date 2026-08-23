# /proposals/create — Создать КП (SUPERSEDED — workspace после 408)

> **STATUS 2026-08-23 (TZ-KP-WS-408):** route `/proposals/create` теперь отдаёт
> **тот же компонент**, что `/proposals/workspace` (query params id/new/source/
> sourceId/templateDraft/action=print сохраняются — конструктор workspace их читает).
> Этот файл — **исторический канон** старой `ProposalCreatePage`, сохранённой
> один релиз как `proposal-create.legacy.page.ts` (rollback path).
> **Новые фичи писать ТОЛЬКО в [`kp-workspace.page.md`](./kp-workspace.page.md).**

**Route:** `/proposals/create` (вход из «Сделки» → КП по умолчанию ведёт сюда; «Все КП» остаётся `/proposals`)
**TZ:** **310–317 DONE** · **319 + 321 DONE** · wave-2 **323/324/325** · витрина **326–328 READY** (318→328) · **320/322 PARK**  
**Spec LOCK:** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md) §0 FROZEN  
**Аудит:** layout + overlay · [`preview-wave2`](../audits/2026-08-09-kp-create-preview-wave2.md) · [`product-vitrine`](../audits/2026-08-09-kp-create-product-vitrine.md)

## Зафиксировано (не менять без PO)

- Центр = только A4; flyout **overlay** (grid rails|center|rails fixed)
- Left rail: **Шаблон** + **Товары** + **Получатель**; Right: **Параметры** · **Редактор таблицы** · **Условия** · **Вывод** (взаимоисключающие overlay-инструменты; порядок рейла TZ-SALES-356 + 367)
- **367 (no-savebar):** над A4 **нет** полосы «Сохранено / статус / версии / заказ / копировать / Скачать». Lifecycle (статус, freeze/версии, «В заказ», копировать) — только на `/proposals` (Все КП). Вывод из студии = rail «Вывод» → Печать · PDF · Архив (`requestOutput`). Autosave пишет draft без видимой полосы; ошибка — toast. Аудит: [`2026-08-12-kp-create-no-savebar-canon.md`](../audits/2026-08-12-kp-create-no-savebar-canon.md).
- 340: «Состав КП» показывает добавленные строки, позволяет менять количество/цену/единицу, дублировать, удалять и менять порядок; повторное добавление изделия увеличивает его количество. Изменения используют тот же build/autosave путь, что и лист.
- 342: в «Состав КП» можно добавить «Своя строка» без карточки каталога; для позиции доступны название, описание, ед. изм., скидка и флаг «Не входит в стоимость». Скидка уменьшает сумму строки, опциональные позиции остаются на листе и выводятся отдельной строкой под итогом; старые каталожные строки читаются без миграции.
- 346: «Вид листа» хранится в КП (`rowsFirstPage`, `rowsNextPage`, `photoScalePercent`, `photoCropYPercent`, `showPhotoColumn`). Build режет позиции на A4-листы, повторяет шапку и фон, выводит итог/условия только на последнем листе, а `pageNumbering` добавляет «Страница N из M». Центр показывает вертикальную ленту sandboxed iframe-листов; один лист по-прежнему без внутренних скроллов.
- **376 (geometry-aware page split):** при `rowsFirstPage=0` / `rowsNextPage=0` build оценивает вместимость по `layout.height` рамки line-items таблицы в шаблоне (A4 content × fraction − thead, деление на оценку высоты строки с учётом шрифта/фото); явные числа >0 остаются ручным override. `pageBreakBefore` режет build-страницы; positioned table block получает `overflow:hidden`; итог на последней странице = полный КП. UI hint: «0 — автоматически по рамке таблицы в шаблоне». Successor: **377** continuation bg+table.
- **378 (multipage bg + full next pages):** multipage build поднимает page CSS (`.doc-bg`, `.doc-content`, table clip) в outer `<head>` — фон не слетает на стр.2+; `.doc-page { position:relative }`. Auto `rowsNextPage=0` считает вместимость от **полного** листа (~1.0), не от короткой рамки стр.1; continuation remaps line-items table `top≈0%`, `height≈100%`. Manual rowsFirst/Next >0 без регрессии.
- **373 (table font size):** `sheetLayout.tableFontSize` (px, default **12**, clamp **8…20**) — **тело** таблицы. UI: Параметры→«Вид листа» — «Шрифт таблицы»; тулбар — Type + overflow-select (`kp-table-editor-font`). Preview `td` получает body `font-size`. Не путать с `/doc-constructor/tables` и per-column font.
- **374 (chrome + dual font + row drawer):** тулбар Рамка/Шапка — Lucide icon-buttons (`Square`/`Bold`) с `title`/`aria-label` состояния; `sheetLayout.tableHeaderFontSize` (default **12**, clamp **8…20**) отдельно от тела — UI «Шрифт шапки» + preview `th`; правый жёлоб строки — **только** chevron; карандаш/⋯/корзина → секция «Действия» в drawer («Создать копию в каталоге»); открытая строка+drawer в ink-рамке, соседи `opacity: 0.5` (локально, как UX-319); Ещё → «Открыть шаблон в Документах».
- **375 (products rail cleanup):** в flyout «Товары» **нет** списка «Позиции КП» (`kp-rail-draft-lines`); состав и qty редактируются в «Редакторе таблицы»; на карточках каталога остаются «В КП: N», add-qty и «Ещё +N». Custom lines без карточки — только в редакторе таблицы.
- ~~347/352: верхняя строка показывает статус…~~ **superseded 367** — lifecycle UI на Все КП, не в студии.
- 348/351: витрина «Товары» — chips Изделия/Модули/Материалы; на карточке «В КП: N» из реального состава, поле кол-ва (default 1) и Add & continue («Ещё +N» если уже в КП). Qty нормализуется к минимуму 1 (дробные значения для материалов сохраняются) и не передаёт в состав 0/отрицательные значения. Пустой вид или поиск без результатов объясняет по-русски, что сменить chip/поиск; активный chip остаётся явным. Модуль/материал пишут `lineKind` + `refId` со снимком имени/артикула/цены; старые `productId` строки читаются без миграции.
- 341: «Параметры» разделены на «Документ», «Деньги» и «Сроки»: номер/название/даты, НДС, скидка в % или ₽, предоплата и сроки сохраняются в КП и гидратируются после F5. Скидка меняет итог фоном, отдельной колонки на бланке нет.
- ~~345: верхняя строка «Скачать ▾»…~~ **superseded 367** — те же действия в rail «Вывод» (Печать первая).
- 343: левый рейл «Получатель» открывает overlay без сжатия A4: выбираются клиент, назначенный контакт и объект/адрес; карточка показывает ИНН/КПП, банк и подписанта, а «Параметры» содержит краткую строку и кнопку «Изменить». Ссылки `contactPersonId` и `siteId` сохраняются в КП, F5 их восстанавливает, а build передаёт их в реквизиты `counterparty.*` вместе с `contactName`, `contactPosition`, `siteName` и `siteAddress`.
- 344/352: правый рейл «Условия» редактирует только экземпляр текущего КП: пустое состояние прямо ведёт к «Добавить условие» или библиотеке, строки можно удалить и переставить ↑/↓, библиотечный `TextBlock` добавляется без выхода из студии, а токены вставляются в позицию курсора. Условия сохраняются в `Quotation.terms`, восстанавливаются после F5 и попадают в HTML/PDF; неизвестные токены остаются текстом.
- 352: пустой «Состав КП» даёт явную кнопку «Открыть «Товары»»; «Своя строка» и поле «Название» остаются русскими, без молчаливой пустой панели.
- **355:** «Состав КП» — wide overlay (`min(50vw, 52rem)`), **таблица** строк (не куча карточек); qty/цена/скидка/опц здесь; A4 только превью; карандаш открывает FullEditor изделия/модуля/материала без ухода со студии. Аудит: [`2026-08-11-kp-composition-table-audit.md`](../audits/2026-08-11-kp-composition-table-audit.md).
- **356–358 (WAVE-KP-TABLE-STUDIO):** «Своя строка» — full-width footer состава; рейл Параметры→Состав→Таблица→Условия. Кнопка «Таблица» = **KP Table Studio** (~A4 width): chrome рамки/шапки, width% колонок, живая HTML-таблица позиций этого КП (qty/цена пишут в тот же `draftLines`). Build применяет width/chrome на A4. Shared TableTemplate не пишется. Vision: [`2026-08-11-kp-table-studio-vision.md`](../audits/2026-08-11-kp-table-studio-vision.md).
- **359–361 (WAVE-KP-TABLE-EDITOR):** Состав + Table Studio слиты в единый «Редактор таблицы» — один flyout (~A4 width) с живыми строками, скидкой/опц. в зоне «только в КП», фото-колонкой и тулбаром; старые composition/table-studio удалены. photoUrl в QuotationItem BE+FE.
- **364 (Рамка/Шапка):** тулбар: Рамка thin|normal|thick + Шапка normal|bold; chrome → page → build A4.
- **365 (DnD строк):** drag строк за левый жёлоб; ↑↓ сохранены; один write-path порядка; read-only off.
- **370 (row layout drawer):** в правом жёлобе chevron «Настройки строки» раскрывает detail-row под выбранной строкой (одна за раз). Только визуал бланка: высота auto|compact|large, акцент, разделитель сверху, с новой страницы, показывать описание, фото inherit|contain|cover. Коммерция (qty/цена/сумма/скидка/Опц./название) остаётся в основной строке; width — в caret шапки. Snapshot `QuotationItem.rowPresentation` → live table + browser print + server PDF; старые КП без поля = defaults. Non-default → постоянный индикатор на chevron.
- **371 (real product photo output, DONE):** карточка изделия переносит `description` и реальный thumb/medium из populated `Product.photoIds` в `ProposalDraftLine`; по умолчанию layout КП содержит видимую колонку `Фото`, которую можно скрыть/вернуть/переместить. FE/BE aliases синхронны, saved `sheetLayout` не теряется в server rebuild. Для PDF разрешены только own `/uploads/...`, configured own HTTP origin и image data assets; relative uploads получают backend base URL, image load ждёт bounded completion, invalid/missing URL даёт нейтральное `Нет фото`. KP3 фото gap не маскируется demo-картинкой: evidence зависит от controlled fixture и `TZD-47 → MIG-303`.
- **372 (snapshot edit/catalog resolution, DONE):** `Наименование / Описание / Артикул / Ед.` для source-linked Product редактируются только в snapshot конкретного КП; autosave не мутирует Product. При выходе из «Редактора таблицы» pending rows проходят единый review с решениями «Только в КП» / «Обновить изделие» / «Создать копию»; source update отправляет только identity fields с `expectedVersion`, Product copy rebinds текущую строку, а явное «Дублировать строку КП» сохраняет тот же Product. Коммерческие qty/price/discount/optional и row presentation никогда не sync в каталог.
- **UX-318:** меню «Колонки» в «Редакторе таблицы» — checkbox stay-open (закрытие: вне / Escape / повторный триггер; без mouseleave и close-on-each-toggle).

- **363 (chrome):** панели-дети студии ужаты по Paper & Ink — без дублей подсказок: имя шаблона под селектом убрано (его и так показывает trigger), пустое «Условия» не повторяет видимые CTA, в «Параметрах» три повтора «только в этом КП» сведены к одной подсказке про наценку, а «Клиент» в «Получателе» снова выбирается через searchable `PiOverflowSelect` (канон 334), а не search + native select.
- **362 (WAVE-KP-STUDIO-CHROME):** flyout тиры **S** (`--kp-flyout-s` ≈20rem: Шаблон/Параметры/Условия/Вывод) и **L** (`--kp-flyout-l` =794px: Товары/Редактор таблицы/Получатель); иконка Условий = `ScrollText`, не дубль `FileText` шаблона. Аудит: [`2026-08-12-kp-studio-flyout-chrome-audit.md`](../audits/2026-08-12-kp-studio-flyout-chrome-audit.md).
- **316 (WAVE-NAV-RETURN):** «Редактировать шаблон» открывает **живой конструктор** `/doc-constructor/builder/:id` (не список `/templates?templateId=` — query там не читался) с `?returnUrl` = текущий Create path (вкл. query id черновика); «←» в конструкторе возвращает в Create. Канон: [`2026-08-12-nav-return-gutters-canon.md`](../audits/2026-08-12-nav-return-gutters-canon.md).
- Под chips нет ghost tools-strip; `flushBody` — студия вплотную к жёлтым chips
- CTA «Добавить шаблон»; pick закрывает панель шаблона
- `draftLines` in-memory до Save; Save создаёт/обновляет draft Quotation с items, templateId и non-null templateSnapshot, а `kp.create.lastDraftId`/`lastTemplateId` используются только для resume
- 338: вход из списка «Редактировать» использует `/proposals/create?id=...` и гидратирует тот же editable draft; «Создать» использует `?new=1` и не открывает второй form-редактор. User-visible подсказки — на русском.
- 339: видимая полоса «Сохранено» убрана (367); после выбора шаблона и нашей фирмы draft по-прежнему сохраняется автоматически (toast при ошибке), F5 восстанавливает товары, шаблон и клиента; удалённый КП не возрождается.
- 334: «Клиент» — searchable `PiOverflowSelect` по всем активным Counterparty без фильтра роли; выбранный клиент входит в autosave и resume.
- 349: индексы `quotations` приводит в порядок стартовая миграция, потому что в production `autoIndex` выключен; это предотвращает старые уникальные индексы и E11000 при создании нового черновика после удаления КП.
- 335: в экземпляр выбранной line-items таблицы можно добавить «Кол-во», «Цена» и «Сумма» без изменения общего шаблона; количество редактируется в «Редакторе таблицы» (375 убрал дубль в «Товары»), а существующая колонка «Рисунок» получает thumb товара.
- 336/352: статус `accepted` показывается как «Принято»; он блокирует товары, количество, шаблон, параметры и таблицу. Снятие статуса возвращает редактирование; при открытии принятого КП A4 использует сохранённый `templateSnapshot`. Копировать / версии / заказ — на Все КП (не в студии savebar).
- Empty table-template with declared columns renders a blank skeleton (`thead` + one empty row), not a plain empty-state paragraph (324).
- 325: preview request carries `previewLines`; the assigned `settings.kpLineItems`/`role: line-items` table is filled by canonical `column.key` aliases. Without an explicit target, exactly one live table is eligible; snapshots and other live tables stay untouched.
- 330/332: the right-flyout «Таблица» is a copy-on-write `kpTableLayout` for this КП, synced from the selected template's actual live line-items table columns: ←/→ and visibility rebuild the A4 table; the shared TableTemplate is never patched. «Открыть пресет в Документах» uses the existing Documents tables route.
- **357/358:** Table Studio adds instance `widthPercent` + `tableChrome` (border/header weight); build HTML reflects them on the live line-items table.
- 331: «Наценка %» changes only request `previewLines.unitPrice` (rounded to kopecks, clamped −100…1000); the catalog is never updated. «НДС %» defaults to **20** and is whole-deal, with prices treated as VAT-inclusive: footer VAT is extracted as `sum × vat / (100 + vat)`; VAT 0 hides the VAT row. No «Скидка» column.

## Center preview (TZ-SALES-319)

- При выборе шаблона или добавлении изделия: `DocumentTemplatesService.build(id, { previewLines, tableLayout, dealTotals, organizationId? })`; all three are request-only
- Лист = sandboxed `iframe` `srcdoc` (`data-test="kp-tpl-html-preview"`); без имени / «упрощённое» / bullet draftLines
- При нескольких листах backend возвращает `.doc-page`, frontend разбирает его в вертикальный стек A4; нумерация «Страница N из M» — в самом бланке (`pageNumbering`), без дубля над листом в студии.
- Превью доступно только для просмотра: iframe sandboxed и не принимает клики/редактирование внутри документа. Loading/error на листе — короткие русские «Загрузка превью…» / «Не удалось построить превью». F5 гидратирует состав, получателя, условия и `sheetLayout` из сохранённого черновика.
- Смена шаблона, org, получателя или условий из панели → rebuild (debounce ~200ms)
- Loading / error — короткий RU на листе
- `<base href="{origin}/">` и absolute app-origin rewrite для `/uploads/...`; iframe `sandbox="allow-same-origin"` без scripts
- A4 iframe имеет intrinsic 794×1123px, `transform: scale(contain)` через ResizeObserver; sheet и документ `overflow: hidden` без H/V scroll; документ — единый A4 page box

## Вывод КП (TZ-SALES-345 → 367 → 368)

- Из студии: правый rail **Вывод** (`data-test="kp-create-toggle-output"`) → overlay: **Печать** · **PDF** · **Сохранить в архив документов** (Печать первая).
- **368 (канон вывода):** Печать свободная — требует только готовое HTML-превью, **не** фирму и **не** форсит save. PDF/Архив работают с сохранённой сущностью: есть draft id → сразу; нет id и можно сохранить → save затем PDF/архив; иначе отдельный тост «Для PDF/архива нужны шаблон, готовое превью и наша фирма» (не общий текст печати). Аудит: [`2026-08-12-kp-output-gates-canon.md`](../audits/2026-08-12-kp-output-gates-canon.md).
- «PDF» вызывает `POST /quotations/:id/pdf` и скачивает `КП-{номер}.pdf` (без номера в UI — `КП-черновик-{shortId}.pdf`); сервер берёт `templateSnapshot.html`, если он есть, иначе повторно вызывает существующий `build()` с сохранёнными строками и коммерческими итогами.
- «Печать» (TZ-SALES-366) НЕ зовёт print() внутри sandbox-превью (Chrome игнорирует `Ignored call to 'print()'`): тот же build HTML всех листов открывается во временном родительском iframe печати (модалки разрешены, кадр убирается после диалога), а PDF остаётся отдельным серверным каналом. Из списка «Все КП» PDF скачивается сразу, а «Печать» открывает сохранённое КП в студии и печатает все листы превью.
- «Сохранить в архив документов» создаёт новую финальную запись `GeneratedDocument` с `sourceType: quotation`; повторный вызов не перезаписывает историю.
- **379 (server PDF engine):** prod Docker-образ backend включает Chromium + кириллические шрифты (`PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser`, `shm_size: 1gb`, `--disable-dev-shm-usage`). Тост «Сервис печати недоступен…» (503) — только если бинарь сломан или отсутствует вне prod-образа; dev без Chrome по-прежнему может fallback на «Печать в браузере».
- **known_limitation:** отдельной страницы «просмотр готового КП» нет — park / successor после чистки студии (не эта TZ).
- **successor (не эта TZ):** авто-PDF на ключевых переходах lifecycle (Принято; «Оплачено» при появлении) — класть PDF-снимок на сервер версиями .1/.2 после стабилизации статусов на Все КП.

## Дальше

- **WAVE-KP-SHAME-POLISH** ([`WAVE-KP-SHAME-POLISH.md`](../../tasks/_backlog/kp-vitrine/WAVE-KP-SHAME-POLISH.md)):
  **350** журнал Все КП (RU-статусы = студия) → **351** витрина краевые → **352** состав/условия/статус chrome →
  **353** превью/F5 → **354** self-pass менеджера. Без новых фич; deploy только по PO.
- **WAVE-KP-COMPLETE** 340…348 — **DONE** (на проде после warm deploy 2026-08-11).
- **323–325** — fit / empty skeleton / draftLines bind (wave-2)
- **326** — products flyout **36–40rem** (≈×2) + transparent backdrop dismiss вне панели (вкл. iframe); A4 center/rails не сжимаются
- **327** — PiShowcaseCard md equal-height (эталон; sm/md/lg уже есть)
- **328** — visual trial: `PiShowcaseCard md` grid **3-col** in the wider ~58rem products flyout (narrow fallback 2→1), slightly compact rail spacing, search + category + pager, `Добавить` / `Редактировать` / `Создать изделие` без выхода из студии
- **UX-342** — KP products rail pager = shared `app-pi-pagination` (range + ‹› + numbers, `showPageSize=false`); `PAGE_SIZE` **10** (was 12)
- **332** — таблица синхронизируется с реальными columns выбранного бланка; right rail разделён на Параметры/Таблица, CTA = «Открыть шаблон таблицы», flyouts имеют воздух и content-height, витрина не клипается.
- **337** — Параметры содержит только фирму/наценку/НДС/оценку/клиента; columns и CTA «Открыть шаблон таблицы» доступны только в rail «Таблица».
- Persist Quotation / snapshot → later · **322 PARK** · Печать → **320 PARK**
- **318** cascade — SUPERSEDED by 328
- **WAVE-KP-TABLE-CONFIG** (канон [`…-kp-table-config-canon.md`](../audits/2026-08-09-kp-table-config-canon.md)): **307** пресет → **330** layout → **331** наценка/НДС
- **TZ-SALES-332** (audit [`…-kp-create-flyout-polish-audit.md`](../audits/2026-08-09-kp-create-flyout-polish-audit.md)): sync колонок панели=лист; ←→; rail Параметры·Таблица; pride padding; витрина без клипа
