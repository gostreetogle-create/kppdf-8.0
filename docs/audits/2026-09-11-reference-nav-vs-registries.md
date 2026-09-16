# Аудит: вкладка «Справ.» vs Реестры (категории текстов)

**Дата:** 2026-09-11  
**Триггер:** PO — целая вкладка «Справочники» только с «Категории текстов»; тексты уже в реестрах; дубль IA.

### Preflight Check Output
- **Context read:** `nav-categories.ts` (`id: reference`); `app.routes.ts` (`dictionaries/text-block-categories` — единственный live route); `text-blocks.registry.ts` (Документы); `text-block-categories.page.ts` (master-detail); `filterNavCategories` (мертвые пункты скрыты → в UI виден только один живой item)
- **Key Constraints:** Mode A TZ; не трогать TextBlockCategory BE; не путать с `Category` (каталог) и секции «Справочники» **внутри** `/registries`
- **Planned Deliverable:** убрать top-nav «Справ.»; «Категории текстов» → реестр «Документы»; redirect старого URL
- **Validation Path:** FIC A (nav); shell specs; nx build

---

## Вердикт

| Вопрос | Ответ |
|--------|--------|
| Дубль? | **Да.** Тексты = `/registries/text-blocks`. Категории текстов = orphan `/dictionaries/...` под отдельной вкладкой. |
| Нужна вкладка «Справ.»? | **Нет.** Остальные items (Классификация, Цвета, Измерения…) — dead stubs; `filterNav` их прячет. Вкладка существует только ради одного экрана. |
| Куда перенести? | Реестры → группа **Документы**, рядом с «Тексты». |
| Master-detail UI? | Сохранить иерархию cat→subcat через **flat registry** (колонка «Путь» Root › Sub + parent в форме) **или** custom expand host — prefer flat + reuse form dialogs (меньше платформенного долга). |
| Секция «Справочники» в реестрах (units / Category)? | **Оставить имя группы внутри `/registries`.** Это не top-nav. |

## PO (сырьё)

Категория у сырья: **select есть, required нет** (PO 2026-09-11).

## WAVE

`docs/agent-checklists/WAVE-NX-DROP-REFERENCE-NAV.md`
