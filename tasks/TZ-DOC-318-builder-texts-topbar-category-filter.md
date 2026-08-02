═══════════════════════════════════════════════════════════════
TZ-DOC-318: Builder — фильтр по категории в верхнем меню выбора текстов
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer / QA-валидатор

КОНТЕКСТ ЗАПРОСА:
Пользователь (2026-08-02): «в текстовых шаблонах, где тексты добавляем
вот эти же категории там будут появлять выпадащим спискам, и мы будем
выбирать категорию… когда будем выбирать тексты в шаблонах, там будет
фильтр по категории».

Это уточнение к TZ-DOC-317 (filter в picker-tool-pane для текстов).
Пользователь называет то же самое место «верхним меню», потому что
tool-pane визуально располагается НАД холстом в builder UI. Разницы в
разработке нет — это продолжение доменной цепочки
TZ-DOC-315 (backend contract) → TZ-DOC-316 (справочник категорий) →
TZ-DOC-317 (filter в picker) → TZ-DOC-318 (полное UX оформление +
  кеш «Все» в URL).

ЗАВИСИМОСТИ:
- TZ-DOC-315 DONE (backend `?categoryId=<id>` поддерживается).
- TZ-DOC-316 DONE (UI-справочник + кэш активных категорий на месте).
- TZ-DOC-317 RECOMMENDED DONE (filter в picker-tool-pane).
- TZ-DOC-318 уточняет UX поверх TZ-DOC-317:
  - синхронизирует categoryId между двумя picker-call-sites (tool-pane и
    страница templates), если builder-tool-pane рендерится независимо;
  - персистит выбор в URL (`?categoryId=...`) для shareable-link scenario;
  - отображает бейдж текущей категории в верхней панели builder (как
    breadcrumb «Текущая категория текстов: Описания»).
- Не запускать параллельно с TZ-DOC-309/310/311/312/313/314 — общий
  builder-tool-pane + builder.page.ts.

LAYER: 3 (только frontend, builder UI).

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts;
frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.spec.ts;
frontend/src/app/pages/doc-constructor/builder/builder.page.ts;
frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts;
frontend/src/app/shared/services/pi-text-block-categories.service.ts;
frontend/src/app/shared/services/pi-text-blocks.service.ts;
frontend/src/app/shared/services/builder-text-filter.service.ts (NEW);
docs/pages/builder.page.md.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. TZ-DOC-317 закрыт: в `builder-tool-pane` есть dropdown «Категория»
   с активными категориями из `PiTextBlockCategoriesService`. По
   умолчанию — «Все». При выборе категории → URL
   `/api/text-blocks?isActive=true&categoryId=<id>`.
   Это решает задачу пользователя по сути.

2. Открытые UX-зазоры, которые TZ-DOC-318 закрывает:
   - **URL-синхронизация**: выбор категории в верхнем меню НЕ
     отражается в URL строке → пользователь не может сохранить или
     расшарить состояние фильтра.
   - **Бейдж «Текущая категория»**: при активном фильтре категории нет
     визуального индикатора в pageHeader → пользователь видит только
     сокращённый список, не помня «это Описания или Реквизиты?»
   - **Empty-state без guidance**: при пустом списке показывается
     «Нет блоков в этой категории», но юзеру не предлагается
     «Создать блок в этой категории» (выход из тупика).
   - **Двух-picker inconsistency**: если в builder-tool-pane рендерят
     два разных call-site текстов (например, в разных вкладках), они
     могут расходиться в выбранной категории. Нужен общий
     `BuilderTextFilterService` (providedIn: 'root') с двумя signal.

3. Reference: TZ-DOC-308 (template registry) — уже реализовал
   аналогичный паттерн: filter хранится в URL-параметре, имеет breadcrumb
   badge, и dropdown «Категория» в верхней панели реестра.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1. Создать `BuilderTextFilterService` (NEW).

   Файл: `frontend/src/app/shared/services/builder-text-filter.service.ts`

   ```ts
   @Injectable({ providedIn: 'root' })
   export class BuilderTextFilterService {
     readonly categoryId = signal<string | null>(null);

     setCategoryId(id: string | null): void {
       this.categoryId.set(id);
     }
   }
   ```

   Альтернатива: раздать сигналы через route resolver + query-param.
   Это решает shareable-link и refresh-on-F5. Выбирать более
   минималистичный вариант в зависимости от контекста исполнения.

