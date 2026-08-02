═══════════════════════════════════════════════════════════════
TZ-MATERIALS-306: Материалы — фото и надёжное сохранение
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: QA-валидатор / Frontend Integration Engineer

ЗАВИСИМОСТИ: TZ-MATERIALS-301, TZ-MATERIALS-302; выполнять после основных изменений формы.

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/materials/material-form-dialog.component.ts;frontend/src/app/pages/materials/materials.page.ts;frontend/src/app/shared/services/photos.service.ts;backend/src/modules/photos/photos.service.ts;backend/src/modules/material/material.service.ts;relevant specs;docs/pages/materials.page.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Форма поддерживает multiple upload, выбор main photo, удаление с отложенным DELETE и cleanup новых uploads в `ngOnDestroy`.

2. Пользователь сообщил, что загрузка нескольких фотографий визуально работает, но просит проверить весь сценарий вместе с сохранением. В форме есть риск частично загруженных фото, orphan cleanup, закрытия dialog во время upload, пустого `photoIds` и отсутствия понятного error state.

3. Кнопка сохранения должна учитывать не только `submitting`, но и `uploading`; иначе пользователь может сохранить material до завершения загрузки.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Проверить upload success/failure mix, progress/loading, repeated file selection, main photo, remove-before-save, Cancel/Escape/backdrop и закрытие во время upload. Записать network sequence.

ШАГ 2: Проверить, что Save disabled/guarded во время upload, photo IDs отправляются только после успешной загрузки, main photo принадлежит выбранному списку, а failed uploads не попадают в payload.

ШАГ 3: Проверить edit: existing photos load, main selection survives PATCH/refresh, deletion is applied only after material save, cancel cleanup не удаляет уже сохранённые photos.

ШАГ 4: Добавить component/service tests и browser integration check. Если обнаружен backend atomicity gap, оформить отдельный successor вместо опасного best-effort расширения.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/materials/material-form-dialog.component.ts;
- frontend/src/app/pages/materials/material-form-dialog.component.spec.ts;
- frontend/src/app/shared/services/photos.service.ts — только подтверждённый client contract issue;
- backend/src/modules/photos/* и backend/src/modules/material/* — только отдельный доказанный API issue;
- docs/pages/materials.page.md при изменении контракта.

НЕ ИЗМЕНЯТЬ:
- upload security policy без отдельного TZ;
- unrelated photo consumers;
- database cleanup scripts and migrations.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Нельзя отправить material save во время незавершённой загрузки.
2. При частичной ошибке пользователь видит точный результат; failed photo IDs не сохраняются.
3. Main photo всегда является одним из сохранённых `photoIds` или явно отсутствует.
4. Cancel/Escape/backdrop после upload удаляет только orphan uploads текущей сессии; сохранённые фото не удаляются.
5. Edit load/save/delete photos корректно работает после refresh.
6. Tests покрывают success/failure/mixed upload, main photo, cancel cleanup, save guard; frontend typecheck/build/Jest проходят.
7. Browser console не содержит новых ошибок, network sequence документирован.

РУЧНОЙ СЦЕНАРИЙ: создать материал без фото; создать с одной и несколькими фотографиями; выбрать главное; удалить одну; отменить; повторить и сохранить; открыть edit, сменить главное, удалить фото и обновить.

ОГРАНИЧЕНИЯ: не переделывать весь photo subsystem; исправлять только доказанные дефекты material dialog.
