# TZ-NX-DARK-CONTRAST-SWEEP: consumers после Pro-палитры

> **SIZE:** L · **PACK:** WAVE-GANTT-DARK-2026-09-15  
> **PAGES:** shell + `/production` + `/orders` + `/home` + `/registries` + DocStudio chrome  
> **PAGE_DOCS:** `docs/DARK-THEME.md`; `docs/paper-and-ink.md`; `docs/audits/2026-09-15-dark-theme-pro-zip.md`  
> **LAYER:** 3 · **IMPLICIT CONFLICT:** `nx build kppdf-web`  
> **CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/layout/**`; `frontend-nx/libs/features/**` (только contrast/class); `frontend-nx/libs/ui/paper-and-ink/**` (утилиты/компоненты, не ломая light)  
> **DEPENDENCIES:** **после** `TZ-NX-DARK-PALETTE-PRO`

## BUILD INTEGRITY

`nx build kppdf-web` baseline + LAST.

## Domain preflight

Палитра Pro уже в CSS. Осталось: хардкоды, `text-white` на gold, active nav «плита», DocStudio desk, gantt day labels.  
Канон: solid gold fill → **`text-on-gold`**; soft/tint active → amber/ink текст + border, не белый.  
N/A: schema.

### Сбои
1. Active «Цех» — жёлтый фон + светлый текст.  
2. Бар «Nд» на светлом WT fill.  
3. Inline light `oklch(0.9…)` washes.  
4. A4 studio на «чёрной дыре» без desk.

## ЧТО ДЕЛАТЬ

### 1. Shell / chips
Active category: Pro-паттерн — `bg-gold-soft` + amber/ink text + border **или** `bg-gold` + `text-on-gold`.  
Запрет: `text-white` / `text-paper` на `bg-gold`.

### 2. Grep sweep (NX)
`text-white` + gold/sunrise/amber; hardcoded light washes; selected chips без tri-state.

### 3. DocStudio desk
Подложка редактора (вне листа): фон ≈ `#1E222D` / token `--studio-desk` / paper-2; лист A4 остаётся светлым с мягкой тенью. Не менять print CSS body-leak.

### 4. Gantt chrome
Сетка дней quieter; weekend wash чуть темнее (если уже есть — подкрутить opacity). Label на WT bar: при светлом fill → тёмный текст или затемнить fill (согласовать с UNASSIGNED-DARK-WASH).

### 5. Evidence
`docs/audits/2026-09-15-dark-contrast-sweep.md` + notes shell / gantt / studio.

## НЕ
- Новая палитра (уже PRO)  
- Порт React zip  
- Light redesign  
- Deploy  
- Менять WT catalog IDs/hue algorithm целиком

## AC
1. Dark: нет белого текста на solid gold в shell/nav.  
2. Studio desk ≠ void; A4 не «в глазах».  
3. Audit note.  
4. Gates + `nx build kppdf-web` LAST.

### Gates
```bash
cd frontend-nx && pnpm exec nx test ui-paper-and-ink --skip-nx-cache
cd frontend-nx && pnpm exec nx test features --testPathPattern="gantt-bars|app-shell|pi-group" --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```
