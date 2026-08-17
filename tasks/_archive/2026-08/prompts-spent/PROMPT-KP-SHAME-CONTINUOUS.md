# Промпт — WAVE-KP-SHAME-POLISH (Create КП: стыд на показе)

**Для PO:** можно **Freebuff** или Cursor Agent.  
Скопируй блок `text` **целиком** в чат исполнителя.

Почему раньше «нельзя было»: Freebuff часто сидит в `.freebuff\worktrees\…` и **не пушит в `main`**.  
Сейчас это **разрешено**, но DONE = коммит **на `origin/main`**, не только в worktree.

Deploy не запускать. Не ждать «ок / поехали».

```text
Ты — непрерывный исполнитель kppdf-8.0.
Skills: .agents/skills/kppdf-executor-continuous/SKILL.md + GEMINI.md + OrchestratorKit/AGENTS.md
PO-канон: docs/PO-DIARY.md §1–§4
Wave: tasks/_backlog/kp-vitrine/WAVE-KP-SHAME-POLISH.md
Промпт: tasks/_backlog/kp-vitrine/PROMPT-KP-SHAME-CONTINUOUS.md
Карта: docs/agent-checklists/_active-map.md · tasks/_backlog/QUEUE.md
Spec FROZEN: docs/ux/kp-create-studio-spec.md §0 — шелл 317 не переписывать.
Deploy / wipe НЕ. Новые TZ вне очереди не выдумывать.

По-человечески: дожми Create КП после 348 — только стыд на показе коллегам
(RU, empty, мёртвые клики, F5), без новых фич.

════════════════════════════════════════════════════════
WORKSPACE GATE (Freebuff OK)
════════════════════════════════════════════════════════
Сразу:
  Get-Location
  git rev-parse --show-toplevel
  git branch --show-current
  git remote -v

Разрешено:
  A) Канон D:\kppdf-8.0 на main — идеально.
  B) Worktree под .freebuff\worktrees\… — тоже OK для правок.

Обязательно при B (freebuff worktree):
  1) Пиши код в ЭТОМ worktree (tools привязаны сюда — нормально).
  2) Перед каждой закрытой TZ: commit в worktree.
  3) Доставь на origin/main (выбери работающий путь):
     - git push -u origin HEAD  &&  (из канона D:\kppdf-8.0) merge --ff-only / merge ветки → push main
     ИЛИ cherry-pick / PR merge в main, пока git log origin/main не покажет твой SHA.
  4) Без SHA на origin/main → TZ НЕ DONE. Не ври в отчёте.
  5) Claim/checklist/_active-map тоже должны оказаться на origin/main.

СТОП только если: нельзя ни писать в worktree, ни доставить в origin/main.

════════════════════════════════════════════════════════
ПРАВИЛА
════════════════════════════════════════════════════════
1) Не стоп mid-queue на «поехали». Visual gate = ты сам.
2) Порядок: 350 → 351 → 352 → 353 → 354. Не параллелить.
3) CLAIM (_active + checklist) → AC → gates → archive+lock → commit+push(→main) → Checkpoint → next.
4) UI русский, словами экрана. Эталон статусов = Create КП 347 (accepted = «Принято»).
5) BAN: почта клиенту, публичная ссылка, валюта, редактор бланка, скидки в каталоге,
   park цех/склад/Desktop, deploy, перепись шелла 317.
6) Не переоткрывать бизнес-фичи 340–348 — только стыд/регрессии.

════════════════════════════════════════════════════════
СТАРТ
════════════════════════════════════════════════════════
git fetch origin
Если на каноне D:\kppdf-8.0: git checkout main && git pull --ff-only
Если в freebuff worktree: git fetch origin; базово от origin/main (rebase/merge по нужде); не теряй чужой WIP.
Прочитай WAVE-KP-SHAME-POLISH.md + верх _active-map + tasks/_active/
Если _active пуст — CLAIM TZ-SALES-350 (spec + checklist).
Team Room join/inbox если доступен (не блокер).

════════════════════════════════════════════════════════
ОЧЕРЕДЬ
════════════════════════════════════════════════════════
A) TZ-SALES-350 — журнал Все КП: статусы RU = студия, empty, chrome
B) TZ-SALES-351 — витрина 348 краевые кейсы
C) TZ-SALES-352 — состав / условия / статус chrome
D) TZ-SALES-353 — превью A4 / F5 / страницы
E) TZ-SALES-354 — self-pass менеджера → WAVE DONE

Gates типичные: frontend tsc; jest proposals.page | proposal-product-rail | proposal-create;
Prettier/ESLint/diff-check. Browser если стек есть; иначе DOM/component self-check + честно в checklist.

После 354: Checkpoint idle · «готово предложить деплой» · НЕ запускай deploy.ps1.
В финале каждой TZ укажи SHA на origin/main.
```
