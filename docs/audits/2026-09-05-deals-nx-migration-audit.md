# Аудит: Сделки — legacy → NX (идеальный порт)

date: 2026-09-05  
author: Cursor (Mode A)  
trigger: PO — вкладка «Сделки» на NX «накидана строками»; в legacy объёмнее; нужен порт как у Ганта (аудит → peer Claude → TZ), expand = всё по сделке, красиво по категориям; запрет текста впритык к рамке  
status: **PEER ACCEPTED** — Claude 2026-09-05; WAVE `docs/agent-checklists/WAVE-NX-DEALS.md`

### Preflight Check Output
- **Context read:** `nav-categories.ts` (deals); NX `orders-list.page.ts`, `order-detail.page.ts`, `proposals-list.page.ts`, `app.routes.ts`; legacy `deals-group-chips.ts`, `order-hub-tray.component.ts`, `orders.page.md` (HUB), `manager-desk.page.md`; `docs/audits/confidence/05-deals-contract.md`; `UX-FORM-CANON.md`, `paper-and-ink.md` (space tokens)
- **Key Constraints:** Mode A; necessity; один write-path Order; не тупой 1:1 copy; peer Claude до WAVE TZ
- **Deliverable:** этот аудит + inset-канон + PROMPT Claude peer
- **Validation Path:** после peer → WAVE + FIC A + page.md

---

## 1. Для PO (простым языком)

**«Сделки» в меню** — это не одна таблица в БД. Это группа: **КП → Договоры → Заказы**.  
**«Открыл сделку и увидел всё»** в старом продукте реализовано вокруг **заказа**: список + раскрытие строки (`order-hub-tray`) / стол менеджера `/desk` с тем же tray.

На NX сейчас:
- `/orders` — тонкий журнал (номер, статус, оплата, есть КП?, ссылка «Карточка»);
- `/orders/:id` — тонкая карточка (meta + позиции + оплата + ссылка в студию);
- `/proposals` — список КП (+ студия);
- **нет** `/contracts`, **нет** `/desk`, **нет** expand-tray с категориями жизни заказа.

То есть чип «Сделки» есть, **рабочее место сделки — нет**.

---

## 2. Что канонично считать «сделкой» (предложение Cursor)

| Слой | Смысл | SoT сущность |
|------|--------|--------------|
| Навигация «Сделки» | КП / Договоры / Заказы | routes + TOC |
| Рабочее место оператора | «моя сделка в работе» | **`Order`** (после convert / прямой заказ) |
| Предпродажа | КП | `Quotation` → Doc Studio |
| Юр. оболочка | Договор | `Contract` (legacy; на NX отсутствует) |

**Не плодить** сущность `Deal` в Mongo, пока peer не докажет иначе. Связка = Order hub + ссылки на КП/договор/снабжение/цех/склад/отгрузку/документы.

---

## 3. Матрица: legacy vs NX

| Возможность | Legacy | NX сейчас | Gap |
|-------------|--------|-----------|-----|
| TOC КП \| Договоры \| Заказы | `DEALS_TOC_CHIPS` + group-workspace | nav chips; нет единого workspace chrome на orders/proposals | IA shell |
| Список заказов + колонки X/Y ready | `/orders` pi-table | flat rows, мало колонок | данные/UX |
| **Expand под строкой** (всё по сделке) | `order-hub-tray` группы | **нет** | **P0** |
| Карточка заказа | detail + composition | thin S35 | P1 (tray может закрыть 80%) |
| Стол `/desk` | очередь + tray + flyouts | **нет route** | решить: порт desk **или** усилить `/orders` |
| КП список + студия | proposals + workspace | list + `/studio` | частично OK |
| Договоры | `/contracts` | **404 / нет** | P1 или park |
| Заказчик / объект | counterparty + site | create order есть; **нет** реестра/страницы заказчиков | реестры (clients) |
| Снабжение / склад / отгрузка в контексте заказа | lazy в tray | нет | в hub-port |
| Документы по заказу | tray → templates | нет | в hub-port |
| Блокнот заметок | desk-notes | нет | после hub / desk |
| Write из expand | запрещён (read + deep-link); desk пишет confirm/ship | — | сохранить канон |

Эталон групп tray (legacy lock, `orders.page.md`):

1. **Заказ** — состав (composition-tree), CTA карточки  
2. **Исполнение** — комбайн-strip, готовность, снабжение+производство  
3. **Логистика** — склад (reservations), отгрузка  
4. **Документы** — шаблоны / блокнот  

