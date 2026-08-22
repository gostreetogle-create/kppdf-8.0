# PROMPT — Freebuff: UI-фиксы волна 1 (PiSelect + gold-контраст)

> Два маленьких, не пересекающихся по файлам TZ. Deploy — ЗАПРЕЩЁН.
> Не расширять scope сверх того, что написано в каждом TZ.

Скопируй **весь блок ниже** в новый чат Freebuff и начни немедленно.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
Прочитай: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + этот файл.

Deploy / wipe / prod Synology — ЗАПРЕЩЕНЫ без явного слова PO в чате.
Push — можно (GitHub только хранилище).

═══ ЦИКЛ (на каждый TZ) ═══
1. CLAIM: tasks/TZ-UI-40N-*.md → tasks/_active/, checklist по _TEMPLATE.md,
   Claim slot (agent_id, claimed_at).
2. Код строго по acceptance criteria TZ. НЕ трогать файлы вне списка "Scope"/
   "Вне scope" каждого TZ.
3. Гейты из TZ — все PASS перед archive.
4. Archive → tasks/_archive/2026-08/<ID>.done.md + lock + commit + push
   (только свои пути, не git add -A).
5. Обнови docs/agent-checklists/_NOW.md одной строкой.
6. Сразу следующий TZ по очереди ниже — не жди PO.

═══ ОЧЕРЕДЬ ═══
1. tasks/TZ-UI-401-fix-pi-select.md — сначала (компонент select).
2. tasks/TZ-UI-402-gold-text-contrast.md — после (8 других файлов, не пересекается с #1).

Файлов TZ ещё нет в tasks/ — скопируй текст ниже в tasks/TZ-UI-401-fix-pi-select.md
и tasks/TZ-UI-402-gold-text-contrast.md перед claim (по одному, не разом).

═══ СТОП ═══
- Conflict keys пересеклись с чужим _active → DEFER, запись в _NOW, следующий TZ.
- Gates FAIL после 2 попыток → archive .failed.md, запись в _NOW, не деплоить.
- Хочется тронуть файл вне scope TZ → не делай, зафиксируй находку в отчёте.

═══ DoD волны ═══
Для каждого TZ — таблица: ID | outcome | archive path | SHA | gates.
Не писать "волна закрыта" — только per-TZ archive + verify.
```

---

**Текст TZ-UI-401** — см. приложенный файл `TZ-UI-401-fix-pi-select.md`.
**Текст TZ-UI-402** — см. приложенный файл `TZ-UI-402-gold-text-contrast.md`.

**Как пользоваться:** один чат Freebuff на оба TZ подряд. Параллельно с этим
Claude Code в терминале работает над desktop-приложением — файлы не
пересекаются, конфликта не будет.
