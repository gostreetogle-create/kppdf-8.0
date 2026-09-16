# TZ-NX-GANTT-UNASSIGNED-DARK-WASH: жёлтый wash читаем в dark

> **SIZE:** S · **PACK:** WAVE-GANTT-DARK-2026-09-15  
> **PAGES:** `/production`  
> **PAGE_DOCS:** `docs/pages/production-cockpit.page.md`  
> **LAYER:** 3 · **IMPLICIT CONFLICT:** `nx build kppdf-web`  
> **CONFLICT KEYS:** `frontend-nx/libs/features/src/lib/production/util/gantt-bar.model.ts`; `gantt-bars.facade.ts`; `ui/gantt-bars.component.ts`; `*.spec.ts`; опционально CSS vars в `frontend-nx/libs/ui/paper-and-ink/src/styles/global.css` если выносите токены  
> **DEPENDENCIES:** после empty-state предпочтительно; keys с #0/#1 пересекаются → sequential

## BUILD INTEGRITY

`nx build kppdf-web` baseline + LAST.

## Domain preflight

Проверено: `GANTT_UNASSIGNED_WASH` / `BAR_FILL` / `CHIP_FILL` = **хардкод light** `oklch(0.94/0.78/0.88 …)` в `gantt-bar.model.ts`; label `text-ink`. В dark `ink` светлый → **светлый текст на светло-жёлтом** (PO: «белая надпись, не видно»).  
Канон: `docs/DARK-THEME.md`, `docs/paper-and-ink.md` — на золоте/`gold` → `text-on-gold` (тёмный), не `text-white`.  
N/A: Counterparty.

### Сбои
1. Dark: «Не назначен» / «38д» нечитаемы.  
2. Light регресс, если wash станет слишком тёмным.  
3. Chip/bar/label разные контрасты.

## ИСХОДНОЕ

```ts
export const GANTT_UNASSIGNED_WASH = 'oklch(0.94 0.06 85)';
export const GANTT_UNASSIGNED_BAR_FILL = 'oklch(0.78 0.12 75)';
export const GANTT_UNASSIGNED_CHIP_FILL = 'oklch(0.88 0.08 85)';
```
Инлайн `[style.background]` без theme branch.

## ЧТО ДЕЛАТЬ

### 1. Theme-aware fills
Заменить хардкод на CSS variables (предпочтительно) или computed light/dark:
- dark: тёплый **тёмный** amber wash (L≈0.28–0.38), bar fill чуть ярче, chip dashed читаем; текст остаётся `text-ink` **или** явный `text-on-gold` / ink с ≥4.5:1 на wash.
- light: сохранить текущий визуальный смысл (тёплый warning wash), контраст ink≥4.5:1.

Канон: не белый текст на золоте/amber.

### 2. Wire
`workerLabelWash` / bar fill unassigned / chip — читают новые токены. Убрать light-only string constants из runtime path (или оставить как light fallback через var).

### 3. Spec / proof
- Unit: unassigned wash resolver возвращает разные значения или class под `.dark` (как принято в проекте).  
- Коммент в коде со ссылкой на audit.  
- Ручной AC: dark `/production` workers — «Не назначен» и «Nд» читаются с одного взгляда.

## НЕ
- Менять hue палитры всего приложения (это TZ-NX-DARK-CONTRAST-SWEEP)  
- `text-white` на wash  
- Deploy

## AC
1. Dark: label «Не назначен» + days chip на unassigned bar читаемы (WCAG AA large минимум).  
2. Light: без регресса «кричащего» контраста / потери warning-смысла.  
3. Specs + `nx build kppdf-web` LAST.

### Gates
```bash
cd frontend-nx && pnpm exec nx test features --testPathPattern="gantt-bar.model|gantt-bars" --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```
