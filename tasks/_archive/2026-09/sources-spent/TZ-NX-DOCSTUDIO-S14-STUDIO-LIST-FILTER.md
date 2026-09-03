# TZ-NX-DOCSTUDIO-S14-STUDIO-LIST-FILTER: поиск и фильтр списка

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S13 DONE (`2546bf88`)  
**CONFLICT KEYS:** `studio-list.page.ts`

## ИСХОДНОЕ

`/studio` — flat list без search/filter. При 20+ документах оператор теряется.

## ЧТО ДЕЛАТЬ

1. Search input: filter by `name` (client-side).
2. Segmented/tabs: Все | Черновик | В архиве (`status`).
3. Sort: по `updatedAt` desc (default, уже implicit) — optional toggle name A-Z.
4. `data-test` search + filter chips.
5. Empty state «Ничего не найдено» при filter miss.

## КРИТЕРИИ ПРИЁМКИ

1. Search + status filter работают вместе.
2. `nx test kppdf-web --testPathPattern=studio-list` or studio spec smoke.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S14-STUDIO-LIST-FILTER.done.md`
