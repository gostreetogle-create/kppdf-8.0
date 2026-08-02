ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
commit: c1241af
verification:
  - acceptance criteria: PASS
  - frontend jest: PASS (699/699 full)
  - backend jest: PASS (320/320 full)
  - ng build (development): PASS
  - frontend typecheck: PASS (targeted; full tsc blocked by foreign categories.page.ts)
  - backend typecheck: PASS
  - git diff --check: PASS
  - code review: PASS
  - verify-status.sh: PASS
browser: MANUAL_BROWSER_CHECK_REQUIRED (no live dev-stack credentials in this session)

═══════════════════════════════════════════════════════════════
TZ-DOC-273: Builder — фон и прозрачность блоков
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend UI Engineer / Interaction QA

ЗАВИСИМОСТИ: TZ-DOC-269. Если выяснится, что feature требует большого backend/API redesign, остановить реализацию и оформить successor вместо частичного решения.

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts;frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts;frontend/src/app/pages/doc-constructor/builder/block-renderer-state.service.ts;frontend/src/app/pages/doc-constructor/builder/block-renderer.component.css;frontend/src/app/pages/doc-constructor/builder/builder.page.ts;frontend/src/app/shared/template-block/template-block.types.ts;frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Пользователь просит: по умолчанию блоки прозрачны, но в properties иметь возможность выбрать background color и opacity.

2. Renderer уже читает часть `settings`: `blockBgColor()` вычисляет RGBA из настроек `blockBgColor`/`blockOpacity`; inspector сейчас не предоставляет полноценные controls для выбранного блока. Это похоже на малый frontend vertical slice, но payload whitelist и preview/print path нужно проверить.

3. Цвета должны использовать Paper & Ink tokens/безопасный color input; нельзя вводить произвольный CSS/URL через style binding.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Проверить текущий settings contract, backend DTO whitelist и server-side render/preview. Зафиксировать, какие block types поддерживают фон безопасно (text/table/image/spacer/signature).

ШАГ 2: Добавить в inspector цветовой control и opacity slider с понятным reset «Прозрачный». Default для новых и старых блоков должен оставаться прозрачным; существующие данные не должны получить неожиданный фон.

ШАГ 3: Валидировать цвет и диапазон opacity на клиенте и сервере/DTO boundary, если settings проходят через whitelist. Не принимать CSS injection, gradients, URLs или NaN.

ШАГ 4: Проверить editor, preview и generated-document output; добавить component/service tests и ручной browser-check.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts — controls.
- frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts;
  frontend/src/app/pages/doc-constructor/builder/block-renderer-state.service.ts — safe style application.
- frontend/src/app/pages/doc-constructor/builder/block-renderer.component.css — default transparent styling.
- frontend/src/app/pages/doc-constructor/builder/builder.page.ts — update/persistence.
- frontend/src/app/shared/template-block/template-block.types.ts — only if typed settings contract is introduced.
- backend template-block DTO/schema/render files — only if current whitelist strips the fields and a minimal contract change is approved.
- relevant specs.

НЕ ИЗМЕНЯТЬ:
- global color tokens or unrelated forms;
- z-order model (TZ-DOC-271);
- marquee/group model (TZ-DOC-272).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. New and existing blocks render with transparent background by default.
2. Inspector can set a safe background color and opacity 0–100%; reset returns to transparent.
3. Settings survive debounce, reload and generated-document preview without leaking raw CSS.
4. Text/table/image behavior is consistent; selection border remains visible regardless of fill.
5. Invalid colors, NaN, out-of-range values and unsupported CSS are rejected and do not corrupt saved settings.
6. Tests cover default/reset/range/serialization and at least one template-build or preview path; frontend/backend typechecks and relevant Jest pass.
7. Manual browser check confirms transparent text over background image, readable filled table, and opacity changes.

РУЧНОЙ СЦЕНАРИЙ: выбрать text/table/image; оставить прозрачным; задать цвет; изменить opacity; reset; обновить страницу и открыть preview. Убедиться, что selection frame не исчезает.

ОГРАНИЧЕНИЯ: если backend whitelist не поддерживает безопасный settings contract, не обходить whitelist и не сохранять произвольный CSS; оформить отдельную backend TZ.
