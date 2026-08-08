═══════════════════════════════════════════════════════════════
TZ-UX-304: Nav — прямоугольник + подпись под иконкой; порядок L→R
═══════════════════════════════════════════════════════════════

> READY · PO feedback после UX-301  
> Canon: lifecycle usage (не «настройки сначала»)

STATUS: READY

РОЛЬ: Frontend (layout)

ЗАВИСИМОСТИ: TZ-UX-301 DONE

LAYER: 3

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/layout/app-layout.nav-order.spec.ts;
frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts;
docs/audits/2026-08-08-nav-ia-lifecycle-audit.md;
docs/audits/2026-08-08-chrome-nav-admin-smell.md;
docs/agent-checklists/TZ-UX-304.md;
docs/agent-checklists/_active-map.md;

НЕ трогать: admin/** (ADMIN-301); production deep; deploy

---

## 1. Вид пункта меню

- Кнопка **не квадрат size-9**: чуть шире (прямоугольник), напр. min-w ~2.75–3.25rem, padding-x умеренный.  
- Внутри **колонка**: иконка сверху (чуть меньше, ~14–16px) + **короткий label снизу** (text-[10px] / leading-tight, truncate, max 1 line).  
- Active: как в 301 (sunrise wash + border).  
- Обводка hairline аккуратная.  
- Отличать от icon-btn справа (Десктоп/Выйти) — те остаются square icon-only.  
- Dropdown trigger — тот же визуальный язык (иконка + подпись).  
- aria-label полный; title можно оставить.

## 2. Порядок категорий L→R (заменить NAV_CATEGORY_ORDER / массив)

По **частоте и циклу товара** (настройки в конец):

```text
Каталог → Клиенты → Сделки → Проектирование → Снабжение
  → Производство → Склад → Документы → Справочники → Админ
```

Админ остаётся крайним справа среди категорий (или после Справочников — **после Справочников**).  
Правый блок (колокольчик/тема/десктоп/выйти) не в этом списке.

Обновить:
- `NAV_CATEGORIES` order  
- `NAV_CATEGORY_ORDER` spec ожидания  
- audit `nav-ia-lifecycle-audit.md` § целевое меню  

## AC

- [ ] Пункты = иконка сверху + мелкий текст снизу в чуть широком rect  
- [ ] Порядок как §2; Справочники после Документов  
- [ ] Нет overflow на ~1280  
- [ ] jest nav-order PASS; FE tsc PASS; archive; push  

known_limitation: длинные слова («Проектирование») — truncate или согласованное короткое «Проект.» в nav label only (RU полный в aria).
