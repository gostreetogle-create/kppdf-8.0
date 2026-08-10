# Промпт — продолжить WAVE-KP-USABLE после обрыва агента (2026-08-09)

Агента прервал внутренний лимит шагов, **не** ошибка проекта. Работа 339 + 334 сделана,
но лежит **в отдельной ветке**, а не на `main` — в браузере у PO её нет.

**Факты на момент обрыва (проверено `git`):**
- Ветка `freebuff/kppdf-8-0-d-kppdf-8-0-944f2711-4373-48e2-95e9-13e5d261aa24`,
  запушена в origin как своя ветка. HEAD `fa14bcec`.
  - `e183a663` — closeout 339 (archive + lock + progress + удаление `_active`)
  - `fa14bcec` — 334 клиент: `proposal-create-inspector.component.ts`,
    `proposal-create.page.ts`, spec, archive + lock
- На `main` (`65ca786b`): `tasks/_active/TZ-SALES-339.md` **всё ещё лежит**,
  архивов 339/334 нет, кода клиента нет. Фича-коммит 339 `8a3186f1` на main был раньше.
- Ветка отстала от `main` на 3 коммита: `0086eaa5`, `e73a7a74` (ADMIN-303),
  `65ca786b` (аудит полноты КП + WAVE-KP-COMPLETE).
- 335: кода нет; изменён только `docs/agent-checklists/TZ-SALES-335.md`
  и создан untracked `tasks/_active/` маркер в worktree.
- Найдено при browser-проверке и **нигде не записано в git**: старый уникальный индекс
  в коллекции `quotations` блокировал создание новых черновиков; агент почистил только
  локальную тестовую базу. Заведено как **TZ-SALES-349**.

```text
Ты — непрерывный исполнитель kppdf-8.0. Рабочая копия: D:\kppdf-8.0, ветка main.
Skills: .agents/skills/kppdf-executor-continuous/SKILL.md + GEMINI.md + OrchestratorKit/AGENTS.md
Wave: tasks/_backlog/kp-vitrine/WAVE-KP-USABLE.md
Канон: docs/audits/2026-08-09-kp-usable-gap-map.md · PO: docs/PO-DIARY.md §1–§4
Deploy НЕ запускать. Не начинать заново то, что уже сделано.

ВАЖНО: работай в канонической копии D:\kppdf-8.0 на main.
НЕ создавай новые worktree в .freebuff — из-за этого 339/334 не доехали до main.

════════════════════════════════════════════════════════
ШАГ 0 — приземлить готовое на main (первым делом)
════════════════════════════════════════════════════════
1) git fetch --all
2) В канонической копии на main:
   git merge --no-ff freebuff/kppdf-8-0-d-kppdf-8-0-944f2711-4373-48e2-95e9-13e5d261aa24
3) Ожидаемые конфликты — только в документах, разрешать СЛИЯНИЕМ, не выбором одной стороны:
   - docs/agent-checklists/_active-map.md — оставить И checkpoint'ы 339/334 агента,
     И checkpoint WAVE-KP-COMPLETE READY.
   - progress.md — оставить обе записи.
   - docs/pages/proposals-create.page.md — РЕГРЕССИЯ в ветке: строка про 334 заменила
     строку про 339. Должны присутствовать ОБЕ: и 339 (Сохранить/автосохранение/F5),
     и 334 (клиент = все Counterparty), и блок «Дальше» про WAVE-KP-COMPLETE.
4) НЕ откатывать ADMIN-303: backend/src/common/guards/system-role.guard*,
   backend/src/modules/admin/roles-admin.controller.ts, frontend admin/roles-admin*,
   docs/pages/admin-roles.page.md, tasks/_archive/2026-08/TZ-ADMIN-303.done.md —
   на main они актуальнее, чем в ветке. После merge проверь: git log --oneline -1 e73a7a74 виден в истории,
   а файлы ADMIN-303 не вернулись к старому виду.
5) Прогнать на слитом main: frontend tsc + pnpm test -- proposal-create + backend tsc;
   Prettier/diff-check. Всё PASS → commit merge → push origin main.
6) Проверить факт: tasks/_active/ пуст; tasks/_archive/2026-08/TZ-SALES-339.done.md
   и TZ-SALES-334.done.md на месте; на /proposals/create «Клиент» — рабочий список,
   а не заглушка.

════════════════════════════════════════════════════════
ШАГ 1 — TZ-SALES-349 (тонкая, до 335)
════════════════════════════════════════════════════════
tasks/_backlog/kp-vitrine/TZ-SALES-349-quotation-legacy-index-hygiene.md
Причина: ты сам напоролся на дубликат-ключ при создании черновика и починил только
локальную базу. На стенде autoIndex выключен, значит там та же мина.
Self-verify: создать КП → удалить → создать снова (несколько раз подряд) без 500/E11000.

════════════════════════════════════════════════════════
ШАГ 2 — доделать волну
════════════════════════════════════════════════════════
TZ-SALES-335 — tasks/_backlog/kp-vitrine/TZ-SALES-335-kp-line-items-columns-photo.md
  Кол-во/цена/сумма на экземпляре таблицы + правка qty + photoUrl в колонке «Рисунок».
  Учти: checklist 335 в ветке уже частично заполнен — перечитай и продолжи, не переписывай.
TZ-SALES-336 — tasks/_backlog/kp-vitrine/TZ-SALES-336-kp-lock-paid-copy.md
  Замок бланка / «Оплачена» hard-lock / копировать КП.

Затем ВОЛНА DONE: WAVE-KP-USABLE.md → STATUS DONE + таблица SHA;
checkpoint в _active-map; отчёт PO. Следующая волна WAVE-KP-COMPLETE (340–348)
начинается только по отдельной команде PO.

На каждой TZ: CLAIM (_active + checklist) до кода → AC → gates зоны → self-verify в браузере
→ Executor report → archive + lock + remove _active → commit + push → checkpoint → next.
Не останавливаться mid-queue ради «ок» от человека. Deploy НЕ запускать.
```
