# PROMPT — Freebuff: PO backlog волна (PARTY-305 + ORDERS-307)

> Два независимых TZ из `_backlog`, уже написаны PO, не пересекаются по файлам.
> Deploy / wipe / prod Synology — ЗАПРЕЩЕНЫ без явного слова PO в чате.

Скопируй **весь блок ниже** в новый чат Freebuff и начни немедленно.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
Прочитай: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + этот файл.

Deploy / wipe / prod Synology — ЗАПРЕЩЕНЫ без явного слова PO в чате.
Push — можно (GitHub только хранилище).

═══ ВАЖНО: НЕ ТРОГАТЬ ═══
tasks/TZD-59-desktop-compat-version-failsafe.md — уже claimed другим executor'ом
(tasks/_active/TZD-59.md существует). Не брать, пока там не появится archive.
tasks/_backlog/desktop/TZD-57-pairing-download-button-version.md — та же CONFLICT KEY
(pairing-dialog.component.ts), что и TZD-59. Не брать в этой волне вообще — отдельный
промпт после того, как TZD-59 будет archived (иначе конфликт правок одного файла).

═══ ЦИКЛ (на каждый TZ) ═══
1. CLAIM: файл TZ → tasks/_active/, checklist по _TEMPLATE.md, Claim slot (agent_id, claimed_at).
2. Код строго по Scope из TZ. Не трогать файлы вне Scope.
3. Гейты — все PASS перед archive.
4. Archive → tasks/_archive/2026-08/<ID>.done.md + lock + commit + push (только свои пути).
5. Обнови docs/agent-checklists/_NOW.md одной строкой.
6. Сразу следующий TZ по очереди — не жди PO.

═══ ОЧЕРЕДЬ (порядок не важен, файлы не пересекаются) ═══
1. tasks/_backlog/TZ-PARTY-305-counterparty-contact-person.md
   FE: PiOverflowSelect Person по counterparty; BE: PATCH contactPersonId,
   Person.lastName optional, unique index phone (sparse, normalized).
2. tasks/_backlog/TZ-ORDERS-307-order-executor-organization.md
   BE: Order.organizationId (FK Organization); FE order-form-panel + desk create/edit
   dropdown «Исполнитель»; supply read-only chip; migration-safe default seed.

Оба файла уже в `_backlog` — просто прочитай их напрямую, не копируй в другое место
перед claim (в отличие от волн, где TZ ещё не существует).

═══ СТОП ═══
- Conflict keys пересеклись с чужим _active → DEFER, запись в _NOW, следующий TZ.
- Gates FAIL после 2 попыток → archive .failed.md, запись в _NOW, не деплоить.
- Migration/seed для ORDERS-307 трогает существующие Order без dry-run — сначала dry-run,
  отчёт PO, потом apply (не молча на проде — там пока и не может, деплоя нет).

═══ DoD волны ═══
Таблица: ID | outcome | archive path | SHA | gates. Без «волна закрыта» — только per-TZ.
```

---

**Как пользоваться:** можно параллельно с волной TZD-59/60/61 — файлы не пересекаются.
Оба TZ помечены в `_NOW.md` как «не брать без PO» — это сообщение и есть твоё «беру».
