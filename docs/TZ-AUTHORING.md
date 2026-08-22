# Как писать TZ для kppdf-8.0 (канон)

> **Source of truth** для авторов техзадач (человек, Cursor Mode A, любой ИИ).  
> Цель: executable TZ без «угадывания» схемы и без лишних уточняющих форм.  
> Обновлено: 2026-08-02.

**Кто обязан читать перед написанием TZ:** Cursor (`tz-authoring` skill), любой агент,
которому PO сказал «напиши TZ / спеку». Исполнитель читает **уже готовый** TZ +
этот файл только если в TZ есть спор имён/уникальности.

Связанные файлы (не дублировать сюда целиком):

| Файл | Роль |
|------|------|
| [`.agents/skills/tz-authoring/SKILL.md`](../.agents/skills/tz-authoring/SKILL.md) | Skill Cursor: поля, split, archive |
| [`OrchestratorKit/_templates/TZ-template.txt`](../OrchestratorKit/_templates/TZ-template.txt) | Скелет секций |
| [`docs/CONTEXT.md`](./CONTEXT.md) | Короткий доменный язык |
| [`docs/AI-AGENT-GUIDE.md`](./AI-AGENT-GUIDE.md) | Онбординг агента |
| [`docs/data-model.md`](./data-model.md) | Сущности (осторожно: наследие + дубли) |
| [`docs/product-vision-lite.md`](./product-vision-lite.md) | Канон цеха ~10 чел, поток |
| [`docs/pages/PAGE-TZ-INDEX.md`](./pages/PAGE-TZ-INDEX.md) | Страница ↔ TZ |
| Эталон качества | `tasks/_backlog/z-series/backend/inventory/Z-001-inventory-write-transactions.md` |

---

## 1. Domain preflight (обязателен до текста TZ)

Перед тем как писать «ЧТО ДЕЛАТЬ», ответь в черновике (и перенеси в TZ):

### 1.1 Канон имён (1 термин = 1 сущность в коде)

Сверь **разговорное слово PO** с **живым FK/модулем**, не с вольным переводом:

| Говорят | В коде / API (канон для новых TZ) | Не путать с |
|---------|-----------------------------------|-------------|
| Клиент / покупатель / контрагент сделки | **`Counterparty`** (`counterpartyId`) | `Organization` |
| Наша фирма / юрлицо продавца / поставщик-склад | **`Organization`** (`organizationId`, type) | Counterparty |
| КП / коммерческое предложение | UI: **«КП»**; сущность: **`Quotation`** (историческое `proposalId` в коде) | отдельный `Proposal` / `CommercialProposal` |
| Заказ | **`Order`** (`orders`, `counterpartyId`) | Contract как «то же самое» |
| Договор | **`Contract`** (optional legal) | КП |
| Люди / сотрудники | **`Worker` / People page** (см. WORKERS-*) | User (аккаунт login) |
| Пользователь системы | **`User`** + roles/permissions | Worker card |

Если PO сказал «Organization = клиент», а код говорит иначе — **в TZ пиши код-канон**
и одну строку: «в dictation слово Organization = loose wording → Counterparty».

### 1.2 Кардинальность и уникальность (схема)

Явно в блоке ИСХОДНОЕ / ЧТО ДЕЛАТЬ:

- Сколько X на одного Y? (1 клиент → **N** КП; 1 КП → 0..1 Order после convert)
- Что **unique**: обычно бизнес-номер (`Order.number`, proposal number), не FK клиента
- Что **не** unique: `customerRef` / `counterpartyId` (иначе один КП навсегда)
- Snapshot vs FK на переходах: см. lifecycle plan / `TZ-CORE-301` (не invent mega-collection)

### 1.3 Источники правды для этого TZ

В шапке или ИСХОДНОЕ перечисли 2–5 путей, которые ты реально открыл:

```text
Проверено: backend/.../order.schema.ts; docs/data-model.md §…;
  docs/product-vision-lite.md; tasks/TZ-… (deps)
```

Запрещено писать TZ «по памяти» про сущности продаж/склада без grep по
`counterpartyId` / `organizationId`.

### 1.4 Границы (НЕ)

Минимум 3 пункта «НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ», иначе исполнитель расползётся
(Гант, PDF-редактор, бухгалтерия, merge трёх схем КП…).

---

## 2. Preflight checklist (скопируй в голову)

- [ ] Имя сущности совпадает с модулем/FK в `backend/src/modules/`
- [ ] Спорные слова (Organization / Client / Proposal) разрешены таблицей §1.1
- [ ] Unique / indexes не ломают «N документов на клиента»
- [ ] PAGES + PAGE_DOCS для UI; строка в PAGE-TZ-INDEX после создания
- [ ] CONFLICT KEYS — реальные пути; нет чужого Layer-3 god-file без DEFER
- [ ] AC измеримы + `pnpm` gates зоны
- [ ] known_limitation: что остаётся successor’у
- [ ] Нет дубля уже существующего TZ (`tasks/` + `_archive/2026-08/`)
- [ ] Общее поле/статус: строка в `docs/COUPLING-MAP.md` или явный N/A

---

## 3. Минимальный каркас (напоминание)

Полный скелет — `TZ-template.txt`. Короче:

1. `TZ-ID: название`
2. ROLE / DEPENDENCIES / LAYER / CONFLICT KEYS
3. PAGES / PAGE_DOCS (если UI)
4. ИСХОДНОЕ — факты с file:line или schema field
5. ЧТО ДЕЛАТЬ — 2–7 шагов
6. ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
7. AC + verification commands
8. known_limitation
9. Промпт исполнителю: `GEMINI.md` + путь TZ; checklist до правок

>7 шагов → несколько TZ с DEPENDENCIES (`tz-authoring` Split rule).

---

## 4. Когда агенту всё же можно спросить PO

Спрашивать **только** если после §1 всё ещё развилка с irreversible schema
(новый unique, смена ownership, удаление сущности).  
Не спрашивать то, что уже сказано в этом файле или в коде
(Counterparty = покупатель).

Формат ask (≤5 строк): варианты A/B + рекомендация + риск.

---

## 5. Куда класть TZ

| Место | Когда |
|-------|--------|
| `tasks/TZ-*.md` | Готово к выдаче исполнителю |
| `tasks/_backlog/` | Park / initiative |
| `tasks/_archive/YYYY-MM/*.done.md` | Только после Executor report |

Текущие потоки: `docs/agent-checklists/_NOW.md`; `_active-map.md` — история.
Gate деплоя: `tasks/TZ-DEPLOY-301-prep-first-deploy.md` (не смешивать с domain TZ).

---

## 6. Пример «плохо → хорошо» (из реального кейса)

**Плохо:** «КП привязан к Organization, customerRef sparse-unique».  
**Хорошо:**

- Покупатель = `Counterparty` (`counterpartyId`), как `Order` / contracts.
- `Organization` = наша фирма / supplier org — не клиент КП.
- Unique = автономер КП; `counterpartyId` indexed, **not** unique.
- Convert → Order копирует `counterpartyId` (ORDERS-301).

---

_Поддерживает: Cursor Mode A. При смене канона имён — правка §1.1 + commit этого файла._
