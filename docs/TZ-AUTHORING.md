# Как писать TZ для kppdf-8.0 (канон)

> **Source of truth** для авторов техзадач (человек, Cursor Mode A, любой ИИ).  
> Цель: executable TZ без «угадывания» схемы и без лишних уточняющих форм.  
> Обновлено: 2026-09-05 (§8 — one-shot PROMPT при rate limits).

**Кто обязан читать перед написанием TZ:** Cursor (`tz-authoring` skill), любой агент,
которому PO сказал «напиши TZ / спеку». Исполнитель читает **уже готовый** TZ +
этот файл только если в TZ есть спор имён/уникальности.
Сложное / новая идея / архитектура: Cursor сначала MCP `claude_code` (analysis-only).

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
| [`docs/DOMAIN-MAP.md`](./DOMAIN-MAP.md) | Домен ↔ BE ↔ legacy FE ↔ **NX FE (target)**; вести параллельно с NX |
| Эталон качества | `tasks/_backlog/z-series/backend/inventory/Z-001-inventory-write-transactions.md` |
| **§8 ниже** | One-shot `PROMPT-*` при rate limits (абсолютный контекст, no placeholders) |

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

### 1.5 Сбои процесса (для доменных / UI-потоковых TZ)

До «happy path» выпиши **≥3 реальных сбоя** оператора (отмена после отгрузки,
правка задним числом, двое правят одну сущность, «ничьи» работы после увольнения…).
ИИ закрывает удачный сценарий сам; сбои без явного AC в TZ не чинит. Не раздувать
модуль ради гипотетики — только сбои, которые уже ломают ваш цех.

---

## 2. Preflight checklist (скопируй в голову)

- [ ] Имя сущности совпадает с модулем/FK в `backend/src/modules/`
- [ ] **Necessity** (`docs/PO-SHARED-UNDERSTANDING.md` §2): оператор NX или security-факт; не partial legacy cleanup / не гипотеза
- [ ] Спорные слова (Organization / Client / Proposal) разрешены таблицей §1.1
- [ ] Unique / indexes не ломают «N документов на клиента»
- [ ] PAGES + PAGE_DOCS для UI; строка в PAGE-TZ-INDEX после создания
- [ ] Домен/route (legacy или NX): строка в `docs/DOMAIN-MAP.md` в AC/Integrity (цель UI = NX)
- [ ] CONFLICT KEYS — реальные пути; нет чужого Layer-3 god-file без DEFER
- [ ] AC измеримы + `pnpm` gates зоны
- [ ] known_limitation: что остаётся successor’у
- [ ] Нет дубля уже существующего TZ (`tasks/` + `_archive/2026-08/`)
- [ ] Общее поле/статус: строка в `docs/COUPLING-MAP.md` или явный N/A
- [ ] Для потоковых TZ: ≥3 сбоя процесса в ИСХОДНОЕ/AC (§1.5) или явный N/A
- [ ] **SIZE** в шапке: `S` (мелочь) или `L` (крупное) — см. §2a

---

## 2a. Калибр TZ: мелочь (S) vs крупное (L)

В шапке каждого TZ обязательно:

```text
**SIZE:** S   · или ·   **SIZE:** L
```

| | **S — мелочь / быстрая** | **L — крупное / вертикаль** |
|--|--------------------------|-----------------------------|
| Что | Частичная правка: scroll, убрать footer, чип, copy, 1–2 файла UI, точечный тест | Новая способность / schema / несколько слоёв FE+BE / заметный UX-поток |
| Объём агента | ~минуты–<1 ч; ≤~3 conflict-file hotspots | Часы; явные под-шаги; часто BE+FE |
| Примеры | G15 legend delete; registries scroll-stable; S43 title wrap | G14 bar assignee; Data IA D50–D54; Gantt L0 wave |
| Промпт | **Пачка S** в одном continuous (3–8 штук, один экран/зона предпочтительно) | **Одна L** или волна из нескольких L с checkpoint между ними |
| Риск контекста | Много мелких по одной — нормально; не смешивать с чужой L mid-prompt | Одна L на промпт/сессию; не клеить 3 L подряд без WAVE checklist |

### Как клеить в волны и промпты

1. **WAVE-S-…** — только `SIZE: S`. Один PROMPT continuous: claim → gates → archive → next S.  
2. **WAVE-L-…** — только `SIZE: L` (или L с тонкими S-хвостами *внутри той же* вертикали, напр. docs smoke в конце Data IA).  
3. **Не смешивать** в одном промпте несвязанные S из разных модулей (реестры + Гант + студия) — три коротких промпта или три слота агента лучше, чем один «комбайн».  
4. Если PO просит «дай ТЗ / цепочку» — Cursor отвечает **таблицей цепочки** (`SIZE` · id · путь) + один PROMPT на цепочку; без эссе.  
5. Перегруз контекста: режь L на 2 TZ с DEPENDENCIES; не дроби S на микроскопические «один CSS-класс = одна TZ», если keys те же.  
6. UI panels / expand: в AC или НЕ — ссылка на `paper-and-ink.md` § **Panel & expand inset** (текст не к рамке).

### Шапка TZ (доп. поле)

После ROLE/LAYER:

