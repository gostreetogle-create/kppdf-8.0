# TZ-NX-PO-SWEEP-03 checklist — studio props outside-close

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PO-SWEEP-03-studio-props-outside-close.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI local, no Team Room in this session)

## Preflight

- [x] `_NOW.md` + `tasks/_active/` — только этот TZ
- [x] TZ прочитан

### Preflight Check Output
- **Context read:** `studio-workspace-shell.component.html` (panel `aside` уже `(click)="$event.stopPropagation()"`; sheet div `(click)="onSheetClick()"` без stop), `studio-blocks-canvas.component.ts` (`selectBlock`/`startDrag` уже `event.stopPropagation()`), `studio-editor.page.ts` `onSheetClick()`, `app-shell.component.ts` (`shell-rail-left`/`shell-rail-right` chrome rail, класс `shell-rail`), `pi-dialog.service.ts` (CDK `Overlay`, `.cdk-overlay-container`), существующий паттерн `@HostListener('document:click')` в `select.component.ts`
- **Key Constraints:** панель/выбранный блок уже не долетают до document (stopPropagation) — реальный gap только в «пустом» chrome вокруг листа/rail/ribbon/footer; не задвоить toggle с rail-кнопками; не мешать CDK-диалогам
- **Planned Deliverable:** `@HostListener('document:click')` на `StudioEditorPage`, exclude panel/rail/overlay, reuse `onSheetClick()` для dismiss
- **Validation Path:** unit spec на сам метод (без полного рендера — по образцу chrome-ia spec) + `nx build kppdf-web` last

## Acceptance (из TZ)

- [x] Свойства открыты → клик в пустоту вне панели/блока → закрыты
- [x] Клик внутри Свойств / по выбранной таблице → не закрывает
- [x] Клик по пустому A4 по-прежнему работает (`onSheetClick` переиспользован)
- [x] Specs + build green

## Integrity slot

- [x] Тип изменения: page (studio editor)
- [x] FIC / page.md / DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A (UX gesture fix, тот же route)
- [x] Чужой WIP не в коммите

## Gates (факт)

- `nx test kppdf-web --testPathPattern=studio-editor-outside-click` (nx свернул в full-suite alternation) → PASS 818/825 (7 skipped), +5 новых
- `nx build kppdf-web` → PASS (pre-existing warnings, не мои файлы)

## Executor report

- Новый `@HostListener('document:click') onDocumentClickOutside()` на `StudioEditorPage`: если `panelCollapsed()` уже true — no-op; иначе исключает клики внутри `.cdk-overlay-container` (диалоги), `[data-test="studio-tools-panel"]` (панель — избыточно, т.к. панель и так stopPropagation, но явно для читаемости/тестов), `.shell-rail` (chrome rail — не задваивать toggle), `[data-test="studio-icon-rail-horizontal"]` (мобильный дубль rail в shell); иначе вызывает существующий `onSheetClick()` (`selectedId=null` + `panelCollapsed=true`) — единый dismiss, как просил PO.
- Клик внутри панели / по выбранному блоку на холсте уже не долетают до `document` (существующий `stopPropagation` в `studio-workspace-shell` panel и в `selectBlock`/`startDrag` канваса) — задача была именно закрыть оставшийся gap (ribbon/viewport padding/footer/пустой chrome), не переписывать эти пути.
- Новый spec `studio-editor-outside-click.spec.ts` — тестирует метод напрямую (синтетические DOM-элементы с нужными classList/data-test, `closest()` работает и без attach к document), не полный рендер (тяжёлый шаблон — тот же паттерн, что и `studio-editor-chrome-ia.spec.ts`).
- Не менял: A4 geometry, BE, product dialogs.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12
