# TZ-NX-DARK-PALETTE-PRO: токены тёмной темы из Dark Theme Pro

> **SIZE:** L · **PACK:** WAVE-GANTT-DARK-2026-09-15  
> **PAGES:** global dark (все NX)  
> **PAGE_DOCS:** `docs/DARK-THEME.md`; `docs/paper-and-ink.md`  
> **LAYER:** 3 · **IMPLICIT CONFLICT:** `nx build kppdf-web`  
> **CONFLICT KEYS:** `frontend-nx/libs/ui/paper-and-ink/src/styles/global.css`; `docs/DARK-THEME.md`; `docs/paper-and-ink.md` (краткая таблица dark); опционально `docs/audits/2026-09-15-dark-theme-pro-zip.md` cite  
> **DEPENDENCIES:** после `TZ-NX-GANTT-UNASSIGNED-DARK-WASH` (gantt wash не должен драться с paper ladder)  
> **ROLE:** executor · один L  
> **SoT цветов:** PO paste 2026-09-15 + `data/kppdf-dark-theme-pro.zip` / audit `docs/audits/2026-09-15-dark-theme-pro-zip.md` — **только dark overrides**, имена токенов проекта сохранить (`paper`/`gold`/`ink`/…).  
> **HEX locked (surfaces/amber):** canvas `#0c0e14` … amber `#f59e0b` / hover `#d97706` / soft `rgba(245,158,11,0.12)`, on-gold `#0f1117`, borders white/α.  
> **Typography override (PO 21:47 — эталон «3 Files Changed»):** ink **не** `#f1f5f9` / не `#fff` → soft cool gray ≈ **`#C9D1D9`**; secondary ≈ `#8B949E`; muted ≈ `#6E7681`. Dark UI weight **400** (titles ≤500). См. `docs/audits/2026-09-15-dark-theme-pro-zip.md` § typography.  
> **Не копировать** Pro-имена `--bg-canvas` / `--color-surface-1` в product.

## BUILD INTEGRITY

`nx build kppdf-web` baseline + LAST. Не параллелить с другим FE.

## Domain preflight

Проверено: zip `promptData.ts` TAILWIND_CONFIG_SNIPPET; текущие dark overrides в `global.css` ~500–566; wiring `@variant dark` + `*-override` (`DARK-THEME.md`).  
Цель: elevation + quiet borders + Industrial Amber + readable ink — **без** порта React-макета.  
Light theme: **не** менять (кроме случаев, где shared token без dark override ломает light — тогда только dark override).  
N/A: Counterparty / BE.

### Сбои
1. Глухой/шумный dark — глаза устают.  
2. Hairline = жёлтая «проволока» на всём.  
3. Gold слишком яркий + светлый текст на нём.  
4. После смены L токенов contrast consumers ещё сломаны → следующая TZ.

## ИСХОДНОЕ

Dark paper L≈0.175 hue 260; gold L≈0.84; rule с заметной gold chroma. Pro targets: canvas `#0C0E14`, surfaces `#141722`→`#2D344B`, amber `#F59E0B`, on-accent `#0F1117`, borders white/α.

## ЧТО ДЕЛАТЬ

### 1. Пересчитать dark overrides (OKLCH ≈ HEX из audit)
В `@layer theme` / `@variant dark` выставить:

| Token | Target (approx HEX) |
|-------|---------------------|
| paper | `#0C0E14` |
| paper-raised | `#141722` |
| paper-2 | `#1B1F2E` |
| paper-3 | `#242A3E` |
| paper-4 | `#2D344B` |
| surface-* aliases | те же ступени |
| ink | `#C9D1D9` (эталон Files Changed; **не** `#F1F5F9`) |
| muted-foreground | `#8B949E` |
| muted | `#6E7681` |
| rule | ≈ `rgba(255,255,255,0.07)` (почти без gold chroma) |
| rule-strong | ≈ `rgba(255,255,255,0.12)` |
| gold / sunrise / accent-warm | `#F59E0B` |
| gold-hover | `#D97706` |
| gold-soft | `rgba(245,158,11,0.12)` |
| gold-deep | для линий/focus — amber readable на paper (не дублировать fill L) |
| on-gold | `#0F1117` (тёмный графит) |
| hint-warn (dark) | amber-семейство ≥4.5:1 на paper |
| overlay-bg | ~0.75 black |
| dialog-shadow / focus-ring | под новый gold, без «неонового» L0.9 |

Конвертация HEX→OKLCH допустима (`culori` / ручная), в комментарии CSS — HEX reference из Pro.

### 1b. Typography weight (dark)
- Body/chrome: `font-weight: 400` default under `.dark` where safe (не ломать icon buttons).  
- Убрать / снизить `font-bold`/`font-semibold` на nav labels и table captions в dark, если они «плакатные».  
- Не вводить новый font-family (Inter/Hanken остаются).

### 2. Документы
Обновить `docs/DARK-THEME.md` таблицу Dark (новые L/HEX + typography note Files Changed).  
1 абзац в `paper-and-ink.md`: Pro zip + typography эталон 2026-09-15; SoT = CSS overrides.

### 3. Smoke proof (без полного UI rewrite)
- Kit/story или existing paper-and-ink specs: dark paper/gold/on-gold contrast ≥4.5:1 (кнопка `bg-gold text-on-gold`).  
- Не ломать light: spot-check light paper unchanged.

### 4. НЕ в этой TZ
- Shell chip layout / gantt bar algorithms / DocStudio desk underlay component (если нужен отдельный class — можно добавить CSS var `--studio-desk` + 1 consumer **или** отложить в CONTRAST-SWEEP).  
- Смена hue семейства light.  
- Фиксированные 4 цвета WT в каталоге.

## НЕ
- Порт `data/_tmp-dark-theme-pro/src/**` в product  
- Новые npm UI libs  
- Deploy  
- Consumer grep `text-white` (следующая TZ)

## AC
1. Dark overrides соответствуют таблице audit (допуск ±2 L в OKLCH).  
2. `bg-gold` + `text-on-gold` читаемы в dark.  
3. Default hairline в dark не «жёлтая сетка» (rule без сильной gold chroma).  
4. `DARK-THEME.md` обновлён.  
5. Specs paper-and-ink + `nx build kppdf-web` LAST.

### Gates
```bash
cd frontend-nx && pnpm exec nx test ui-paper-and-ink --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```

### known_limitation
Точные OKLCH ≠ пиксель-perfect Figma; важнее лестница и контраст. Gantt WT hue map — successor / CONTRAST.