ШАГ 2. Прокинуть `categoryId` через URL.

   В `builder.page.ts` при загрузке: `takeUntilDestroyed` +
   `effect` на `route.queryParamMap.get('categoryId')` →
   `this.builderTextFilter.setCategoryId(...)`.
   При изменении сигнала → router.navigate с обновлённым query.

   Граничные случаи:
   - URL имеет `categoryId=`, но категория не существует → UI показывает
     «Все», console.warn('unknown categoryId: ...') (dev-only).
   - URL имеет невалидный ObjectId → игнорируется, фильтр = «Все».

ШАГ 3. Dropdown в верхней панели builder-tool-pane (не в нижней)

   Расположить dropdown в САМОМ ВЕРХУ tool-pane (перед секцией «Тексты»),
   чтобы он был визуально «верхним меню» — как просил пользователь.

   Варианты: «Все категории» (eyebrow «без фильтра») + список активных.
   При выборе → `setCategoryId(...)` (см. ШАГ 1). Эффект фильтрации —
   переход на шаблон TZ-DOC-317 (если уже реализован).

ШАГ 4. Бейдж текущей категории в page header.

   В `<app-pi-page-header>` (или рядом с eyebrow) добавить badge:
   ```
   <span class="pi-badge">{{ currentCategoryLabel() }}</span>
   ```
   Где currentCategoryLabel = lookup по `categoriesRes.value().find(c => c._id === categoryId())`
   или «Все категории» если null.

   Hover/aria-label badge: «Кликните, чтобы сбросить фильтр» —
   при клике → setCategoryId(null) + navigate без query-param.

ШАГ 5. Empty-state с CTA «Создать блок».

   Когда `textBlocksRes.value()?.length === 0 && categoryId() != null`:
   - текущий текст «Нет блоков в этой категории».
   - добавить кнопку «+ Создать блок в этой категории» →
     router.navigate(['/dictionaries/text-blocks/new'], { queryParams: { categoryId }}).
   - Кнопка видна только МЕНЕДЖЕРУ/АДМИНУ (RBAC check).
   - Если прав нет — кнопка скрыта, только текст empty-state.

ШАГ 6. Two-picker sync.

   Если в builder-page рендерятся два call-site текстов (например,
   в двух разных tool-panes внутри одной страницы — резервный сценарий),
   оба должны читать `BuilderTextFilterService.categoryId()`.
   Это предотвращает drift.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

СОЗДАТЬ:
- frontend/src/app/shared/services/builder-text-filter.service.ts (NEW)
- frontend/src/app/shared/services/builder-text-filter.service.spec.ts (NEW, unit)

ИЗМЕНИТЬ:
- frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts
  (новая позиция dropdown: в САМОМ ВЕРХУ панели; binding к
   BuilderTextFilterService вместо локального signal).
- frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.spec.ts
  (обновить тесты под shared service).
- frontend/src/app/pages/doc-constructor/builder/builder.page.ts
  (effect на queryParamMap; router.navigate при изменении;
   бейдж в page header; empty-state с CTA).
- frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts
  (новые тесты: URL sync, breadcrumb, empty CTA, RBAC-checked CTA).
- docs/pages/builder.page.md (новая секция «Filter URL-sync + badge»).