`**SIZE:** S` или `**SIZE:** L`  
Опционально: `**PACK:** WAVE-…` / `PROMPT-…`

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
9. **Proof of adoption** (для UI/canonical primitive TZ — обязательно):
   - ≥1 routed production consumer (или явное «docs-only / deferred → TZ-…»);
   - тест на ключевое поведение;
   - `/kit` или Markdown docs обновлены;
   - migration note: что запрещено делать вручную;
   - legacy leftover: где ещё старый путь.
   Без этого TZ не DONE («готово в shared, 0 consumers» = провал).
10. Промпт исполнителю: `GEMINI.md` + путь TZ; checklist до правок

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

## 7. Build-integrity (frontend-nx) — обязательно с 2026-08-30

Любой TZ с `frontend-nx/apps/kppdf-web/src/**`:

1. **Implicit conflict:** весь `kppdf-web` должен собираться (`nx build kppdf-web`), не только затронутый route.
2. **Gate:** полный `nx build kppdf-web` — baseline до CLAIM и **последний** шаг перед archive (не заменяется `tsc`/scoped tests).
3. **Параллель:** два активных TZ на `kppdf-web/src/**` — запрещены без sequential rule в `QUEUE-LIVE.md`.
4. **Split:** монолиты «все реестры + constructor» → серия under-1h TZ, каждая с зелёным build в конце.
5. **PO «можно запускать?»:** `tasks/_active/` пуст + `nx build kppdf-web` exit 0.

Полный протокол, инцидент, шаблон блока для TZ: [`docs/TZ-NX-BUILD-INTEGRITY.md`](./TZ-NX-BUILD-INTEGRITY.md).  
Промпт Cursor: [`tasks/PROMPT-CURSOR-TZ-ORDERING.md`](../tasks/PROMPT-CURSOR-TZ-ORDERING.md).

---

## 8. PROMPT для исполнителя при жёстких rate limits (one-shot)

> Цель: модель с лимитом **5–10 запросов/час** выполняет **весь** объём за **один** промпт.  
> Итераций «уточни / допиши / по аналогии» — нет. Токенов на ошибки нет.  
> TZ остаётся SoT в `tasks/`; PROMPT — копипаст-обёртка с CLAIM + полным контекстом.

### 8.1 Принципы

| Принцип | Что писать в PROMPT |
|---------|---------------------|
| **Абсолютный контекст** | Все нужные каноны, пути файлов, deps, conflict keys, MCP/архитектурные запреты — в промпте или явным списком «прочитай эти пути». Не рассчитывать на историю чата. |
| **No placeholders** | Запрет: `// остальной код здесь`, «далее по аналогии», обрезанные диффы, «…». Требовать полный готовый результат от первой до последней строки / полный diff scope. |
| **Chain of Thought** | Сначала план в `<thinking>…</thinking>` (или эквивалент), сверка с AC, затем финал. Не спрашивать PO mid-wave. |
| **Превентивная самопроверка** | Чек-лист перед сдачей: (а) архитектурные правила, (б) крайние случаи из TZ, (в) ответ/дифф не обрезан, (г) gates зелёные. |
| **Один проход** | Весь объём волны/TZ в шагах; STOP только на irreversible schema / чужой `_active` conflict. |

### 8.2 Обязательная структура PROMPT

Каждый `tasks/PROMPT-*.md` (и handoff в чат) — в этом порядке:

```text
[КОНТЕКСТ ПРОЕКТА]
  workspace · branch · agent_id · GEMINI/CLAUDE · PO-CANON pointers · пути TZ/WAVE/аудит

[ГЛОБАЛЬНАЯ ЗАДАЧА И ШАГИ]
  цель одной фразой → нумерованные шаги (claim → code → gates → archive → next)
  факты file:line / schema; не «сделай красиво»

[ЖЕСТКИЕ ОГРАНИЧЕНИЯ]
  CONFLICT KEYS · НЕ трогать · no placeholders · Mode A N/A для executor
  параллель / rate-limit: не ждать «ок»; STOP только по blockers из TZ
  frontend-nx → nx build kppdf-web last (§7)

[ТРЕБУЕМЫЙ ФОРМАТ ОТВЕТА]
  1) <thinking> план + сверка с AC </thinking>
  2) полный результат (код в репо + краткий отчёт SHA / paths)
  3) self-check: архитектура · edge cases · не обрезано · gates
  4) Executor report (auto) перед archive
```

CLAIM-блок в начале handoff — как в skill `tz-authoring` (без CLAIM код не писать).

### 8.3 Checklist автора PROMPT (Cursor)

- [ ] Все пути/TZ из § «Проверено» реально открыты; absolute context без дыр
- [ ] Нет шагов «уточни у PO» кроме irreversible (§4)
- [ ] Явный запрет placeholders / truncated answers
- [ ] Есть `<thinking>` + финальный self-check
- [ ] SIZE/WAVE согласованы с §2a; один continuous = связанные S или одна L
- [ ] Conflict keys не пересекают чужой active slot
- [ ] Gates и archive path указаны явно

### 8.4 Антипаттерны

- Промпт «посмотри и скажи что думаешь» без шагов и AC  
- Ссылка «как в прошлый раз» без путей  
- Половина волны «остальное потом» внутри одного rate-limit слота  
- Параллель двух TZ на `kppdf-web/src/**` без sequential rule  

---

_Поддерживает: Cursor Mode A. При смене канона имён — правка §1.1 + commit этого файла._
