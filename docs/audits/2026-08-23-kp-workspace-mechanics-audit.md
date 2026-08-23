# Audit: KP Workspace — механика, связки, deep-open (не chrome)

**Дата:** 2026-08-23  
**Триггер:** PO — «Открыть карточку клиента» не открывает нужную карточку; непонятно что правит шаблон vs это КП.  
**Scope:** внутренности панелей, CTA, автоподстановки. **Rails L/R, overlay, геометрия A4 — вне scope** (PO: ок).  
**Evidence:** code trace [Trace client card deep-link](c79db997-d539-44c9-8667-4ac0f5e0802f), IA map [Map KP rail IA](19f2d90f-a19c-42bb-979f-73616e2332a2), MCP Claude analysis-only, `docs/audits/2026-08-23-kp-workspace-implementation-audit.md` §1 row 24.

---

## 1. Executive verdict

| Класс | Статус |
|-------|--------|
| Chrome / rails / ribbon PDF | ✅ PASS (prior QA) |
| Deep-open сущностей из КП | ✅ FIXED (MECH-501) — client/org in-KP dialog |
| Эталон vs snapshot — подписи в UI | ✅ FIXED (MECH-502) |
| Автономер КП / inherit скидок | ✅ FIXED (MECH-503/504 — номер + НДС; скидка doc = 0) |
| Дубль КП + смена org→бланк | ✅ FIXED (MECH-505 — duplicate + toast) |

Предыдущий `docs/qa/kp-workspace-full-audit.md` проверял mount панелей, не **семантику кнопок**.

---

## 2. P0 — deep-open (FIXED MECH-501, `0ea6cab6`)

### 2.1 «Открыть карточку клиента» — **FIXED**

| | |
|---|---|
| Было | `router.navigate(['/counterparties', id])` — маршрута нет |
| Стало | `PiDialogService.open(CounterpartyFullEditorDialogComponent, { data })` in-place |
| Файл | `proposal-create-recipient.component.ts` |
| Тест | spec: dialog open, `Router.navigate` не вызывается |

### 2.2 «Открыть организацию» — **FIXED**

| | |
|---|---|
| Было | `navigate(['/organizations'], { highlight: id })` — param игнорировался |
| Стало | `OrganizationFullEditorDialogComponent` in-place |
| Файл | `proposal-create-inspector.component.ts` |

---

## 3. IA map — что правит что (code SoT)

### Left rail

| Id | RU | Пишет в | Smell |
|----|-----|---------|-------|
| `catalog` | Каталог | **This KP** (`draftLines`); catalog-review может обновить Product | «В КП» vs справочник до модалки review |
| `template` | Шаблон | **Doc template** (rename/bg/AI) + **This KP** (`templateId`) | Бланк и «это КП» в одной панели |
| `recipient` | Клиент | **This KP** only | MECH-501: in-KP card dialog |

### Right rail

| Id | RU | Пишет в | Smell |
|----|-----|---------|-------|
| `params` | Параметры | **This KP** (номер, скидки, org, sheet) | org = «наша фирма», легко спутать с клиентом |
| `table` | Редактор таблицы | **This KP** lines/layout; preset → **TableTemplate** shared | «Пресет» = общий шаблон таблицы |
| `terms` | Условия | **This KP** terms; library CRUD → **TextBlock** shared | условия сделки vs библиотека |
| `output` | Вывод | print/pdf/archive | дубль ribbon (не блокер PO) |

### Эталон vs snapshot (менеджер)

| Bucket | Ожидание | Факт |
|--------|----------|------|
| **Template** | один раз на будущее | размазано: Шаблон, Таблица→preset, Условия→библиотека |
| **This KP** | этот черновик | Клиент, Параметры, строки, условия в КП |
| **Preview** | только смотреть | center iframe; edit через панели |

---

## 4. CTA matrix (выборка; полный список — implementation-audit §1)

| # | CTA | data-test | Verdict (post-wave) |
|---|-----|-----------|---------------------|
| 1 | Открыть карточку клиента | `kp-recipient-card` | **PASS** MECH-501 |
| 2 | Открыть организацию | `kp-insp-open-org` | **PASS** MECH-501 |
| 3 | Открыть карточку изделия | row drawer | **PASS** (was ok) |
| 4 | Создать клиента | `kp-recipient-quick-create` | **PASS** |
| 5 | Редактировать шаблон | `kp-tpl-edit` | **manual PO** |
| 6 | PDF / Печать ribbon | `kp-ribbon-pdf/print` | **PASS** |
| 7 | Дублировать шаблон | template panel | **PASS** |
| 8 | Дублировать КП | `kp-ws-duplicate` | **PASS** MECH-505 |
| 9 | Номер КП | `kp-insp-number` | **PASS** MECH-503 |
| 10 | Скидка / НДС | `kp-insp-discount*` / vat | **PASS** MECH-504 (НДС inherit; скидка doc=0) |

---

## 5. Волна — **DONE** (2026-08-23)

| TZ | Commit | Archive |
|----|--------|---------|
| MECH-501 | `0ea6cab6` | `tasks/_archive/2026-08/TZ-KP-MECH-501-in-kp-party-org-dialog.done.md` |
| MECH-502 | `01a6317a` | `tasks/_archive/2026-08/TZ-KP-MECH-502-ia-hints-kp-vs-template.done.md` |
| MECH-503 | `e83d1e3a` | `tasks/_archive/2026-08/TZ-KP-MECH-503-kp-number-auto.done.md` |
| MECH-504 | `1bd886c2` | `tasks/_archive/2026-08/TZ-KP-MECH-504-inherit-terms-from-party-org.done.md` |
| MECH-505 | `7c0b3568` | `tasks/_archive/2026-08/TZ-KP-MECH-505-duplicate-kp-change-org.done.md` |

**Gates (2026-08-23):** FE tsc 0 errors; jest proposal-workspace* + recipient + inspector + draft **87/87** PASS.

**Leftover (backlog):** inherit discount from Counterparty schema (поля нет); auto org→template FK (нет в модели); rail «Вывод» vs ribbon dedup.

---

## 6. НЕ в этой волне

- Перестановка rails, panel side, UI-density chrome.
- Удаление rail «Вывод» (дубль ribbon) — отдельно, если PO попросит.
- Desktop TZD-66, deploy.

---

## 7. PO sign-off checklist (после волны)

- [ ] Клиент выбран → «Открыть карточку» → диалог **этого** ООО → save → КП на месте
- [ ] Организация → «Открыть» → диалог **этой** фирмы → save → наценка/реквизиты видны
- [ ] В «Параметрах» подпись «только это КП»; в «Шаблоне» — «эталон на будущее»
- [ ] Новый черновик получает номер; можно править вручную
- [ ] «Дублировать КП» из workspace → новый draft; смена org меняет бланк (505)
