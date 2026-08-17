# PROMPT — доделать живую очередь по одной TZ до конца

Скопируй **весь блок `text` ниже** в Cursor Agent / Freebuff. Не дописывай историю.

Состояние на 2026-08-17: `_active/` в корне **пусто**. Уже DONE (не кодить):  
351/352/353, SALES-369, TZD-39, COMBINE-409…415. Warm deploy `61dd144e` уже был.

---

```text
Ты — непрерывный исполнитель kppdf-8.0. Репо: D:\kppdf-8.0 на main.
Skills: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
Канон: docs/PO-CANON.md
Карта: docs/agent-checklists/_NOW.md · tasks/_backlog/QUEUE.md
Этот файл: tasks/PROMPT-SEQUENTIAL-DRAIN-NOW.md

════════════════════════════════════════════════════════
WORKSPACE
════════════════════════════════════════════════════════
Get-Location · git rev-parse --show-toplevel · git branch --show-current
Разрешено: D:\kppdf-8.0 на main. .freebuff/worktrees запрещён.
git fetch origin && git checkout main && git pull --ff-only
Чужой dirty WIP (seed, data/paspots, product.service и т.п.) НЕ стейджить.

════════════════════════════════════════════════════════
ПРАВИЛА (жёстко)
════════════════════════════════════════════════════════
1) Одна TZ за раз. tasks/_active/ = 0 или 1 файл.
2) Закончил → archive `_archive/YYYY-MM/<ID>.done.md` + lock + checklist DONE
   + commit + push по docs/GIT-POLICY.md + одна строка в _NOW → ТОЛЬКО ПОТОМ next.
3) Перед стартом ID: если уже есть `_archive/**/<ID>.done.md` — НЕ кодить; skip.
4) Не спрашивай PO «ок / продолжать?». СТОП только: wipe, prod secrets, MCP offline,
   конфликт CONFLICT KEYS, развилка A/B в TZ.
5) Deploy / wipe / «кати» — ЗАПРЕЩЕНЫ в этом чате, пока PO не скажет отдельно.
6) `_park/**` НЕ ТРОГАТЬ.
7) Не изобретай новые TZ / WAVE «заодно».
8) Если AC уже на main — только closeout (archive+lock+_NOW), без лишнего кода.

════════════════════════════════════════════════════════
ОЧЕРЕДЬ (строго сверху вниз)
════════════════════════════════════════════════════════
Сначала осмотри tasks/_active/ в КОРНЕ репо (не worktrees).
Есть чужой claim → одна фраза PO, не воюй.
Пусто → бери первый НЕ-DONE пункт:

A) tasks/TZ-UX-371-orders-list-redesign.md
   FE: плоский expand заказа + semantic dark + ▸ gold.
   Gates: FE tsc + jest orders.page (и связанные).
   Если уже сделано на main без archive — closeout only.

B) tasks/_backlog/desktop/TZD-56-desktop-ai-runner-nsis-sidecar.md
   Sidecar/bundle ai-runner для NSIS. Dev `tauri dev` не ломать.
   Bump installer / deploy — НЕТ без «кати».

C) tasks/_backlog/desktop/TZD-47-mcp-photo-upload.md
   MCP upload photo → Photo + bind product. STOP если MCP/Desktop offline
   → напиши PO «подключи MCP», не имитируй загрузку.

D) tasks/_backlog/migrate-kp3/TZ-MIG-302-kp3-mcp-load.md
   Scope LOCK: categories → CP → products → quotations. БЕЗ photo/email/brand.
   MCP must ping. STOP если MCP down.

E) tasks/_backlog/migrate-kp3/TZ-MIG-306-fix-category-filter.md
   Только после 302 DONE (или skip если archive already).

F) tasks/_backlog/migrate-kp3/TZ-MIG-304-cp-email-via-person.md
   Только после 302 DONE.

G) tasks/_backlog/migrate-kp3/TZ-MIG-303-attach-kp3-photos.md
   Только после TZD-47 DONE + MIG-302 DONE.

После G: если все MIG живые закрыты — WAVE-KP3-DATA-MIGRATE → waves-done.

SKIP (уже DONE): PRODUCTION-351/352/353, SALES-369, TZD-39, COMBINE-409…415.

════════════════════════════════════════════════════════
ЦИКЛ ОДНОЙ TZ
════════════════════════════════════════════════════════
CLAIM (checklist + tasks/_active/) → код строго по AC →
gates из TZ → archive+lock → убрать _active → commit+push → _NOW → next.

BAN: секреты в git; «улучшить заодно»; правки Ганта/комбайна вне своей TZ.

════════════════════════════════════════════════════════
КОНЕЦ СЕССИИ
════════════════════════════════════════════════════════
Таблица: ID | outcome (DONE/SKIP/BLOCKED) | archive path | SHA
Если очередь кончилась или BLOCKED на MCP: _NOW idle, предложи деплой текстом,
deploy.ps1 НЕ запускай.
```
