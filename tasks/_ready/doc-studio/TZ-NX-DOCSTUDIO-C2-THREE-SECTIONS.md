# TZ-NX-DOCSTUDIO-C2: Три раздела — Документы / Шаблоны / Студия

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Freebuff  
**ЗАВИСИМОСТИ:** TZ-NX-DOCSTUDIO-C1 DONE  
**LAYER:** 3  
**SIZE:** L  
**PACK:** WAVE-DOCSTUDIO-CHROME-IA · `tasks/PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA.md`

**PAGES:** `/studio` ; `/studio/templates` ; `/studio/:id`  
**PAGE_DOCS:** `document-studio.page.md` ; `document-template-categories.page.md` (ссылка, не переписывать)

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio.routes.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-templates-list.page.ts` (new) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-templates-list.page.spec.ts` (new) ;  
`frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/route-paths.spec.ts` ;  
`frontend-nx/libs/ui/paper-and-ink/src/page/pi-page-chrome.component.ts` (только consume, не ломать API)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — полная сборка приложения (nx build kppdf-web)

---

### Preflight Check Output
- **Context read:** audit §3; `studio.routes.ts`; `PiDocumentTemplatesService`; `pi-page-chrome.component.ts`; C1 DONE
- **Key Constraints:** route order `:id` не перехватывает `templates`; Paper & Ink chrome; без BE
- **Planned Deliverable:** 3 живых раздела + крошки на list-страницах
- **Validation Path:** FIC §A; route specs; nx build

**Проверено:** `document_templates` API уже в data-access; picker dialog существует.

Loose wording → канон: «просто документы» = list `studio_documents`; «шаблоны» = `document_templates`; «студия» = editor `/studio/:id`.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Роуты: `''` → list, `:id` → editor. Нет `/studio/templates`.
2. Nav docs содержит мёртвые `/doc-constructor/templates|texts|tables|documents` + `/studio`.
3. List page: H1 «Студия документов», без `app-pi-page-chrome` crumbs.
4. Шаблоны сейчас — только dialog «Из шаблона» / save-as, не отдельный раздел.

**Сбои:**
- Оператор ищет «Шаблоны» в меню — битый path.
- Путает экземпляр и шаблон в одном списке.
- Нет крошки между разделами модуля.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Routes
В `studio.routes.ts` (порядок важен):

```text
''           → StudioListPage          // Документы
'templates'  → StudioTemplatesListPage // Шаблоны
':id'        → StudioEditorPage        // Студия (как сейчас) + dirty guard
```

Spec/route-paths: `/studio/templates` registered; `'templates'` не матчится как id.

### ШАГ 2 — Страница шаблонов
Новый `studio-templates-list.page.ts`:
- `app-pi-page-chrome` crumbs: `Документы` → `/studio` · current `Шаблоны`.
- Загрузка `PiDocumentTemplatesService.list()`.
- Таблица/строки: имя, ориентация, pageSize, updatedAt (что есть в типе).
- Действия: **Создать документ из шаблона** (reuse logic из list `createFromTemplate` / from-template API — вынести helper если дубль >15 строк), **Удалить** (reuse confirm из template-picker delete).
- Empty / error / loading — как list.
- `data-test="studio-templates-list"`.

Не строить полноценный template-editor (нет в scope) — только журнал шаблонов + создать документ / удалить.

### ШАГ 3 — Список документов: chrome + copy
- `studio-list.page.ts`: заменить eyebrow/H1 на `app-pi-page-chrome`:
  - crumbs: current **«Документы»** (без link) **или** parent «Докум.» без link + current Документы — достаточно одного current «Документы».
  - Рядом actions: существующие кнопки Создать / Новое КП / Из шаблона (можно оставить в chrome actions slot).
- Добавить вторичную ссылку/кнопку **«Шаблоны»** → `/studio/templates` (ghost или text link в actions).
- Заголовок модуля в copy: не смешивать «Студия» (редактор) со списком.

### ШАГ 4 — Nav категории docs
Оставить живые пункты только:

| path | label | pageKey |
|------|-------|---------|
| `/studio` | Документы | `doc-studio` (или сохранить ключ) |
| `/studio/templates` | Шаблоны | `doc-templates` (переназначить с мёртвого) |

- Удалить из **NX nav items** мёртвые `/doc-constructor/*` и `/import-todos` только если нет NX route (проверить `app.routes` — нет → убрать из docs category).
- `entryPath` остаётся `/studio` (C1).
- Обновить nav/route specs.

### ШАГ 5 — Permissions / FIC (минимум)
- Если `doc-templates` pageKey уже в RBAC — reuse; иначе map на существующий `doc-studio` capability (не плодить BE permission без нужды). Зафиксировать в checklist.
- Строка в Integrity при C4; здесь — не ломать доступ admin.

---

## ИЗМЕНЯТЬ
- CONFLICT KEYS + необходимые тонкие helpers в `pages/studio/**` если extract create-from-template.

## НЕ ИЗМЕНЯТЬ
- Ribbon редактора / shellTools actions (C3).
- Backend schemas; `/registries` table/text templates.
- Legacy `frontend/**`.
- Геометрию A4.

---

## КРИТЕРИИ ПРИЁМКИ

1. `/studio` — список экземпляров + chrome «Документы» + CTA создания.
2. `/studio/templates` — список шаблонов; из шаблона создаётся studio doc и открывается `/studio/:id`.
3. Nav «Докум.» / подпункты ведут только на живые NX paths; 0 ссылок на `/doc-constructor/*` в docs category.
4. Роут `/studio/templates` не открывает editor с id=`templates`.
5. Gates PASS.

## BUILD INTEGRITY (обязательно)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM):
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Gates (закрытие, nx build — ПОСЛЕДНИЙ):
  cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  cd frontend-nx && pnpm test -- studio-list studio-templates nav-categories route-paths
  cd frontend-nx && pnpm lint
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0  ← обязательно последним

Параллель: STOP если в tasks/_active/ другой TZ с kppdf-web/src/**

**known_limitation:** визуальный editor ribbon ещё старый (C3); categories page не трогаем.
