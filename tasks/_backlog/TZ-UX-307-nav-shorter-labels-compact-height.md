═══════════════════════════════════════════════════════════════
TZ-UX-307: Nav — ниже по высоте + короткие интуитивные подписи
═══════════════════════════════════════════════════════════════

> READY · PO после UX-305: кнопки слишком высокие; нужны **короткие**
> понятные названия (не обрезка многоточием длинного слова).
> ID: **307** — `TZ-UX-306` уже занят архивом people-route.

STATUS: READY

РОЛЬ: Frontend (layout)

ЗАВИСИМОСТИ: TZ-UX-305 DONE

LAYER: 3

PAGES: /* (chrome)
PAGE_DOCS: (layout — app-layout)

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/layout/app-layout.nav-order.spec.ts;
frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts;
docs/audits/2026-08-08-nav-ia-lifecycle-audit.md;
docs/agent-checklists/TZ-UX-307.md;
docs/agent-checklists/_active-map.md;

НЕ: admin/**; QuickCreate/dialogs; deploy

---

## 1. Высота

- Уменьшить hit-area: цель ~**h-10** (или h-11 max), не h-12+ с крупным padding.
- Иконка ~12–14px; caption `text-[9px]` / `leading-none`; gap между icon и text минимальный.
- Header row снова ближе к **h-14** (не раздувать под nav).
- Equal-width grid **сохранить** (колонки одной ширины), но ширина от **коротких** label.

## 2. Подписи (канон shortLabel — полный RU в aria-label + title)

| Раздел | Подпись в кнопке | aria / title (полный) |
|--------|------------------|------------------------|
| catalog | Каталог | Каталог |
| clients | Клиенты | Клиенты |
| deals | Сделки | Сделки |
| design | Проект | Проектирование |
| supply | Снабж. | Снабжение |
| production | Цех | Производство |
| warehouse | Склад | Склад |
| docs | Докум. | Документы |
| reference | Справ. | Справочники |
| admin | Админ | Администрирование |

Порядок L→R **не менять** (305/304).

## 3. AC

- [ ] Nav визуально ниже (header ~h-14)
- [ ] Подписи как таблица §2; полный смысл в title/aria
- [ ] Equal width по самому длинному **short** label
- [ ] jest nav-order + tsc PASS; archive; push

Verification:
```
cd frontend && pnpm exec jest src/app/layout/app-layout.nav-order.spec.ts --no-cache
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```
