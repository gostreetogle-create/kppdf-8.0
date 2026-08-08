═══════════════════════════════════════════════════════════════
TZ-UI-COLOR-301: Contrast sweep light + dark (P0/P1)
═══════════════════════════════════════════════════════════════

> Проверено: audit 2026-08-08 §4; docs/DARK-THEME.md; PO-DIARY gold-on-white ban;
> badge.component.ts; pi-table selected row gap; surface-* light-only.

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UI-TYPE-301 (docs/tokens calm); TYPE-302 preferred before but not hard-block if conflict-free

LAYER: 3

PAGES: /modules/:id ; /products ; tables with selection ; /foundations badges if any
PAGE_DOCS: DARK-THEME.md ; page-chrome.md ; paper-and-ink.md (contrast note — sync cool graphite)

CONFLICT KEYS: frontend/src/styles.css; frontend/src/app/shared/ui/badge/badge.component.ts; frontend/src/app/shared/ui/pi-table.component.ts; frontend/src/app/pages/production/blocks/gantt-bars.component.ts; docs/DARK-THEME.md; docs/paper-and-ink.md

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: P0 — gold-as-text / badges
- Найти `text-gold` на paper в badge/UI kit → заменить на ink + gold border/soft bg, или gold только как fill с ink label (по DARK-THEME anti-goal).
- Badge secondary: убрать raw `green-500/700` → status tokens / semantic success vars с dark override.
- Outline badge: починить `bg-surface-container` (map to paper-2 or define token).

ШАГ 2: P0 — selected rows
- pi-table: selected row visible fill (`bg-gold-soft` or paper-3 + rule) light **and** dark; checkbox alone insufficient.

ШАГ 3: P1 — mute stacks + surface
- Заменить худшие `text-muted-foreground/50` на tiny UI в CONFLICT-adjacent files на `/70` или `muted-foreground-strong` без opacity.
- Если `bg-surface-*` used in shared kit — dark override OR migrate to paper-2/3.
- Gantt zebra `bg-black/[0.02]` → theme-aware `ink/5` or paper ladder.

ШАГ 4: Docs
- DARK-THEME.md: checklist row «badges / selected / no gold text on paper».
- paper-and-ink.md: footnote that live tokens are cool graphite (hue 260), not warm cream tables if still stale — short sync, не переписывать весь файл.

НЕ ИЗМЕНЯТЬ: catalog-kind-oklch hues; builder canvas content colors; TYPE-302 layout; backend; desktop.

AC:
1. Нет `text-gold` как единственный цвет лейбла на светлом paper в badge kit.
2. Selected row visually distinct light+dark (screenshot/manual).
3. Badge secondary читаем в dark.
4. Gantt zebra не `bg-black/[0.02]`.
5. frontend tsc + badge/table specs if present.
6. Manual `/modules/:id` + one table page light **and** dark.
