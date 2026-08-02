ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
commit: PENDING (feat(builder): one-click close + visible category validation (TZ-DOC-310))
verification:
  - acceptance criteria: PASS (one click closes; no-category click shows visible hint, never silently swallowed; single POST; cancel/Escape/backdrop regression green; parentDestroyRef on all 4 dialog.open entry points)
  - frontend targeted Jest: PASS (49 tests / 3 suites, runInBand)
  - frontend typecheck (tsconfig.app.json --noEmit): PASS (exit 0)
  - frontend development build: PASS (exit 0)
  - git diff --check: PASS (exit 0)
  - OrchestratorKit/verify-status.sh: PASS (exit 0)
  - independent code review: PASS (no P0/P1; 2 P2 findings fixed: canConfirm keeps button enabled so the hint is reachable, dead spec accessor removed)
  - checklist: ADDED (docs/agent-checklists/TZ-DOC-310.md)
  - STATUS.md: UPDATED (READY -> DONE)

ИЗМЕНЁННЫЕ ФАЙЛЫ

- frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts
- frontend/src/app/pages/doc-constructor/builder/builder.page.ts
- frontend/src/app/pages/doc-constructor/templates/templates.page.ts
- frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.spec.ts
- frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts
- frontend/src/app/pages/doc-constructor/templates/templates.page.spec.ts
- docs/agent-checklists/TZ-DOC-310.md

РЕЗУЛЬТАТ

Диалог создания/дублирования шаблона закрывается с первого клика «Создать»:
- кнопка disabled только пока каталог категорий грузится / в ошибке / пуст, или
  уже submitted — во время loading клик физически невозможен (бывший симптом
  «висит и ждёт второго нажатия»);
- при готовом каталоге без выбранной категории кнопка активна намеренно:
  клик показывает видимое «Выберите категорию» (confirmAttempted), не закрывает
  диалог и не создаёт шаблон — вместо молчаливого `if (!categoryId()) return;`;
- выбор категории сбрасывает hint;
- TZ-DOC-268 submit-guard сохранён: первый валидный confirm вызывает
  ref.close() ровно один раз, повторный клик не даёт второй результат и второй POST;
- во все 4 точки dialog.open(TemplateSetupDialogComponent) передан
  parentDestroyRef (builder onCreate/onDuplicate, templates onCreate/onDuplicate) —
  CDK overlay гарантированно уничтожается при навигации (не «зависает» в DOM).

РУЧНОЙ СЦЕНАРИЙ

Оба маршрута (/doc-constructor/builder, /doc-constructor/templates): «Создать» без
категории → видимое сообщение, диалог не закрывается; выбрать категорию → один
клик закрывает и ведёт к шаблону; двойной клик → один POST; Cancel/Escape/backdrop
закрывают без POST; duplicate-flow аналогичен.

ОГРАНИЧЕНИЯ

- MANUAL_BROWSER_CHECK_REQUIRED — live authenticated browser flow не запускался;
  контракт доказан unit/интеграционными тестами (включая TestBed template-компиляцию,
  ловящую NG5xxx).
- Не выполнялись: TZ-DOC-309 (уже в архиве, не трогали), TZ-DOC-311/312/313/314,
  TZ-278, TZ-MATERIALS-307/308/309, Z-series, Admin/RBAC, sanitize-html.
- pi-dialog.service.ts и on-dialog-close-once.ts НЕ изменялись (дефекта overlay не
  доказано; parentDestroyRef уже поддерживается сервисом).
