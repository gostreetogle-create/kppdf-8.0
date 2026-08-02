═══════════════════════════════════════════════════════════════
TZ-DOC-332: Builder Inspector — IA и визуальный канон правой панели
═══════════════════════════════════════════════════════════════

> Domain preflight: UI-only. Сущности не меняются (`TemplateBlock`,
> template props). Цель — сделать правую панель «Свойства» такой же
> читаемой и ритмичной, как левая «Палитра» (tool-pane), без смены
> бизнес-логики groupId / canvas / API.
>
> PO smell (dictation): справа хаос высот/ширин, типографика, кнопки
> «не хочется лезть»; палитра (теперь **сверху**, tool-pane) уже
> аккуратно. Loose wording «свойства» → `BuilderInspectorComponent`.
> Эталон ритма = top `builder-tool-pane`, не «левая колонка 280px».

РОЛЬ АГЕНТА: Frontend Doc-Constructor (inspector UX / Paper & Ink rail)

ЗАВИСИМОСТИ:
- Не блокируется DOC-331 (group drag). CONFLICT KEYS почти disjoint:
  331 = canvas/renderer/page; 332 = inspector (+ docs).
  Если оба в `_active` — **параллельно ок**, не трогать чужие keys.
- Не требует backend.

LAYER: 3

PAGES: /doc-constructor/builder/:id
PAGE_DOCS: builder-inspector.page.md ; builder.page.md (краткая ссылка на
  inspector IA — без переписывания canvas)

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts;
frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.spec.ts;
docs/pages/builder-inspector.page.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/agent-checklists/TZ-DOC-332.md

> Параллель с DOC-331 ок: 331 = canvas/renderer/page; 332 = inspector.
> Не править tool-pane / canvas / block-renderer в этом TZ.

Проверено (аудит Cursor 2026-08-02, live `builder-inspector.component.ts`):
- ~2200 строк template+styles в одном файле; 4 режима: empty / template /
  multi / single.
- Три конкурирующих системы секций: `props-section` + номера 00/01/02/SNAP;
  `inspector__section` (multi); плоский `inspector__form` без заголовков
  (single — худший UX при самой частой работе).
- Title `20px` Hanken vs tool-pane `13px` uppercase; inputs с hardcoded
  `Inter`; hex fallbacks; native checkbox рядом с `pi-switch`; 4 диалекта
  кнопок (`pi-button`, `layer-order-btn`, `field__reset-btn`, bg-action).
- Empty: «Ничего не выбрано» + сразу сводка + SNAP — противоречие.
- Single: Edit+Delete в одном ряду; geometry после content; duplicate
  overlay XY vs layout XY для image.
- Docs `builder-inspector.page.md` устарели (нет template mode / snap /
  group / layout).

Эталон ритма (копировать паттерн, не page-level `pi-section`):
`frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts`
— section-toggle, 13px uppercase title, hairline borders, compact 24px
controls, soft sunrise-soft hover, `var(--color-*)` без hex, font inherit.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Левая палитра уже выглядит «цехом»: категории, единый размер кнопок,
   спокойная типографика. Правая панель — свалка контролов разных эпох
   TZ (snap, multi margins, group, template bg, single fields).

2. Оператор не видит категории с первого взгляда: где геометрия, где
   текст, где опасное удаление.

3. Функциональность в целом есть (не выкидывать поля) — нужна
   **пересборка chrome + порядок секций + единый visual scale**.

═══════════════════════════════════════════════════════════════
ЦЕЛЕВОЙ КАНОН (зафиксировано, без развилок)
═══════════════════════════════════════════════════════════════

### Один section pattern на все режимы

Как у tool-pane (или 1:1 визуальный близнец):

- Заголовок панели: `13px` / `600` / uppercase / `letter-spacing ≈ 0.06em`
  / ink (не 20px display).
- Секция: hairline `border-bottom`, заголовок секции uppercase 11–12px
  muted/ink, опционально collapsible (если делаете — все режимы одинаково).
