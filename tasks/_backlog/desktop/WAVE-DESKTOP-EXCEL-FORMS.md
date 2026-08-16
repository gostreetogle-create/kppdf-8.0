# WAVE — Desktop Excel Forms (скачал → заполнил → загрузил)

> **Статус:** READY к выдаче (TZD-50 → TZD-51)  
> **Дата:** 2026-08-16  
> **Источник:** PO отказался от Google Sheets в пользу Desktop: выбрать таблицу → скачать Excel-форму с заголовками → заполнить → загрузить → проверка → подтвердить → в SoT.

## Цель продукта

Менеджер **не лазит по веб-формам пачкой**: в Desktop выбирает категорию → таблицу → скачивает канонический `.xlsx` → заполняет в Excel → загружает обратно. Система сама узнаёт форму, валидирует строки, дубли/мусор — в отчёт (не пишутся), хорошие — propose/confirm как положено.

Планка качества: **98–100** (не «быстро срочно»). Google Sheets / Apps Script — **out of scope** этой волны.

## Канон allowlist (только безопасный массовый ввод)

### V1 — TZD-50 (гарантированный write-path уже есть)

| Категория UI | Таблица (`targetKey`) | Dedupe key | Write |
|--------------|----------------------|------------|-------|
| Каталог | `material` — Материалы | `article` (org-scoped) | mutation journal propose→confirm |
| Каталог | `product` — Изделия | `sku` (если пуст — создать без дедупа по имени нельзя молча) | POST `/api/products` + Policy A confirm |
| Каталог | `module` — Модули | `article` | POST `/api/modules` + Policy A confirm |
| Контрагенты | `counterparty` — Контрагенты | `inn` | POST `/api/counterparties` + Policy A confirm |

### V2 — TZD-51 (справочники, POST API уже есть на Nest)

| Категория UI | Таблица (`targetKey`) | Dedupe key | Write |
|--------------|----------------------|------------|-------|
| Справочники | `warehouse` — Склады | `name` (trim, case-insensitive) | POST `/api/warehouses` |
| Справочники | `workType` — Виды работ | `name` | POST `/api/work-types` (hourlyRate обязателен) |
| Справочники | `colorReference` — Цвета (RAL) | `name` или `slug` | POST `/api/color-references` |
| Справочники | `category` — Категории | `type`+`slug` / `skuPrefix` | POST `/api/categories` |

### Явный запрет в этой волне (не в dropdown)

Заказы, КП, договоры, складские движения, статусы, User/Role/Permissions, паспорта изделий (отдельная WAVE-PRODUCT-PASSPORTS), BOM-иерархия из CAD (уже Import Studio / TZD-38).

## Порядок исполнения

1. **TZD-50** — Form Studio UI (категория→таблица) + генерация/скачивание xlsx + fingerprint `_kppdf` + round-trip в существующий HITL для V1.  
2. **TZD-51** — расширить каталог V2 + createEntities + dedupe + тесты.  
3. **TZD-49** остаётся PARK (journal unify) — не параллелить с 50/51 на `App.svelte`.

## DoD волны

- [x] TZD-50 DONE — archived + lock `TZD-50-desktop-excel-form-studio.lock` (2026-08-16, commit `10dde79a`); TZD-51 свободен  
- [x] TZD-51 code DONE + gates green (desktop tsc + svelte-check 0 + tsx --test 64/64) — READY FOR REVIEW; archive + Cursor PASS — после вердикта  
- [ ] Smoke: скачал Материалы → 2 строки (1 ок, 1 дубль) → отчёт отклонил дубль → ok в SoT/journal  
- [ ] Deploy Desktop ZIP — только по слову PO

## Связанные аудиты

- `docs/audits/2026-08-16-google-sheets-bridge-audit.md` — Sheets отложен; этот путь предпочтителен  
- `docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md` — HITL / ImportTask север  
- `desktop/src/core/import-targets.ts` — текущий каталог колонок V1
