# PROMPT — Freebuff агент 2 (параллель, не пересекается с агентом 1)

> Агент 1 уже делает `PROMPT-FREEBUFF-WAVE-2026-08-22.md`
> (OPS-320, DESK-418, SALES-381, UI-407, UI-408).
> Эти 4 TZ **другие файлы**. Deploy / wipe — запрещены. Push — можно.
> Режим: **Medium**.

**PO:** новый чат Freebuff, скопируй блок ниже целиком.

---

```text
Ты — executor kppdf-8.0, агент 2. Репо: D:\kppdf-8.0
Прочитай: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + этот файл.

Параллельно агент 1 работает по tasks/PROMPT-FREEBUFF-WAVE-2026-08-22.md.
НЕ ТРОГАТЬ его зоны:
- tasks/TZ-OPS-320*, TZ-DESK-418*, TZ-SALES-381*, TZ-UI-407*, TZ-UI-408*
- manager-desk.page.ts / .spec / manager-desk.page.md
- document-template.service.ts / continuation.spec.ts
- products.page.ts, modules.page.ts, materials.page.ts
- frontend/src/app/pages/admin/device-*-dialog, owner-device-invite, reset-password, user-form-dialog, role-form-dialog
- git mv spent PROMPT/TZ из корня tasks/ (это OPS-320)

Deploy / wipe — ЗАПРЕЩЕНЫ. Push — можно. .github/ не трогать.

Перед КАЖДЫМ TZ: git fetch origin && git merge origin/main
(агент 1 пушит в main). Конфликт в _NOW.md / PAGE-TZ-INDEX.md / progress.md:
оставь чужие строки, добавь свою; не revert чужой волны.

CLAIM первым (до кода), на каждый TZ:
1) Get-Location + git rev-parse → D:\kppdf-8.0 (не .freebuff/worktrees)
2) TZ → tasks/_active/<ID>.md; checklist _TEMPLATE.md
3) Claim slot: agent_id=freebuff-2, claimed_at ISO, workspace
4) Чужой _active на ТЕ ЖЕ conflict keys → этот TZ DEFER, следующий
5) Team Room claim best-effort

Цикл: CLAIM → код по Scope → gates → archive 2026-08/<ID>.done.md + lock
+ commit + push (только свои пути, не git add -A) → одна строка _NOW → следующий TZ.

ОЧЕРЕДЬ:
1. tasks/TZ-TEST-420-fix-preexisting-fe-jest.md
2. tasks/TZ-UI-409-list-pages-micro-type.md
3. tasks/TZ-UI-410-notification-badge-type.md
4. tasks/TZ-UI-411-color-hex-type.md

СТОП: gates FAIL ×2 → .failed.md, дальше. Файл вне KEYS → не трогай.

DoD: таблица ID | outcome | archive | SHA | gates. Без деплоя.
```
