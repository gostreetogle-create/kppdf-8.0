# TZ-DAY — Catalog kind colors wave (330 → 331 → 332)

**Цель PO:** визуально различать изделие / модуль / материал как легенду каталога
(не RAL). Максимум задач за сессию, непрерывный executor loop.

**Канон:** `docs/audits/2026-08-07-catalog-entity-colors-audit.md`  
**PO Diary:** §1–§4 + запись про kind colors.

## Очередь (строго по порядку)

| # | TZ | Файл | Результат |
|---|-----|------|-----------|
| 1 | **TZ-CATALOG-330** | `_backlog/catalog/TZ-CATALOG-330-catalog-kind-colors-tree.md` | `catalogKindOklch` + wash на дереве + BOM inspector |
| 2 | **TZ-CATALOG-331** | `_backlog/catalog/TZ-CATALOG-331-catalog-appearance-settings.md` | Экран «Оформление» + persist + shared hue field |
| 3 | **TZ-CATALOG-332** | `_backlog/catalog/TZ-CATALOG-332-kind-colors-lists-picker.md` | Списки + picker |

Стоп после 332 или на блокере. **Не** деплоить без явной команды PO.

## Перед стартом

1. Прочитать `GEMINI.md` + `.agents/skills/kppdf-executor-continuous/SKILL.md`.
2. `docs/PO-DIARY.md` §1–§4.
3. Скопировать следующий TZ из `_backlog/catalog/` → `tasks/TZ-CATALOG-NNN.md`
   и claim в `_active/` / checklist map по правилам репо.
4. CONFLICT KEYS vs `_active/` — не параллелить с чужим WIP на тех же FE файлах.
5. Не `git add .` — только зона TZ; чужой dirty (desktop/, chrome pages WIP) не трогать.

## После каждого TZ

gates → archive → lock → commit+push → checkpoint → **сразу следующий** без «поехали».
