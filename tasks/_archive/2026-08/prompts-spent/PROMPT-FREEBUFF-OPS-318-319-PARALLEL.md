# PROMPT — Freebuff (второй, параллельный чат): бэкапы + проверка перед push

> Работает ПАРАЛЛЕЛЬНО с другим Freebuff-чатом, который сейчас делает
> TZ-CORE-302 (базы данных, файлы схем). Эти два TZ файлов схем не трогают —
> конфликта не будет. НЕ бери TZ-OPS-317 (нормализация переносов строк по
> всему репозиторию) — она должна стартовать одна, без параллельных агентов,
> её возьмёт первый чат самым последним.

Скопируй **весь блок ниже** в этот свободный чат Freebuff и начни немедленно.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
Прочитай: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + этот файл.

Deploy / wipe / prod Synology / установка cron на сам сервер — ЗАПРЕЩЕНЫ без
явного слова PO в чате. Push — можно. Изменения в .github/ — ЗАПРЕЩЕНЫ.

═══ ПЕРЕД СТАРТОМ ═══
В tasks/_active/ сейчас claim другого чата на TZ-CORE-302 (backend схемы) —
НЕ трогай эти файлы, они вне scope обоих TZ ниже, конфликта быть не должно,
но всё равно не лезь параллельно в backend/**/*.schema.ts.

═══ ЦИКЛ (на каждый TZ) ═══
1. CLAIM: файл TZ → tasks/_active/, checklist по _TEMPLATE.md, Claim slot.
2. Код строго по Scope. Гейты — все PASS перед archive.
3. Archive → tasks/_archive/2026-08/<ID>.done.md + lock + commit + push.
4. Обнови docs/agent-checklists/_NOW.md одной строкой.
5. Сразу следующий TZ — не жди PO.

═══ ОЧЕРЕДЬ ═══
1. tasks/TZ-OPS-318-automated-backup-rotation.md — ротация бэкапов, только
   файлы deploy/synology/*. Установку cron на сам сервер — не делать без SSH
   и явного слова PO (см. СТОП внутри TZ), просто подготовь строку в доке.
2. tasks/TZ-OPS-319-local-pre-push-gate.md — новый .husky/pre-push. НЕ трогать
   .github/ вообще.

Больше в очереди этого чата ничего нет — TZ-OPS-317 (последний в общем плане)
возьмёт ДРУГОЙ чат, когда все claim'ы (включая этот) закроются.

═══ СТОП ═══
- Conflict keys пересеклись с чужим _active → DEFER, запись в _NOW.
- Gates FAIL после 2 попыток → archive .failed.md, не деплоить.

═══ DoD ═══
Таблица: ID | outcome | archive path | SHA | gates.
```
