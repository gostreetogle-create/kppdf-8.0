# TZ-UI-DEN-505: Framed content inset — единые отступы текста в рамках

PAGES: **global** (приоритет: `/desk`, `/proposals/workspace`, lists, panels)
PAGE_DOCS: ui-density-canon.md ; AI-UI-CONTRACT.md ; manager-desk.page.md

РОЛЬ: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-501 (tokens) — **DONE**

CONFLICT KEYS: `frontend/src/styles.css` ; `frontend/src/app/shared/ui/**` ; sweep по `frontend/src/app/pages/**`

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ (PO 2026-08-23)
═══════════════════════════════════════════════════════════════

На `/desk`: поле «Поиск» (`pi-input`, `px-control-x`) — текст **с отступом от края**.
В той же рамке очереди «Загрузка заказов…» — текст **прилип к левому hairline**
(`.manager-desk__empty { padding: 0.75rem 0 }` — нет horizontal inset).

**Неприемлемо:** один экран, две «рамки», разный inset. Пользователь видит
«текст в коробке» — inset должен быть **одинаковым везде**.

Проверено:
- `manager-desk.page.ts:685-689` — `.manager-desk__empty` padding Y-only
- `manager-desk.page.ts:669-675` — `.manager-desk__queue-error` уже `0.75rem 1rem` ✓
- `manager-desk.page.ts:754` — строки очереди `padding: 0.5rem 1rem` ✓
- Grep `padding: 0.75rem 0` — desk + workspace + proposal-create (см. audit list)

═══════════════════════════════════════════════════════════════
КАНОН (зафиксировать в docs, шаг 1)
═══════════════════════════════════════════════════════════════

**Framed content** = любой блок с `border` / hairline / `bg-paper-raised`, внутри
которого лежит текст (empty, loading, error, meta, list row).

| Контекст | Inset (min) | Token / class |
|----------|-------------|---------------|
| Panel / card body | **16px** (`1rem`) all sides | `--panel-content-inset` или `px-panel-inset py-panel-inset` |
| Compact row in list | **12–16px** horizontal, **8–12px** vertical | align с соседними rows |
| Table empty (PiEmptyState) | уже `px-4` + inner `p-6` — **не ломать** | exception documented |
| Form value (input) | `px-control-x` — **эталон** для controls | не дублировать magic px |

**Правило:** если родитель имеет visible frame, дочерний текст **не** `padding-left: 0`
(unless full-bleed media/table explicitly marked).

Anti-pattern: `padding: Xrem 0` на message внутри bordered container.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

### ШАГ 1 — Token + utility (styles.css)

```css
:root {
  --panel-content-inset: 1rem; /* 16px — ui-density-canon § compactness */
}
@utility px-panel-inset { padding-inline: var(--panel-content-inset); }
@utility p-panel-inset { padding: var(--panel-content-inset); }
```

Обновить: `docs/ui-density-canon.md` (§ Framed content inset), `docs/AI-UI-CONTRACT.md`
(таблица Spacing).

### ШАГ 2 — Hotfix desk (PO screenshot)

`manager-desk.page.ts`:
- `.manager-desk__empty` → `padding: 0.75rem 1rem` (или `p-panel-inset` + muted typography)
- Spec: loading/empty state — `getComputedStyle` или data-test + class assert **padding-left ≥ 12px**

### ШАГ 3 — Project grep sweep

```bash
cd frontend/src/app/pages
rg "padding:\s*[\d.]+rem\s+0" -g '*.ts' -g '*.css'
rg "padding:\s*0(\s|;|$)" -g '*.ts' | rg -v 'spec\.ts'
```

Для каждого hit в **bordered** container (не toolbar full-bleed):
- fix → `--panel-content-inset` / `px-panel-inset`
- или document exception в `.done.md`

**Приоритет маршрутов:** `/desk` → `/proposals/workspace` → `/orders` → catalogs.

Не трогать: timeline canvas, gantt grid cells, chart SVG — full-bleed by design.

### ШАГ 4 — Shared component (optional, ≤1h)

Если ≥3 копии «loading/empty in framed box» — thin wrapper
`app-pi-framed-message` (message + state loading|empty|error) с canon inset.
Иначе — только token + page fixes.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- IA / routing / business logic desk, KP workspace geometry (A4 reflow law)
- PiEmptyState table contract (colspan row) — только document as exception
- Shadow/radius wave (503) — отдельно

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] `/desk` — «Загрузка заказов» и «Нет заказов» визуально выровнены с search inset
- [ ] Grep sweep: 0 unlisted hits `padding: *rem 0` inside bordered message blocks
- [ ] `manager-desk.page.spec.ts` + affected specs PASS
- [ ] tsc + lint PASS
- [ ] Canon updated in ui-density-canon + AI-UI-CONTRACT

Gates:

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm test -- manager-desk proposal-workspace --runInBand
pnpm lint
```

Manual PO: side-by-side search vs empty on `/desk` — same left inset.
