═══════════════════════════════════════════════════════════════
TZ-SALES-317: Create КП focus shell (A4 + icon rails)
═══════════════════════════════════════════════════════════════

> Перед работой: `docs/TZ-AUTHORING.md` · `docs/PO-DIARY.md` §1–§4 ·
> SoT раскладки: `docs/ux/kp-create-studio-spec.md` (v2) ·
> Аудит: `docs/audits/2026-08-09-kp-create-studio-layout-audit.md`

РОЛЬ АГЕНТА: Frontend Layout Engineer (Angular studio shell)

ЗАВИСИМОСТИ: TZ-SALES-312…316 DONE (shell + rail + inspector + template center уже в коде)

LAYER: 3

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create-template-picker.component.ts; docs/pages/proposals-create.page.md; docs/ux/kp-create-studio-spec.md

Проверено: `proposal-create.page.ts` (H1 + zone titles + always-on wide columns); audit viewport 1920×1080 (center≈570px, studio height≈2124px); dictation «Organization=клиент» = loose → клиент **Counterparty**, бланк **Organization**; КП = `Quotation`.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `/proposals/create` — трёхколоночная студия (SALES-312…316) под `PiGroupWorkspace` (TOC + жёлтые chips).

2. Проблемы (PO + audit 2026-08-09):
   - Дубль «Создать КП» (H1 + активный chip).
   - Zone titles «Товары / Превью КП / Параметры» едят высоту.
   - Desktop `isWide`: left+right **всегда** открыты → центр узкий, A4 не лист.
   - Список товаров раздувает высоту студии → **page scroll**; превью не fit viewport.
   - Товары = длинный список, не icon-rail + cascade flyout.

3. Цель этой TZ — **только каркас поведения и фокус A4**. Глубокие категории/фильтры/persist — не здесь.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: DECLUTTER PAGE CHROME

  Под-шаг 1.1: Убрать page H1 «Создать КП» и toolbar-блок, если он только для заголовка.
  Под-шаг 1.2: Убрать visual zone-titles (`h2` Товары/Превью/Параметры). Сохранить `aria-label` / `aria-labelledby` на регионах (можно sr-only заголовок).
  Под-шаг 1.3: Жёлтые chips + TOC **не трогать** (SALES-310).

ШАГ 2: ICON RAILS + OPEN/CLOSE

  Под-шаг 2.1: Desktop ≥1280: слева и справа **icon-rail** ~44–52px (Lucide ок: напр. `Package` / `SlidersHorizontal` или близкие уже в проекте). Кнопки `aria-label` «Товары» / «Параметры», `aria-expanded`.
  Под-шаг 2.2: Default: **оба свёрнуты**. Center занимает оставшуюся ширину.
  Под-шаг 2.3: Клик по иконке → открыть flyout этой стороны. Клик повторно → закрыть.
  Под-шаг 2.4: Pointerdown вне rail+flyout и Escape → закрыть все flyout.
  Под-шаг 2.5: При открытии Left не открывать Right автоматически. Если после открытия ширина center < 480px — закрыть Right.
  Под-шаг 2.6: Tablet/mobile: сохранить однопанельный режим (≤1 side); icon-rail или прежние toggles — на выбор, но AC про Escape/вне клик обязательны.

ШАГ 3: LEFT CASCADE SKELETON

  Под-шаг 3.1: Раскрытие Left = горизонтальный cascade от рейла вправо (≥2 панели визуально).
  Под-шаг 3.2: L1 — stub разделов (2–4 пункта RU, напр. «Все изделия» / «Недавно» — без нового API).
  Под-шаг 3.3: L2 — **reuse** текущего `app-proposal-product-rail` (поиск + Добавить → `draftLines`).
  Под-шаг 3.4: Скролл только внутри flyout панелей. Не раздувать высоту center/studio.

ШАГ 4: RIGHT FLYOUT + CENTER A4 FIT

  Под-шаг 4.1: Right flyout содержит текущий `app-proposal-create-inspector` без смены write-path (по-прежнему UI-only).
  Под-шаг 4.2: Studio body: высота под sticky group-chrome, `overflow: hidden` на странице студии (нет document scroll из-за списка товаров).
  Под-шаг 4.3: Center: компактный выбор шаблона (одна полоска); A4 sheet `data-test="kp-tpl-preview"` вписывается в доступный прямоугольник (пропорция 210∶297, top-aligned). Допустимо CSS `aspect-ratio` + max-height 100%.
  Под-шаг 4.4: Empty copy center укоротить до «Выберите шаблон КП» (spec §7).

ШАГ 5: TESTS + DOCS

  Под-шаг 5.1: Обновить `proposal-create.page.spec.ts` под новый chrome (нет H1; rails; default collapsed; escape).
  Под-шаг 5.2: Обновить `docs/pages/proposals-create.page.md` (focus shell + ссылка на spec v2).
  Под-шаг 5.3: Gates ниже.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/commercial/proposals/proposal-create.page.ts — shell layout / rails / open-close
- frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts — AC shell
- frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts — только если нужно для встраивания в flyout (высота/scroll)
- frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts — только scroll/compact при необходимости
- frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts — compact + A4 fit
- docs/pages/proposals-create.page.md — факт страницы
- docs/ux/kp-create-studio-spec.md — только если исполнитель нашёл рассинхрон с реализацией (SoT уже v2)

НЕ ИЗМЕНЯТЬ:
- backend/** — нет API в этой TZ
- deals-group-chips / TOC labels
- proposals.page.ts (Все КП / family)
- quotation persist / Counterparty write
- print (320), styles.css global theme tokens (кроме локальных styles компонента)
- чужие TZ / _active чужих агентов

known_limitation:
- Реальные категории каталога / фильтры / plugin-иконки в rail → **TZ-SALES-318**
- Выбор Counterparty + save quotation → later
- Печать → 320 PARK
- Полноценный HTML/PDF preview шаблона — по-прежнему упрощённый center + deep-link builder

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. На `/proposals/create` **нет** видимого H1 «Создать КП» и zone-titles Товары/Превью/Параметры; жёлтый chip «Создать КП» активен.
2. Desktop ≥1280: default — оба icon-rail свёрнуты; center доминирует.
3. Клик иконки Товары открывает left cascade (≥2 панели); клик вне / Escape закрывает.
4. Клик иконки Параметры открывает right flyout с inspector; default right закрыт.
5. Список изделий не создаёт document scroll всей страницы; studio вписывается в viewport height.
6. A4 preview sheet целиком виден в center (пропорция листа), top-aligned под chips.
7. Добавление изделия из L2 по-прежнему кладёт строку в in-memory `draftLines` (регресс 314 нет).
8. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-create
   ```
9. Checklist `docs/agent-checklists/TZ-SALES-317.md` + `## Executor report (auto)` перед archive.
10. Archive только после Cursor/PO PASS (layout — visual).

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

По `GEMINI.md`: claim → code → gates → READY FOR REVIEW → Cursor PASS →
`tasks/_archive/2026-08/TZ-SALES-317.done.md` + progress + lock + убрать `_active`.
Не archive без Executor report (auto).
