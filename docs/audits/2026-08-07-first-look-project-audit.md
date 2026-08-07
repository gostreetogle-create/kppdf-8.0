# First-look audit — kppdf ERP (2026-08-07)

**Режим:** Cursor Mode A (архитектор + будущий пользователь цеха). Код продукта не правился.  
**Срез:** `main` @ `a11cd26` · working tree: **~298 строк Gantt hotfix uncommitted**.  
**Планка:** PO-DIARY §1–§4 — показать коллегам (~10 чел.) без стыда; север КП → заказ → Гант → склад/отгрузка.

---

## Вердикт одной фразой

Продукт **уже можно показывать по северу до Ганта**, если **не потерять локальный hotfix**, **засеять данные** и **не обещать** отгрузку / канбан чертежей как готовые. Очередь исполнителей пуста — главный риск не «недоделанный backlog», а **WIP вне git** и **устаревшая карта приоритетов**.

---

## 1. Что я увидел «с первого взгляда»

| Слой | Состояние |
|------|-----------|
| Каркас ERP | Живой: Angular 20 + Nest + Mongo RS, Paper & Ink, ACL/capabilities |
| Коммерция | `/proposals` + «В заказ» + `/orders` — в коде DONE |
| Производство | `/production` shell + plan-estimate Gantt (PRODUCTION-303 на `08e7a45`) |
| Hotfix поверх 303 | **в working tree, не в remote** — фильтры, confirm дней, контекст полос |
| Склад | UX страниц есть; glue reserve→заказ слабый |
| Отгрузка | backlog `TZ-SHIPPING-301` parked |
| Чертежи / YouGile | каталог≈готов; канбан статусов — дыра (см. `docs/yougile/`) |
| Очередь TZ | `_active/` пусто · STATUS §IN WORK пусто · §READY **засорён** и врёт |
| Vision doc | `product-vision-lite` до правки этой сессии говорил «нет КП / Гант не сейчас» |

---

## 2. P0 — до показа коллегам

1. **Commit + единый FE+BE deploy Gantt hotfix**  
   Иначе на стенде снова: фильтры rail ≠ полосы; опасный глобальный PATCH `WorkType.days`.  
   Evidence: dirty `frontend/src/app/pages/production/**`, `docs/pages/production-cockpit.page.md`, untracked `docs/audits/2026-08-06-production-gantt-verdict-response.md`.

2. **PO browser smoke `/production` (15 мин)**  
   Логин → заказ с изделие→модуль→`WorkType.days` → полосы → inspector → смена фильтра → (опц.) смена дней с confirm.  
   Evidence: `_active-map` явно «after PO smoke 303»; без дней полосы пустые.

3. **Данные под сценарий**  
   Локальная Mongo / стенд не должны быть «3 DEMO и пусто». YouGile snapshot есть (`data/yougile-import/`), match sku в Mongo был ≈0.  
   Evidence: `docs/yougile/GAP-AND-REPLACEMENT.md`.

4. **Не деплоить FE без BE** (и наоборот) на волне 303/capabilities.  
   Evidence: PO-DIARY quality bar.

---

## 3. P1 — доверие к северу (после P0)

5. **Deep-link inspector → заказы мёртвый**  
   `order-inspector` шлёт `queryParams: { q: number }`, `orders.page.ts` читает только локальный search signal — `?q=` игнорируется. Либо починить, либо убрать ссылку (сейчас это «кнопка-обман»).

6. **Один живой прогон КП → «В заказ» → появление в rail**  
   Unit/archive говорят DONE; runtime на целевой БД в этом аудите не гонялся.

7. **Люди ↔ виды работ**  
   Без заполнения на полосах будет «—» — для показа коллегам это выглядит как «недоделка», хотя модель ок.

8. **Синхронизация приоритетов в docs**  
   Gap-map vision (правка в этой сессии) + не доверять корневому `STATUS.md` §READY как board. Truth: `_active` + `_active-map` + `progress.md`.

---

## 4. P2 — после стабильного показа (не смешивать с hotfix)

| ID / тема | Зачем | Когда |
|-----------|--------|--------|
| PRODUCTION-308 | responsive inspector, keyboard, scroll-to-today | после smoke |
| PRODUCTION-309 | BE `production:write` + order-level days **до** любого resize | **обязательно до drag** |
| PRODUCTION-310 | a11y grid / focus / patterns без цвета | после 308 |
| Чертежи в cockpit | замена YouGile-канбана, не дубль `/products` | отдельный поток |
| SHIPPING-301 | board ready→shipped + docs | закрытие севера |
| PRODUCTION-304+ | stuck / check-in / auto-chain | только после PO ok на 303+hotfix |

**Явно не делать сейчас:** drag-reschedule, ProductionSchedule SoT, auto status, FE-only deploy.

---

## 5. UX / бизнес-запахи (глазами менеджера)

- Ссылка «Открыть в списке заказов» обещает поиск и **не ищет** — подрывает доверие сильнее, чем отсутствие фичи.
- Гант без людей на видах работ читается как «пустая полоска», не как «план без назначения».
- Vision/STATUS врали агентам → риск, что следующий исполнитель снова «откроет КП» или «отложит Гант».
- Показ без данных = пустой кокпит = «продукт не работает», хотя код живой.
- Отгрузку на демо лучше **назвать следующим этапом**, чем показывать half UI.

---

## 6. Что уже хорошо (не ломать)

- Lego-shell кокпита без лишней сущности ProductionOrder — правильная база.  
- КП → заказ как конверсия, не три дубля коммерции.  
- Каталог + фото + doc-constructor как витрина аккуратности.  
- Сознательный отказ от drag до safe estimate (309) — совпадает с PO-DIARY «мышью чётко».

---

## 7. Рекомендуемые следующие шаги PO

| # | Кто | Действие |
|---|-----|----------|
| 1 | Исполнитель / PO | «Закоммить Gantt hotfix и задеплой FE+BE» |
| 2 | PO | 15 мин smoke по чеклисту §2.2 |
| 3 | Cursor | thin TZ: orders `?q=` deep-link (или удаление ссылки) |
| 4 | Cursor по запросу | executable TZ-PRODUCTION-308 после PASS smoke |
| 5 | Данные | seed DEMO или YouGile→products import на целевую Mongo |

One-liner исполнителю (после явной команды PO):

> Прочитай `docs/audits/2026-08-07-first-look-project-audit.md` §2 P0.1 и `docs/audits/2026-08-06-production-gantt-verdict-response.md`. Закоммить только production Gantt hotfix + связанные docs, прогони targeted jest/tsc зоны production, push. Deploy — только если PO сказал «деплой».

---

## 8. Unknowns (не проверялось в этой сессии)

- Живой HTTP/браузер на стенде / local (реальные bars, F5-сессия, dark/light контраст).  
- Состояние Synology prod vs этот working tree.  
- Наполненность Workers / WorkType.days / composition на целевой БД.  
- Прогнан ли YouGile import в какую-либо Mongo или только snapshot на диске.  
- Desktop installer URL на проде.

---

## Связанные артефакты

- `docs/audits/2026-08-06-production-gantt-verdict-response.md`  
- `docs/yougile/GAP-AND-REPLACEMENT.md`  
- `docs/agent-checklists/_active-map.md`  
- `docs/product-vision-lite.md` (gap-map синхронизирован в этой сессии)  
- Canvas (IDE): `canvases/first-look-audit.canvas.tsx`
