# Аудит: типографика + цвета light/dark (2026-08-08)

**Заказчик:** PO — «глаза устают / прищуриваешься; разброс размеров слишком большой; перепроверить светлую и тёмную».  
**Экран-триггер:** `/modules/:id` (Демо · Финиш) — паспорт, состав, inspector.  
**SoT кода:** `frontend/src/styles.css`, UI kit + catalog detail.  
**Не цель:** «золотое сечение 1.618» как буквальный множитель заголовков (для ERP это даёт слишком редкие гигантские ступени). Цель — **гармоничная короткая шкала** с постоянным шагом ≈ **1.125–1.2** (major second / minor third), как на спокойных рабочих UI.

---

## 1. Вердикт (1 абзац)

Типографика **не сломана «хаосом 5xl»** — на рабочих экранах почти всё `text-sm` / `text-xs`. Боль болит от **лишних микро-ступеней ниже body** (9 / 10 / 11 / 12 px) и **разъехавшихся заголовков detail** (chrome `lg` vs order `xl/2xl` vs product `lg/xl`). Цвета в целом на Cool Graphite & Gold, но есть **P0/P1 дыры**: gold-as-text на светлом, orphan badge/surface токены, tiny+opacity mute, selected-row без заливки. Docs (`design-spec.md`, куски `paper-and-ink.md`) **отстают от shipped** шрифтов/палитры.

---

## 2. Что PO имел в виду (перевод в инженерный язык)

| Ощущение | Факт в UI |
|----------|-----------|
| «То мелкий, то крупный» | Рядом: `text-[9px]` nav · `eyebrow` 11px · `text-xs` 12px · `text-sm` 14px · display title 18–24px · mono габариты визуально «другие» |
| «Прищуриваешься» | Meta на `muted-foreground` + иногда `/50` opacity + размер ≤11px |
| «На хороших сайтах глаза не устают» | 4–5 ролей текста, один шаг между ролями, контраст ≥ комфортного для secondary |

**Канон шкалы (предложение аудита → TZ-UI-TYPE-301):**

| Роль | Размер | Utility / token | Где |
|------|--------|-----------------|-----|
| micro | **11px** | `.eyebrow` / `pi-tech-label` → unify 11px | ПАСПОРТ, УЗЕЛ, table headers |
| meta | **12px** | `text-xs` | артикул, подсказки, «N материалов» |
| body | **14px** | `text-sm` | строки состава, таблица, кнопки |
| title | **16–18px** | `text-base` → `text-lg` | имя в chrome / detail card |
| display | **≤20px** ERP | `text-xl` max | редкий order header; kit demos отдельно |

**Запрет на ERP:** новые `text-[9px]` / `text-[10px]`; `text-5xl` на рабочих страницах (уже в PO-DIARY).  
**Шаг:** 11 → 12 → 14 → 16 → 18 ≈ ×1.09–1.17 (глаз читает как «лестницу», не «два разных сайта»).

---

## 3. Типографика — факты

### 3.1 Шрифты (shipped)

| Роль | Stack | Где |
|------|--------|-----|
| Display | Hanken Grotesk | `--font-display` `styles.css` |
| Body | Inter | `--font-body` |
| Mono | JetBrains Mono | `--font-mono` |

`docs/design-spec.md` всё ещё Source Serif 4 / Work Sans — **stale**. Foundations hint «Syne · Jakarta» — **stale**.

### 3.2 Usage (app, без spec)

| Класс | ~count | Заметка |
|-------|-------:|---------|
| `text-sm` | 247 | основной UI |
| `text-xs` | 226 | meta |
| `eyebrow` | 291 | 11px mono-ish labels |
| `text-[10px]` / `[11px]` / `[9px]` | ~115 | **лишняя микро-лестница** |
| `text-base`…`text-xl` | мало | titles разъехались точечно |
| `text-5xl` | ~4 | kit / demos |

### 3.3 Hotspots (экран модуля = образец боли)