НЕ ИЗМЕНЯТЬ:
- backend/* (TZ-DOC-315 уже отдаёт правильный фильтр).
- Builder canvas + Inspector (TZ-DOC-269 revoked + TZ-DOC-271/272/273
  в другой TZ-цепочке).
- Materials, Admin/RBAC, TZ-278, Z-backlog, sanitize-html,
  TZ-MATERIALS-*, TZ-BACKEND-E2E-HARNESS, TZ-DOC-309/310/311.
- package.json / lockfiles.
- Templates.page.ts / TZ-DOC-308 / TZ-DOC-316 (общие регионы,
  рефакторить только при явной координации).
- TZ-DOC-269 (для грид-слоя) оставить в архиве как
  SUPERSEDED — оно для удобства трейсинга понадобится в отчётах.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Dropdown «Категория» в builder-tool-pane визуально расположен
   В САМОМ ВЕРХУ панели (над секцией «Тексты»).
2. По умолчанию — «Все категории»; опции — из
   `PiTextBlockCategoriesService.list({ activeOnly: true })`.
3. При выборе категории:
   - URL обновляется: `/doc-constructor/builder?templateId=…&categoryId=<id>`;
   - квери-парамeтр синхронизирован через `BuilderTextFilterService`;
   - список текстов фильтруется по `?categoryId=<id>`;
   - в page header появляется badge с названием категории;
   - empty-state содержит CTA «Создать блок в этой категории»
     (для admin/manager).
4. Возврат на «Все категории» → URL без `categoryId` →
   `BuilderTextFilterService.categoryId = null` → все блоки снова видны →
   badge убирается.
5. Клик по badge → setCategoryId(null) + navigate без query-param.
6. Refresh страницы (F5) сохраняет фильтр через URL query-param.
7. Shareable link `/doc-constructor/builder?categoryId=<id>` открывается
   с уже активным фильтром.
8. RBAC: для роли `user` без прав на создание блоков — CTA-кнопка
   скрыта, пустой state остаётся информативным.
9. Keyboard: dropdown открывается/закрывается Enter/Esc; focus visible.
10. 375px viewport: dropdown не выходит за края; badge переносится
    корректно.
11. Frontend tsc — exit 0.
12. Frontend Jest (targeted) PASS.
13. ng build --configuration=development PASS.
14. ESLint — 0 errors.
15. Manual browser-flow (если есть credentials) — заполнен.

═══════════════════════════════════════════════════════════════
РУЧНОЙ СЦЕНАРИЙ
═══════════════════════════════════════════════════════════════

1. Создать 3 категории текстов: «Описания», «Реквизиты», «Контакты».
2. Создать 6 текстовых блоков, разнести по категориям.
3. Открыть `/doc-constructor/builder?templateId=…` →
   в верхней панели инструментов виден dropdown «Категория»
   со списком активных категорий.
4. По умолчанию «Все категории» → в списке все блоки →
   в page header нет badge.
5. Выбрать «Описания»:
   - URL меняется на …&categoryId=<id>;
   - в page header badge «Категория: Описания»;
   - в списке только блоки категории «Описания»;
   - empty-state (если список пуст) содержит CTA «+ Создать блок».
6. Скопировать URL из строки → открыть в новой вкладке →
   фильтр уже активен (URL persistence).
7. Клик по badge → фильтр сбрасывается, URL без `categoryId`.
8. Выбрать другую категорию → URL и badge обновляются.
9. 375px viewport: dropdown открывается, badge переносится под title.
10. Выйти из системы (или зайти под `user`-ролью) →
    CTA «Создать блок» НЕ виден → empty-state только текст.

═══════════════════════════════════════════════════════════════
DEFINITION OF DONE
═══════════════════════════════════════════════════════════════

- Conventional commit: `feat(builder): text topbar category filter (TZ-DOC-318)`.
- Checklist `docs/agent-checklists/TZ-DOC-318.md` создан ДО коммита.
- `docs/pages/builder.page.md` обновлён (новая секция «Filter URL-sync + badge»).
- STATUS.md: TZ-DOC-318 зарегистрирован в ⏳ READY → DONE.
- Archive: `tasks/_archive/2026-08/TZ-DOC-318.done.md`.
- Lock: `.mimocode/locks/TZ-DOC-318-builder-topbar-category-filter.lock`.
- progress.md: запись.
- Push только с явного разрешения владельца.

═══════════════════════════════════════════════════════════════
ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ
═══════════════════════════════════════════════════════════════

- Зависит от TZ-DOC-316 (UI-справочник + кэш категорий).
  Без него `PiTextBlockCategoriesService` не существует, и придётся
  инжектить категории через ActivatedRoute или httpResource напрямую —
  архитектурно хуже, но возможно.
- URL persistence через queryParamMap требует stable router config;
  если builder-page рендерится через lazy loader без явного
  `provideRouter({ withComponentInputBinding: true })` —
  input-binding не сработает, придётся использовать ActivatedRoute
  snapshot подход.
- Browser-flow может попасть в MANUAL_BROWSER_CHECK_REQUIRED
  (зависит от dev-stack credentials; не предполагается в этой TZ).
- Запрещено запускать параллельно с TZ-DOC-310..314, так как
  builder-tool-pane + builder.page.ts — это общие файлы.

═══════════════════════════════════════════════════════════════
СВЯЗАННЫЕ
═══════════════════════════════════════════════════════════════

- TZ-DOC-315: TextBlockCategory backend contract (DONE).
- TZ-DOC-316: TextBlockCategory reference & picker UI (RECOMMENDED DONE).
- TZ-DOC-317: Builder picker category filter (RECOMMENDED DONE; содержит
  базовый dropdown в tool-pane — TZ-DOC-318 расширяет UX поверх).
- TZ-DOC-308: DocumentTemplateCategory (DONE; reference pattern).
- TZ-269 (revoked): декоративный grid-layer; релевантно только потому,
  что TZ-DOC-269 revocation произошёл в одной сессии с TZ-DOC-318.

═══════════════════════════════════════════════════════════════
EOF TZ-DOC-318
