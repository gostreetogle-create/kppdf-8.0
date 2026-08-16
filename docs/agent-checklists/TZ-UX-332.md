# TZ-UX-332 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-UX-332.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-grok-4.6 (TZ-UX-332 frontend/BE executor)
- claimed_at: 2026-08-16T12:05:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (join ok; claim «Unknown task: TZ-UX-332; sync tasks first» — слот в checklist = SoT)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (TZD-48 = desktop + import-mapping-profile)
- [x] TZ / канон / deps прочитаны (`TZ-UX-332-product-edit-undefined-ru-errors.md`, `PO-CANON.md`, `AI-AGENT-GUIDE.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-332.md` на месте

## Acceptance

- [x] Dashboard → редактировать изделие → форма с данными и `_id`; состав-редактор доступен (не false «сначала сохраните» при реальном edit)
- [x] Добавить фото → Сохранить → **нет** `Product undefined not found`; изделие обновляется с photoIds
- [x] Любой оставшийся 404 `Product … not found` в UI на **русском**
- [x] Новый upload с кириллическим именем файла не показывает mojibake в dropzone
- [x] Тесты + gates PASS
- [ ] Commit только conflict keys (+ checklist/index); Executor report (auto); archive после Cursor PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (products/dashboard dialog) + thin BE filter/photos
- [x] FIC §A–E: N/A — нет нового route/права/модуля/MCP; правка существующего диалога
- [x] page.md / PAGE-TZ-INDEX обновлены (`products.page.md`, `dashboard.page.md`, index IN WORK→review)
- [x] SECTION-READINESS: N/A (статус раздела не менялся)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (TZD-48 desktop не трогать)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
  PASS

cd frontend && pnpm test -- --testPathPattern="product-form-dialog|dashboard-dialog|silent-http" --coverage=false
  PASS  3 suites / 35 tests

cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
  PASS

cd backend && pnpm exec jest --testPathPattern="http-exception.filter|photos" --coverage=false
  PASS  5 suites / 14 tests
```

## Executor report

- Dashboard `openProductEdit` грузит `ProductsService.findById` и открывает диалог с полным Product (`_id`). Голый `{ id }` больше не передаётся.
- `ProductFormDialogComponent`: edit = usable `_id`; `{ id }` без `_id` не бьёт `PATCH undefined`, показывает RU «открыто без идентификатора».
- BE `HttpExceptionFilter.humanizeNotFoundMessage`: `Product undefined not found` → «Изделие не найдено: не указан идентификатор»; `Product <id> not found` → «Изделие не найдено».
- FE `extractErrorMessage` — короткий RU fallback, если EN всё же протёк.
- Фото: `decodeMulterOriginalName` (latin1→utf8 только при mojibake; уже-кириллица не трогается) в multer fileFilter + `photos.service` `originalFilename`.
- Conflict disclosure: TZD-48 desktop / import-mapping-profile не входили в diff этой TZ.
- known_limitation: старые битые `originalFilename` в Mongo не мигрируем; полный EN-словарь BE вне `not found` — successor.
- Filename canon (checklist): decode latin1→utf8 **только** если в имени есть latin1 high bytes и нет кириллицы.

## Review handoff

- [x] READY FOR REVIEW
- [ ] **Не** archive до Cursor Verdict PASS (TZ требует review)

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
