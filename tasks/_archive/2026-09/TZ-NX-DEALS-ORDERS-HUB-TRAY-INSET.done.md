# TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET — DONE

- **agent_id:** claude
- **implementation_sha:** b770e802
- **TZ:** tasks/_ready/TZ-NX-DEALS-ORDERS-HUB-TRAY-INSET.md

## Что сделано

- **Outer air:** `order-lifecycle-groups` grid `gap-4` → `gap-5` (DESK-428 эталон воздуха); 4 group sections уже были `p-4`/`hairline rounded-sm bg-paper` — не менялось.
- **Убрано прилипание:** `-mx-2` снят с `order-composition-toggle` (оставлен `px-2` для hover-подсветки, как просил TZ). Проверено grep'ом — `-mx-*` в файле больше нет.
- **Плитки Исполнение/Логистика:** 5 подблоков (Снабжение/Производство/Готовность/Склад/Отгрузка) перешли с `border-t hairline pt-3 mt-3` (слипшийся список) на независимые плитки `rounded-sm bg-paper-2 p-3` в контейнере `flex flex-col gap-3`. Без hairline на плитках (чтобы не получить «двойную толстую рамку») — `bg-paper-2` на фоне родительского `bg-paper` уже читается отдельной подложкой. Внутренняя раскладка (label → counters → CTA) и все deep-links/write-path (kit-reserve confirm, supply/production/storage-items/shipping/documents) не менялись.
- **Тесты:** 3 новых assert'а (нет `-mx-` на toggle; `gap-5` не `gap-4` на внешнем grid; все 5 подблоков несут `bg-paper-2`+`p-3` без `border-t`).
- **Docs:** `docs/pages/orders.page.md` § Визуальная иерархия expand — одна строка про fix.

## Gates (все зелёные)

```
frontend-nx nx test kppdf-web --testPathPattern=order-hub-tray → 97 suites / 641 passed / 7 skipped / 0 FAIL
frontend-nx nx lint kppdf-web → 0 new issues
frontend-nx nx build kppdf-web → SUCCESS (last gate)
```

## AC чек

1. Текст/кнопки не вплотную к hairline (p-3/p-4 на группах и подплитках) ✔
2. Четыре группы и подблоки Исполнение/Логистика — отдельные плитки, не слипшийся текст ✔
3. Нет `-mx-*` на toggles tray ✔ (spec)
4. Поведение expand/composition/supply/reservations/links — без регресса ✔ (все существующие specs зелёные)
5. Gates PASS ✔

## known_limitation

Живой browser PASS — глазами PO (Playwright в репо нет, канон TZ). КП/договоры expand — отдельный TZ, если тот же FAIL повторится там.

## НЕ тронуто

Backend/order API/status semantics; desk-write (confirm/ship/add-line); группировка 4 колонок/групп и deep-link URL; shared `frontend/` legacy tray; proposals/contracts list; supply; photos; desktop.
