# data/yougile-import — снимок YouGile → каталог kppdf

Однократный read-only импорт с доски **Разработка ТД / Рабочая**.  
Карточки в YouGile **не** меняем.

## Зачем

Не парсить YouGile десять раз: один снимок → JSON + фото → аудит → локальная Mongo → (позже) деплой по команде PO.

## Содержимое

| Файл | Назначение |
|------|------------|
| `snapshot.mjs` | Скрипт съёмки (нужен `.env.local` с `YOUGILE_TOKEN`) |
| `snapshot-meta.json` | Дата, counts |
| `tasks.raw.json` | Все задачи + чат-паспорт + путь к фото |
| `products.normalized.json` | Уникальные изделия по `sku` (артикул) для upsert |
| `sku-to-tasks.json` | Артикул → список кодов `D-*` |
| `gap-report.json` | Сверка с локальной Mongo |
| `photos/` | PNG с карточек (`D-xx-артикул.png`) |

## Запуск снимка

```powershell
cd D:\kppdf-8.0
node data/yougile-import/snapshot.mjs
```

## Маппинг полей

| YouGile (чат) | Product |
|---------------|---------|
| артикул (`3101`) | `sku` |
| название («Пергола…») | `name` |
| габариты | `dimensions` (мм) |
| отделка / опции | `description` (+ при необходимости `ralCode`) |
| **обложка** | фото из чата с «Сделать обложкой» → отдельное image-only сообщение (не скрин строки паспорта) |
| код `D-64`, колонка, title «Чертежи…» | `notes` / source (очередь работ ≠ sku) |

### Важно про фото

Раньше ошибочно брался **первый** `user-data/…` из текста паспорта — это часто скрин таблицы (~1369×94).  
Сейчас: приоритет **image-only** сообщений чата + отсев «полосок» по высоте PNG. REST API флаг обложки не отдаёт.

Пересъёмка: `node data/yougile-import/snapshot.mjs`  
Обновить фото в локальной Mongo: `node data/yougile-import/seed-photos-fix.mjs`  