Визуал: мягкая подложка, группы с заголовком, **не** плоская жёлтая сетка без воздуха.

---

## 4. Реестры / данные, без которых «сделки» на NX хромают

Связано с волной Gantt-registries, но отдельный контур clients/deals:

| Нужно оператору | NX | Примечание |
|-----------------|----|------------|
| Заказчики (`Counterparty`) | нет страницы/реестра | nav ещё ссылает `/counterparties` — dead |
| Объекты (`Site`) | только `ensureDefault` при create | возможно thin в карточке заказчика |
| Люди / виды работ | gap (уже WAVE Gantt registries) | не блокер списка сделок |
| Договоры | нет | решить после peer: park vs thin registry |
| Организации | есть в registries | OK для «наша фирма» |

---

## 5. Что в legacy **не** тащить как есть

| Артефакт | Почему |
|----------|--------|
| Плоский «жёлтый» expand без групп | уже отвергнут PO visual lock |
| Текст вплотную к hairline (частый баг legacy) | новый канон inset — см. §7 / `paper-and-ink.md` |
| Дубль tray на desk + orders с разъездом шаблонов | был сведён к shared `order-hub-tray` — на NX сразу **один** компонент |
| Stub «Создать КП» с карточки прямого заказа | NX S35 правильно убрал |
| Totals/прайс КП внутри order hub | commerce strip — не смешивать с live BOM |
| Полный embed Ганта/Комбайна в desk | legacy stubs; deep-link достаточны на первом NX pass |
| Второй write-path статуса | запрещено (`05-deals-contract`) |

---

## 6. Целевое UX (как если бы PO = автор)

1. Открыл **Сделки → Заказы** (или единый «Стол» — peer выберет).  
2. Видит **все свои заказы-сделки** (фильтр активных по умолчанию).  
3. Клик по строке → **раскрытие под строкой**, не уход в пустую карточку.  
4. Внутри — **категории** (Заказ / Исполнение / Логистика / Документы + шапка: клиент, объект, КП, оплата, статус).  
5. Действия: deep-link / flyout где уже канон desk; **не** править состав заказа из expand (карандаш = каталог).  
6. Карточка `/orders/:id` — углубление, не единственный способ увидеть жизнь сделки.  
7. КП и Договоры остаются siblings в TOC; из tray — явные ссылки «это КП / этот договор».

---

## 7. Inset / «текст не к рамке» (продуктовый закон)

Зафиксировано в [`docs/paper-and-ink.md`](../paper-and-ink.md) § **Panel & expand inset** и кратко в `UX-FORM-CANON.md`.  
Любой expand / collapse / hairline-panel: **min padding `--space-3` (12px)** внутри рамки до текста; предпочтительно `--space-4` (16px) для group panels. Зазор между группами ≥ `--space-3`.  
Нарушение = визуальный FAIL в review, не «потом».

---

## 8. Черновик волны (НЕ финальные TZ — ждут Claude)

Имена предварительные:

| # | SIZE | Тема |
|---|------|------|
| D0 | L | IA: desk vs `/orders` hub + deals TOC chrome (ADR в TZ) |
| D1 | L | NX `order-hub-tray` port (read groups + lazy APIs) |
| D2 | L | Orders list: expand + columns + filters (desk-lite) |
| D3 | L | Counterparties registry/page (clients) |
| D4 | L | Contracts thin **или** PARK |
| D5 | S-pack | Inset audit pass на новые panels + docs smoke |

Gantt registries R1–R3 и Data IA — **не смешивать** в одном Freebuff-промпте с deals.

---

## 10. Peer Claude (принят) + next

**Решение IA:** C→A — порт hub-tray на `/orders`; `/desk` вне волны.  
**Поправки к черновику Cursor:** contracts = thin (BE готов), не park; counterparties дешевле (client есть); eyebrow Сделки≠Коммерция = P0 IA; hub-port ≈ вырезание `mode==='desk'`, не rewrite; комбайн-strip опционально drop; totals/прайс в tray уже отсутствуют.

**WAVE:** `docs/agent-checklists/WAVE-NX-DEALS.md` · TZ `tasks/_ready/nx-deals/` · промпт `tasks/PROMPT-FREEBUFF-NX-DEALS.md`.

---

## 9. Вопросы peer Claude — закрыты defaults

См. WAVE § PO defaults.
