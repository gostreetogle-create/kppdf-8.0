# PROMPT — Freebuff: правки по внешнему аудиту

> Два TZ. Второй (OPS-317) трогает весь репозиторий одним коммитом — запускать
> только когда `tasks/_active/` пуст (никого больше не работает параллельно).
> Deploy / wipe / prod Synology — ЗАПРЕЩЕНЫ без явного слова PO в чате.

Скопируй **весь блок ниже** в новый чат Freebuff и начни немедленно.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
Прочитай: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + этот файл.

Deploy / wipe / prod Synology — ЗАПРЕЩЕНЫ без явного слова PO в чате.
Push — можно (GitHub только хранилище).

═══ ЦИКЛ (на каждый TZ) ═══
1. CLAIM: tasks/TZ-*.md → tasks/_active/, checklist по _TEMPLATE.md, Claim slot.
2. Код строго по Scope из TZ.
3. Гейты — все PASS перед archive.
4. Archive → tasks/_archive/2026-08/<ID>.done.md + lock + commit + push.
5. Обнови docs/agent-checklists/_NOW.md одной строкой.

═══ ОЧЕРЕДЬ ═══
1. tasks/TZ-CORE-302-soft-delete-coverage-gap.md — можно сразу, обычный Layer 4.
2. tasks/TZ-OPS-317-git-line-endings-normalize.md — ТОЛЬКО когда tasks/_active/
   пуст (проверь перед claim — если там что-то ещё есть, подожди или спроси PO,
   не начинай). Это один коммит на весь репозиторий, конфликтует с любым
   параллельным diff.

═══ СТОП ═══
- tasks/_active/ не пуст перед стартом OPS-317 → не брать, написать в _NOW почему.
- Gates FAIL после 2 попыток → archive .failed.md, не деплоить.

═══ DoD ═══
Таблица: ID | outcome | archive path | SHA | gates.
```

---

**Текст TZ-CORE-302** — см. приложенный файл.
**Текст TZ-OPS-317** — см. приложенный файл.

**Контекст:** оба TZ — результат перепроверки внешнего аудита (`tasks/аудит.txt`).
Часть выводов аудита (дыра в RegisterDto.role, дублирующийся soft-delete хук,
«риск потери проекта без пуша») оказались устаревшими при проверке — уже
исправлено или неверно. Эти два TZ — то, что осталось реально открытым.
