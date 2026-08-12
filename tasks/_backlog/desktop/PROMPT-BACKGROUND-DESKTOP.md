# PROMPT — фоновый агент (пока PO рефакторит КП)

Скопируй блок ниже **другому** ИИ (не тому, кто трогает Create КП).  
Цель: полезная работа **без** CONFLICT KEYS на `proposal-create*` / `proposals.page*`.  
Deploy — **не** запускать (это делает PO / основной поток).

---

## Промпт (копировать)

```text
Ты — фоновый исполнитель kppdf-8.0. PO сейчас рефакторит Create КП в другом чате.
Корень: D:\kppdf-8.0 · ветка main · pnpm only.

Читай: GEMINI.md · kppdf-executor-continuous · OrchestratorKit/AGENTS.md · docs/PO-DIARY.md §1–§4
Правда: docs/agent-checklists/_active-map.md · git status · tasks/_active/

════════════════════════════════════════════════════════
ЖЁСТКИЙ BAN (чтобы не врезаться в основной поток)
════════════════════════════════════════════════════════
НЕ ТРОГАТЬ никогда в этой сессии:
• frontend/.../proposal-create*
• frontend/.../proposals.page*
• backend/.../quotation* (кроме явного read-only grep)
• backend/.../document-template* / table-template* (build КП)
• deploy.ps1 / wipe / секреты
• ruvector.db

Если git status показывает чужой dirty на этих путях — не revert, не commit чужое.

════════════════════════════════════════════════════════
ОЧЕРЕДЬ (строго по порядку, stop только на блокере)
════════════════════════════════════════════════════════

### 0) Диагностика (≤3 мин)
git fetch && git checkout main && git pull --ff-only
git status --short
Если dirty ТОЛЬКО desktop/** (+ .gitignore) — это твой кандидат на шаг 1.
Если dirty смешан с KP — отчитайся и бери только desktop файлы в коммит.

### 1) Desktop WIP → main (если есть)
Локально часто лежит незакоммиченный Desktop:
  desktop/src/App.svelte, desktop/src/core/mcpHost.ts, package/tauri version bumps…
1. Понять diff (не коммить мусор / секреты).
2. Gates: cd desktop && pnpm exec tsc --noEmit (или как принято в desktop/package.json)
   cd desktop/mcp && pnpm test  (если трогал mcp)
3. Commit conventional + push origin/main.
4. Checkpoint в _active-map: Desktop WIP landed · HEAD sha.

Если WIP пуст / бессмысленен — skip с одной строкой в Checkpoint.

### 2) TZD-40 — Desktop version gate
Файл: tasks/_backlog/desktop/TZD-40-desktop-version-gate.md
CONFLICT KEYS — только desktop + desktop pairing FE + backend desktop module (см. TZ).
AC из файла. Claim → code → gates → archive → commit+push → Checkpoint.

### 3) TZD-45 — MCP production/supply READ (если 40 DONE)
Файл: tasks/_backlog/desktop/TZD-45-mcp-production-supply-read.md
Сначала inventory живых Nest routes (не invent API).
Только read (+ опционально draft write с userOk, если TZ разрешает).
Gates: desktop/mcp tests + tsc. Archive → push → Checkpoint.

### 4) Если 40 и 45 закрыты — IDLE
Не выдумывай z-series / производство UI / склад 304.
Checkpoint: NEXT idle · «фоновый агент свободен» · Deploy НЕ.
Короткий отчёт PO: таблица TZ | SHA | что можно дать следующему.

════════════════════════════════════════════════════════
ГИГИЕНА КОНТЕКСТА
════════════════════════════════════════════════════════
После каждой ступени: commit+push + Checkpoint ≤8 строк в чат.
Не читай proposal-create. Не тащи весь MCP.md в ответ.
Обрыв → тот же промпт + Checkpoint.

Team Room: join/inbox; claim своей TZ; не claim KP.

НАЧИНАЙ с шага 0. Поехали.
```

## Промпт (конец)

---

## Почему это безопасно рядом с рефактором КП

| Поток | Зона | Конфликт с КП? |
|-------|------|----------------|
| Desktop WIP + TZD-40 | `desktop/**`, pairing dialog, `backend/.../desktop` | Нет |
| TZD-45 MCP read | `desktop/mcp/**` | Нет |
| Create КП refactor | `proposal-create*`, quotation build | — основной поток |

## Не давать фону без отдельной TZ от архитектора

- z-series inventory/production cockpit  
- warehouse 304  
- любые правки Create КП «для тестов»  
- auto-deploy
