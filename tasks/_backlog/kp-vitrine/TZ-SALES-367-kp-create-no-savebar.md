═══════════════════════════════════════════════════════════════
TZ-SALES-367: Create КП — убрать savebar; A4 кверху; вывод в рейл
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-12-kp-create-no-savebar-canon.md
Spec: docs/ux/kp-create-studio-spec.md §0 (обновить LOCK)

РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: нет (параллель с 366 ок: 366 = template-center print; 367 = page chrome)
LAYER: 3
CONFLICT KEYS:
  frontend/src/app/pages/commercial/proposals/proposal-create.page.ts ;
  frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts ;
  docs/ux/kp-create-studio-spec.md ;
  docs/pages/proposals-create.page.md ;
  docs/agent-checklists/_active-map.md

Проверено: `kp-create-studio__savebar` (`data-test="kp-save-bar"`) сидит ВЫШЕ
`app-proposal-create-template-center` и толкает A4 вниз; на savebar —
autosave, page count, status, status select, versions, create order, duplicate,
download menu. На `/proposals` уже есть статус, freeze/версии, «В заказ»,
копировать, PDF, Печать.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Удалить savebar целиком**
   - Убрать блок `.kp-create-studio__savebar` / `data-test="kp-save-bar"` из template.
   - Убрать связанные стили полосы.
   - Center сразу = template-center (A4 к верху студии под chips).
   - Studio `overflow: hidden` / без page-scroll из-за полосы над листом.

2. **Убрать из Create (логика UI; handlers можно оставить мёртвыми или вычистить)**
   Из UI студии исчезнуть:
   - бейдж статуса + select «Изменить статус…»
   - «Сохранить версию» / «Версии (N)» / version menu / «Вернуться к текущему»
   - «Создать заказ»
   - «Копировать КП»
   - текстовый «Сохранено» / «Автосохранение…» / дубль «Страница 1 из N»
   Autosave **продолжает работать** без полосы; ошибка сохранения — toast (как сейчас).

3. **Вывод (PDF · Печать · Архив) → правый или левый рейл**
   - Новая icon-btn на рейле (предпочтительно **правый**, внизу или после Условий),
     aria/title «Вывод», `data-test="kp-create-toggle-output"`.
   - По клику — тот же overlay-flyout паттерн, что у других tools: пункты
     **Печать** · **PDF** · **Сохранить в архив документов** (порядок: Печать первой —
     PO: из студии главное печатать).
   - Переиспользовать существующие `requestOutput('print'|'pdf'|'archive')`.
   - Не класть кнопки на строку chips «Создать КП | Все КП» и не открывать
     `group-tools` полосу.

4. **Спеки / docs**
   - `kp-create-studio-spec.md` §0: явный запрет любой tools/savebar полосы над A4
     в center; вывод только через rail overlay.
   - `proposals-create.page.md`: студия без lifecycle-кнопок; lifecycle на Все КП;
     вывод = rail.
   - Jest: нет `kp-save-bar`; есть `kp-create-toggle-output`; open output → пункты
     Печать/PDF/Архив; A4/center всё ещё `kp-create-center` / preview iframe.
   - Старые тесты на top-status / save-version / duplicate-from-studio / create-order
     в create page — переписать или удалить (канон: эти действия на `/proposals`).

5. **Не делать в этой TZ**
   - Новая страница «просмотр готового КП» (зафиксировать known_limitation /
     successor park одной строкой в page.md).
   - Менять `/proposals` list (уже умеет lifecycle).
   - Deploy. Unpark 320. Трогать table-editor / print-366 логику print helper
     (можно звать тот же printPreview).

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Autosave write-path / snapshot
- Rail набор инструментов сборки (Шаблон·Товары·Получатель / Параметры·Редактор·Условия)
- BE PDF / archive endpoints
- PiGroupWorkspace общий API (только не проецировать `[tools]` на create)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] В DOM Create КП нет `data-test="kp-save-bar"`
- [ ] Под жёлтыми chips сразу studio body: rails + A4; лист не сдвинут полосой кнопок
- [ ] Нет UI: статус/версии/заказ/копировать/«Сохранено» на create
- [ ] Есть rail «Вывод» → Печать · PDF · Архив; Печать первой
- [ ] Autosave после правки строк/шаблона всё ещё пишет draft (без полосы)
- [ ] FE tsc + proposal-create.page.spec.ts PASS
- [ ] Spec §0 + page.md обновлены

Gates:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern=proposal-create.page --no-coverage
```

Финализация: archive TZ-SALES-367.done.md + lock + Checkpoint + commit/push.
Deploy НЕ.

═══════════════════════════════════════════════════════════════
HANDOFF
═══════════════════════════════════════════════════════════════

Промпт: `tasks/_backlog/kp-vitrine/PROMPT-KP-NO-SAVEBAR-367.md`
