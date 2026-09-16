# Audit 2026-09-13 — «Выбрано»: нельзя сменить уже выбранное

> PO-скрин: чип «Клиент Торговая сеть „Формат“» — только текст; у «2 изделия» есть ×, у клиента нет. Нужна кнопка → открыть **то же** место выбора (Клиент / Поставщик / …) и заменить.

## Факт по коду

- Буфер `mode=selected` в `studio-data-panel.component.ts`: anchors = `<dd class="chip">` без действий; catalog chips = × → `catalogRemove`.
- Выбор живёт в **Данные**: Кому (Клиент/Плательщик), Ещё (Поставщик), Товары (витрина), Связи (КП/Заказ).
- Write-path уже есть: `onCounterpartyChange` / `onAnchorChange` / catalogChange. Новый picker не нужен — нужен **jump**.

## Necessity

KEEP буфер + CTA вставить. ADD: явный «Изменить»/«Заменить» на каждом чипе → Данные + нужный TOC. Не второй модал выбора.

## TZ

`tasks/_ready/2026-09-13-studio-ops/TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP.md`
