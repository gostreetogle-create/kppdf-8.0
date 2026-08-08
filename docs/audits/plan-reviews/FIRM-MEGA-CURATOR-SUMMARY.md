# Сводка куратора — firm mega plan (2026-08-08)

Источники (все на main):
- `firm-mega-sol.md` (GPT-5.6 Sol)
- `firm-mega-terra.md` (GPT-5.6 Terra)
- `firm-mega-composer.md` (Composer)
- `firm-mega-sonnet.md` (Claude Sonnet 5)

План: `C:\Users\User\.cursor\plans\firm_clients_sales_docs_mega_a1b2c3d4.plan.md`  
Статус: **ждём ответы PO на 7 вопросов** → потом нарезка TZ.

---

## Вердикт peers

Все: **Go с правками**. Направление ок; до lock правим факты и контракты.

## Консенсус (все согласны)

| Тема | Lock-предложение |
|------|------------------|
| CP backend CRUD уже есть | W1 = **FE FullEditor**, не новый API |
| Org FE тонкий | W1 = новый kind C FullEditor |
| INN lookup = ноль | W2 только с ключом/бюджетом PO, иначе park |
| Stub ИНН в quick-create опасен | Не маскировать под настоящий; HITL; миграция |
| D7 stub-КП нет в коде | Отдельный ранний кусок sales-wave |
| Supply / line-ready уже есть | W5 **не** переписывать |
| Vault ≠ photoIds | Typed roles + ACL admin + audit до PDF |
| «PDF одной кнопкой» | Отдельная волна после vault, не магическая кнопка |
| Фото клиентов | После org vault |
| TZD-30 | Не мешать |

## Порядок волн (сводка)

```
W0 TZD-30 (уже DONE / отдельно)
→ W1 Party FE (Org + CP FullEditor)
→ **W1.5 Org-guard** (Sonnet): findById/update/delete Org+CP проверяют tenant — **до** vault/INN write
→ W2 INN (если PO дал ключ) ИНАЧЕ park
→ W5a D7 stub-КП (+ residual design/module-ready — **не** supply/line-ready)
→ W3 Org vault (logo/seal/signature) только после W1.5
→ W4 Реквизиты/PDF + image bindings
→ W6 Desktop MCP поверх стабильных API
```

D7 раньше печати (Sol/Terra/Composer). Vault не раньше tenant-guard (Sonnet).

## Расхождения peers → рекомендация куратора

| Вопрос | Sol | Terra | Composer | Куратор → PO |
|--------|-----|-------|----------|--------------|
| Адреса в Org/CP | да, structured | да, не плоские | park, хватит Site | **Park в W1**; legal address когда lookup/договор потребует |
| Multi-org | проектировать N | проектировать N | вердикт PO; часто 1 | **Код готов к N; UX default = одна активная** — скажи сколько юрлиц реально |
| W5 vs W3 | W5R раньше | W5a раньше | D7 в начало W5 | **D7 раньше печати** |
| Quick-create INN | optional lookup, no fake | не заменять безусловно | W2 + badge stub | **W2: кнопка «Найти по ИНН»; до W2 badge «временный ИНН»** |

## Намёк: какая модель сильнее (для PO)

| Место | Кто | Почему |
|-------|-----|--------|
| **1** | **GPT-5.6 Sol** | Шире всех: security/tenant, fake-INN, no-commerce, work-type binding, перестановка волн |
| **1≈** | **Claude Sonnet 5** | Лучший security-фокус: дырявый Organization CRUD + CP by-id без org-guard → обязал **W1.5** до vault |
| **3** | **GPT-5.6 Terra** | Сильная hygiene W5 + vault/PDF контракты, ясно и без воды |
| **4** | **Composer** | Верные факты, практичные советы PO; меньше глубины по tenant |

Для тяжёлых DISCUSSION: **Sol + Sonnet** (или Terra вместо одного). Composer — быстрый третий взгляд.

---

## Вопросы PO — ответь номерами (просто)

1. **ИНН-сервис:** платный ключ (напр. DaData) сейчас / позже / не надо?
2. **Юрадрес фирмы/клиента в карточке:** нужно сразу / хватит адреса объекта (Site) пока?
3. **Сколько наших юрлиц** в одной программе: 1 / несколько?
4. **Печать менять:** только админ / ещё кто-то?
5. **Фото/сканы клиентов** сразу: да / нет (сначала только печать нашей фирмы)?
6. Что стыднее на ближайшем показе: **дыра заказ↔КП (D7)** или **КП без печати**?
7. В быстром заказе: **кнопка «Найти по ИНН»** позже ок / обязательно сразу с формами?

После ответов — нарезка W1… TZ + промпты.
