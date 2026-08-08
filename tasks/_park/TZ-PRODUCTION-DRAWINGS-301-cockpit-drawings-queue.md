═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-DRAWINGS-301: Чертежи / очередь в cockpit (YouGile replacement)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — **не сегодня**; отдельный поток после стабилизации Ганта
SOURCE: docs/yougile/GAP-AND-REPLACEMENT.md; docs/audits/2026-08-07-first-look-project-audit.md
PLAN: stabilize-then-split 2026-08-07

РОЛЬ АГЕНТА: Frontend (+ thin BE если нужен статус чертежа)
ЗАВИСИМОСТИ: TZ-PRODUCTION-303.1 DONE; желательно данные YouGile→products отдельно
LAYER: 3

PAGES: /production (block) — **не** дублировать канбан на `/products`
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS: _(уточнить при un-park — новый block + facade; не трогать Gantt bars без нужды)_

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Каталог `/products` ≈ готов (паспорт/фото). Канбан статусов чертежа (очередь
«на распределении → в работе → готово») — дыра; YouGile пока внешний SoT.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ (когда un-park)
═══════════════════════════════════════════════════════════════

ШАГ 1 — Спека статусов (минимум колонок) + где хранить (Order line vs Product draft)  
ШАГ 2 — Block в Lego cockpit (не вторая YouGile-копия)  
ШАГ 3 — Связь карточка↔изделие/заказ; empty states на русском  
ШАГ 4 — Gates + archive

НЕ ДЕЛАТЬ: писать в YouGile; дубль CRUD изделий; shipping; drag-Гант.

known_limitation: импорт snapshot `data/yougile-import/` — отдельная data TZ.
