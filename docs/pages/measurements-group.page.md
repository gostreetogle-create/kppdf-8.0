# Страница: Группа «Измерения» (MeasurementsGroupPage)

**Краткое описание:** Пилот Group Chip Workspace (`TZ-DICT-308`). Экран группы на `/dictionaries/measurements`: chips сверху (активный жёлтый), sticky tools, сразу таблица единиц. Без H1 и без path-крошек.

## Route

```
/dictionaries/measurements — «KPPDF — Измерения»
```

Legacy `/dictionaries/units` → **redirect** на эту страницу (TZ-DICT-309). Единственный UX единиц.

## Chrome

| Компонент | Назначение |
|-----------|-----------|
| `PiGroupWorkspace` | chips группы + sticky tools + body |
| Chip «Единицы» | единственный chip пилота (`activeId=units`) |
| Tools | search + category filter + inline add + CTA |
| `app-pi-table` | список единиц |

## SoT

`docs/superpowers/specs/2026-08-04-group-chip-workspace-design.md`

---

_Обновлено: 2026-08-04 (TZ-DICT-308)._
