# Страница: Профили быстрых форм

**Route:** `/dictionaries/form-profiles`  
**Название:** «Профили быстрых форм»  
**Группа:** Справочники → TOC «Формы» → чип «Профили быстрых форм»  
**TZ:** TZ-DICT-315 · Canon: `docs/audits/2026-08-09-quick-create-form-profiles.md`

## Назначение

Оператор настраивает, **какие FieldKeys** видны в коротком диалоге создания
(QuickCreate) для сущности × размера диалога `S | M | L`. Это UX форм, не
цвета kind в каталоге (`/catalog/appearance`) и не RAL.

Полный редактор (product-form / module-form) **не меняется**. Wire диалога
QuickCreate → TZ-DICT-316.

## UI

1. **Сущность** — overflow-select: Изделие (`product`) / Модуль (`module`).
2. **Размер** — chips `S | M | L` (ширина будущего `pi-dialog`: sm / md / lg).
3. **Матрица** — чекбоксы allowlist FieldKeys с RU-лейблами.
4. **LockedRequired** — всегда включены, `disabled` (product: name/kind/unit;
   module: name). Снять нельзя (иначе BE 400 / сломанный create).
5. **Сохранить** → `PUT /api/form-profiles/:entity/:size` с
   `{ visibleFieldKeys }`. Ошибка → toast + текст на странице.

## API (DICT-314)

| Method | Path |
|--------|------|
| GET | `/api/form-profiles?entity=` |
| GET | `/api/form-profiles/:entity/:size` |
| PUT | `/api/form-profiles/:entity/:size` |

Org берётся из JWT. Seed defaults — на первом GET.

## Empty / error

- Ошибка загрузки: «Повторить» + подсказка открыть пункт меню Справочники.
- Пустой allowlist (не должно случаться): выбрать сущность выше.

## Связанные файлы

- Page: `frontend/src/app/pages/dictionaries/form-profiles.page.ts`
- Service: `frontend/src/app/shared/services/form-profiles.service.ts`
- BE: `backend/src/modules/form-profiles/**`
