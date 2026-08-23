# UI Density Rollout — Paper & Ink (incremental) — 2026-08-23

**Режим:** не редизайн, а **выравнивание** живого сайта под канон.  
**SoT:** [`ui-density-canon.md`](../ui-density-canon.md) · [`design-spec.md`](../design-spec.md) · [`AI-UI-CONTRACT.md`](../AI-UI-CONTRACT.md)  
**Очередь:** [`tasks/WAVE-UI-DENSITY-PAPER-INK.md`](../../tasks/WAVE-UI-DENSITY-PAPER-INK.md)

---

## Принцип PO (зафиксировано)

1. **Не ломать IA и layout** — меняем токены, кегль, hairline, фоны, copy, anti-patterns.
2. **Сначала shared → shell → страницы** — один раз поправили примитив → меньше diff на 40+ routes.
3. **Одна золотая CTA на экран** — остальные кнопки outline/ghost/secondary.
4. **Русский UI** — grep `unfit|exception|null` в user-facing строках → человеческий текст.
5. **Закрыть тему дизайна** — после волны DEN-599 PO больше не возвращается к «общему виду».

---

## Что уже сделано (не дублировать)

| Серия | Суть |
|-------|------|
| UI War Room WR-500…512 | overlay a11y, kit routes, error-banner, gold contrast |
| UI ROI-520…523 | keyboard QA, ui-rules, native select canon |
| TZ-UI-TYPE-301/303 | type scale 11/12/13/14 в styles.css |
| TZ-DESK-431 | desk tray + supply flyout padding/grid |
| WAVE-KP-WS-401…403 | workspace shell/store/left panels (404+ — в работе) |

---

## Разрыв канона (что чинит волна DEN)

| Зона | Сейчас | Цель |
|------|--------|------|
| Фон страницы | местами `bg-white` / `#fff` | `bg-paper` `#fbf9f6`, белый только в таблице/карточке |
| Тени | остатки `shadow-*`, `executive-shadow` вне кнопок | hairline only на панелях/таблицах |
| Radius | `rounded-md/lg` на feature-страницах | `rounded-sm` max на интерактиве, `rounded-none` на структуре |
| Label полей | mix default/eyebrow; design-spec label 13px vs density 11px uppercase | FormField eyebrow + gap 4px (уже близко) |
| Hint/error | generic muted | gold (#904d00) для ИИ, amber для warn, red для block |
| Copy | редкий dev-jargon в toast/validation | RU формулировки |
| Плотность списков | разный padding в filter rails | 16px outer, 8–12px inner, hairline между зонами |

---

## Параллельность и STOP

| Блокер | DEN TZ | Действие |
|--------|--------|----------|
| KP workspace 404–408 | DEN-552 | **WAIT** до `TZ-KP-WS-409.done` |
| DESK-425…430 | DEN-512 | **WAIT** или merge после desk wave |
| Активный claim в CONFLICT KEYS | любой | DEFER, запись в `_NOW.md` |

---

## PO gate (конец программы) — **READY FOR PO**

Программа DEN закрыта кодом (**590+599 DONE**). Осталось:

1. PO заполняет spot-check в [`docs/agent-checklists/UI-DENSITY-GUARDS.md`](../agent-checklists/UI-DENSITY-GUARDS.md).
2. Прогон [`docs/agent-checklists/KP-WORKSPACE-SMOKE.md`](../agent-checklists/KP-WORKSPACE-SMOKE.md) после **KP-WS-409** (перед DEN-552).
3. «кати» — только по явной команде PO после sign-off.

**Отложено:** DEN-512 (desk wave) · DEN-552 (409).
