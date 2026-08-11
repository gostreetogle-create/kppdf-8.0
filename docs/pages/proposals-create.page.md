# /proposals/create — Создать КП

**Route:** `/proposals/create` (вход из «Сделки» → КП по умолчанию ведёт сюда; «Все КП» остаётся `/proposals`)
**TZ:** **310–317 DONE** · **319 + 321 DONE** · wave-2 **323/324/325** · витрина **326–328 READY** (318→328) · **320/322 PARK**  
**Spec LOCK:** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md) §0 FROZEN  
**Аудит:** layout + overlay · [`preview-wave2`](../audits/2026-08-09-kp-create-preview-wave2.md) · [`product-vitrine`](../audits/2026-08-09-kp-create-product-vitrine.md)

## Зафиксировано (не менять без PO)

- Центр = только A4; flyout **overlay** (grid rails|center|rails fixed)
- Left rail: **Шаблон** + **Товары** + **Получатель**; Right: **Состав** + **Параметры** + **Таблица** + **Условия** (взаимоисключающие overlay-инструменты, TZ-SALES-340/332/343/344)
- 340: «Состав КП» показывает добавленные строки, позволяет менять количество/цену/единицу, дублировать, удалять и менять порядок; повторное добавление изделия увеличивает его количество. Изменения используют тот же build/autosave путь, что и лист.
- 342: в «Состав КП» можно добавить «Своя строка» без карточки каталога; для позиции доступны название, описание, ед. изм., скидка и флаг «Не входит в стоимость». Скидка уменьшает сумму строки, опциональные позиции остаются на листе и выводятся отдельной строкой под итогом; старые каталожные строки читаются без миграции.
- 346: «Вид листа» хранится в КП (`rowsFirstPage`, `rowsNextPage`, `photoScalePercent`, `photoCropYPercent`, `showPhotoColumn`). Build режет позиции на A4-листы, повторяет шапку и фон, выводит итог/условия только на последнем листе, а `pageNumbering` добавляет «Страница N из M». Центр показывает вертикальную ленту sandboxed iframe-листов; один лист по-прежнему без внутренних скроллов.
- 347: верхняя строка показывает статус «Черновик/Отправлено/Принято/Отклонено/В заказе/Отменено» и выбор разрешённого следующего статуса. «Сохранить версию» использует `freeze`, «Версии (N)» открывает сохранённый HTML только для просмотра без PATCH/autosave, «Создать заказ» доступна для принятого КП и после API ведёт в заказ, «Копировать КП» открывает duplicate в студии.
- 348/351: витрина «Товары» — chips Изделия/Модули/Материалы; на карточке «В КП: N» из реального состава, поле кол-ва (default 1) и Add & continue («Ещё +N» если уже в КП). Qty нормализуется к минимуму 1 (дробные значения для материалов сохраняются) и не передаёт в состав 0/отрицательные значения. Пустой вид или поиск без результатов объясняет по-русски, что сменить chip/поиск; активный chip остаётся явным. Модуль/материал пишут `lineKind` + `refId` со снимком имени/артикула/цены; старые `productId` строки читаются без миграции.
- 341: «Параметры» разделены на «Документ», «Деньги» и «Сроки»: номер/название/даты, НДС, скидка в % или ₽, предоплата и сроки сохраняются в КП и гидратируются после F5. Скидка меняет итог фоном, отдельной колонки на бланке нет.
- 345: верхняя строка «Скачать ▾» содержит только русские действия «PDF», «Печать» и «Сохранить в архив документов». Перед выводом дожимается автосохранение; PDF строится из того же сохранённого HTML, а «Печать» вызывает системную печать текущего A4 iframe. Сервер использует `puppeteer-core` и `PUPPETEER_EXECUTABLE_PATH`/системный Chrome; без движка приложение работает, PDF возвращает 503 с русской подсказкой.
- 343: левый рейл «Получатель» открывает overlay без сжатия A4: выбираются клиент, назначенный контакт и объект/адрес; карточка показывает ИНН/КПП, банк и подписанта, а «Параметры» содержит краткую строку и кнопку «Изменить». Ссылки `contactPersonId` и `siteId` сохраняются в КП, F5 их восстанавливает, а build передаёт их в реквизиты `counterparty.*` вместе с `contactName`, `contactPosition`, `siteName` и `siteAddress`.
- 344: правый рейл «Условия» редактирует только экземпляр текущего КП: строки можно добавить, удалить и переставить ↑/↓, библиотечный `TextBlock` добавляется без выхода из студии, а токены вставляются в позицию курсора. Условия сохраняются в `Quotation.terms`, восстанавливаются после F5 и попадают в HTML/PDF; неизвестные токены остаются текстом.
- Под chips нет ghost tools-strip; `flushBody` — студия вплотную к жёлтым chips
- CTA «Добавить шаблон»; pick закрывает панель шаблона
- `draftLines` in-memory до Save; Save создаёт/обновляет draft Quotation с items, templateId и non-null templateSnapshot, а `kp.create.lastDraftId`/`lastTemplateId` используются только для resume
- 338: вход из списка «Редактировать» использует `/proposals/create?id=...` и гидратирует тот же editable draft; «Создать» использует `?new=1` и не открывает второй form-редактор. User-visible подсказки — на русском.
- 339: «Сохранить КП» заменено русским статусом автосохранения «Сохранено»; после выбора шаблона и нашей фирмы draft сохраняется автоматически, а F5 восстанавливает товары, шаблон и клиента; удалённый КП не возрождается.
- 334: «Клиент» — searchable `PiOverflowSelect` по всем активным Counterparty без фильтра роли; выбранный клиент входит в autosave и resume.
- 349: индексы `quotations` приводит в порядок стартовая миграция, потому что в production `autoIndex` выключен; это предотвращает старые уникальные индексы и E11000 при создании нового черновика после удаления КП.
- 335: в экземпляр выбранной line-items таблицы можно добавить «Кол-во», «Цена» и «Сумма» без изменения общего шаблона; количество редактируется в панели «Товары», а существующая колонка «Рисунок» получает thumb товара.
- 336: статус `accepted` показывается как «Оплачена»; он блокирует товары, количество, шаблон, параметры и таблицу. Снятие статуса возвращает редактирование; при открытии оплаченной КП A4 использует сохранённый `templateSnapshot`, а «Копировать» создаёт новый draft в студии.
- Empty table-template with declared columns renders a blank skeleton (`thead` + one empty row), not a plain empty-state paragraph (324).
- 325: preview request carries `previewLines`; the assigned `settings.kpLineItems`/`role: line-items` table is filled by canonical `column.key` aliases. Without an explicit target, exactly one live table is eligible; snapshots and other live tables stay untouched.
- 330/332: the right-flyout «Таблица» is a copy-on-write `kpTableLayout` for this КП, synced from the selected template's actual live line-items table columns: ←/→ and «Видна/Скрыта» rebuild the A4 table; the shared TableTemplate is never patched. «Открыть шаблон таблицы» uses the existing Documents tables route.
- 331: «Наценка %» changes only request `previewLines.unitPrice` (rounded to kopecks, clamped −100…1000); the catalog is never updated. «НДС %» defaults to **20** and is whole-deal, with prices treated as VAT-inclusive: footer VAT is extracted as `sum × vat / (100 + vat)`; VAT 0 hides the VAT row. No «Скидка» column.

