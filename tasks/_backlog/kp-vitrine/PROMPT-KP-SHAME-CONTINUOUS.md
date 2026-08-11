# Промпт — WAVE-KP-SHAME-POLISH (Create КП: стыд на показе)

Скопируй агенту **целиком**. Workspace = `D:\kppdf-8.0` (не freebuff).  
Deploy не запускать. Не ждать «ок / поехали».

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · ветка main.
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
HARD GATE WORKSPACE
════════════════════════════════════════════════════════
Get-Location + git rev-parse --show-toplevel → оба D:\kppdf-8.0
Если tools в .freebuff\worktrees — СТОП, доложи PO.

════════════════════════════════════════════════════════
ПРАВИЛА
════════════════════════════════════════════════════════
1) Не стоп mid-queue на «поехали». Visual gate = ты сам.
2) Порядок: 350 → 351 → 352 → 353 → 354. Не параллелить.
3) CLAIM (_active + checklist) → AC → gates → archive+lock → commit+push → Checkpoint → next.
4) UI русский, словами экрана. Эталон статусов = Create КП 347 (accepted = «Принято»).
5) BAN: почта клиенту, публичная ссылка, валюта, редактор бланка, скидки в каталоге,
   park цех/склад/Desktop, deploy, перепись шелла 317.
6) Не переоткрывать бизнес-фичи 340–348 — только стыд/регрессии.

════════════════════════════════════════════════════════
СТАРТ
════════════════════════════════════════════════════════
git fetch && git checkout main && git pull --ff-only
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
```
