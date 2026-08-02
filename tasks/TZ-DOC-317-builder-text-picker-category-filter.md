═══════════════════════════════════════════════════════════════
TZ-DOC-317: Builder — фильтр текстов по категории в picker-панели
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer / QA-валидатор

ЗАВИСИМОСТИ:
- TZ-DOC-315 DONE (backend отдаёт `?categoryId=<id>`).
- TZ-DOC-316 RECOMMENDED DONE (UI-справочник и кэш активных категорий
  уже на месте). Если 316 ещё не закрыт — допускается создать
  локальный `inject(ActivatedRoute)`-источник, но строго через
  `PiTextBlockCategoriesService` (создаётся в TZ-DOC-316).
- Не запускать параллельно с TZ-DOC-310, 311, 312, 313, 314
  (общий `builder-tool-pane.component.ts` + `builder.page.ts`).

LAYER: 3 (только builder-страница; backend уже готов).

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts;
frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.spec.ts;
frontend/src/app/pages/doc-constructor/builder/builder.page.ts;
frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts;
frontend/src/app/shared/services/pi-text-blocks.service.ts;
frontend/src/app/shared/services/pi-text-block-categories.service.ts;
docs/pages/builder.page.md.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Builder панель инструментов «Тексты» сейчас подгружает одним
   запросом ВСЕ активные текстовые блоки:
   - `builder-tool-pane.component.ts:444`:
     `httpResource('/api/text-blocks?isActive=true')`
   - `builder.page.ts:704`:
     `<...>('/api/text-blocks?isActive=true')`
   Никакого фильтра по категории нет.

2. После TZ-DOC-315 backend умеет принимать `?categoryId=<ObjectId>` в
   `/api/text-blocks` и фильтровать на стороне Mongo. UI этого не
   использует.

3. Пользователь сказал: «в текстовых шаблонах, где тексты добавляем
   вот эти же категории там будут появлять выпадащим спискам, и мы
   будем выбирать категорию… когда будем выбирать тексты в шаблонах,
   там будет фильтр по категории».

4. Dropdown с категориями — это именно то, что уже есть в TZ-DOC-308
   для template registry: filter-секция в верхней панели. Аналог.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1. Получить список активных категорий для picker'а.

   Ввести в `builder-tool-pane.component.ts`:

   ```
   private readonly textBlockCategories = inject(PiTextBlockCategoriesService);
   protected readonly categoriesRes = httpResource<TextBlockCategory[]>(
     () => '/api/text-block-categories?activeOnly=true',
     { defaultValue: [] },
   );
   ```

   Альтернатива: подписаться на
   `textBlockCategories.list({ activeOnly: true })` через RxJS, чтобы
   переиспользовать кэш. Шаблон — TZ-DOC-309.

   Если активных категорий 0 (только системная «Общее») — отображать
   dropdown как «Все» (одна опция по умолчанию). Если 0 вообще
   категорий (теоретически) — picker работает как до изменений.

ШАГ 2. Dropdown «Категория» в верхней части «Текстов».

   Расположить НАД списком текстов, ВНУТРИ секции «Тексты» в
   tool pane. Не выносить в общий toolbar — это контекстный фильтр
   для секции.

   Варианты выбора:
   - «Все» (default; не отправляем `categoryId`).
   - Конкретная категория → `categoryId=<id>`.

   Заголовок dropdown (eyebrow): «Категория».

   OnChange → обновляет локальный signal `selectedCategoryId` →
   триггерит reload `textBlocksRes`.

ШАГ 3. Конвертировать `textBlocksRes` URL на сигнал `selectedCategoryId`:

   ```
   protected readonly selectedCategoryId = signal<string | null>(null);
   protected readonly textBlocksRes = httpResource<TextBlock[]>(() => {
     const url = new URL('/api/text-blocks', API_BASE);
     url.searchParams.set('isActive', 'true');
     const cat = this.toolPane.selectedCategoryId();
     if (cat) url.searchParams.set('categoryId', cat);
     return url.pathname + url.search;
   }, { defaultValue: [] });
   ```

   Это место чисто про builder-tool-pane. Логика В `builder.page.ts`
   такая же (ШАГ 4).

   Гарантии:
   - При смене категории запрос пересоздаётся (HttpClient сохраняет
     fetch-state в эффекте).
   - При ошибке категорий (5xx/4xx) dropdown показывает placeholder
     «Все»; picker не падает.
   - При 0 блоков после фильтра — empty state «Нет блоков в этой
     категории».

ШАГ 4. Builder.page синхронизация.

   В `builder.page.ts:704` `textBlocksRes` тоже прокинуть через
   общий state или через сервис. Самый простой путь —
   shared signal в маленьком сервисе `BuilderTextFilterService`
   (providedIn: 'root') с двумя сигналами: `categoryId`, `searchText`.

   Альтернатива (если service избыточен): пробросить binding из
   builder-tool-pane в builder.page через `output` event
   `categoryChanged`. Выбрать простой путь по контексту.

ШАГ 5. Не ломать существующее поведение.

   - Поиск/filter по тексту должны работать как раньше (после
     server-side фильтра).
   - Click `(cdkDragData)="text-block"` не меняется.
   - Drop событие в canvas работает идентично (TextBlock фигурирует
     как цельный блок; categoryId не пробрасывается, только content).
   - Search в picker (если есть в текущей версии) + новый category
     filter комбинируются в одном `findAll` запросе.

