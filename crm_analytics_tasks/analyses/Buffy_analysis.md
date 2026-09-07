# ФУНДАМЕНТАЛЬНОЕ ЯДРО — Анализ (Buffy)

> Анализ слоёв системы kppdf-8.0. Разделы 1–4 документа «Master Core».
> Раздел 5 (вопросы) — в отдельном файле.

## ⚠️ Как читать «8 версий»
В каталоге нет восьми папок-версий — это **одна эволюционирующая система**. «8 версий» трактуются как **8 реальных слоёв/генераций** на диске:

| # | Слой (что на диске) | Где | Что дал |
|---|---------------------|-----|---------|
| 1 | KP3-legacy (исходная) | `tasks/_backlog/migrate-kp3/` | Бизнес-сценарии «с нуля» |
| 2 | Legacy-модель (90 сущностей) | `docs/_archive_legacy/`, `docs/data-model.md`, `data/` | Полнота домена + карта дублей |
| 3 | Backend NestJS + Mongo | `backend/` (19+ модулей, 72 схемы) | Transaction-safe ядро, счётчики, аудит, idempotency |
| 4 | Legacy Angular frontend | `frontend/` | Paper & Ink, Signals, silent-http, DSL |
| 5 | NX frontend | `frontend-nx/` | Реестры + Studio S2 (геометрия A4) |
| 6 | Desktop (импорт) | `desktop/` (Svelte) | Excel/фото-импорт каталога + journal propose→confirm |
| 7 | Mobile + OrchestratorKit | `mobile/`, `OrchestratorKit/` | Multi-agent координация, Team Room, snapshot-immutability |
| 8 | Ops/Deploy | `deploy/synology`, `docker-compose.prod`, `start.mjs` | One-command старт, health, backup, no-wipe deploy |

---

## 1. Технологический стек и Архитектура

### 1.1 Стек
- **Frontend:** Angular 20 standalone + **Signals** + `OnPush`; `input<T>()`, `inject()`, `@if/@for`.
- **Дизайн-система:** **Paper & Ink** — OKLCH-токены, hairline (1px, без shadow), `pi-focus-ring`, тёмная тема через `oklch()`. Без Material/PrimeNG/AG Grid; Lucide-иконки.
- **Стили:** TailwindCSS v4 + `--color-*`; запрет `#[hex]`, `bg-white`, `box-shadow`.
- **Backend:** NestJS 10 + Mongoose 8 + MongoDB 7 (**Replica Set обязателен**).
- **Качество:** jest (unit+e2e), ESLint (+ `no-raw-ui-values`), `madge`, axe-core.

### 1.2 Ключевые решения
1. CSR SPA без SSR (TZ-80 REJECTED). Поиск только MongoDB (regex+индексы); Vector DB = NO (TZ-105.1 canonical), future-seam на `$vectorSearch`.
2. Signals + httpResource + **silent-http** (`{ok,data|error}`). Запрещены голые subscribe.
3. `SubmitGuard` + `IdempotencyInterceptor` — против двойных сабмитов.
4. CRUD-DSL `defineEntity<T,P>()` + `PiEntityListComponent`.
5. Backend Module→Controller→Service→Schema; DTO whitelist.
6. Аудит: AsyncLocalStorage → `$locals.userId` → `auditPlugin`.
7. **Snapshot immutability (CORE-301)** — deep-frozen снапшот при переходах.
8. Атомарные счётчики `prefix-YYYY-NNN` (требуют Replica Set).
9. Team Room multi-agent по CONFLICT-KEYS.

### 1.3 Запреты
`@Input()`, constructor DI, `*ngIf/*ngFor`, `any`, shadows, hex-цвета, Vector DB SDK. Бизнес-тексты API — на русском.

---

## 2. Архитектура данных (Сущности)

### 2.1 Карта — 6 кирпичей
```
 Каталог ─► КП ─► Заказ ─► Производство ─► Склад ─► Отгрузка
```
И вокруг: Контрагенты/Организации, Люди (Сотрудник≠Пользователь), Документы/Шаблоны, Справочники, Финансы.

