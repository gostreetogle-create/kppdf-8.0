# Чек-лист вопросов для Создателя — Agent_Cursor_Composer

> **Агент:** Agent_Cursor_Composer  
> **Дата:** 2026-08-30  
> **Контекст:** противоречия и дыры, найденные при анализе 8 версий (`D:\Для аналитики все kppdf\`) + линия crm-generator → kppdf-8.0  
> **Анализ:** `../analyses/Agent_Cursor_Composer_analysis.md`

---

## Стек и платформа

### Q1. MongoDB vs PostgreSQL
**v5/v6** построены на PostgreSQL + Prisma (ACID для финансов). **v8** — MongoDB + Mongoose + RS transactions. Финальная версия остаётся на MongoDB, или есть причины вернуться к PostgreSQL?

*Противоречие:* v6 BIG-BOOK явно выбрал PostgreSQL для финансовой целостности; v8 и crm-generator lineage — MongoDB.

---

### Q2. Next.js vs Angular
**v5/v6** — единый Next.js монолит (44 страницы, 89 API, единственный полный runnable на Next). **v8** — Angular + NestJS. PO-CANON указывает на v8. Next.js-линия закрыта навсегда?

---

### Q3. Redis / BullMQ
**v7** имеет async-import через BullMQ. **v8** отказался от брокеров в runtime. Нужен ли Redis **только** для тяжёлого Excel-импорта, или весь импорт через Desktop MCP достаточен?

---

## Домен и сущности

### Q4. Контрагент = клиент И поставщик
**v7** — одна Organization с `partyTypes[]`. **v8** — строгое разделение Counterparty/Organization. Фирма, которая одновременно клиент и поставщик: два Counterparty или `roles[]` на одном?

---

### Q5. Worker ↔ User
**v7** — Employee (отдельно от User). **v8** — Worker + опциональный `userId`. Сотрудник цеха обязан иметь аккаунт в системе, или менеджер ведёт карточки без логина?

---

### Q6. Картотека (packageTag)
Поле есть в v5/v6 schema, UI нигде не реализован. v6 описывает `/packages` как главный экран директора. Это приоритет MVP или отложить?

---

### Q7. Финансовая глубина
**v6** описывает полную цепочку Order → Invoice → Payment → Refund → margin (32 сущности). **v8** имеет OrderClosing + ReconciliationAct. Нужна ли полная бухгалтерия в v1 продукта, или OrderClosing + сверка достаточны?

*Противоречие:* v6: Storno ≠ Refund как две сущности; v8: только OrderClosing.

---

### Q8. Одна сущность «КП»
В модели v8 coexist Proposal, Quotation, CommercialProposal (legacy). Канон: «Quotation, UI: КП». КП и Договор — отдельные сущности или стадии одной сделки?

---

## Бизнес-процессы

### Q9. КП paid → что дальше?
**v5:** `status=paid` → auto ProductionOrder. **v6:** запрет конвертировать paid КП в договор. **v8:** КП ≠ Order, договор опционален. Правильно: paid сразу в производство, или сначала договор?

---

### Q10. Один КП → один заказ
**v8 канон (D16):** нет split-order. **v2:** `Order.kpIds[]` (несколько КП). **crmgenerator_nx:** один КП → один Order. Жёстко один-к-одному?

---

### Q11. Гранулярность «готов к работе»
**v8 D8:** модуль можно раньше изделия. **v3:** work-order-operations на уровне операции. **v2:** Digital Twin lifecycle (4 стадии). Гранулярность ready: модуль, линия заказа, или операция?

---

### Q12. Soft vs hard gate материалов
**v8 D19 / PO-CANON:** soft warning. **v3/v6:** «без материала не стартовать». **crm-generator:** production forecast блокирует. Финал: warning или жёсткий запрет старта цеха?

---

### Q13. Отгрузка без документа
**PO-CANON:** «Отгружено» в tray → POST ship; документ опционален позже. **v3:** shipping-docs (ТОРГ-12, ТТН) как полноценный модуль. Документ обязателен или достаточно статуса + метаданные?

---

### Q14. Прямой заказ без КП
**v8 D7:** auto stub-КП при создании заказа. Реализовано ли это в v8 коде, или только в каноне? Stub-КП должно быть видно менеджеру в списке КП?

---

### Q15. Семья КП (master/variant)
**v8 D21:** слой 1 API (masterId, familyVersion, orgMarkup). **v6:** «скопировать для другого юрлица» 30 сек. Это must-have MVP или Phase 2?

---

## UI / UX

### Q16. Эталон редактора КП
**v1:** `/kp/:id` — undo/redo 10 snapshots, localStorage backup, canDeactivate. **v8:** `/proposals/workspace` — geometry 480px overlay, A4 ratio 1.414. Что эталон: восстановить v1-фичи в v8 workspace, или v8 geometry — закон?

---

### Q17. Guest preview
**v1:** `/guest-preview/:token` read-only. Нужен ли клиентам просмотр КП без логина в финальном продукте?

---

### Q18. Витрина КП (лево товары / право шаблон)
**v3/v8 D13:** отдельная UX-волна. Must-have для MVP или polish после ORDERS-302 / снабжения?

---

### Q19. Два фронтенда v8
`frontend/` (legacy Angular) и `frontend-nx/` (NX experiment). Финальный продукт живёт в каком? Doc Studio уже в nx — это база для всего?

---

## PLM / Каталог

### Q20. BOM depth и правила
**v8 CATALOG:** max depth 8, Product→Product да, Product→raw Material нет. **v2:** max 10 nested modules. **v7:** неограниченная вложенность childModuleIds. Финальные лимиты?

---

### Q21. Compliance engine
**v2/v3:** 8 операторов, batch checks, блокировка паспорта. **v8:** module `compliance-rule` есть, UI нет. Compliance в v1 продукта или Phase 2?

---

### Q22. Digital Twin lifecycle
**v2/v3:** as_ordered → as_designed → as_built → as_maintained (4 значения на атрибут). **v8:** composition tree без lifecycle. Нужны 4 стадии или достаточно состава изделия?

---

### Q23. CRM Interactions
**v3:** звонки/встречи/письма по контрагенту. **v8 CAPABILITY-LEDGER:** full CRM removed. Мини-таймлайн сделки (без «CRM-зоопарка») нужен?

---

## Закупки и склад

### Q24. Supply vs legacy Purchase
**v8:** SupplyRequest/SupplyTask = канон; PurchaseRequest/PurchaseOrder = legacy read-only. **v3/v5:** полный PurchaseOrder UI. Legacy полностью выводим из эксплуатации?

---

### Q25. Глубина склада
**PO-CANON:** один склад, разделы внутри, без мультисклада. **v3/v5:** warehouses, zones, reservations. Насколько глубоко: простые остатки vs полный журнал с резервами под заказ?

---

### Q26. Tender / закупки mega
**v3/v5:** богатая модель Tender. **v8 CAPABILITY-LEDGER:** tender mega = removed. Тендеры нужны в финале или сознательно out of scope?

---

## Операционка

### Q27. Backup management
**v1:** UI бэкапов MongoDB + media из Settings. **v8:** нет встроенного. Нужен backup в продукте или достаточно ops на Synology?

---

### Q28. Synology как целевой хост
**v5** имеет `deploy/` для Synology NAS. **v8** — `deploy/synology/`. Synology остаётся production-хостом?

---

### Q29. Nx roadmap
**PO-CANON:** Doc Studio = модуль №1 на NX. Следующий после Doc Studio: реестры, auth, или продажи?

---

### Q30. Order.status как единый FSM
**reports/MASTER-CORE.md:** единый FSM заказа — правда для склада/отгрузки/производства. **v8:** статусы размазаны по сущностям. Делать Order.status единственным источником правды?

---

*Конец чек-листа. Всего: 30 вопросов.*
