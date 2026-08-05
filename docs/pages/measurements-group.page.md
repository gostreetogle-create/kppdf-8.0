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
| `PiGroupWorkspace` | chips группы + adaptive sticky tools + body |
| Chip «Единицы» | единственный chip пилота (`activeId=units`) |
| Tools | search + category filter + inline add + CTA |
| `app-pi-table` | список единиц |

Для DICT-312 route использует dense main без page top padding. Chips и tools находятся в одном sticky `top-0` стеке внутри scroll-контейнера `main`; при wrap chips tools не перекрываются и не требуют фиксированного `top`.

## SoT

`docs/superpowers/specs/2026-08-04-group-chip-workspace-design.md`

---

_Обновлено: 2026-08-05 (TZ-DICT-312 READY FOR REVIEW)._