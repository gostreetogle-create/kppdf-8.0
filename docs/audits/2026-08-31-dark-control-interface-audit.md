# Аудит: Dark Control Interface (DESIGN.zip)

**Дата:** 2026-08-31  
**Источник:** `data/DESIGN.zip` → один файл `DESIGN.md` (~25 KB)  
**Полная копия:** [`docs/reference/dark-control-interface/DESIGN-FULL.md`](../reference/dark-control-interface/DESIGN-FULL.md)  
**Канон kppdf:** `docs/design-spec.md`, `docs/paper-and-ink.md`, `docs/DARK-THEME.md`, `docs/ui-rules.md`

---

## 1. Что внутри архива

| Факт | Значение |
|------|----------|
| Файлов | 1 (`DESIGN.md`) |
| Шрифты / woff2 | **нет** (только ссылки на Onest) |
| Иконки / SVG assets | **нет** (только CSS/JS паттерны для SVG-маршрутов) |
| HTML/CSS demo | **нет** |
| Тип документа | Маркетинговый/лендинговый **visual contract** «тёмный инженерный пульт» |

Это **не UI-kit с готовыми компонентами**, а спецификация стиля для promo/landing страниц: hero, scroll progress, canvas-частицы, glass-панели, SVG-схемы потоков.

---

## 2. Сравнение с Paper & Ink

| Ось | Dark Control Interface | kppdf Paper & Ink |
|-----|------------------------|-------------------|
| Контекст | Landing / demo / «живая система» | ERP ~10 пользователей, плотные таблицы |
| Акцент | Фиолет `#7351ff` | Золото hue ~86 (`--color-gold`) |
| Фон dark | `#05060f` + инженерная сетка | OKLCH graphite L≈0.20 hue 260 |
| Глубина | Inset-shadow + blur + radial glow | Hairline + tonal lift (`paper-2…4`) |
| Типографика | Onest variable, H1 до 92px | Inter + Hanken Grotesk, ERP max 20px |
| Кнопки | Pill (`radius-pill 999px`) | `rounded-sm` interactive, ink/gold |
| Glassmorphism | Точечный blur (шапка, lightbox) | **Запрещён** на рабочих экранах |
| Иконки | Не указаны | Lucide 1.5px stroke |
| Анимации | Reveal, route-pulse, canvas hero | Минимум; reduced-motion обязателен |

**Вердикт:** стили **родственны по «инженерности»**, но **несовместимы как замена** нашего ERP-канона. Берём **паттерны и техники**, не палитру и не маркетинговую композицию.

---

## 3. Матрица adoption

### ✅ ADOPT — брать в канон (с маппингом на наши токены)

| # | Паттерн DCI | Куда в kppdf | Наш маппинг |
|---|-------------|--------------|-------------|
| A1 | **Inset highlight** на elevated panel | Dark theme panels, cockpit cards | `--shadow-executive`: `inset 0 1px 0 oklch(1 0 0 / 0.05)` — уже в TZ-UI-THEME-331; усилить на `/kit` demo |
| A2 | **Tri-state active** (фон + контур + текст) | Segmented controls, chips, tabs | `DARK-THEME.md` § Segmented — дополнить явным правилом «не только цвет» |
| A3 | **Status pulse** (`status-pulse` keyframes) | Live-индикаторы: производство, отгрузка, sync | `--color-success` + `@keyframes pi-status-pulse`; **не** на статичных badge |
| A4 | **Orthogonal SVG routes** | Combine kanban, production flow, shipping tray | `ResizeObserver` + `orthogonalPath()` — новый Pi-примитив `pi-flow-diagram` |
| A5 | **Focus-visible** 2px + offset 4px | Глобальный `:focus-visible` | `--color-gold-deep` вместо `--ice` |
| A6 | **Reduced motion** блок | Глобальный canon | Перенести в `paper-and-ink.md` § Motion |
| A7 | **Scroll-snap carousel** | Каталог карточек, kit showcase | Native scroll + snap; prev/next; keyboard — **не** Swiper |
| A8 | **Синхронный цикл анимации** (~7.2s) | Demo «процесс получен» на cockpit | Одна длительность на связанные элементы |
| A9 | **`<dialog>` lightbox** | Превью вложений, zoom чертежей | Уже есть `PiDialog`; borrow backdrop `blur(18px)` **только** в dark + reduced perf check |
| A10 | **Technical label** (11px uppercase tracking) | Уже есть `.pi-tech-label` | Сверить tracking: DCI `0.12em` vs наш mono 11px — optional tweak в kit |

### 🔶 ADAPT — гибрид (наша палитра, их техника)

