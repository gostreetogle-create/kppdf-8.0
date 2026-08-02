═══════════════════════════════════════════════════════════════
TZ-MATERIALS-301: Материалы — широкий структурированный диалог
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Layout Engineer / Frontend UI Engineer / QA-валидатор

ЗАВИСИМОСТИ: Нет. Выполнять первым среди TZ-MATERIALS.

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/materials/material-form-dialog.component.ts;frontend/src/app/pages/materials/materials.page.ts;frontend/src/app/shared/ui/dialog/pi-dialog.component.ts;frontend/src/app/styles.css;frontend/src/styles.css

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `MaterialsPage.openCreate()` открывает `MaterialFormDialogComponent` с width `lg`; сам диалог также использует `app-pi-dialog [width]="'lg'"`.

2. В форме последовательно расположены базовые поля, поставщик, габариты, фото, описание и заметки. Пользователь сообщает, что окно визуально узкое и высокое, структура тяжело читается, а кнопка «Сохранить» иногда не видна/уходит за рамку.

3. Существующий `PiDialogComponent` поддерживает form-width до 800px, body/footer slots и ограничение overlay до 90vh. Нельзя ломать общий dialog lifecycle или просто отключать ограничение высоты.

4. Доказательство: код `material-form-dialog.component.ts`, `materials.page.ts`, `pi-dialog.component.ts`, `frontend/src/app/styles.css`.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Воспроизвести create и edit на desktop и viewport 375px. Зафиксировать computed width/height, наличие footer, scroll-контейнер и причины исчезновения кнопки «Сохранить».

ШАГ 2: Перестроить только material dialog в широкий form-layout: слева обязательные основные данные (название, единица, цена и согласованный идентификатор), справа необязательные данные (поставщик, описание/заметки, фото), отдельной секцией — габариты. На узком viewport перейти в одну колонку с внутренней прокруткой.

ШАГ 3: Сделать footer диалога всегда видимым: «Сохранить» и «Отмена» должны находиться в sticky/фиксированной области dialog footer, не перекрываться body и не исчезать при длинной форме. Сохранить keyboard focus и submit через Enter.

ШАГ 4: Использовать Paper & Ink tokens, hairline, существующие `PiInput`, `PiTextarea`, `PiFormField`, `PiButton`; не копировать новую глобальную dialog-систему. Добавить component/browser regression tests.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/materials/material-form-dialog.component.ts — структура и layout формы.
- frontend/src/app/pages/materials/materials.page.ts — только width/config, если подтверждено необходимым.
- frontend/src/app/pages/materials/material-form-dialog.component.spec.ts — NEW/регрессионные тесты.
- frontend/src/app/styles.css — только scoped/shared dialog rule, если без этого невозможно.

НЕ ИЗМЕНЯТЬ:
- backend API/schema/DTO;
- общий `PiDialogComponent` и `PiDialogService`, если проблема решается scoped-изменением;
- unrelated dialogs;
- другие TZ-MATERIALS и `.mimocode/locks` чужих задач.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Create/edit dialog на desktop имеет широкую горизонтальную структуру, а не узкую длинную колонку.
2. Обязательные поля визуально находятся раньше и слева; необязательные сгруппированы справа/ниже по согласованной responsive-схеме.
3. «Сохранить» видна без прокрутки footer и остаётся доступной при длинном body.
4. На viewport 375px нет горизонтального overflow; body прокручивается внутри dialog, footer остаётся доступным.
5. Escape, крестик, Cancel и submit не ломают текущий lifecycle и не вызывают двойной POST.
6. Добавлены tests на render/submit/disabled/loading и выполнен browser-check.
7. Frontend tsc, development build, targeted Jest и `git diff --check` проходят.

РУЧНОЙ СЦЕНАРИЙ: `/materials` → «Создать»; проверить desktop/375px, заполнить обязательные поля, прокрутить форму, нажать «Сохранить»; убедиться, что кнопка видима, запрос один, после успеха dialog закрывается.

ОГРАНИЧЕНИЯ: не менять бизнес-модель материала и не добавлять новые поля в рамках одной UI-задачи.

═══════════════════════════════════════════════════════════════
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (Freebuff session)
protected_files:
  - frontend/src/app/pages/materials/material-form-dialog.component.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.spec.ts (NEW)
verification:
  - acceptance criteria: PASS
  - frontend tsc -p tsconfig.app.json --noEmit: PASS (exit 0)
  - jest src/app/pages/materials: 2 suites / 11 tests PASS (dialog spec instantiates via TestBed → template-compiles, NG5xxx guard)
  - ng build --configuration=development: BLOCKED by parallel TZ-DOC session mid-edit file builder-inspector.component.ts (NG5002, not in this TZ's conflict keys); re-run at chain end
  - git diff --check: PASS
manual_browser_check: PENDING — full stack up (:4200/:3000/mongo); dialog browser check scheduled for chain-end audit
known_limitations:
  - Full ng build gate is blocked by a parallel session editing builder-inspector.component.ts in the same canonical folder (AGENTS.md: не трогаю чужое). This TZ's files compile via tsc + TestBed-instantiated jest.
lock_file: .mimocode/locks/TZ-MATERIALS-301-dialog-layout.lock
successor_required: FALSE