- Горизонтальный padding секций = tool-pane (`16px`).
- Контролы: одна высота input (~28–32px), `font: inherit`, без Inter.
- Тогглы: везде `app-pi-switch` (убрать native checkbox snap / pageNumbering).
- Акцент: soft `sunrise-soft` hover + ink active; **не** золотые панели /
  золотой текст как основной CTA (upload/layer как ink outline).
- Danger: отдельная секция внизу, destructive only (Delete). Edit —
  secondary выше или в «Содержимое», не в одном ряду с Delete.

### IA по режимам (порядок сверху вниз)

**A. Ничего не выбрано (document context)**  
1. Контекст: «Документ» + краткая сводка (counts/types) — **без** hero
   «Ничего не выбрано» как главной мысли (можно одну строку-hint внизу
   заголовка).  
2. Сетка / привязка (snap, шаг, отступ краёв).

**B. Выбран шаблон (templateSelected)**  
1. Контекст «Шаблон» + close.  
2. Стиль страницы (opacity, нумерация).  
3. Фон (gallery + upload).

**C. Multi-select**  
1. Контекст «Выбрано: N» (+ badge группы если `grouped`).  
2. Геометрия (общие отступы / то что уже есть).  
3. Группа (сгруппировать / разгруппировать).  
4. Слой (front/raise/lower/back) — компактный ряд, не 4 толстые плашки.  
5. Опасная зона — удалить выбранные.

**D. Single block**  
1. Контекст: type pill + title + Активен (+ read-only «в группе» если
   `groupId` есть — опционально, без новой API).  
2. **Геометрия** первой после контекста (layout X/Y/W/H или legacy
   margins; image overlay XY слить в эту историю, не дублировать).  
3. Содержимое (text/image/signature/table/binding).  
4. Стиль (линия, фон блока, overlay-флаг).  
5. Слой.  
6. Опасная зона: Delete; Edit — outline secondary над danger или в
   «Содержимое».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Design tokens / chrome parity с tool-pane

  Под-шаг 1.1: Унифицировать header + section title + field label +
    input heights в styles inspector (удалить Inter, hex fallbacks где
    есть var).
  Под-шаг 1.2: Один класс секции для всех режимов (рефактор
    `props-section` / `inspector__section` → один паттерн).
  Под-шаг 1.3: Убрать inline `style="margin-top…"` у SNAP; номер «SNAP»
    заменить нормальным заголовком секции.
  Под-шаг 1.4: Удалить мёртвый CSS orientation/page-size, если UI уже
    вырезан.

ШАГ 2 — Переставить секции по IA (режимы A–D выше)

  Под-шаг 2.1: Empty → document context (сводка + snap).
  Под-шаг 2.2: Template / multi / single — порядок как в каноне.
  Под-шаг 2.3: Single: geometry до content; danger отделён от Edit.

ШАГ 3 — Контролы: один диалект

  Под-шаг 3.1: Snap + pageNumbering → `pi-switch`.
  Под-шаг 3.2: Layer order — компактный toolbar (иконки lucide и/или
    короткие label), единый размер с reset/upload.
  Под-шаг 3.3: Upload / reset — ink outline, hover как tool-pane.

ШАГ 4 — Поведение не менять (регрессия логики)

  Под-шаг 4.1: Те же inputs/outputs и те же PATCH-поля; не ломать
    groupSelected/ungroupSelected, snapSettingsChange, templateUpdate,
    layoutOrderChange, delete*, editSelected.
  Под-шаг 4.2: Не трогать canvas / groupId resolve / left palette
    структуру (кроме copy-paste CSS values).

ШАГ 5 — Тесты + docs

  Под-шаг 5.1: Checklist `docs/agent-checklists/TZ-DOC-332.md` до кода.
  Под-шаг 5.2: Обновить/добавить spec: в каждом режиме видны заголовки
    секций в каноническом порядке (data-test на section headers).
  Под-шаг 5.3: Переписать `docs/pages/builder-inspector.page.md` под
    live IA (режимы A–D, без spacer-only наследия).
  Под-шаг 5.4: PAGE-TZ-INDEX строка DOC-332.

