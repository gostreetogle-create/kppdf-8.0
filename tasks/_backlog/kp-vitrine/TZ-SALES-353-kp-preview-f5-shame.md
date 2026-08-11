═══════════════════════════════════════════════════════════════
TZ-SALES-353: Превью A4 / F5 / многостраничность — стыд
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
WAVE: WAVE-KP-SHAME-POLISH

РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-SALES-352 DONE; 346 multipage в коде
LAYER: 3
PRIORITY: high
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.html; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; docs/pages/proposals-create.page.md

Проверено: center = sandboxed A4 iframe(s); 346 — «Страница 1 из N»; autosave 339;
loading/error на листе должны быть короткие RU (канон page doc).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Loading / error превью — короткий **русский** текст на листе (не сырой Exception / EN).
2. После F5: позиции, шаблон, получатель, условия, sheetLayout восстанавливаются
   (уже контракт 339/343/344/346 — дожать регрессии, если что-то «молчит»).
3. Многостраничность: «Страница N из M» видно и понятно; один лист — без ложного «из 1»
   если так задумано — зафиксировать поведение в тесте/доке.
4. Нельзя править документ кликом внутри iframe preview (канон: превью = смотреть).
5. Tests + page doc note.

ИЗМЕНЯТЬ: proposal-create preview chrome / hydrate guards / specs / page doc.
НЕ ИЗМЕНЯТЬ: document-template build engine (кроме чтения); puppeteer PDF; шелл 317;
deploy.

known_limitation: pixel-perfect бланк vs Word — вне волны; только стыд UX.

КРИТЕРИИ ПРИЁМКИ:
1. Ошибка build не стыдит EN-простынёй.
2. F5 не теряет состав/условия/лист на happy-path draft.
3. Многостраничный индикатор корректен.
4. Gates: FE tsc; `pnpm test -- proposal-create`; Prettier/ESLint/diff-check;
   browser/DOM self-check PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-353.done.md` + lock
`.mimocode/locks/TZ-SALES-353-kp-preview-f5-shame.lock`.
