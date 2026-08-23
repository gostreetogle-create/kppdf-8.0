# WAVE-UI-DENSITY-PAPER-INK

> **Status:** DONE (2026-08-23) — все фазы закрыты (552 DONE `85afc27a` + shadow-fix)
> **Program:** `docs/audits/2026-08-23-ui-density-rollout-program.md`  
> **Canon:** `docs/ui-density-canon.md`  
> **Executor prompt:** `tasks/PROMPT-FREEBUFF-UI-DENSITY-WAVE.md`

## Цель

Привести **весь web ERP** к единому Paper & Ink **без смены IA**: цвета, кегль, hairline, компактность, RU copy. Не «новый сайт» — **аккуратная доводка**.

## Очередь (строго по фазам)

### Фаза 0 — Foundations (shared tokens & primitives)

| # | TZ | Суть | Layer |
|---|-----|------|-------|
| 0.1 | **TZ-UI-DEN-501** | styles.css: paper levels, hint/warn/error tokens, gap-form-field 4px | 1 |
| 0.2 | **TZ-UI-DEN-502** | FormField: hint gold/amber, error 11px, gap label→field | 2 |
| 0.3 | **TZ-UI-DEN-503** | shared/ui: shadow+radius sweep (примитивы only) | 2 |
| 0.4 | **TZ-UI-DEN-504** | PiButton + kit/docs: one gold CTA rule | 2 |

### Фаза 1 — App shell

| # | TZ | PAGES | DEP |
|---|-----|-------|-----|
| 1.1 | **TZ-UI-DEN-510** | `(app shell)` layout, nav | **DONE** `a1a6478d` |
| 1.2 | **TZ-UI-DEN-511** | `pi-page-chrome` | **DONE** `4c4a79d4` |
| 1.3 | **TZ-UI-DEN-512** | `/desk` | **DONE** `d25cb1f4` |

### Фаза 2 — Catalog lists

| # | TZ | PAGES | DEP |
|---|-----|-------|-----|
| 2.1 | **TZ-UI-DEN-520** | `/materials`, `/products`, `/modules` | **DONE** `cfb30fe9` |
| 2.2 | **TZ-UI-DEN-521** | `/counterparties`, `/organizations`, `/categories` | **DONE** `2d3b21d8` |
| 2.3 | **TZ-UI-DEN-522** | `/dictionaries/*` | **DONE** `a21356e8` |

### Фаза 3 — Forms & FullEditor dialogs

| # | TZ | PAGES | DEP |
|---|-----|-------|-----|
| 3.1 | **TZ-UI-DEN-530** | org/counterparty FullEditor | **DONE** `21533019` |
| 3.2 | **TZ-UI-DEN-531** | product/material/module forms | **DONE** `cdcd8866` |

### Фаза 4 — Doc constructor

| # | TZ | PAGES | DEP |
|---|-----|-------|-----|
| 4.1 | **TZ-UI-DEN-540** | templates, texts, tables, documents lists | **DONE** (in `cfb30fe9`) |
| 4.2 | **TZ-UI-DEN-541** | builder tool pane + inspector | **DONE** (in `a21356e8`) |

### Фаза 5 — Deals & logistics

| # | TZ | PAGES | DEP |
|---|-----|-------|-----|
| 5.1 | **TZ-UI-DEN-550** | `/orders`, `/supply`, `/shipping` | **DONE** `d5454914` |
| 5.2 | **TZ-UI-DEN-551** | `/proposals` list | **DONE** `6b1e554f` |
| 5.3 | **TZ-UI-DEN-552** | `/proposals/workspace` | **DONE** `85afc27a` (+hairline shadow-fix) |

### Фаза 6 — Production & people

| # | TZ | PAGES | DEP |
|---|-----|-------|-----|
| 6.1 | **TZ-UI-DEN-560** | `/production` chrome (не палитра Gantt) | **DONE** `a7c50d2d` |
| 6.2 | **TZ-UI-DEN-561** | `/work-types`, `/people` | **DONE** `5cb571c7` |

### Фаза 7 — Auth & admin

| # | TZ | PAGES | DEP |
|---|-----|-------|-----|
| 7.1 | **TZ-UI-DEN-570** | `/login`, `/enroll` | **DONE** `d306586c` |
| 7.2 | **TZ-UI-DEN-571** | `/admin/*` | **DONE** `21533019` |

### Фаза 8 — Desktop (отдельное приложение)

| # | TZ | DEP |
|---|-----|-----|
| 8.1 | **TZ-UI-DEN-580** | Import tab Paper & Ink | **DONE** `1ded0439` |

### Фаза 9 — Closeout

| # | TZ | DEP |
|---|-----|-----|
| 9.1 | **TZ-UI-DEN-590** | RU copy sweep (user-visible dev terms) | **DONE** `b1b6442e` |
| 9.2 | **TZ-UI-DEN-599** | grep guards, checklist, PAGE-TZ-INDEX, PO sign-off | **DONE** |

## Сессии (рекомендация PO)

| Сессия Freebuff | TZ | ~время |
|-----------------|-----|--------|
| 1 | 501 → 504 | 2–4 ч |
| 2 | 510 → 512 | 2–4 ч |
| 3 | 520 → 522 | 3–5 ч |
| 4 | 530 → 531 | 3–5 ч |
| 5 | 540 → 541 | 2–4 ч |
| 6 | 550 → 552 | 3–5 ч (552 отдельно после 409) |
| 7 | 560 → 571 | 3–5 ч |
| 8 | 580 | 2–4 ч |
| 9 | 590 → 599 | 2–3 ч |

## Conflict keys (общие — не трогать параллельно)

```
frontend/src/styles.css
frontend/src/app/shared/ui/**
frontend/src/app/layout/**
frontend/src/app/shared/page/pi-page-chrome.component.ts
frontend/src/app/pages/commercial/proposals/**/proposal-workspace*
```

## Gates (каждая TZ)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="<scope-from-TZ>"
cd frontend && pnpm lint
```

Deploy — только PO после **DEN-599** + spot-check.

## Файлы TZ

`tasks/_backlog/ui-density/TZ-UI-DEN-*.md`
