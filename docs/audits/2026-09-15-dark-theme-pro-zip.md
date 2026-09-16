# Audit: KPPDF Dark Theme Pro zip → NX tokens

**Date:** 2026-09-15  
**Source:** `data/kppdf-dark-theme-pro.zip` + **PO paste confirm 21:44** (CSS vars + MASTER_PROMPT)  
**Mode:** Cursor · reference only — **не** порт React-макета  
**Exec:** PARK until PO says go (Freebuff on hotfix)

## PO typography canon (2026-09-15) — эталон «3 Files Changed»

**SoT визуал:** Cursor/IDE panel «3 Files Changed · Review» (+N/−N).  
Assets: `…/image-69aec346-…png` (primary), activity log thin gray (secondary).

| Rule | Do | Don't |
|------|-----|--------|
| Primary labels | cool soft gray ≈ `#C9D1D9` / `#D0D4D8` (не `#FFFFFF`, не сверкающий `#F1F5F9`) | Pure white / near-white bloom |
| Secondary | ≈ `#8B949E` / slate-400–500 («Review», paths) | Same L as primary |
| Weight | UI chrome **400** (regular); titles ≤**500**; dark не «жирный плакат» | `font-bold` / 700 на рядовых надписях |
| Borders | `rgba(255,255,255,0.08–0.12)` soft | Yellow wireframe |
| Accents | muted green/red for +/- only | Neon |

**Корректировка Pro HEX:** `--text-primary: #f1f5f9` **слишком яркий** для нашего dark → в `TZ-NX-DARK-PALETTE-PRO` ставить ink ≈ **`#C9D1D9`** (или OKLCH L≈0.82–0.85 hue 260), не slate-100.

Связь с surfaces/amber из Pro zip — без изменения; меняется только «белизна» и вес текста.

## PO-locked HEX (surfaces / amber)

```css
--bg-canvas: #0c0e14;
--bg-surface-1: #141722;
--bg-surface-2: #1b1f2e;
--bg-surface-3: #242a3e;
/* + Surface 4 from modal */ --bg-surface-4: #2d344b;
--border-subtle: rgba(255, 255, 255, 0.07);
--border-medium: rgba(255, 255, 255, 0.12);
--border-accent: rgba(245, 158, 11, 0.4);
/* text: prefer Files Changed canon, not Pro slate-100 */
--text-primary: #c9d1d9;
--text-secondary: #8b949e;
--text-muted: #6e7681;
--accent-primary: #f59e0b;
--accent-hover: #d97706;
--accent-subtle: rgba(245, 158, 11, 0.12);
/* Text on Primary */ #0f1117 → on-gold
```

Gantt fixed `--gantt-cutting|welding|painting|bending` — **not** in palette TZ (catalog `accentHue`).

## Что взяли (цвета / иерархия)

Из `src/data/promptData.ts` + `PaletteTokensModal.tsx` + PO paste:

| Pro token | HEX / value | Наш dark override |
|-----------|-------------|-------------------|
| Canvas | `#0C0E14` | `--color-paper-override` |
| Surface 1 | `#141722` | `--color-paper-raised-override` |
| Surface 2 | `#1B1F2E` | `--color-paper-2-override` |
| Surface 3 | `#242A3E` | `--color-paper-3-override` (+ hover/tooltip) |
| Surface 4 | `#2D344B` | `--color-paper-4-override` |
| Border subtle | `rgba(255,255,255,0.07)` | `--color-rule-override` (убрать «жёлтую проволоку» как default hairline) |
| Border medium | `rgba(255,255,255,0.12)` | `--color-rule-strong-override` |
| Border accent | `rgba(245,158,11,0.4)` | focus / active only |
| Amber primary | `#F59E0B` | `--color-gold-override` (+ sunrise aliases) |
| Amber hover | `#D97706` | `--color-gold-hover` |
| Amber soft | `rgba(245,158,11,0.12)` | `--color-gold-soft-override` |
| Text on amber | `#0F1117` | `--color-on-gold` (уже идея канона — зафиксировать dark) |
| Text primary | `#C9D1D9` (Files Changed; was Pro `#F1F5F9`) | `--color-ink-override` |
| Text secondary | `#8B949E` | `--color-muted-foreground-override` |
| Text muted | `#6E7681` | `--color-muted-override` |
| Studio desk | `#1E222D` | подложка DocStudio canvas (не лист A4) |
| Overlay | `rgba(0,0,0,0.75)` | `--overlay-bg` dark |

**Поведение акцента (не заливка-плита):** active nav/chip = `gold-soft` + `text` amber/ink + optional underline — не монолитный ядовитый жёлтый со светлым текстом.

