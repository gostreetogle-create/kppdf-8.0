═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-300: Production Cockpit — Lego canon (docs umbrella)
═══════════════════════════════════════════════════════════════

> DOCS / architecture only. Не код продукта.
> Design: `docs/superpowers/specs/2026-08-06-production-cockpit-lego-design.md`
> Child code starts at **TZ-PRODUCTION-303** after PO «стартуем Гант».

РОЛЬ АГЕНТА: Cursor / docs (Mode A) — этот файл уже канон; правки только с PO.

ЗАВИСИМОСТИ: TZ-PRODUCTION-302 DONE (`WorkType.days`); People/WorkTypes существуют.
LAYER: 1

CONFLICT KEYS:
docs/superpowers/specs/2026-08-06-production-cockpit-lego-design.md;
tasks/_backlog/TZ-PRODUCTION-300-production-cockpit-lego.md;
tasks/_backlog/vision/GANT-calendar.md;
tasks/_backlog/TZ-PRODUCTION-303-gantt-board-page.md;
docs/product-vision-lite.md (только ссылка/строка later→cockpit);
docs/pages/PAGE-TZ-INDEX.md

Проверено: product-vision-lite (Гант later); GANT-calendar READY_WHEN_DEPS;
  PRODUCTION-302 archive; compose plan S5; PO «Лего» 2026-08-06.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

PO хочет одно пространство производства (заказы + Гант + фильтры + позже авто).
Риск монолита → канон **shell + plug-in blocks**.

═══════════════════════════════════════════════════════════════
LOCKED (D1–D4)
═══════════════════════════════════════════════════════════════

| ID | Решение |
|----|---------|
| **D1** | Route cockpit = `/production` (board alias optional в 303). |
| **D2** | UI = shell + named slots; blocks = standalone Angular components. |
| **D3** | Phase 1 bars = **оценка** из Order + modules + `WorkType.days`; не full Schedule SoT. |
| **D4** | Child TZ plug into slots: 303 shell+rail+gantt → 304 stuck → 305 check-in → 306 auto → 307 completion. |

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ (этот docs-TZ)
═══════════════════════════════════════════════════════════════

1. Держать design + этот umbrella согласованными.
2. Переписать 303 под shell+блоки (уже цель этого коммита).
3. В 304–307 шапках — «plug into cockpit»; не отдельные god-pages.
4. Не un-park код до сигнала PO.

═══════════════════════════════════════════════════════════════
НЕ
═══════════════════════════════════════════════════════════════

- Код frontend/backend в рамках 300.
- Стартовать 303 параллельно с конфликтом `app.routes` (ADMIN-306) без DEFER.
- Обещать auto-assign в Phase 1.

═══════════════════════════════════════════════════════════════
ACCEPTANCE (docs)
═══════════════════════════════════════════════════════════════

1. Design файл существует; D1–D4 здесь.
2. 303 ссылается на 300 + design.
3. GANT-calendar.md указывает на cockpit Lego, не mono-file.
4. Нет правок product `*.ts` от этого TZ.

Verification: `git status` — только docs/tasks markdown.
