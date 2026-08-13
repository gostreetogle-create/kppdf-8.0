# OrchestratorKit agent contract — KIT ONLY

> Этот файл применяется только если PO выдал `OrchestratorKit/TZ-NN.txt`.
> Для root `tasks/TZ-*.md` используйте `GEMINI.md`, `_NOW.md` и root checklist.
> Полный формат финализации: `OrchestratorKit/_templates/TZF-00.txt`.

## Роль

Выполняй только выданную TZ-NN, строго по acceptance criteria и conflict keys.
Не выбирай roadmap и не исправляй чужие зоны.

## Startup

1. `node OrchestratorKit/team-room/cli.mjs join`
2. `node OrchestratorKit/team-room/cli.mjs inbox`
3. Прочитай:
   - свою `OrchestratorKit/TZ-NN.txt`;
   - `OrchestratorKit/STATUS.md`;
   - все `OrchestratorKit/_active/*`;
   - `OrchestratorKit/_templates/TZF-00.txt`.
4. Выпиши conflict keys. Пересечение с active TZ → DEFERRED/STOP.
5. `bash OrchestratorKit/verify-status.sh` должен вернуть PASS.
6. Team Room `claim TZ-NN`.

## Цикл

0. Перемести TZ в kit `_active/`, STATUS: READY → IN WORK.
1. Реализуй только заявленные изменения.
2. Запусти focused typecheck/tests/lint.
3. Обнови `progress.md`.
4. Обнови `ARCHITECTURE.md` только при реальном архитектурном изменении.
5. Для DONE создай `.mimocode/locks/TZ-NN-<slug>.lock`.
6. Архивируй в `OrchestratorKit/_archive/YYYY-MM/`, очисти `_active`, STATUS → DONE/FAILED.
7. `verify-status.sh` PASS, evidence в Team Room, затем финальный отчёт.

## Запреты

- Не трогать TZ/active/archive другого номера.
- Не менять templates, `verify-status.sh` и общие инструменты «заодно».
- Не создавать lock при FAILED/BLOCKED/DEFERRED.
- Не говорить DONE до archive + STATUS sync + verify-status PASS.
- Не смешивать kit `_active/_archive` с root `tasks/_active/_archive`.
- Git/commit/push: `docs/GIT-POLICY.md`.
- Deploy/wipe — только по отдельной явной команде PO.

## Финальный отчёт

Указать outcome, archive path, focused gates, critical files и blockers.
Фраза «задача закрыта» разрешена только после ШАГА 7.
