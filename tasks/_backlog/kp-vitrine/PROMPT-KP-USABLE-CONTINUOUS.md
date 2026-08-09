# Промпт — WAVE-KP-USABLE дочистить до конца (self-verify, без стопов на PO)

Скопируй агенту **целиком**. Один промпт = вся оставшаяся волна.  
Deploy **не** запускать. Не ждать «ок / PASS / продолжай» от человека.

**Состояние на `main` (проверь `git log`):**
- DONE archive: 337, 333, 338 (+ feature studio edit).
- 339: код `da1d83e7` + Cursor hotfix `8a3186f1` (без кнопки Save, фикс 400 `item.total`, пустой resume после удаления) — **ещё не archive**, маркер `tasks/_active/TZ-SALES-339.md`.
- NEXT после closeout 339: **334 → 335 → 336**.
- Чужой WIP не трогать: `system-role.guard*`, `roles-admin*`, DOC-343/344 dirty.

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · ветка main.
Skills: .agents/skills/kppdf-executor-continuous/SKILL.md + GEMINI.md + OrchestratorKit/AGENTS.md
Канон: docs/audits/2026-08-09-kp-usable-gap-map.md
Wave: tasks/_backlog/kp-vitrine/WAVE-KP-USABLE.md
PO: docs/PO-DIARY.md §1–§4
Deploy НЕ запускать. Не invent новые TZ вне этой очереди.
НЕ коммитить: system-role.guard*; roles-admin*; DOC-343/344 dirty WIP.

════════════════════════════════════════════════════════
ЖЁСТКИЕ ПРАВИЛА ДВИЖЕНИЯ (почему прошлый агент «застрял»)
════════════════════════════════════════════════════════
1) ЗАПРЕЩЕНО останавливаться mid-queue и писать «нужен visual PASS от PO/Cursor».
2) Visual gate = ТЫ САМ: браузер (Playwright / cursor-ide-browser / ручной сценарий через tooling)
   + gates (tsc/jest/e2e зоны) + повторная самопроверка. Зафиксируй evidence в checklist.
3) После самопроверки СРАЗУ: archive + lock + remove _active + progress + _active-map
   + commit+push → следующий TZ. Не жди ответа человека.
4) Commit+push на КАЖДОЙ закрытой TZ (feature и/или closeout). Без push ≠ DONE.
5) Слова экрана в отчётах: «Сделки», «Создать КП», «Параметры», «Таблица», «КП удалено».
6) UI user-visible = русский (никаких draft/Save в тексте).
7) FROZEN: A4 overlay shell 317; print/PDF 320; не трогать.

════════════════════════════════════════════════════════
СТАРТ
════════════════════════════════════════════════════════
git fetch && git checkout main && git pull --ff-only
Прочитай _active-map, tasks/_active/, WAVE-KP-USABLE, этот файл.
Team Room join/inbox если доступен (не блокер).

════════════════════════════════════════════════════════
ОЧЕРЕДЬ (строго до пустого _active по этой волне)
════════════════════════════════════════════════════════

A) CLOSE TZ-SALES-339 (уже почти готова)
   - Feature: da1d83e7; hotfix уже на main: 8a3186f1
     (кнопки «Сохранить КП» НЕТ — только статус автосохранения;
      payload без item.total; удалённый КП не resume’ится).
   - SELF-VERIFY (обязательно, сам):
     1. Стек up при необходимости (start:no-browser), не оставляй мусор — stop в конце сессии если сам поднял.
     2. Сделки → Создать КП → Наша фирма → шаблон → товары → жди «Сохранено»
        → F5 → товары+шаблон на месте. Кнопки «Сохранить КП» нет.
     3. Сделки → КП → удалить строку → «КП удалено» → F5 списка → строки нет.
     4. Снова Создать КП → пустой лист (не воскресший шаблон).
   - Запиши evidence в docs/agent-checklists/TZ-SALES-339.md (self PASS + SHA).
   - archive → tasks/_archive/2026-08/TZ-SALES-339.done.md + lock
   - удали tasks/_active/TZ-SALES-339.md
   - commit+push closeout. Сразу B.

B) TZ-SALES-334 — tasks/_backlog/kp-vitrine/TZ-SALES-334-kp-counterparty-picker.md
   Клиент = ВСЕ Counterparty без фильтра роли; OverflowSelect + searchable; в autosave/resume.
   SELF-VERIFY: выбрать клиента → дождаться «Сохранено» → F5 → клиент на месте; нет «заглушка».
   archive+lock+push → C.

C) TZ-SALES-335 — tasks/_backlog/kp-vitrine/TZ-SALES-335-kp-line-items-columns-photo.md
   Кол-во/цена/сумма на экземпляре таблицы Create + правка qty + photoUrl в «Рисунок» если колонка есть.
   SELF-VERIFY: на листе A4 видны кол-во (и цена/сумма после merge keys); смена qty перестраивает лист;
     фото в ячейке если колонка Рисунок есть.
   archive+lock+push → D.

D) TZ-SALES-336 — tasks/_backlog/kp-vitrine/TZ-SALES-336-kp-lock-paid-copy.md
   Замок бланка / «Оплачена» hard-lock / копировать КП.
   SELF-VERIFY: оплачена → нельзя править товары/шаблон; снять → можно; копия → новый draft в студии.
   archive+lock+push → E.

E) ВОЛНА DONE
   - tasks/_active/ пуст от SALES-333…339 / 334…336 этой волны.
   - WAVE-KP-USABLE.md → STATUS DONE + таблица SHA.
   - _active-map checkpoint: WAVE-KP-USABLE DONE; NEXT idle.
   - Финальный отчёт PO: таблица TZ | SHA feature | SHA closeout | archive path.
   - НЕ начинай PROMPT-KP-CHAIN-E2E-RESEARCH и НЕ деплой.
   - Idle.

На каждую TZ цикла B–D:
CLAIM (_active + checklist) ДО кода → AC → gates зоны → self-browser verify
→ Executor report (auto) → archive/lock/remove _active → commit+push → Checkpoint → next.
Если self-verify FAIL — чини в той же TZ, не прыгай дальше, не зови PO без реального блокера
(секреты / wipe / конфликт CONFLICT KEYS с чужим _active).

Gates минимум:
- затронутый frontend tsc + focused Jest
- backend tsc + quotation e2e если трогал quotation
- Prettier/ESLint/diff-check по зоне

Финал = чистый _active по волне + все DONE в _archive/2026-08/. Deploy NO.
```
