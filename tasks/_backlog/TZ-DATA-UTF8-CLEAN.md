# TZ-DATA-UTF8-CLEAN: decode mojibake в демо-данных каталога

> Найдено при `TZ-OPS-SITE-SMOKE-401` (site operator walk, 2026-08-16).
> Журнал: `docs/audits/2026-08-16-site-operator-walk.md` (finding S2).

РОЛЬ АГЕНТА: Backend data migration (скрипт + сухой прогон)

STATUS: **PARK** — брать по явному слову PO; Deploy/wipe нет.

LAYER: 1 (скрипт миграции, не runtime-код)

CONFLICT KEYS: `scripts/migrate-utf8-clean.ts` (новый) ; НЕ трогать backend-модули/схемы

PAGES: N/A

---

## Domain preflight

- Живые `products.name` частично показывают `???????` — байты уже потеряны до `?`, либо latin1→utf8 двойное декодирование.
- `materials.*` и `photos.originalFilename` («Снимок экрана…») — latin1 mojibake (паттерн `decodeMulterOriginalName`).
- Проверить в Mongo: `products.find({ name: /[\u00c0-\u00ff]{2,}/ })` — если есть latin1-байты в utf8-поле, это recoverable decode; если уже `?` — только ручная правка.

## Что делать

1. Скрипт `scripts/migrate-utf8-clean.ts`: сухой прогон (`--dry-run`) → список документов и декодированные значения.
2. Декодировать recoverable: `Buffer.from(str, 'latin1').toString('utf8')` для полей `products.name/sku`, `materials.name/article`, `photos.originalFilename`.
3. Только demo-данные (`DEMO-*`, `Demo Client*`, локальные `uploads/`); не трогать боевые.
4. Отчёт: сколько исправлено / сколько безвозвратно `?`.

## AC

- [ ] dry-run показывает diff до/после без записи
- [ ] apply идемпотентен (повторный run — 0 изменений)
- [ ] не трогает записи без mojibake
- [ ] Gates: `tsc --noEmit` (backend) PASS; ручной smoke на `/products`/`/materials`

## НЕ

- Deploy / wipe
- Runtime-декодирование в контроллерах (это данные, не UI)
- Менять схему/API
