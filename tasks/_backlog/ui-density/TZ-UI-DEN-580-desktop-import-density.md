# TZ-UI-DEN-580: Desktop Import tab — density canon

PAGES: (Desktop app — Import tab)
PAGE_DOCS: ui-density-canon.md

РОЛЬ АГЕНТА: Frontend UI Engineer (desktop package)

ЗАВИСИМОСТИ: TZ-UI-DEN-501…504

LAYER: 3

CONFLICT KEYS: desktop/**/import*; desktop/**/tabs* (grep before claim)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Studio mock 2026-08-23: 6 zones, file bar, A–F mapping, footer idempotency + single gold CTA.

Desktop уже 3 вкладки: Подключение · Импорт · ИИ.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Map 6 zones to existing Import component tree (no 4th tab)

ШАГ 2: Colors/spacing from ui-density-canon; remove SaaS shadows

ШАГ 3: RU validation messages; BOM Lvl+Родитель if spec import

ШАГ 4: Footer idempotency copy + «Отправить N строк в базу ERP» gold CTA

ШАГ 5: Профиль импорта — нейтральный «Профиль импорта» (**без** «★ CAD Компас»; PO 2026-08-23 отклонил preset mock)

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Electron shell / installer version
- Backend import API semantics

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] ui-density-canon 8-point checklist in .done.md
- [ ] desktop unit tests PASS if present
- [ ] DESKTOP-SMOKE Import section noted PASS
