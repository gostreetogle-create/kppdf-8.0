# PEER PROMPT — UI отображения связей сущностей (обсуждение + подбор)

Скопируй блок ниже **целиком** в Smart Merge / Claude / GPT / Gemini.  
Задача: **только обсуждение и рекомендация**, не писать код в репозиторий.

---

```
Ты Senior UX/UI + системный архитектор. Продукт: цеховой ERP kppdf (~10 операторов).
Цель сессии: подобрать ЛУЧШИЙ вариант отображения связей сущностей (клиент ↔ КП ↔ заказ ↔ снабжение/производство ↔ склад/отгрузка ↔ документы), сохранив целостность («всё под рукой»), понятность связей и структуру — БЕЗ generic SaaS-CRM фантазий.

════════════════════════════════════
ЖЁСТКИЙ КОНТЕКСТ ПРОЕКТА (обязателен)
════════════════════════════════════

1) Dual-track фронт
- Финал продукта = только NX: frontend-nx/ (Angular, libs features/data-access).
- frontend/ = эталон и склад для переноса до cutover; НЕ второй боевой сайт.
- Частично вырезать legacy «по пути» — НЕ предлагать.
- /desk (стол менеджера) живёт ТОЛЬКО в legacy frontend/; в NX пока нет.
- Order hub tray уже в NX на /orders; в legacy тот же tray + mode="desk" с большим числом write-CTA.

2) Уже ПРИНЯТЫЙ визуальный язык (не изобретать с нуля)
- Paper & Ink: hairline, плотные таблицы, русский UI, light/dark.
- Shell: header + узкие L/R chrome-rail (иконки). Tools открывают flyout OVERLAY поверх контента; список/A4 НЕ reflow при open/close.
- Related entities SoT: expand-in-row hub tray под строкой (single-expand), золотой left-accent, карточки-группы, lazy HTTP, deep-link на живые маршруты.
  Эталоны NX: order-hub-tray, counterparty-hub-tray, supply/warehouses expand.
- Реестры /registries: ▸ expand + плотная таблица = визуальный SoT списков.
- Гант: каскад-полосы Order→Изделие→Модуль→WT под строкой; НЕ bottom «Карточка», НЕ dual-split gantt.
- Студия документов: icon-rail + flyout; буфер «Выбрано»; таблица на холсте правится в Свойствах, не inline-админ на A4.
- Комбайн: kanban только там, где канон (ряд = изделие).
- «Одна страница — один контекст»: максимум действий inline, без ухода «только ради +».
- Двухколоночный master-detail для desk/orders УЖЕ отвергнут (DESK-401).

3) Сущности (имена)
- Покупатель = Counterparty (НЕ Organization).
- Organization = наша фирма.
- КП в UI = «КП»; сущность = Quotation.
- Поток: продажи/КП → заказ → снабжение/производство → склад/отгрузка.

4) Что НЕ использовать как PRIMARY UI связей
- Интерактивный граф / mindmap / semantic zoom ops-экрана.
- Adaptive widget mashup / настраиваемый dashboard как SoT related-entities.
- Многоуровневый kanban «для всех сущностей».
- Каскад колонок Finder-style (Клиент | Проекты | Документы | …) как основной ERP-список.
- Disabled «скоро»-кнопки в chrome-rail.
- Второй write-path / дубли экранов «на чистоту».

════════════════════════════════════
ЗАДАЧА
════════════════════════════════════

Ниже — популярные концепции из внешнего брейнсторма. Оцени ИХ ПРИМЕНИТЕЛЬНО К kppdf (NX + legacy SoT), а не к абстрактной CRM.

Концепции-кандидаты:
A) Продвинутый Master-Detail / каскадные панели / split
B) Интерактивный граф связей (+ sidebar)
C) Semantic zoom
D) Многоуровневый kanban
E) Split + мини-представления связанных объектов
F) Contextual tabs + side panels / sidecar
G) Hierarchical columns (колонки уровней)
H) Adaptive workspace из виджетов

Сделай:

1) Таблица: концепция → Вердикт (Primary | Secondary niche | Reject) → почему именно для цеха ~10 чел и Paper & Ink → конфликт с уже принятым каноном NX (если есть).

2) Выбери ОДИН primary pattern для related-entities по всему ERP.
   Если primary ≈ уже существующий hub expand-in-row + chrome-rail — скажи прямо «оставить и усилить parity», не переименовывай ради новизны.

3) Назови ≤3 допустимых ИСКЛЮЧЕНИЯ (где другой паттерн ок): Гант / Студия / Комбайн / Desk — с границей «не расползается на списки».

4) Сравни NX vs legacy desk:
   - что уже хорошо на NX hub;
   - чего не хватает оператору относительно legacy desk tray/chips;
   - что НЕ портировать слепо при будущем /desk.

5) Anti-patterns: 5 конкретных «не делать в kppdf», с одной фразой вреда для оператора.

6) Checklist parity для НОВОГО hub-экрана (если появится): 8–12 пунктов (chevron, single-expand, gold accent, группы, lazy budget, deep-links, no dual write-path, rails…).

7) Рекомендация на 90 дней: только 3 шага (без roadmap на год). Учти: модули называет только PO; cutover = NX целиком.

Формат ответа:
- Сначала 5–8 строк вердикта.
- Потом пункты 1–7.
- Без кода, без Angular-сниппетов, без «давайте сделаем Neo4j».
- Язык: русский.
- Если предлагаешь гибрид — он обязан опираться на УЖЕ принятый hub/rails, а не на граф.

Эталонные пути (если модель видит репо — можно сослаться; если нет — опирайся на контекст выше):
- docs/PO-CANON.md
- docs/PO-SHARED-UNDERSTANDING.md
- docs/pages/orders.page.md
- docs/audits/2026-09-10-nx-hub-expand-cards.md
- docs/pages/manager-desk.page.md (legacy SoT)
- frontend-nx/.../order-hub/ui/order-hub-tray.component.ts
- frontend/.../desk/manager-desk.page.ts
```

---

После ответов peer: Cursor сводит в короткий канон/TZ только если есть **факт расхождения** с оператором (не ради «ещё одна концепция»).
