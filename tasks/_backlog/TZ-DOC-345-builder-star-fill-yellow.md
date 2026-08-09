# TZ-DOC-345: builder — default-звезда с жёлтой заливкой (fill)

PAGES: /doc-constructor/builder/:id  
PAGE_DOCS: builder.page.md  
Зависит от: TZ-DOC-344 (один фон OK; PO visual почти PASS)

РОЛЬ АГЕНТА: frontend  
ЗАВИСИМОСТИ: можно влить в closeout DOC-344, если 344 ещё _active; иначе отдельный thin TZ  
LAYER: 2  
CONFLICT KEYS: frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts; frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.spec.ts; docs/pages/builder.page.md

Проверено: CSS уже пытается `fill: currentColor` на active star (`builder-inspector.component.ts` ~1483–1488), но PO видит в основном обводку — Lucide Star outline не заливается надёжно. Нужна явная жёлтая заливка «как у обычных звёзд».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Active/default звезда: визуально **залита** `var(--color-gold)` / gold-deep (не только stroke).
2. Неактивные — outline OK.
3. Jest: active star имеет fill-класс/атрибут.
4. Если DOC-344 ещё не archived — сделай это в том же closeout и archive оба. Иначе archive 345 отдельно.

НЕ: BE document-template, SALES-*, deploy.

Gates: `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` + jest builder-inspector.

Финализация: archive DOC-344 (если ещё) и/или `TZ-DOC-345.done.md`.
