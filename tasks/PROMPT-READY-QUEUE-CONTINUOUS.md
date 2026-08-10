# Промпт — READY-очередь сейчас (не останавливаясь)

**Для PO:** скопируй блок `text` ниже целиком в новый чат исполнителя (Buffy / Gemini / local).  
**Дата сверки:** 2026-08-10 вечер · после Basic Auth на VPS + закрытия TZD-38.

## Что уже DONE (не трогать / не переоткрывать)

| Волна | Статус |
|-------|--------|
| WAVE-MCP-GAP TZD-31→34 | DONE |
| WAVE-EXCEL-IMPORT-STUDIO TZD-36→38 (+ TZD-35 unparked) | DONE |
| WAVE-DICT-DEMO (PRODUCTS-310…UX-DIALOG-307) | DONE |
| WAVE-KP-USABLE (339→334→349→335→336) | DONE |
| TZ-OPS-309 deploy-prep | DONE |
| HTTP Basic Auth на VPS nginx | DONE (ops; пароль в gitignored `CREDENTIALS.md`) |

`tasks/_active/` пуст на старте. Desktop ZIP publish и `deploy.ps1` — **не** в этой очереди.

## Что реально доделывать сейчас (порядок)

1. **TZ-AUTH-301** — мягкий notice на `/login` (косметика; не compliance).  
2. **WAVE-KP-COMPLETE** — строго **340 → 341 → 345 → 343 → 344 → 342 → 346 → 347 → 348**.

После пустой очереди: короткий отчёт «готово предложить деплой / desktop publish» и **стоп**.  
Перед фактическим деплоем (когда PO скажет «деплой») агент **обязан** закрыть **TZ-OPS-310**, если нет archive — см. `tasks/_backlog/ops/PROMPT-OPS-310-HARDEN.md`.  
Деплой и ZIP **не** запускать из этой кодовой волны.

---