### 2.2 Главные сущности и связи
| Блок | Сущности | Связи |
|------|----------|-------|
| Каталог | Материал, Изделие, Модуль, Состав, Категория, Ед.изм | изделие = модули+материалы в `composition[]`; глубина ≤8; циклы запрещены; Product→raw запрещён |
| Клиенты | Организация, Контрагент, Человек, Роль | ⚠️ Контрагент ⚠️ дубль Организации |
| Продажи | КП (единая), Договор, Заказ, Счёт, Отгрузка, Флаг-оплаты | КП→Заказ→Договор(optional)→Склад/Отгрузка |
| Производство | Заказ-производства, Вид работ, Раб.центр, Сотрудник, Задача | Сотрудник←Виды работ, ставка; Задача←Заказ |
| Склад | Склад, Позиция-хранения, Движение, Резерв | **остаток = сумма движений**; резерв связывает Заказ↔Склад |
| Закупки (новые) | SupplyRequest, SupplyTask | заменяют legacy Purchase* |
| Документы | Шаблон, Тип, Текст-блок, Таблица-шаблон, Сформ.документ | шаблон→PDF/HTML, автозаполнение |
| Финансы | Калькуляция/Себест., Факт-стоимость, Сверка | калькуляция = Σматериалов+Σработ+overhead% |
| Доступ | Пользователь, Роль, Право, Страница√, Аудит | Пользователь≠Сотрудник; доступ «страницей» |

### 2.3 Критичные правила
- Валюта — только RUB (модуль Currency удалён; ⚠️ seed RUB/USD/EUR остался).
- Остаток SoT = движения.
- Снапшот при переходах.
- soft-delete глобально; unique+`deletedAt: null`.
- Стабильные артикулы/ключи для миграций и portable-export.

---

## 3. Целостная Бизнес-логика

### 3.1 Жизненный цикл сделки
1. Каталог готов (цена+себестоимость).
2. Менеджер собирает **КП** (одна сущность, с персональной наценкой клиента).
3. КП подтвердили → **Заказ** (со снапшотом). Договор — optional.
4. Заказ готов? Нет → **Проектирование/чертежи**. Да → **Производство** (виды работ/модули → люди → Production Cockpit/Гант).
5. **Снабжение** при необходимости (SupplyRequest/SupplyTask).
6. Готово → **Склад**: приход, **резерв под заказ** (glue — дыра).
7. **Отгрузка частичная**.
8. **Оплата/Флаг + Архив** — снапшот замораживается.

### 3.2 Статусы/FSM
- Единый FSM Заказа — правда для склада/отгрузки/производства.
- Остаток производное от движений.
- Себестоимость: recalc-модули ×qty → snap при «активации».

### 3.3 Автоматизации
Нумерация документов атомарно · автозаполнение шаблонов из заказа/КП · аудит · резерв/списание при отгрузке · лёгкие уведомления статуса.

### 3.4 Доступ (~10 чел.)
Админ / Директор (выдаёт страницы галочками) / Менеджер / Работник. Правило: **доступ «страница целиком»**; backend = authority, FE-гейт = UX-видимость.

---

## 4. Золотой фонд фич (Lost & Found)
| Фича | Где | Почему золото |
|------|-----|---------------|
| Paper & Ink + OKLCH + hairline | frontend | Чистовой «дорогой» UI |
| Signals + silent-http + httpResource | frontend | Детерминированный data-flow |
| CRUD-DSL defineEntity | frontend | CRUD за минуты, единый вид |
| ⌘K command palette | frontend | Быстрый доступ |
| Live OKLCH theme editor | frontend | Смена стиля без рефактора токенов |
| Pure-Angular SVG charts (NO d3) | frontend | Лёгкие графики |
| Snapshot immutability (CORE-301) | backend | Архив/отгрузка не «плывут» |
| Атомарные счётчики `prefix-YYYY-NNN` | backend | Номера не дублируются |
| Audit-плагин + AsyncLocalStorage | backend | «Кто что менял» бесплатно |
| Idempotency-Key + SubmitGuard | оба | Двойной сабмит ≠ двойной заказ |
| Excel/фото-импорт (desktop) | desktop | Быстрый ввод каталога |
| Portable Export / Excel-пакет (IDEA-001) | бэклог | DR, лёгкая миграция |
| Studio S2 геометрия A4 (не 1.726) | frontend-nx | Документы как на бумаге |
| Себестоимость/калькуляция | оба | КП по факту, не «на глаз» |
| Реестры + capabilityRouteGuard | frontend-nx | Справочники с правами |
| Team Room multi-agent | OrchestratorKit | Параллельная разработка |

**Потерянные в поздних версиях (вернуть/решить):**
- `Interaction` (звонки/встречи/письма) — единый таймлайн сделки.
- `personalMarkupPercent` — не потерять при консолидации Client→Counterparty.
- Дубли Employees/Client/Roles — консолидировать.
- Модель Tender/закупки — решить судьбу.