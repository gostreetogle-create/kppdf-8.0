# TZ-SALES-369: PDF download filename = КП-{number}

> Тонкий audit+fix. Канон имён: `docs/audits/2026-08-12-desktop-download-version-naming-canon.md` § PDF.

РОЛЬ АГЕНТА: Frontend (proposals PDF download) + optional BE Content-Disposition

ЗАВИСИМОСТИ: нет (можно параллельно TZD-46)

LAYER: 3

CONFLICT KEYS: `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts` ; `frontend/src/app/pages/commercial/proposals/proposals.page.ts` ; (если найдётся) backend quotation PDF download handler

PAGES: `/proposals` ; `/proposals/create`  
PAGE_DOCS: `proposals.page.md` ; `proposals-create.page.md` (если есть)

Проверено: FE уже ставит `anchor.download = КП-${number}.pdf` в create + list. Нужен полный grep других путей (server blob, archive, print→pdf) на `download.pdf` / безымянный blob.

---

## ЧТО ДЕЛАТЬ

1. Grep всех PDF download/save путей КП; таблица в checklist.
2. Любой путь без `КП-{number}` — починить (draft: `КП-черновик-{id.slice(0,8)}.pdf`).
3. Если PDF отдаёт Nest — `Content-Disposition: attachment; filename="КП-{number}.pdf"` (RFC5987 filename* при необходимости).
4. Jest на имя файла где мокается download.
5. Archive; **не** deploy.

## НЕ ИЗМЕНЯТЬ

- print sandbox 366; output gates 368
- Desktop zip (TZD-46)
- авто-PDF на статусе (отдельный successor)

## AC

- [ ] Нет пользовательского download КП с именем `download.pdf` / `blob` / без номера
- [ ] FE tsc + релевантные jest PASS
- [ ] page.md one-liner если менялось поведение