1. **Nav labels `text-[9px]`** — мельче всего UI; глаз «ломается» при переходе в body 14px.  
2. **Composition-tree:** row `text-sm` + qty `text-xs` + type/`глуб.` `text-[10px]` + chevron `text-lg`.  
3. **Fact / passport:** `eyebrow` + value `text-base` + hint `text-xs` — локально ок; mono габариты рядом с Inter выглядят «громче».  
4. **Titles:** product/module `text-lg sm:text-xl` vs order `text-xl sm:text-2xl` vs chrome H1 `text-lg`.  
5. **Page chrome crumbs `text-sm`** vs current crumb `text-base` — норма; дублирующий ghost «← К модулям» + крупные CAPS-кнопки справа усиливают ощущение разброса (не размер шкалы, а плотность акцентов).

---

## 4. Цвета light/dark — факты

### 4.1 Токены (canon `styles.css`)

Cool graphite hue ~260 + gold hue ~86. Dark через `--color-*-override`.  
Подробная таблица light/dark: см. исследование в этом аудите (paper / ink / muted / rule / gold).

### 4.2 Уже закрыто ранее (не открывать заново)

- Dark nest ladder composition-tree (CATALOG-335).  
- Токен `muted-foreground` усилен vs старого «серого на креме».  
- Ban marble/noise; flat paper.

### 4.3 Открытые риски (приоритет демо)

| Pri | Риск | Где смотреть |
|-----|------|----------------|
| **P0** | `text-gold` / gold-as-label на светлом paper | badge, редкие CTA labels — PO «gold-on-white» |
| **P0** | Selected table row без fill (только checkbox) | `pi-table` |
| **P1** | Badge `green-*` / `bg-surface-container` без dark | `badge.component.ts` |
| **P1** | `surface-*` без dark override | любой `bg-surface*` |
| **P1** | `text-[10px]` + `text-muted-foreground/50` | Gantt, tree drag hints |
| **P1** | Status hex light vs OKLCH dark | `styles.css` status |
| **P2** | Gantt zebra `bg-black/[0.02]` | dark невидим |
| **P2** | Docs drift warm cream vs cool graphite | `paper-and-ink.md`, `design-spec.md` |
| **P2** | Kind accent как **текст** на light (L≈0.62) | catalog markers — rails OK |

### 4.4 Экран модуля (скрин)

- Светлая тема: paper / paper-2 / cyan kind rail — ок.  
- Labels «ПАСПОРТ / ВЫБРАНО / УЗЕЛ» на muted — borderline мелкие (11px); если ещё opacity — прищур.  
- Dark: отдельно прогнать тот же `/modules/:id` + deep nest + inspector buttons (ghost vs solid).

---

## 5. Что НЕ делать

- Не вводить литеральный **φ = 1.618** между body и title (получится «плакат», не цех).  
- Не красить весь secondary в ink (потеряется иерархия).  
- Не править builder canvas user-content цвета в этой волне.  
- Не смешивать с PRODUCTS-307 / UX-313 (другие CONFLICT KEYS).  
- Не «перекрасить всё приложение» одним TZ — волна из 3 тонких TZ.

---

## 6. План исправления (волна)

См. `tasks/_backlog/ui-type-color/WAVE-UI-TYPE-COLOR.md`:

1. **TZ-UI-TYPE-301** — канон шкалы в `styles.css` + живой `design-spec` / foundations hint.  
2. **TZ-UI-TYPE-302** — миграция micro + titles на catalog detail / chrome / tree / nav.  
3. **TZ-UI-COLOR-301** — P0/P1 contrast light+dark (badges, selected row, mute opacity, surface).

Acceptance волны: один проход `/modules/:id` + `/products` + nav light **и** dark без прищура на meta; titles одной семьи размеров.

---

## 7. Связанные файлы

| Файл | Роль |
|------|------|
| `frontend/src/styles.css` | fonts, colors, eyebrow, pi-tech-label |
| `frontend/src/app/shared/page/pi-page-chrome.component.ts` | crumbs / H1 |
| `frontend/src/app/shared/ui/composition/composition-tree.component.ts` | row type density |
| `frontend/src/app/shared/ui/fact-card/fact-card.component.ts` | passport scale |
| `frontend/src/app/pages/modules/module-detail.page.ts` | trigger screen |
| `docs/DARK-THEME.md` | dark canon |
| `docs/PO-DIARY.md` §2 | gold-on-white, dark nest, compact chrome |
