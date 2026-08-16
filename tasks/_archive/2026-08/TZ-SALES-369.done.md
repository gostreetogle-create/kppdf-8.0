# TZ-SALES-369.done — KP PDF download filename canon

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-17T00:15:00+03:00
closed_by: composer-executor-369 (kppdf-executor-loop)
TZ: TZ-SALES-369
DEP: none

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`kp-pdf-filename.spec.ts` FE 4/4 + proposals.page TZ-SALES-369; BE `kp-pdf-filename.spec.ts` 4/4)
  - checklist: DONE
  - deploy: NOT RUN

## Outcome

- Grep: only two user PDF download paths (`proposal-create.page.ts`, `proposals.page.ts`) + server `POST /quotations/:id/pdf`.
- Shared `buildKpPdfFilename`: numbered → `КП-{number}.pdf`; no number → `КП-черновик-{id.slice(0,8)}.pdf` (fixes create-page fallback to raw mongo id).
- BE `buildKpPdfContentDisposition` with RFC5987 `filename*` + ASCII fallback.
- Jest: unit helper + mocked download on proposals list.

## PDF path audit

| Path | Before | After |
|------|--------|-------|
| `/proposals` row PDF | `КП-{number}.pdf` | same via helper (+ draft fallback) |
| `/proposals/create` rail PDF | `КП-{number \|\| fullId}.pdf` | `КП-{number}.pdf` or `КП-черновик-{shortId}.pdf` |
| `POST /quotations/:id/pdf` | inline Content-Disposition | shared helper |

No `download.pdf` / anonymous blob paths found (print sandbox 366 untouched).

## Critical files

- `frontend/src/app/pages/commercial/proposals/kp-pdf-filename.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts`
- `frontend/src/app/pages/commercial/proposals/proposals.page.ts`
- `backend/src/modules/generated-document/kp-pdf-filename.ts`
- `backend/src/modules/generated-document/quotation-output.controller.ts`
- `docs/pages/proposals-create.page.md`

## Lock

`.mimocode/locks/TZ-SALES-369-kp-pdf-filename.lock`

---

# Original TZ

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

- [x] Нет пользовательского download КП с именем `download.pdf` / `blob` / без номера
- [x] FE tsc + релевантные jest PASS
- [x] page.md one-liner если менялось поведение
