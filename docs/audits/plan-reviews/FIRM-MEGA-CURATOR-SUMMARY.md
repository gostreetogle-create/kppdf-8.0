# Сводка куратора — firm mega plan (2026-08-08)

Peers на main: **sol · terra · composer · sonnet · fable · opus** (+ краткие дубли по тем же темам).

План: `C:\Users\User\.cursor\plans\firm_clients_sales_docs_mega_a1b2c3d4.plan.md`  
**Статус:** TZ нарезаны → `tasks/_backlog/party-docs/WAVE-PARTY-DOCS.md` + `PROMPT-CONTINUOUS.md`.  
Defaults peers приняты (PO Q1–7 не отвечал). Код — исполнителю по волне.

---

## Вердикт

Все: **Go с правками.** Направление верное. **W1 «просто формы» нарезать нельзя** — сначала гигиена party-слоя (Opus **W0.5** / Sonnet **W1.5**).

---

## Консенсус peers → lock-предложение

| Тема | Решение |
|------|---------|
| TZD-30 / W0 | **DONE** — не «в полёте» (Opus) |
| CP backend CRUD | Есть; W1 = **FE FullEditor** |
| Org FE | Новый **kind C 1120** с нуля (банк/ОГРН/…), не патч 7-полевого диалога |
| Tenant / IDOR | Org CRUD не scoped; CP get/patch/delete не scoped; quick-create **без organizationId** → **W0.5 hygiene до UI** |
| Soft-delete | `deletedAt` часто не в схеме → DELETE no-op — в W0.5 |
| INN indexes | Global `unique` + compound — конфликт; миграция в W0.5 |
| Stub ИНН | Помечать; не притворяться настоящим |
| INN lookup | W2 только с ключом PO, иначе park |
| Supply / line-ready | **Уже есть** — убрать из «дыр» W5 |
| D7 stub-КП | Отдельный ранний кусок (параллель party-ручью) |
| Vault | Roles поверх живого `POST /photos/upload`; admin + audit |
| PDF / image | Reuse template image/background + registry contract-change, не 3-й пайплайн |
| mcp-runtime WIP | Конфликт с **W6** — выбрать SoT `desktop/mcp` vs staging до W6 |
| «Чья печать в документе» | Нужен указатель «наша фирма» (`isOurCompany` / current), не только «сколько юрлиц» (Opus) |

---

## Порядок волн (сводка)

```
W0     TZD-30 — DONE (снять с параллели)
W0.5   Party hygiene: tenant-stamp, org-scope IDOR, deletedAt, drop global inn unique, stub badge
W1     Party UX: Org FullEditor kind C + CP FullEditor/list actions
W2     INN lookup (park без ключа) + HITL + org-scoped reuse
W5a    D7 stub-КП (+ позже design/module-ready; НЕ supply rewrite)
W3     Org vault logo/seal/signature (+ Org legalAddress)
W4     Реквизиты/PDF + image bindings (contract-change)
W6     Desktop MCP — после выбора SoT mcp vs mcp-runtime
```

Параллель после W0.5: **party/vault/doc** ‖ **D7/sales** (кроме одного владельца `order.service.ts`).

---

## Намёк: модели

| Место | Кто | Почему |
|-------|-----|--------|
| **1** | **Opus 5** | Самый сильный блокер-анализ: W0.5, soft-delete no-op, quick-create без orgId, «чья фирма в PDF», mcp-runtime vs W6 |
| **1≈** | **GPT-5.6 Sol** | Широкая глубина: security, fake-INN, no-commerce, work-type binding, волны |
| **3** | **Claude Sonnet 5** | Жёстко про tenant IDOR → W1.5/W0.5 до vault |
| **4** | **GPT-5.6 Terra** | W5 hygiene, vault/PDF контракты |
| **5** | **Fable** | Reuse photo/image pipeline, индексы INN |
| **6** | **Composer** | Верные факты, практичные defaults |

Для тяжёлых планов: **Opus и/или Sol + Sonnet**. Остальные — второе/третье мнение.

---

## Вопросы PO — defaults применены (ответов не было)

| # | Default lock | TZ |
|---|--------------|-----|
| 1 INN API | позже / PARK | TZ-INN-301 PARKED |
| 2 legalAddress | с vault | TZ-ORG-ASSETS-301 |
| 3 наших юрлиц | **1** на instance | TZ-PARTY-301 |
| 4 печать | admin only | TZ-ORG-ASSETS-301 |
| 5 фото клиентов | нет в волне | — |
| 6 показ | stub-КП рано + печать после vault | #4 затем #5–6 |
| 7 stub badge | да | TZ-PARTY-301 |

Executable: `tasks/_backlog/party-docs/` · промпт `PROMPT-CONTINUOUS.md`.
