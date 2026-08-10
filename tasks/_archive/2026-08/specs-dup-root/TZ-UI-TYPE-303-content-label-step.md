═══════════════════════════════════════════════════════════════
TZ-UI-TYPE-303: Content label step (readable info labels)
═══════════════════════════════════════════════════════════════

> Domain: UI tokens only.
> Проверено: WAVE TYPE-301/302/COLOR-301 на main (959175c6 / 888f8fe8 / 8a39ea98);
> PO review: micro 11px нужен для компактных зон (иконки/nav/плотность), но
> заголовки таблиц, паспорт (высота/вес/RAL), информационные лейблы — слишком
> мелкие на `.eyebrow`; нужен шаг **между** micro и body.
> styles.css ERP scale сейчас: micro11 / meta12(text-xs) / body14 — meta почти
> не используется для th/fact; всё информационное уехало в eyebrow.

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UI-TYPE-301 DONE, TZ-UI-TYPE-302 DONE

LAYER: 2–3

PAGES: /modules/:id ; /products/:id ; any pi-table list
PAGE_DOCS: ui-fact-card.md ; page-chrome.md ; design-spec.md (type table);
  audits/2026-08-08-typography-and-theme-contrast-audit.md (amend §2)

CONFLICT KEYS: frontend/src/styles.css; frontend/src/app/shared/ui/pi-table.component.ts; frontend/src/app/shared/ui/fact-card/fact-card.component.ts; frontend/src/app/shared/ui/fact-card/fact-stack.component.ts; frontend/src/app/pages/modules/module-detail.page.ts; frontend/src/app/pages/products/product-detail.page.ts; docs/design-spec.md; docs/pages/ui-fact-card.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. `.eyebrow` / `--text-micro` (11px mono UPPERCASE) = правильный **chrome-micro**.
2. Table `<th class="eyebrow">`, fact-card label `eyebrow`, stack titles `eyebrow` —
   PO щурится: место есть, смысл информационный → нужен крупнее.
3. Не раздувать body (14) и не возвращать 9/10px.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Канон — новая роль `label` (13px)

  В `styles.css` ERP type scale comment + token:
  - `--text-label: 0.8125rem` /* 13px — between micro 11 and body 14 */
  - `@utility pi-label`:
      font-family: var(--font-body);
      font-size: var(--text-label);
      font-weight: 500;
      letter-spacing: 0.01em;
      /* NOT uppercase mono — readable informational label */
      color: inherit; /* callers add text-muted-foreground as needed */

  Обновить таблицу ролей в design-spec / audit §2:

  | Role   | Size | Utility        | Где |
  | micro  | 11   | eyebrow / pi-tech-label | nav density, kind short badges, sort glyph |
  | label  | 13   | **pi-label**   | table th, fact labels, passport field names (Высота, Вес, RAL…), section titles in inspector |
  | meta   | 12   | text-xs        | captions, secondary hints, pager |
  | body   | 14   | text-sm        | rows, inputs |
  | title  | 16–18| text-base/lg   | detail names |

ШАГ 2: Миграция горячих мест

  - `pi-table` headers: `eyebrow` → `pi-label text-muted-foreground` (keep py/px).
    Sort indicator: `text-[10px]` → `text-xs` или micro via span (не 10px).
  - `PiFactCard` label: `eyebrow` → `pi-label text-muted-foreground`.
  - `PiFactStack` title: `eyebrow` → `pi-label text-ink` (или muted-strong).
  - module-detail / product-detail: паспортные подписи и th «Вид работы» /
    «Норма» — с eyebrow на pi-label где это **информационный** текст.
  - **Оставить eyebrow**: top-nav compact labels, composition-tree kind short
    («мод»), декоративные CAPS в очень плотных местах.

ШАГ 3: Specs + manual

  - Update fact-card / pi-table specs if they assert `eyebrow` class on labels.
  - Manual: `/modules/:id` passport + work-types table + `/products` table headers
    light+dark — labels читаются без прищура; nav остаётся компактным.

НЕ ИЗМЕНЯТЬ:
- COLOR-301 badge/selected (уже DONE)
- searchable overflow-select
- desktop/**, supply/**, orders peer WIP, PRODUCTS-307
- Не поднимать micro nav обратно к 14px

AC:
1. `--text-label` + `.pi-label` существуют; design-spec таблица обновлена.
2. pi-table column headers не используют `eyebrow` (используют `pi-label`).
3. fact-card label = `pi-label`, не `eyebrow`.
4. Nav compact labels остаются ≤11px (eyebrow / text-[11px]).
5. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
6. Relevant jest (fact-card, pi-table, module-detail) PASS.
7. Нет новых text-[9px]/[10px] в CONFLICT files.