ШАГ 6 — Gates + ручная приёмка

  См. AC. Screenshot не обязателен; ручной чеклист PO-сценариев обязателен
  в checklist evidence.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/.../builder/builder-inspector.component.ts
- frontend/.../builder/builder-inspector.component.spec.ts
- docs/pages/builder-inspector.page.md
- docs/pages/PAGE-TZ-INDEX.md
- docs/agent-checklists/TZ-DOC-332.md

НЕ ИЗМЕНЯТЬ:
- builder-canvas / block-renderer / groupId drag (DOC-331 зона)
- builder-tool-pane структура (эталон только читать)
- builder.page.ts — кроме доказанного поломанного binding после
  перестановки template (тогда минимальный wire)
- Backend / TemplateBlock schema / PiToastService / GlobalErrorHandler
- Новые свойства блоков, nested groups, rename групп
- Не «улучшать» insertBlock / palette content в этом TZ

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Visual: в режимах A–D все секции используют **один** chrome
   (заголовок панели ≈ tool-pane; секции hairline; единая высота input).
2. IA: single-block — после контекста сразу **Геометрия**, затем
   содержимое/стиль/слой, Delete внизу отдельно от Edit.
3. Empty: нет доминирующего «Ничего не выбрано» без контекста документа;
   snap и сводка выглядят как свойства документа.
4. Нет native checkbox для snap/pageNumbering; нет Inter на полях;
   нет золотого «главного» CTA upload.
5. Multi: порядок Контекст → Геометрия → Группа → Слой → Danger.
6. Логика group/snap/template/update/delete не регрессирует (существующие
   + новые section-order specs зелёные).
7. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern="builder-inspector" --no-coverage
   cd frontend && pnpm exec ng build --configuration=development
   ```
8. `git diff --check`; push только по запросу PO.
9. Manual (записать в checklist):
   - клик холст → document sections;
   - клик блок → geometry сверху;
   - multi 2 блока → группа/слой/danger читаемы;
   - свойства шаблона → стиль + фон.

known_limitation:
- Полный вынос shared pane CSS в отдельный файл — successor (не
  обязательно в 332, если дублирование token-значений достаточно).
- Иконки lucide для layer — желательны; если конфликт размера бандла —
  короткие текстовые compact buttons ок.
- DOC-331 group-drag — отдельный TZ; не смешивать.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

Root-tasks: checklist + archive `tasks/_archive/2026-08/` по GEMINI.md.
Перед archive — `## Executor report (auto)` ≤15 строк.

═══════════════════════════════════════════════════════════════
ПРОМПТ ИСПОЛНИТЕЛЮ (скопировать целиком)
═══════════════════════════════════════════════════════════════

```
Прочитай и выполни TZ-DOC-332.

Обязательный порядок:
1. Прочитай `GEMINI.md`, `docs/AI-AGENT-GUIDE.md`,
   `.agents/skills/kppdf-project/SKILL.md`.
2. Создай `docs/agent-checklists/TZ-DOC-332.md` ДО первой правки кода.
3. Следуй буквально: `tasks/TZ-DOC-332-builder-inspector-ia-visual-canon.md`.
4. Эталон визуала — левая палитра
   `builder-tool-pane.component.ts` (читать, не ломать).
5. Сверь CONFLICT KEYS: не трогай canvas/renderer/group-drag (DOC-331)
   и не трогай чужие dirty файлы.
6. Сделай один section chrome + IA порядок (режимы A–D в TZ).
   Не выкидывай существующие поля — переставь и выровняй.
7. Не меняй API outputs / groupId semantics / backend.
8. Spec на порядок секций + gates (tsc, builder-inspector jest, ng build).
9. Обнови `docs/pages/builder-inspector.page.md`.
10. `git diff --check`. Commit/push только если PO попросил.
11. Executor report (auto) ≤15 строк перед archive.

Критерий вкуса PO: правая панель должна ощущаться сестрой левой —
категории сразу читаются, кнопки одной высоты, без «мусорной свалки».
```
