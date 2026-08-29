# TZ-DOC-STUDIO-2001: Dual-read leak — studio-блоки видны легаси-билдеру

> **[ИСПРАВЛЕНО]** — проверено инспекцией 2026-08-29 (повторная сверка кода, не commit message)

## Проверка исправления

- `template-block.service.ts:72` — `templateParentFilter()` теперь `{ templateId, parentType: { $ne: 'studio-document' } }` вместо голого `{ templateId }`. Подтверждено чтением файла.
- `template-block-dual-read.spec.ts:106-116` — тест `findAll excludes studio blocks that share the same templateId (TZ-DOC-STUDIO-2001)` реально проверяет форму `$or`-ветки (`toEqual`/`not.toContainEqual`), не тривиальный мок.
- Разовый отчёт по масштабу уже существующей утечки в проде — **не проверялся** (вне зоны git diff, надо уточнить у исполнителя/PO отдельно, делался ли).

## Было (для истории)

CONFLICT KEYS: `backend/src/modules/template-block/template-block.service.ts` (`templateParentFilter`); `backend/src/modules/template-block/template-block-dual-read.spec.ts`

Доказательство: `templateParentFilter()` строила `$or: [{ templateId }, { parentType:'template', parentId }]`, что матчило studio-блоки с тем же `templateId`, что и исходный шаблон — легаси builder видел и мог мутировать чужие studio-блоки.

## ACCEPTANCE CRITERIA

- [x] Regression-тест «изоляция builder vs studio» зелёный
- [x] `templateParentFilter` больше не матчит studio-блоки по `templateId`
- [ ] Отчёт по масштабу уже существующей утечки в проде — уточнить у исполнителя, делался ли (не видно в diff)
