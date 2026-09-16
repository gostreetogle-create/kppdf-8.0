# TZ-VERIFY-2026-09-16-DARK-GANTT-SMOKE: live smoke dark + gantt после волны

> **SIZE:** S · **ROLE:** executor Freebuff · **LAYER:** verify (+ hotfix only if FAIL in scope)  
> **PAGES:** `/production`, shell nav, `/studio/:id` (desk), optional `/orders/:id`  
> **PAGE_DOCS:** `docs/DARK-THEME.md`; `docs/audits/2026-09-15-dark-theme-pro-zip.md`  
> **CONFLICT KEYS:** только если FIX — точечно `global.css` / gantt / shell; иначе docs-only  
> **IMPLICIT CONFLICT:** `nx build kppdf-web` если трогаешь FE

## Цель

PO: волна DONE по gates — нужен **живой** PASS/FAIL по глазам (dark надписи + Гант).  
Не новая палитра. Не deploy.

## Checklist smoke (dark theme ON)

1. **Shell:** active «Цех» — читаемо (`text-on-gold` / soft amber chip), не белый на жёлтом.  
2. **Typography:** body/nav ≈ soft gray (`#c9d1d9` vibe), не ослепительный белый.  
3. **`/production` По заказам:** сортировка default по №; смена «Начало плана» **не** прыгает строкой; режим «По дате» работает.  
4. **`/production` По рабочим:** «Не назначен» авто-раскрыт если есть unassigned; wash/label читаемы; empty hint если уместно.  
5. **DocStudio:** desk подложка не void; лист A4 светлый.  
6. **Hairline:** списки не «без разделителей» где `hairline-top/bottom`.

## Если FAIL

Минимальный fix в scope токенов/класса (не редизайн). Повтор smoke.  
Известный OK: WT цвета = `accentHue`, не 4 Pro HEX.

## AC

1. Audit `docs/audits/2026-09-16-dark-gantt-smoke.md` — таблица шаг | PASS/FAIL/WARN | note.  
2. Verdict: **PASS** (можно PO смотреть) | **FAIL** (+ SHA фикса) | **WARN** (нет API/сервера).  
3. Archive + commit docs (± fix). `_active` empty. STOP.

### Gates
```bash
# если был FE fix:
cd frontend-nx && pnpm exec nx build kppdf-web
# иначе docs-only: node --check / skip
```