ШАГ 6. Spec / regression tests.

   Расширить `builder-tool-pane.component.spec.ts`:
   - при загрузке dropdown показывает «Все» + опции из API;
   - смена категории → новый URL формируется c правильным
     `categoryId`;
   - снятие фильтра (на «Все») → URL без `categoryId`;
   - пустой результат после фильтра → empty state, не crashed.

   Расширить `pi-text-blocks.service.spec.ts`:
   - `list({ categoryId, activeOnly: true })` отправляет
     правильный query string (categoryId set корректно через
     HttpParams).

   И, если создан `BuilderTextFilterService`, его unit-spec.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНИТЬ:
- frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts
  (dropdown + signal + httpResource URL-формирование).
- frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.spec.ts
  (новые тесты).
- frontend/src/app/pages/doc-constructor/builder/builder.page.ts
  (input binding или shared service для categoryId).
- frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts
  (regression: categoryId прокинут правильно).
- frontend/src/app/shared/services/pi-text-blocks.service.ts
  (опционально: добавить `categoryId?: string` в `TextBlockListParams` —
  лучше, чем собирать URL руками; паттерн совпадает с TZ-DOC-309).
- frontend/src/app/shared/services/pi-text-blocks.service.spec.ts
  (assert HttpParams border).
- docs/pages/builder.page.md (таблица «Тексты» → «Категория
  фильтр + бейдж»).

НЕ ИЗМЕНЯТЬ:
- backend/* (TZ-DOC-315 уже отдаёт правильный фильтр).
- Builder canvas + Inspector (TZ-DOC-311/312/313/314 другие).
- Materials, Admin/RBAC, TZ-278, Z-backlog, sanitize-html, TZ-MATERIALS-*,
  TZ-BACKEND-E2E-HARNESS, TZ-DOC-309/310/311.
- package.json / lockfiles.
- Templates.page.ts / TZ-DOC-308/316 — общие регионы, не трогать
  без явной координации.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. В builder панели «Тексты» сверху появился dropdown «Категория»
   с активными категориями из `PiTextBlockCategoriesService`.
2. По умолчанию выбрано «Все».
3. При выборе категории → запрос уходит с параметром
   `?isActive=true&categoryId=<id>`; список перерисовывается с
   блоками ТОЛЬКО этой категории.
4. Возврат на «Все» → запрос БЕЗ `categoryId`; список всех
   активных блоков, как раньше.
5. При пустом списке в выбранной категории — empty state
   «Нет блоков в этой категории».
6. Существующий `(cdkDrag)` drag-flow без регрессии:
   перетаскивание блока в canvas работает так же.
7. Cancelled drag → state корректен (нет «зависшего» запроса).
8. Ошибки 4xx/5xx на `/text-block-categories` НЕ ломают picker;
   dropdown показывает «Все».
9. Caching активных категорий работает (TZ-DOC-309 паттерн):
   повторное открытие builder не вызывает лишний GET
   `/text-block-categories`.
10. Keyboard: dropdown открывается/закрывается Enter/Esc,
    focus ring видно, labels корректны.
11. 375px viewport: dropdown не выходит за края; список текстов
    скроллится нормально.
12. Browser console нет новых ошибок в известных сценариях.
13. Frontend tsc — exit 0.
14. Frontend Jest (targeted) PASS.
15. ng build --configuration=development PASS.
16. Targeted ESLint — 0 errors.

═══════════════════════════════════════════════════════════════
РУЧНОЙ СЦЕНАРИЙ
═══════════════════════════════════════════════════════════════

1. Создать в `/dictionaries/text-block-categories` три категории:
   «Описания», «Реквизиты», «Контакты».
2. Создать 6 текстовых блоков, разнести по категориям (несколько в
   «Реквизиты», несколько в «Описания», один без `categoryId` —
   будет «Общее»).
3. Открыть builder `/doc-constructor/builder?templateId=…`.
4. В секции «Тексты» увидеть dropdown «Категория».
5. Выбрать «Описания» → в списке только блоки этой категории.
6. Перетащить один блок в canvas — текст появляется, как раньше.
7. Сменить категорию на «Реквизиты» — список обновился, в canvas
   остались ранее вставленные блоки (не очищаются).
8. Сбросить на «Все» — все блоки снова видны.
9. 375px viewport: dropdown открывается, тексты видны.
10. Добавить ещё категорию «Условия» в словарь → переоткрыть
    builder → dropdown содержит «Условия» (без hard reload страницы).

═══════════════════════════════════════════════════════════════
DEFINITION OF DONE
═══════════════════════════════════════════════════════════════

- Conventional commit: `feat(builder): text picker category filter`.
- Checklist `docs/agent-checklists/TZ-DOC-317.md` создан ДО коммита.
- `docs/pages/builder.page.md` обновлён.
- STATUS.md: READY → DONE; archive marker.
- progress.md: запись.
- `tasks/_archive/2026-08/TZ-DOC-317.done.md` создан по конвенции.
- `.mimocode/locks/TZ-DOC-317-builder-text-filter.lock` создан.
- Push только с явного разрешения владельца.

═══════════════════════════════════════════════════════════════
ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ
═══════════════════════════════════════════════════════════════

- Если TZ-DOC-316 ещё не закрыт → этот TZ начинать нельзя (нет
  `PiTextBlockCategoriesService`). Альтернативно можно использовать
  httpResource напрямую — но тогда архитектурная консистентность с
  TZ-DOC-308/309 ломается; не рекомендуется.
- Авторизованный browser-прогон может попасть в
  `MANUAL_BROWSER_CHECK_REQUIRED` (зависит от dev-stack credentials).
- Не затрагивает категории таблиц; пользователь явно сказал
  «таблицы не трогаем».
- Существующая legacy enum-категория (`legal/intro/outro/custom`) не
  пробрасывается в UI picker'а — это в компетенции TZ-DOC-318.
- Не выполнять параллельно с TZ-DOC-310..314 (общие файлы
  builder).