## Center preview (TZ-SALES-319)

- При выборе шаблона или добавлении изделия: `DocumentTemplatesService.build(id, { previewLines, tableLayout, dealTotals, organizationId? })`; all three are request-only
- Лист = sandboxed `iframe` `srcdoc` (`data-test="kp-tpl-html-preview"`); без имени / «упрощённое» / bullet draftLines
- При нескольких листах backend возвращает `.doc-page`, frontend разбирает его в вертикальный стек A4; верхняя строка показывает «Страница 1 из N».
- Смена шаблона, org, получателя или условий из панели → rebuild (debounce ~200ms)
- Loading / error — короткий RU на листе
- `<base href="{origin}/">` и absolute app-origin rewrite для `/uploads/...`; iframe `sandbox="allow-same-origin"` без scripts
- A4 iframe имеет intrinsic 794×1123px, `transform: scale(contain)` через ResizeObserver; sheet и документ `overflow: hidden` без H/V scroll; документ — единый A4 page box

## Вывод КП (TZ-SALES-345)

- «PDF» вызывает `POST /quotations/:id/pdf` и скачивает `КП-<номер>.pdf`; сервер берёт `templateSnapshot.html`, если он есть, иначе повторно вызывает существующий `build()` с сохранёнными строками и коммерческими итогами.
- «Печать» не открывает сырой HTML: печатается содержимое уже показанного sandboxed A4 iframe. Из списка «Все КП» PDF скачивается сразу, а «Печать» открывает сохранённое КП в студии с печатью текущего листа.
- «Сохранить в архив документов» создаёт новую финальную запись `GeneratedDocument` с `sourceType: quotation`; повторный вызов не перезаписывает историю.

## Дальше

- **WAVE-KP-SHAME-POLISH** ([`WAVE-KP-SHAME-POLISH.md`](../../tasks/_backlog/kp-vitrine/WAVE-KP-SHAME-POLISH.md)):
  **350** журнал Все КП (RU-статусы = студия) → **351** витрина краевые → **352** состав/условия/статус chrome →
  **353** превью/F5 → **354** self-pass менеджера. Без новых фич; deploy только по PO.
- **WAVE-KP-COMPLETE** 340…348 — **DONE** (на проде после warm deploy 2026-08-11).
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
