# TZ-BACKEND-PDF-FONT-READY: PDF печатается до загрузки шрифта — гарантия вместо надежды

РОЛЬ АГЕНТА: executor, код `backend` only
СТАТУС: **BACKLOG** — мелкий, но закрывает дыру в дельте D1
ЗАВИСИМОСТИ: `TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE` (закрыт, `tasks/_archive/2026-08/`)
LAYER: backend (render/output)
PAGES: — · PAGE_DOCS: document-studio.page.md

CONFLICT KEYS:
`backend/src/modules/generated-document/quotation-output.service.ts` ; `backend/src/modules/document-render/**` (только строка `font-display`) ; `docs/pages/document-studio.page.md`

---

## ПРОБЛЕМА

Дельта D1 сделала правильную вещь: шрифты self-hosted, раздаются с `/fonts/*.ttf` (проверено — 200 и
`font/ttf` для всех трёх гарнитур), в HTML лежит `@font-face` с абсолютными URL. Но два места сводят гарантию к
вероятности:

1. `font-display: swap` в сгенерированном CSS — браузер **сразу** рисует резервной гарнитурой и подменяет
   настоящей, когда та догрузится. Для экрана это правильно, для печати — нет.
2. `quotation-output.service.ts:84-85` печатает после `waitUntil: 'load'` и не ждёт шрифты явно. Загрузка
   веб-шрифта в Chromium ленивая и к событию `load` может быть не завершена.

Вместе это даёт ровно то, от чего защищалась волна: **в PDF молча уезжает резервный шрифт**, а на экране
оператор видит выбранный. Воспроизводится нестабильно (гонка), поэтому «у меня получилось один раз» — не
доказательство.

## ЧТО ДЕЛАТЬ

1. В CSS-генерации `@font-face` заменить `font-display: swap` на `font-display: block` для рендера документов.
   Если тот же CSS используется для экрана — параметризовать: экран `swap`, печать `block`.
2. Перед `page.pdf()` дождаться шрифтов явно: `await page.evaluate(() => document.fonts.ready)` (с таймаутом,
   чтобы битый шрифт не подвешивал pipeline навсегда — при таймауте писать warning в лог, а не падать молча).
3. Тест: `page.pdf` не вызывается раньше ожидания шрифтов (проверяется на моке страницы, как уже сделано в
   `quotation-output.service.spec.ts`).
4. Живое доказательство: PDF с гарнитурой из белого списка, из которого **извлечён список встроенных шрифтов**
   (этого не сделали в D1 — там осталось `pdf: not separately extracted`). Достаточно одной проверки, что в
   PDF присутствует Tinos/Liberation/Carlito, а не дефолт рендерера.

## НЕ ДЕЛАТЬ

- Не менять белый список гарнитур и не добавлять шрифты.
- Не трогать sanitize и схему `BlockStyle` — они закрыты и работают.
- `frontend/**`, `frontend-nx/**` — ни строки.

## КРИТЕРИИ ПРИЁМКИ

1. Печать не начинается раньше готовности шрифтов; при таймауте — warning в логе, pipeline не падает.
2. `font-display` для печати — `block`.
3. Извлечённый из PDF список шрифтов содержит выбранную гарнитуру. Это и есть доказательство, которого не
   хватало в D1.

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test
```
