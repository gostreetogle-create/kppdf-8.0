# Страница: Справочники — Обзор (DictionariesHubPage)

**Краткое описание:** Hub-страница справочников на `/dictionaries`. Карточки-ссылки на разделы. После **TZ-DICT-308** основной вход из nav — **группы** (Классификация / Измерения / Оформление / Документы); hub остаётся до DICT-311 (redirect).

## Route

```
/dictionaries — «KPPDF — Справочники» (hub cards)
/dictionaries/measurements — группа «Измерения» (Group Chip Workspace, пилот)
```

## Chrome

| Компонент | Назначение |
|-----------|-----------|
| `PiDictionaryShell` | title «Справочники», без description |
| Card grid | карточки-ссылки с заголовком и описанием |
| Nav «Справочники» | dropdown **по группам** (не плоский список всех leaf) |

## Маршруты (все разделы)

| Раздел / группа | Route |
|-----------------|-------|
| Классификация | `/categories` |
| Измерения (пилот chips) | `/dictionaries/measurements` |
| Единицы (legacy shell) | `/dictionaries/units` |
| Цвета (RAL) / Оформление | `/dictionaries/color-references` |
| Категории шаблонов / Документы | `/doc-template-categories` |
| Категории текстов | `/dictionaries/text-block-categories` |

---

_Обновлено: 2026-08-04 (TZ-DICT-303/304/308)._
