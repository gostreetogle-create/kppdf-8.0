═══════════════════════════════════════════════════════════════
TZ-MATERIALS-306: Материалы — фото и надёжное сохранение (DONE)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: QA-валидатор / Frontend Integration Engineer

РЕЗУЛЬТАТ
═════════

1. Save-guard (критерий 1): кнопка «Сохранить» теперь
   `[disabled]="submitting() || uploading()"` с label «Загрузка фото…» во время
   upload; `onSubmit()` делает early-return при `uploading()` — material save
   невозможно отправить до завершения загрузки фото.

2. Смешанный upload (критерий 2): `forkJoin` никогда не error'ит (photosService
   возвращает SilentResult), per-file `ok`/`!ok` разбирается — успешные фото
   попадают в `photos()`/payload, failed исключаются; toast показывает точный
   результат. Покрыто тестами (upload вызывается по разу на файл, в payload
   только успешные).

3. Main photo (критерий 3): mainPhotoId всегда принадлежит текущему списку
   фото; при удалении main — переключается на первый оставшийся или null.
   Покрыто тестом.

4. Cancel/Esc/backdrop (критерий 4): `cleanupOrphanUploads()` в ngOnDestroy
   удаляет ТОЛЬКО `newlyUploadedIds` текущей сессии (флаг `submitted` отделяет
   «сохранено» от «закрыто»); сохранённые фото (p-saved) не удаляются.
   Покрыто тестом destroy.

5. Edit flow (критерий 5): существующие фото грузятся через list(),
   mainPhotoId нормализуется (Photo-object vs string), удаление отложено до
   onsubmit (`pendingPhotoDeletions`), payload атомарен с сохранением.

Бэкенд-контракт НЕ менялся: atomicity photos/material сохранения — существующая
модель (upload фото → затем material PATCH с photoIds), отдельного backend gap
не обнаружено → successor не требуется.

ПРОВЕРКИ
════════

- frontend tsc (tsconfig.app.json --noEmit): PASS (0 errors; исключены
  параллельные TZ-DOC-файлы, не в conflict keys этой TZ)
- frontend jest materials: 2 suites / 36 tests PASS (включая 4 новых TZ-306:
  onSubmit no-op при uploading, failed uploads исключены + upload called 2x,
  mainPhotoId ∈ photoIds после remove, destroy удаляет только orphans)
- code-reviewer-deepseek-flash: 2 раунда — findings: добавлено усиление
  (upload toHaveBeenCalledTimes(2)); остальное подтверждено (wiring очереди,
  fixture.destroy() триггерит ngOnDestroy, нет регрессии 32 тестов)
- git diff --check: PASS (только LF/CRLF warnings)
- Полный `ng build` — пере-прогон в конце цепочки (параллельная TZ-DOC-сессия
  чинит свои файлы).

ИЗМЕНЁННЫЕ ФАЙЛЫ
════════════════

- frontend/src/app/pages/materials/material-form-dialog.component.ts
  (save button + onSubmit guard)
- frontend/src/app/pages/materials/material-form-dialog.component.spec.ts
  (setup: uploadResults-queue/photoList/remove/upload; +4 теста, +1 усиление)

НЕ ИЗМЕНЯЛИСЬ: photos backend, material backend, upload security policy,
cleanup-скрипты, другие consumers фото.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (Codebuff session)
protected_files:
  - frontend/src/app/pages/materials/material-form-dialog.component.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.spec.ts
acceptance_status: PASS
verification:
  - frontend tsc --noEmit: PASS
  - frontend jest materials: 36/36 PASS
  - code review: 2 rounds, findings resolved
  - git diff --check: PASS
  - OrchestratorKit/verify-status.sh: PASS (прогон после closeout)
manual_browser_check: NOT RUN — save-guard/upload-mix/main-photo/orphan-cleanup
  покрыты unit-тестами; визуальный прогон фото-сценария — на итоговый
  browser-аудит цепочки (стек :4200/:3000/mongo поднят).
known_limitations:
  - Бэкенд-атомарность photos/material не менялась (существующая модель:
    upload → material PATCH). Отдельный backend gap не выявлен.
lock_file: .mimocode/locks/TZ-MATERIALS-306-media-and-save-audit.lock
successor_required: FALSE (итоговый browser-аудит цепочки — следующий шаг)
