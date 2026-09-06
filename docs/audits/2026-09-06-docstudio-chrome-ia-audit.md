# Аудит: шапка / IA модуля «Докум.» (NX DocStudio)

**Статус: DONE** — WAVE-DOCSTUDIO-CHROME-IA C1–C4 закрыты Freebuff 2026-09-06:
C1 `42b4df0f` (landing без auto-resume, entryPath `/studio`) · C2 `85f1dc8e` (три раздела + nav cleanup) · C3 `45d7e6b8` (ribbon = крошки, actions → right rail) · C4 (docs/FIC/DOMAIN-MAP closeout). Финальный `nx build kppdf-web` green.

**Дата:** 2026-09-06  
**Автор:** Cursor Mode A  
**Триггер:** PO — повторный запрос (скрин): убрать текстовый ribbon, сделать хлебные крошки, три раздела (шаблоны / список документов / студия-редактор), действия → вертикальные rails.  
**WAVE:** `docs/agent-checklists/WAVE-DOCSTUDIO-CHROME-IA.md`  
**TZ:** `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-C1…C4-*.md`

---

### Preflight Check Output
- **Context read:** `docs/PO-CANON.md`; `docs/PO-SHARED-UNDERSTANDING.md`; `docs/TZ-AUTHORING.md`; `docs/pages/document-studio.page.md`; `docs/pages/kp-workspace-geometry.md`; `frontend-nx/.../studio-list.page.ts`; `studio-editor.page.ts`; `studio-session.ts`; `studio-workspace-shell.component.html`; `nav-categories.ts`; `shell-tool-rail.service.ts`; `docs/agent-checklists/_NOW.md`
- **Key Constraints:** Mode A (без product code); A4 не reflow; page-tools → chrome-rail; necessity §2 PASS (оператор NX, факт со скрина)
- **Planned Deliverable:** аудит + WAVE C1–C4 + PROMPT (после hotfix Freebuff)
- **Validation Path:** FIC §A (routes/nav); page.md; PAGE-TZ-INDEX; nx build per TZ

---

## 1. Что видит оператор (факт)

1. Чип **«Докум.»** в app-shell ведёт в категорию `docs`.
2. Заявленный `entryPath` = `/doc-constructor/templates` (`nav-categories.ts` ~149), но **на NX этих роутов нет** → фильтр падает на первый живой пункт → **`/studio`**.
3. `/studio` = `StudioListPage`, но сразу после `list()` вызывается `pickResumeStudioDocument` → **автопереход на `/studio/:id`** последнего/свежего draft (если нет `?list=1`). Комментарий в коде прямо говорит: «Документы resumes editing».
4. В редакторе вторая полоса (`kp-ws-ribbon`) — текстовые кнопки: **К списку · Редактор · Сохранить · Сохранить как… · Просмотр · PDF · В архив** + имя документа слева. Это и обведено на скрине PO.
5. Рабочие панели уже на chrome-rails (Данные / Выбрано слева; Элементы / Слои / Страницы / Свойства / Шаблон справа). Действия документа **дублируют** смысл rails текстом сверху.

## 2. Почему «игнорировали»

Не злой умысел, а **другая ось волн**: Data IA (D50–D56), витрина, Save/Preview honesty, warehouse/supply. Chrome/landing IA из page.md §1.2 («целевая») **не была отдельной executable WAVE** с conflict keys — поэтому ribbon остался как в S2 shell.

## 3. Целевая IA (зафиксировано по диктовке PO)

| Раздел | Смысл для оператора | Целевой route NX |
|--------|---------------------|------------------|
| **Документы** | Список созданных в студии экземпляров (`studio_documents`) | `/studio` (list **всегда**, без auto-resume) |
| **Шаблоны** | Список `document_templates` (отдельно от экземпляров) | `/studio/templates` |
| **Студия** | Редактор создания/правки экземпляра | `/studio/:id` |

**Чип «Докум.»** → всегда **Список документов** (`/studio`), не редактор.

**Верхняя полоса в редакторе:** только хлебные крошки, напр.  
`Документы / Студия / «537 SMOKE КП»`  
(клик по «Документы» = к списку; dirty-guard сохраняется).  
Имя в крошке кликабельно → rename (как сейчас клик по имени).

**Действия ribbon → rails (логика):**

| Было в ribbon | Куда | Как |
|---------------|------|-----|
| К списку | **Крошка** «Документы» | Отдельная кнопка не нужна |
| Редактор / Просмотр | **Правый rail** | Две иконки режима (active = текущий) |
| Сохранить | **Правый rail** | Иконка-действие (immediate) |
| Сохранить как… | Уже в панели **Шаблон** | Убрать из ribbon; CTA в flyout «Шаблон» |
| PDF | **Правый rail** | Иконка-действие |
| В архив | **Правый rail** | Иконка + существующий confirm |

Левый rail **не** раздувать lifecycle-кнопками: остаётся **Данные / Выбрано** (+ опционально позже). Геометрия: `kp-workspace-geometry.md` — overlay, A4 без reflow, ribbon тонкий.

## 4. Сущности (не путать)

| UI | Коллекция / API | Не путать с |
|----|-----------------|-------------|
| Документы (список) | `studio_documents` | Legacy `generated_documents` / «Архив» |
| Шаблоны | `document_templates` | `table_templates`, `text_blocks` (реестры) |
| Студия | редактор `studio_documents/:id` | Builder legacy |

Legacy пункты `/doc-constructor/*` в nav на NX — **мёртвые**; в C2 заменить на живые `/studio` + `/studio/templates` (тексты/таблицы остаются в `/registries` если уже там).

## 5. Сбои оператора (≥3)

1. Жмёт «Докум.» → оказывается в редакторе чужого/прошлого КП → не понимает, где список.
2. Ищет «Шаблоны» в чипе → 404 / fallback → снова студия.
3. Семь текстовых кнопок в ribbon крадут внимание и высоту; «Сохранить как» дублирует панель Шаблон.
4. Dirty: уход через крошку без guard → потеря правок (AC: guard обязателен).

## 6. Necessity (`PO-SHARED` §2)

- Оператор NX? **Да.**  
- Факт со скрина/кода? **Да.**  
- Дешевле? Нет — это корневой путь модуля.  
- Не dual-site / не partial legacy delete? **Да** (только NX routes + nav cleanup мёртвых пунктов).

## 7. Нарезка TZ

| SIZE | ID | Суть |
|------|-----|------|
| S | **C1** | Убить auto-resume; entryPath → `/studio`; list всегда виден |
| L | **C2** | Три раздела: routes + nav + страница шаблонов + крошки на list/templates |
| L | **C3** | Ribbon → только крошки; действия → правый chrome-rail |
| S | **C4** | page.md / PAGE-TZ-INDEX / specs / FIC closeout |

Последовательность обязательна (один `kppdf-web` build).  
**Старт:** Freebuff сейчас (`PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA`); hotfix shell — после C4.

## 8. НЕ делать

- Новый backend / новые коллекции.
- Порт legacy Builder / generated-documents journal как «четвёртый» раздел без запроса PO.
- Горизонтальный icon-strip вместо chrome-rail.
- Параллельный второй TZ на `studio/**` mid-wave.
- Менять Data IA (D50–D56) и геометрию A4.