**Гант (частично):** полосы WT — полупрозрачный fill + читаемый текст; выходные чуть темнее. Фиксированные 4 HEX (cyan/indigo/emerald/amber) — **только** как suggested defaults / legend polish, **не** ломать `accentHue` каталога без отдельного AC.

## Что НЕ берём

- Порт React views / Vite app / Gemini banner UI  
- Смена шрифтов на Plus Jakarta / JetBrains (вне scope; monospace уже есть где нужно)  
- Полный редизайн light theme  
- Обязательные микроградиенты CTA  
- Копипаст Tailwind class-soup в Angular без токенов  
- «Белый текст на любой полосе Ганта» если fill светлый — либо темнее fill (Pro), либо `text-on-gold`/ink (наш канон)

## Gap vs текущий NX dark (`global.css` @variant dark)

Сейчас paper ~`oklch(0.175…)`, gold ~`oklch(0.84…)` (очень светлый), **rule с chroma gold** → ощущение «жёлтых рамок». Pro: глубже canvas, quieter borders, amber ~Amber-500, text-on-gold тёмный.

## TZ (пакет)

`tasks/_ready/2026-09-15-gantt-workers-dark/`:

1. …gantt S (как было)  
2. **`TZ-NX-DARK-PALETTE-PRO`** — токены из таблицы выше + `DARK-THEME.md`  
3. **`TZ-NX-DARK-CONTRAST-SWEEP`** — consumers после палитры  

## Verdict on raw MASTER_PROMPT_RU (PO paste 2026-09-15)

**Не отдавать исполнителю as-is.** Это UX-essay + Tailwind class soup под React-макет.  
Исполняемый SoT: `TZ-NX-DARK-PALETTE-PRO` + `TZ-NX-DARK-CONTRAST-SWEEP` + эта таблица.

| Блок промпта | Вердикт |
|--------------|---------|
| §1 диагноз (void / wireframe / toxic yellow / gantt / A4 shock) | **OK** — совпадает с live smells |
| §2 surfaces Canvas→S4 HEX | **OK** → наши `paper`…`paper-4` dark overrides |
| §2 borders white/α, amber only on focus | **OK** → `rule` / focus gold |
| §2 Amber + Text on Primary `#0F1117` | **OK** → `gold` + `on-gold` |
| §2 text slate ladder | **OK** → `ink` / `muted-foreground` / `muted` |
| §2 JetBrains Mono везде | **SKIP** — mono уже `--font-mono` для tech; body не менять |
| §2 фиксированные 4 цвета WT Ганта | **SKIP / successor** — live = `accentHue` каталога, не hardcode 4 HEX |
| §2 статусы снабжения emerald/amber chips | **PARTIAL** — через существующие success/warning soft tokens, не копипаст Tailwind |
| §3 header 56px + blur + underline tab | **PARTIAL** — цвет/active chip да; высоту shell не ломать без нужды |
| §3 tables uppercase tracking | **SKIP taste** — pi-table канон; только border/hover токены |
| §3 gantt «белый текст + drop-shadow» | **ADJUST** — белый только на **тёмном** fill; иначе ink/`on-gold` |
| §3 modal overlay 0.75 | **OK** |
| «Tailwind ко всем экранам» | **FAIL** — только CSS vars / Angular Pi-*; не порт zip |

## Verdict on TAILWIND_CONFIG_SNIPPET (PO paste)

**Брать как HEX-reference для dark overrides**, не как новые имена `--bg-canvas` / `--color-surface-1` в product.

| Pro var | → наш dark token | Берём? |
|---------|------------------|--------|
| `--bg-canvas` / `--color-canvas` `#0c0e14` | `paper` | **да** |
| `--bg-surface-1` / `--color-surface-1` `#141722` | `paper-raised` | **да** |
| `--bg-surface-2` `#1b1f2e` | `paper-2` | **да** |
| `--bg-surface-3` `#242a3e` | `paper-3` | **да** |
| (нет S4 в snippet; в modal есть `#2D344B`) | `paper-4` | **да** (из modal) |
| `--border-subtle` | `rule` | **да** |
| `--border-medium` | `rule-strong` | **да** |
| `--border-accent` | focus-ring / gold border only | **да** |
| `--text-primary` | `ink` | **да** |
| `--text-secondary` | `muted-foreground` | **да** |
| `--text-muted` | `muted` | **да** |
| `--accent-primary` / `--color-accent` `#f59e0b` | `gold` (+ sunrise aliases) | **да** |
| `--accent-hover` `#d97706` | `gold-hover` | **да** |
| `--accent-subtle` | `gold-soft` | **да** |
| `--gantt-cutting/welding/painting/bending` | — | **нет** в palette TZ (каталог `accentHue`; optional later) |

Не заводить параллельный `:root` с Pro-именами. Wiring остаётся `@variant dark { --color-*-override }`.


