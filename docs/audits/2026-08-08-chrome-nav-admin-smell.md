# UX smell — меню, chrome, админ (глазами PO)

**Дата:** 2026-08-08  
**Эталон chrome:** **Справочники** → `app-pi-group-workspace` (`pathLabel` + toc/chips).  
Не эталон: голый `PiPageChrome` с «своими» крошками (Снабжение и др. расходятся визуально).

---

## 1. Вердикт

| Наблюдение PO | Канон / действие |
|---------------|------------------|
| Верхнее меню + «Десктоп»/админ вылезают | **TZ-UX-301** compact → **TZ-UX-304** icon+caption rect + порядок lifecycle |
| Роли: список прав не кликабелен / не редактируется | Система «Администратор» = **read-only by design**; UX плохой. **TZ-ADMIN-301** — явный hint + edit кастомных ролей через диалог (права галочками pageKey) |
| Все ли pageKey в ролях | Аудит seed vs NAV pageKeys в ADMIN-301 |
| Хлебные крошки разные | **TZ-UX-302** — выровнять под эталон Справочники |
| DSL / один дизайн | **TZ-UX-303** docs-audit: chrome только из shared (`PiGroupWorkspace` / `PiPageChrome` rules) |
| Производство | PARK — отдельная сессия PO |
| Проектирование пусто | Ожидаемо до очереди заказов |

---

## 2. Эталон (зафиксировать)

```text
Раздел с подстраницами (Справочники, Каталог, Админ, Сделки…):
  app-pi-group-workspace
    pathLabel="Раздел"
    [toc] / [chips] как в dictionaries

Одна страница без групп (редко):
  app-pi-page-chrome [crumbs]="[{label: Раздел},{label: Страница}]"
  — те же токены шрифта/gap, что у workspace path row
```

Документ-канон после UX-302: `docs/pages/ui-page-chrome.md` (создать).

---

## 3. Очередь

1. **UX-301** compact nav — DONE  
2. **UX-304** icon+caption + order (Dictionaries after Docs) — IN WORK / next DONE  
3. **ADMIN-301** roles permissions UX + pageKey audit (параллельно, не layout)  
4. **UX-302** chrome unify (supply, shipping, design, docs, deals…)  
5. **UX-303** design-system audit (docs)  
6. Production deep — later  

Deploy — не из этой волны.
