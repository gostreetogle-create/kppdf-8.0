═══════════════════════════════════════════════════════════════
TZ-UX-324: Chrome-rail — отступ и отличие history vs page-tools
═══════════════════════════════════════════════════════════════

STATUS: READY
ACTIVE: claim → tasks/_active/TZ-UX-324.md
DEPENDENCIES: TZ-UX-322/323 DONE
LAYER: 3
SOURCE: PO 2026-08-15 screenshot — кружок: page-tools сливаются со ←→;
  нужен зазор ~высота одной кнопки + лёгкое визуальное отличие global vs page

РОЛЬ АГЕНТА: Frontend shell polish
PAGES: (app shell) — видно на /production ≥1680
PAGE_DOCS: page-chrome.md

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/layout/app-layout.component.spec.ts;
docs/pages/page-chrome.md;
docs/agent-checklists/TZ-UX-324.md;
progress.md

Проверено: left/right rails — history button затем сразу @for chrome tools,
  gap:8px между всеми; оба класса `app-nav-rail-button` — визуально один ряд.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM

ШАГ 2 — Spacer
Между history (← / →) и первым page-tool: вертикальный зазор ≈ высота одной
кнопки (32px) + существующий gap, т.е. визуально «пропуск одной кнопки».
Реализация: spacer `div` с `data-test="chrome-rail-tools-gap"` **только если**
есть tools на этой стороне; aria-hidden. Не увеличивать gap между самими tools.

ШАГ 3 — Visual distinction (лёгкая)
- History кнопки: оставить текущий raised/paper (global).
- Page-tools: чуть иной фон (например paper-2 / чуть более muted border) —
  класс `app-chrome-page-tool` vs `app-nav-rail-button` для history.
- Active page-tool по-прежнему читаем (is-active).
- Light + dark: оба набора читаемы, без «второй панели-коробки».

ШАГ 4 — Docs
В page-chrome.md § Page tools: правило «history сверху → spacer → page tools»;
global ≠ page visual.

ШАГ 5 — Jest: gap в DOM когда tools set; отсутствует когда tools пусты.
Gates + archive.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- PiChromeToolsService API (кроме layout CSS/classes)
- production flyout logic / tool registration ids
- backend, deploy, breakpoint 1680

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. На /production ≥1680: между ← и Заказы виден явный пустой интервал ≈1 кнопку.
2. То же справа между → и Карточка.
3. History и page-tools слегка различаются по фону/бордеру.
4. Страницы без tools — только ←→, без лишнего spacer.
5. tsc + app-layout Jest PASS.

Verification:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest src/app/layout/app-layout.component.spec.ts --runInBand --no-coverage
git diff --check
```

Промпт:
`Прочитай GEMINI.md + tasks/TZ-UX-324-chrome-history-page-tools-gap.md. Отступ ~1 кнопку между ←→ и page-tools + лёгкий visual split. Production logic не трогать.`
