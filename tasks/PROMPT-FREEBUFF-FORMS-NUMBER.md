# Промпт Freebuff — волна FORMS-NUMBER (до конца очереди)

Для PO: вставь **весь блок** `text` в **один** чат Freebuff. Не дописывай
«пройди всё приложение». Список файлов — в TZ. При обрыве: тот же блок +
`tasks/PROMPT-RESUME-ANY.md` («продолжи с первой незакрытой FORMS-*»).

Деплой этой волной **не** делать. После SHA на origin PO скажет «кати».

---

```text
Ты — непрерывный executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
Skills: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
Канон: docs/PO-CANON.md
Волна: tasks/_backlog/WAVE-FORMS-NUMBER.md
Этот промпт: tasks/PROMPT-FREEBUFF-FORMS-NUMBER.md

WORKSPACE GATE сразу: Get-Location · git rev-parse --show-toplevel · git branch --show-current
Работаешь только в D:\kppdf-8.0 на main. .freebuff/worktrees запрещён.

ГЛАВНОЕ
1) Не спрашивай PO «ок / продолжать?». Цикл: claim → код → gates → archive → commit+push → следующий TZ.
2) Один TZ в tasks/_active/. Conflict keys чужого _active → DEFER, не войнуй.
3) Не выдумывай новые TZ. Не трогай _park. Не включай enableImplicitConversion на весь ValidationPipe.
4) НЕ меняй app-pi-input CVA (он специально string). Coerce только на submit / @Type на DTO.
5) deploy.ps1 / wipe / «кати» — ЗАПРЕЩЕНЫ в этом чате.

БАГ (уже доказан на материалах)
app-pi-input type=number → form value string "500" → JSON "500" → @IsNumber() 400.
Эталон: TZ-MATERIALS-313 (e34b015d) и products asNumber.
Helper который создать в 314: frontend/src/app/shared/forms/to-optional-number.ts
  toOptionalNumber(v): number | undefined  — null/''/NaN → undefined (поле не класть)
  Пустая строка не слать как "".

ОЧЕРЕДЬ (строго по порядку; если archive уже .done.md — skip и дальше)
1) tasks/TZ-FORMS-314.md
2) tasks/TZ-FORMS-315.md
3) tasks/TZ-FORMS-316.md
4) tasks/TZ-FORMS-317.md

На каждый TZ:
- Прочитай TZ целиком. CONFLICT KEYS — только эти файлы (+ новый spec, если TZ велит).
- Claim: скопируй TZ в tasks/_active/, checklist docs/agent-checklists/<ID>.md
- Сделай ШАГИ 1:1. Тесты из блока VERIFICATION. Не полный ng build / не весь jest.
- Closeout по GEMINI.md: archive tasks/_archive/2026-08/<ID>.done.md, lock, _NOW одна строка, commit+push только своих путей.
- Потом следующий номер. Не останавливайся, пока 314–317 не в archive.

СТОП если: красные gates в зоне TZ после одной правки; нужен файл вне CONFLICT KEYS; prod/deploy.
Тогда BLOCKED в отчёте, не выдумывай обход.

DoD сессии: 314–317 DONE или честный BLOCKED. Таблица ID | SHA | archive. Deploy нет.
```
