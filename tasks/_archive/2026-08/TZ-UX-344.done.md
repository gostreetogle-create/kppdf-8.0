# TZ-UX-344 DONE — showcase photo contain (object-fit)

```
ARCHIVE_MARKER
task_id: TZ-UX-344
outcome: DONE
closed_at: 2026-08-16T09:45:00Z
agent_id: agent-ux344-WIN-LOQVGED63JM-28704
workspace: D:\kppdf-8.0
branch: main
review: Cursor Verdict PASS
```

## Что сделано

- `pi-showcase-card`: `.sc-media img` → `object-fit: contain` + `object-position: center` (sm/md/lg inherit).
- Removed `.sc-media--md img { object-fit: cover }` override that re-cropped md cards.
- Spec TZ-UX-344: source assert contain/center; no cover on base or md.
- Page notes: products/modules grid media contain; materials note left for CATALOG-375 WIP (no materials.page.ts touch).

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` → TSC_PASS
- `pnpm test -- --testPathPattern="pi-showcase-card" --coverage=false --runInBand` → PASS 12/12

## Не трогали

- `materials.page.ts` / CATALOG-375 expand
- List-thumb `object-cover` on catalog list pages (known_limitation / successor)
- Photo frame WAVE / TZ-PHOTO-304
- Deploy

## Review

Cursor Verdict PASS → archive + commit.

## known_limitation

List-thumb `object-cover` on catalog list pages unchanged (out of scope).

---

## Original TZ

# TZ-UX-344: Showcase-карточки — фото целиком (object-fit contain)

> PO: в grid-карточках каталога фото «увеличивается» / обрезается — не видно целиком.
> Нужно грамотное позиционирование: **весь кадр виден** в слоте media.

РОЛЬ АГЕНТА: Frontend (shared UI)

ЗАВИСИМОСТИ: нет

LAYER: 2

CONFLICT KEYS: `frontend/src/app/shared/ui/card/pi-showcase-card.component.ts` ; `frontend/src/app/shared/ui/card/pi-showcase-card.component.spec.ts`

PAGES: catalog grids via `app-pi-showcase-card` (`/products` `/modules` `/materials` grid)  
PAGE_DOCS: короткий абзац в `docs/pages/page-chrome.md` или note в audit; при необходимости одна строка в products/modules/materials.page.md «grid media: contain»

CHECKLIST: `docs/agent-checklists/TZ-UX-344.md`  
REVIEW: required

---

## Domain preflight

Проверено: `pi-showcase-card.component.ts` — `.sc-media img { object-fit: cover }` (~202–205) и `.sc-media--md img { object-fit: cover }` (~317–318). Cover кадрирует → PO smell.

Loose wording «увеличивают» → CSS `object-fit: cover` crop, не zoom-on-hover.

---

## ЧТО ДЕЛАТЬ

1. В `pi-showcase-card` для media img: **`object-fit: contain`** (sm / md / lg — единообразно, чтобы весь кадр в слоте).
2. Фон слота уже paper — оставить (letterbox по краям ок).
3. `object-position: center` явно.
4. Spec: assert в стилях/computed или source содержит `object-fit: contain` для `.sc-media img` (и md override не возвращает cover).
5. **Не** менять list-thumb `object-cover` на страницах в этой TZ (отдельный smell; known_limitation / successor). Focus = showcase cards.

Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="pi-showcase-card" --coverage=false
```

## НЕ

- materials.page expand (CATALOG-375)  
- Backend photo pipeline  
- Deploy  

## AC

- [x] Grid showcase media показывает фото целиком (contain), не crop cover  
- [x] Gates PASS  

Archive после Cursor PASS.
