# TZ-CATALOG-372 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZ-CATALOG-372.done.md`
> Lock: `.mimocode/locks/TZ-CATALOG-372-modules-list-vitrine-parity.lock`
> Implementation: `3b460f4517cfae01b40722c9b4229ba7717e6552`
> Closeout: `1ba6382e`

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-15T07:36:56Z
- workspace: D:\kppdf-8.0
- closed_at: 2026-08-15T11:30:00Z

## Acceptance

- [x] `/modules` list: колонка Фото + имя-ссылка + Обновить + view toggle + filters-rail с каноном оверлея
- [x] Grid: md showcase-карточки с фото/placeholder, клик → `/modules/:id`, pager при необходимости
- [x] Фильтр «Состав» режет client-side; пустой поиск+фильтр → понятный RU empty
- [x] View mode переживает F5 через `pi-modules-view-mode`
- [x] Себест. в list/grid не дергает N× cost-preview (hint «см. карточку»)
- [x] Gates зелёные: FE tsc + modules.page Jest 17/17

## Review

- [x] Cursor Verdict: **PASS** (2026-08-15)

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T11:30:00Z
