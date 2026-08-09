═══════════════════════════════════════════════════════════════
TZ-DOC-343: Builder — editable template name
═══════════════════════════════════════════════════════════════

> Domain: DocumentTemplate.name; клиент ≠ Organization.
> Проверено: `builder-inspector.component.ts` L136–142 Mode B показывает
> `{{ t.name }}` как `<p class="insp-hint">` (read-only); `templateUpdate`
> уже умеет PATCH; `onTemplateUpdate` в `builder.page.ts` L1527+ шлёт
> `templatesSvc.update(tid, patch)`; BE `UpdateDocumentTemplateDto` =
> PartialType(Create) → `name` optional, но если передан — `@IsNotEmpty`.

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: Нет (FE-only; API уже есть)

LAYER: 3

PAGES: /doc-constructor/builder/:id
PAGE_DOCS: builder.page.md

CONFLICT KEYS: frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts; frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.spec.ts; docs/pages/builder.page.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Список шаблонов → «Конструктор» / Редактировать → `/doc-constructor/builder/:id`.

2. В инспекторе (клик по листу / Mode B template) секция «Контекст» показывает
   название **только текстом** — поля ввода нет. Поэтому PO «не может поменять название».

3. Это не баг API и не lock: **дыра UX** — rename никогда не сделали в builder.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: INPUT НАЗВАНИЯ В MODE B

  В `builder-inspector` секция `insp-section-context` (Mode B):
  - Заменить read-only `<p>{{ t.name }}</p>` на поле:
    - label RU: «Название»
    - `input` (или `app-pi-input`) с `data-test="insp-template-name"`
    - значение = `t.name`
  - На **blur** и **Enter**: trim → если пусто — toast/ошибка «Название обязательно»,
    вернуть предыдущее; иначе `templateUpdate.emit({ name: trimmed })`.
  - Не спамить PATCH на каждый keystroke (только commit blur/Enter).
  - `aria-label="Название шаблона"`.

ШАГ 2: PARENT УЖЕ ГОТОВ

  Не менять `onTemplateUpdate` без нужды — он уже optimistic + PATCH.
  Убедиться, что `headerSubtitle` подхватывает новое имя из `template()` signal
  (сейчас computed от `template()?.name` — должно обновиться само).

ШАГ 3: TESTS + DOCS

  - Jest: emit `templateUpdate` with `{ name: '…' }` после commit.
  - Строка в `docs/pages/builder.page.md`: Mode B — редактируемое название шаблона.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Backend DTO/schema (уже ок)
- templates.page список / create dialog (кроме если явно нужно — **не** в этой TZ)
- Upload background / DOC-342 keys
- Block title editing (другое поле)
- TZ-SALES-317 / proposal-create

known_limitation:
- Переименование из списка шаблонов без входа в builder — later, если PO попросит
- description / tags edit — out of scope

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. В builder, Mode B (шаблон выбран): видно редактируемое поле «Название».
2. Изменение + blur/Enter → PATCH уходит; имя в шапке/subtitle обновляется.
3. Пустое имя не сохраняется; прежнее имя остаётся.
4. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=builder-inspector
   ```
5. Checklist + Executor report (auto); archive после Cursor/PO PASS (visual ok).

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

GEMINI.md → `tasks/_archive/2026-08/TZ-DOC-343.done.md`