| # | Паттерн | Адаптация |
|---|---------|-----------|
| B1 | Engineering grid background | Только **login**, **kit hero**, empty-state — `--color-rule` grid, opacity ≤0.04; **не** на `/orders`, `/supply` |
| B2 | Ambient radial glow | Dark login / kit section — gold-whisper `oklch(0.84 0.08 86 / 0.06)`, не violet |
| B3 | System panel surface | Cockpit / manager desk elevated card — tonal lift + inset line, **без** `backdrop-filter` на body |
| B4 | Scroll progress bar | Длинные формы (doc builder) — gradient `gold-deep → gold`, 2px top fixed |
| B5 | Reveal on scroll | **Только** `/kit/*` demos и onboarding — `IntersectionObserver`; ERP tables **нет** |
| B6 | Route pulse on SVG | Pulse stroke = `--color-gold-deep` (light) / `--color-gold` @ 0.6 (dark), не ice |
| B7 | Result meter fill | Progress bar заказа / отгрузки — CSS `scaleX` + semantic green |

### ❌ REJECT — не брать

| # | Паттерн | Причина |
|---|---------|---------|
| R1 | Onest как основной шрифт | Конфликт TYPE-301: Inter + Hanken + JetBrains Mono |
| R2 | Violet CTA / accent | Конфликт Cool Graphite & Gold; PO canon gold-only accent |
| R3 | Canvas particle hero | Marketing-only; perf + a11y; не ERP |
| R4 | H1 52–92px | Ban `text-5xl` на working pages |
| R5 | Pill buttons по умолчанию | Наш interactive = `rounded-sm`; pill — только icon-chip / tag |
| R6 | Glassmorphism на всех карточках | Anti-goal Paper & Ink + DARK-THEME |
| R7 | Cyberpunk / neon / cyan-magenta | Явный запрет в обеих системах |
| R8 | Marketing page rhythm (hero→lead→CTA×N) | Не layout ERP list/detail |
| R9 | Single font for mono | JetBrains Mono для ID/REF — уже канон |
| R10 | `color: white` on CTA | Используем `text-on-gold` |

---

## 4. Где это реально поможет продукту

| Экран PO | Что взять | Приоритет |
|----------|-----------|-----------|
| **Комбайн** `/design/combine` | SVG orthogonal flow между стадиями изделия | P1 |
| **Production cockpit** | Status pulse + sync cycle на active WT | P1 |
| **Manager desk** | System panel depth для KPI cards | P2 |
| **Shipping tray** | Route animation «заказ → отгрузка → результат» | P2 |
| **Login** | Subtle grid + ambient glow (dark) | P3 |
| **Kit** `/kit/*` | Showcase: flow diagram, pulse, reveal, carousel | P1 (документация + demo) |
| **Рабочие таблицы** | Tri-state segmented, focus-visible | P1 (CSS only) |

---

## 5. Обновления документации (эта сессия)

| Файл | Изменение |
|------|-----------|
| `docs/DARK-THEME.md` | § Borrowed depth patterns |
| `docs/paper-and-ink.md` | § External references + § Motion canon |
| `docs/design-spec.md` | § Hybrid adoption note |
| `docs/reference/dark-control-interface/` | Полная копия спеки |
| `tasks/_backlog/ui-design-adoptions/` | Очередь TZ для исполнителя |

---

## 6. Очередь TZ (исполнитель)

| TZ-ID | Scope | Effort |
|-------|-------|--------|
| **TZ-UI-DCI-601** | Kit: `pi-flow-diagram` showcase + docs | ~2h |
| **TZ-UI-DCI-602** | Global `:focus-visible` + tri-state segmented refinement | ~1h |
| **TZ-UI-DCI-603** | `pi-status-pulse` utility + production/shipping adopters | ~2h |
| **TZ-UI-DCI-604** | Login dark: subtle grid (B1) | ~1h |
| **TZ-UI-DCI-605** | Scroll-snap carousel primitive for catalog cards | ~3h |

Параллель с active TZ — только после проверки conflict keys в `tasks/_active/`.

---

## 7. Иконки и шрифты — итог

| Запрос PO | Ответ |
|-----------|-------|
| Новые иконки в zip | **Нет.** Продолжаем Lucide. Для flow-узлов — Lucide + SVG lines |
| Onest | **Не подключать.** Variable sans не даёт выигрыша над Inter для ERP density |
| Accordion | **Нет в zip.** У нас — expand-in-row / PiSheet; accordion TZ отдельно если PO попросит |
| Карточки товаров | **Нет готовых.** Carousel pattern (A7) → TZ-UI-DCI-605 |
| Тёмная тема | Частично compatible: depth/inset/pulse — да; violet/ice/glass — нет |
| Светлая тема | Grid/glow/pulse — adapt с gold; остальное marketing-only |

---

## 8. Критерий «откликается PO»

Стиль DCI откликается там, где PO хочет **«живую систему»** на demo/cockpit:
- видно **куда идут данные** (маршрут);
- видно **смену состояния** (pulse);
- видно **результат** (meter/card).

На плотных таблицах снабжения/склада — **тишина и hairline**, не анимация. Это уже PO-CANON.

---

_Аудит: Cursor Mode A. Product code — только через TZ исполнителю._
