# Аудит UI: создание шаблонов документов (2026-08-02)

**Автор:** Cursor Mode A (read-only + TZ)  
**Scope:** `/doc-constructor/templates|builder|texts|tables` + справочник категорий текстов + nav  
**Эталон chrome:** Materials (`materials.page` / `material-form-dialog`) + `builder-tool-pane`  
**Цель PO:** дополировать до deploy; product-fixes → локальный executor по TZ ниже

---

## Вердикт

Цепочка «шаблон → конструктор → тексты/таблицы» **рабочая**, но не «цехово-ровная»:

| Уже ок | Блокирует polish / deploy UX |
|--------|------------------------------|
| Top-palette для альбома | Правый inspector (DOC-332) — визуальный хаос |
| Группы / drag (DOC-331 done) | Категории текстов **недоступны** (route+nav) — P0 |
| Фото persist (DOC-333 done) | Empty-state копирайт про «выпадающие списки» |
| Nav без дубля «Конструктор» | Texts/Tables ≠ PiPageHeader shell |
| Templates registry Paper & Ink | Edit table из builder без `editId` |

**Не открывать новый backend** для этого батча (кроме уже готового DOC-333 на проде: volume uploads).

---

## Статус спек

| TZ | Код | Действие |
|----|-----|----------|
| DOC-331 group drag | archived done | — |
| DOC-332 inspector IA | **не сделан** | выполнить |
| DOC-333 photo persist | archived done (код+тесты) | ops: volume; не wipe uploads |
| DOC-316 categories page | page+dialog есть, **route/nav нет** | **DOC-334** |
| Top palette | сделано в WIP | empty-copy + docs → DOC-335 |
| Texts/Tables canon | drift | **DOC-336** |

---

## Findings → TZ map

### P0

1. **Категории текстов unreachable**  
   Page: `text-block-categories.page.ts`. Archive DOC-316 AC: `/dictionaries/text-block-categories` + nav «Категории текстов».  
   Live: нет в `app.routes.ts`, нет в `NAV_CATEGORIES.reference`. Editor: «создайте в справочнике» → тупик.  
   → **TZ-DOC-334**

### P1

2. Inspector multi-dialect chrome → **TZ-DOC-332** (уже написан)  
3. Canvas empty: «выпадающих списков» → **TZ-DOC-335**  
4. Palette empty без CTA на texts/tables → **TZ-DOC-335**  
5. `onEditSelected` table без `editId` (texts уже умеет) → **TZ-DOC-335**  
6. Нет breadcrumb «← Шаблоны» в builder → **TZ-DOC-335**  
7. Dead `textsRes`/`tablesRes` на BuilderPage → **TZ-DOC-335**  
8. Texts/Tables page shell drift vs Templates → **TZ-DOC-336**  
9. Dialogs: setup / text-editor / table vs Materials FormField → **TZ-DOC-336**  
10. Stale page docs (tool-pane accordion, left 280px) → часть DOC-332 + DOC-335 docs

### P2 (в known_limitation или хвост DOC-332/336)

- Faux-tabs без `aria-controls` / `app-pi-tabs`
- Missing `pi-focus-ring` на chips / view toggle
- Hex / Inter в inspector (закрывается DOC-332)
- Templates `documentLabel="Дублировать"` вместо copy slot
- Tables promo aside
- Text editor align glyphs все `≡`
- Nested scroll inspector panel

---

## Рекомендуемый порядок исполнителю (1 агент за раз на Layer 3)

```
1. TZ-DOC-334  (тонкий: routes + nav)           — P0, 15–30 мин
2. TZ-DOC-335  (builder UX copy/CTA/deeplink) — P1; keys: canvas, tool-pane, builder.page
3. TZ-DOC-332  (inspector IA)                  — P1/P0 visual; keys: inspector only
4. TZ-DOC-336  (texts/tables shell+dialogs)   — P1; не параллелить с 335 на shared services
```

Параллель **ок:** 334 ‖ 332 (disjoint).  
**Не параллелить:** 335 + 332 если оба трогают `builder.page.ts` (332 не должен; если executor полез в page — DEFER).  
**Не параллелить:** 335 + 336 на `texts.page` / `tables.page` (335 только navigate query; 336 — shell).

---

## Deploy checklist (после executor)

- [ ] 334: открывается `/dictionaries/text-block-categories`, пункт в Справочниках  
- [ ] 335: альбомный холст + empty copy про палитру; Edit table открывает диалог  
- [ ] 332: inspector ритм как tool-pane; нет Inter/native checkbox  
- [ ] 336: texts/tables выглядят как templates  
- [ ] Smoke: create template → add text/table/photo → save chip «Сохранено» → reload  
- [ ] Prod: `KPPDF_DATA_DIR/uploads` volume; не `--wipe` без бэкапа фото  

---

## Что уже хорошо (не ломать)

- Top exclusive tabs Groups/Texts/Tables/Photo  
- DOC-333 upload-first photos  
- Templates `pi-page-header` / toolbar / section / empty  
- Canvas `pi-canvas-page`, align toolbar, group outline  
- Nav: Шаблоны / Текстовые блоки / Шаблоны таблиц / Архив  
