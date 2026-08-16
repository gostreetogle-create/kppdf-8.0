# TZ-UX-332 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-UX-332.done.md`
> Commit/push: product `e45bfcccd049315561d15873f672569dde16783a`; closeout this commit

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-grok-4.6 (TZ-UX-332 frontend/BE executor)
- claimed_at: 2026-08-16T12:05:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (join ok; claim «Unknown task» — слот в checklist = SoT)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-332.md` на месте (удалён после archive)

## Acceptance

- [x] Dashboard → редактировать изделие → форма с данными и `_id`; состав-редактор доступен
- [x] Добавить фото → Сохранить → нет `Product undefined not found`
- [x] 404 `Product … not found` в UI на русском
- [x] Новый upload с кириллическим именем без mojibake
- [x] Тесты + gates PASS
- [x] Commit conflict keys; archive после Cursor PASS

## Integrity slot (до READY / archive)

- [x] Тип: page (products/dashboard dialog) + thin BE filter/photos
- [x] FIC §A–E: N/A — нет нового route/права/модуля/MCP
- [x] page.md обновлён (`products.page.md`); PAGE-TZ-INDEX строка DONE
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в product-коммите
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
frontend tsc PASS
frontend jest product-form-dialog|dashboard-dialog|silent-http PASS 35
backend tsc PASS
backend jest http-exception.filter|photos PASS 14
```

## Executor report (auto)

- commit: e45bfcccd049315561d15873f672569dde16783a
- Dashboard `openProductEdit` → findById → полный Product `_id`.
- Dialog: `{ id }` без `_id` не PATCH undefined.
- BE filter RU not-found; FE safety net.
- Photo filename latin1→utf8 только при mojibake.
- known_limitation: старые битые originalFilename не мигрируем.

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor Verdict PASS (self-review 2026-08-16; PO «можно закрыть», без деплоя)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T12:16:00+03:00