```text
Ты — непрерывный исполнитель kppdf-8.0.
Корень: D:\kppdf-8.0 · ветка main (не уводи работу в случайный freebuff).
Skills: .agents/skills/kppdf-executor-continuous/SKILL.md + GEMINI.md + OrchestratorKit/AGENTS.md
PO: docs/PO-DIARY.md §1–§4
Карта: docs/agent-checklists/_active-map.md · tasks/_backlog/QUEUE.md
Этот промпт: tasks/PROMPT-READY-QUEUE-CONTINUOUS.md

════════════════════════════════════════════════════════
ГЛАВНЫЕ ПРАВИЛА
════════════════════════════════════════════════════════
1) Mid-queue НЕ останавливайся ждать «ок / поехали / продолжай».
2) Цикл на каждой TZ: CLAIM (_active + checklist) → код → gates зоны → self-verify →
   archive + lock + remove _active → commit+push main → Checkpoint в _active-map → СРАЗУ next.
3) Commit+push на КАЖДОЙ закрытой TZ. Без push ≠ DONE.
4) Чужой WIP не свой — не затирай и не мешай в коммит.
5) НЕ выдумывай новые TZ из parked backlog.
6) deploy.ps1 / wipe / desktop ZIP publish — ЗАПРЕЩЕНЫ в этой сессии.
7) Не коммить: __pycache__/, tasks/Данные/, desktop/mcp-runtime/**, CREDENTIALS.md, config.env.
8) UI только на русском (лейблы/toast), кроме принятых кодов (RAL, Ø).

════════════════════════════════════════════════════════
СТАРТ (обязательно)
════════════════════════════════════════════════════════
git fetch origin
git checkout main
git pull --ff-only
# Если dirty не твой — не stash -u / не reset; отчитайся и работай только своими keys.

Прочитай:
- docs/agent-checklists/_active-map.md (верхние checkpoint)
- tasks/_active/ (должен быть пуст или только твой claim)
- tasks/PROMPT-READY-QUEUE-CONTINUOUS.md
- tasks/TZ-AUTH-301-login-private-system-notice.md
- tasks/_backlog/kp-vitrine/WAVE-KP-COMPLETE.md
- tasks/_backlog/kp-vitrine/PROMPT-KP-COMPLETE-CONTINUOUS.md
- docs/ops/home-host-access.md (Basic Auth уже включён — не трогай nginx/VPS)

Team Room если доступен:
  node OrchestratorKit/team-room/cli.mjs join
  node OrchestratorKit/team-room/cli.mjs inbox

Проверь DONE-факты (если чего-то нет — СТОП и доложи PO):
- tasks/_archive/2026-08/TZD-38.done.md
- tasks/_archive/2026-08/TZ-SALES-336.done.md
- tasks/_archive/2026-08/TZ-AUTH-301.done.md  ← ещё НЕТ, это первая работа

════════════════════════════════════════════════════════
ОЧЕРЕДЬ A — TZ-AUTH-301 (сначала, маленькая)
════════════════════════════════════════════════════════
Spec: tasks/TZ-AUTH-301-login-private-system-notice.md
Checklist: docs/agent-checklists/TZ-AUTH-301.md
Conflict keys: login.page.ts/.spec.ts · index.html · login.page.md · PAGE-TZ-INDEX.md

Смысл: мягкий notice «личный учебный проект» на /login + robots noindex.
ЗАПРЕЩЕНО в copy: организация*/корпоратив*/сотрудник*/«несанкционированный доступ запрещён»/угрозы/РКН.
Notice ≠ защита доступа (в page.md явно; ссылка на docs/ops/home-host-access.md ок).

Уже могут быть локальные правки page docs под AUTH-301 — доведи до AC, не дублируй.
Gates: frontend tsc app + pnpm test -- login.page
Closeout: archive TZ-AUTH-301.done.md + lock + commit+push → Checkpoint → сразу B.

════════════════════════════════════════════════════════
ОЧЕРЕДЬ B — WAVE-KP-COMPLETE (после AUTH-301)
════════════════════════════════════════════════════════
Канон: docs/audits/2026-08-09-kp-builder-completeness-audit.md
Wave: tasks/_backlog/kp-vitrine/WAVE-KP-COMPLETE.md
Промпт волны: tasks/_backlog/kp-vitrine/PROMPT-KP-COMPLETE-CONTINUOUS.md
Spec FROZEN: docs/ux/kp-create-studio-spec.md §0 — шелл 317 (rails|center A4, overlay) НЕ переписывать.

Порядок СТРОГИЙ (не параллелить 340/341):
  340 Состав → 341 коммерч.поля/НДС → 345 PDF/Печать/архив →
  343 Получатель → 344 Условия → 342 свои строки →
  346 многостраничность → 347 статус/версии → 348 витрина

На каждой TZ: читай файл TZ в tasks/_backlog/kp-vitrine/TZ-SALES-NNN-*.md + checklist
docs/agent-checklists/TZ-SALES-NNN.md (создай/заполни claim slot).

Visual gate = ты сам (браузер + тесты); evidence в checklist.
Не переоткрывать: 317 шелл · 319/321 превью · 323–328 · 307/330–332 таблицы · 333/339 Save.

BAN волны: почта клиенту · публичная ссылка · валюта · согласования/подписи ·
редактор вёрстки бланка в студии · скидки в каталоге · deploy · ZIP publish.

════════════════════════════════════════════════════════
СТОП (когда A+B закрыты)
════════════════════════════════════════════════════════
1) _active/ пуст; все TZ очереди в _archive/2026-08/*.done.md + locks.
2) Checkpoint в _active-map: DONE wave · NEXT idle · Deploy NO · ZIP NO.
3) Короткий отчёт PO:
   - что закрыто (AUTH-301 + SALES-340…348)
   - HEAD commit
   - «готово предложить warm deploy + desktop ZIP»
   - Напомни: перед деплоем нужен **TZ-OPS-310** (если ещё нет archive) — VPN OFF
   - НЕ запускай deploy.ps1 и НЕ публикуй ZIP
4) Idle.

Если блокер неснимаемый (нужен выбор PO / wipe / secrets) — один раз доложи и остановись.
Если чат оборвался — следующий агент с ЭТИМ ЖЕ промптом продолжает с Checkpoint / _active /.
```
