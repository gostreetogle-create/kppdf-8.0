# Resume — TZ-SALES-342 (после обрыва по лимиту шагов)

Предыдущий агент остановился из‑за **лимита последовательных ответов**, не из‑за блокера проекта.  
SALES-344 DONE на `origin/main`. Claim `tasks/_active/TZ-SALES-342.md` жив.

**Важно при сверке 2026-08-11:** в working tree **нет** незакоммиченного кода 342 (только claim + checklist).  
Не ищи «полуготовые» product-файлы — **продолжай реализацию с claim**, не переоткрывай 340–345.

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · main.
Skills: .agents/skills/kppdf-executor-continuous/SKILL.md + GEMINI.md
PO: docs/PO-DIARY.md §1–§4
Карта: docs/agent-checklists/_active-map.md

RESUME (не начинай волну с нуля):
1) git fetch && git checkout main && git pull --ff-only
2) Убедись: tasks/_archive/2026-08/TZ-SALES-344.done.md есть; tasks/_active/TZ-SALES-342.md есть
3) Прочитай:
   - tasks/_active/TZ-SALES-342.md
   - docs/agent-checklists/TZ-SALES-342.md
   - tasks/_backlog/kp-vitrine/TZ-SALES-342-kp-custom-lines.md
   - tasks/_backlog/kp-vitrine/WAVE-KP-COMPLETE.md
4) git status — если нет WIP по conflict keys 342, реализуй TZ с нуля кода (claim уже есть)
5) Доведи AC 342 → gates FE/BE → self-verify → archive + lock → remove _active → commit+push
6) Checkpoint → сразу NEXT: 346 → 347 → 348 (тот же continuous стиль; не жди «поехали»)
7) BAN: deploy.ps1, ZIP, OPS-310 сейчас, shell 317 rewrite, чужой WIP

Если чат снова упрётся в лимит шагов — остановись ПОСЛЕ commit+push текущего куска (или хотя бы после зелёных gates + partial commit), обнови Checkpoint, оставь _active на незакрытой TZ.
```
