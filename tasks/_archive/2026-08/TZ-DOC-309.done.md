ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
commit: 366ef60 (feat(builder): cache document template categories (TZ-DOC-309))
verification:
  - acceptance criteria: PASS (active catalog cache, cold loading/error/empty states, successful mutation invalidation, stale-response generation guard)
  - frontend targeted Jest: PASS (24 tests / 2 suites)
  - frontend typecheck (tsconfig.app.json --noEmit): PASS (exit 0)
  - frontend development build: PASS (exit 0)
  - git diff --check: PASS (exit 0)
  - independent code review: PASS (no P0/P1; remaining P2 limitations documented)
  - checklist: ADDED (docs/agent-checklists/TZ-DOC-309.md)
  - STATUS.md: UPDATED (READY -> DONE)
  - progress.md: UPDATED
browser: MANUAL_BROWSER_CHECK_REQUIRED (authenticated live flow was not available; manual scenario is recorded below)
limitations:
  - Dialog specs use a service mock; the real service cache is covered independently by HttpTestingController tests.
  - The browser scenario was not run in this session.
  - No commit or push was performed because the canonical worktree contains unrelated work from other sessions.

═══════════════════════════════════════════════════════════════
TZ-DOC-309: Диалог создания шаблона — мгновенное открытие
═══════════════════════════════════════════════════════════════

РЕЗУЛЬТАТ

`DocumentTemplateCategoriesService` теперь кэширует только стабильный активный
каталог (`list({ activeOnly: true })` без поиска) на время жизни приложения.
Повторные вызовы делят один in-flight GET и получают кэш синхронно; запросы
справочника и поиска остаются свежими. Успешные create/update/remove инвалидируют
кэш, а generation guard не позволяет старому ответу перезаписать свежий кэш.

`TemplateSetupDialogComponent` использует существующий сервисный контракт:
холодное открытие сохраняет loading/error/empty состояния, а после успешного
первого ответа повторное открытие получает категорию и default синхронно.
Механику закрытия, submit guard и API-контракт не изменяли.

ИЗМЕНЁННЫЕ ФАЙЛЫ

- `frontend/src/app/shared/services/pi-document-template-categories.service.ts`
- `frontend/src/app/shared/services/pi-document-template-categories.service.spec.ts`
- `frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.spec.ts`
- `docs/agent-checklists/TZ-DOC-309.md`

ПРОВЕРКИ

- `cd frontend && pnpm exec jest src/app/shared/services/pi-document-template-categories.service.spec.ts src/app/pages/doc-constructor/builder/template-setup-dialog.component.spec.ts --no-coverage --runInBand` — 24/24 PASS.
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS.
- `cd frontend && pnpm exec ng build --configuration=development` — PASS.
- `git diff --check` — PASS.

РУЧНОЙ СЦЕНАРИЙ

На `/doc-constructor/builder` и `/doc-constructor/templates` открыть диалог
создания шаблона, закрыть и открыть снова. При втором открытии select категории
и default-категория должны быть видны без loading-индикатора и без второго GET
активного каталога. Проверить также viewport 375px и отсутствие console errors.
