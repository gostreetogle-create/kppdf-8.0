# PROMPT — Freebuff #2 · DOCSTUDIO S3 TEXT BLOCKS

## LOADER (вставить в чат Freebuff #2)

```text
Executor kppdf-8.0 · S3 SHELL WIRE (CRLF bypass)

GATE: nx build kppdf-web exit 0

1) git fetch origin ; git merge origin/main
2) Прочитай:
   - tasks/TZ-NX-DOCSTUDIO-S3-SHELL-WIRE.md   ← обход CRLF (главное)
   - tasks/TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS.md
   - tasks/_active/TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS.md
   - docs/TZ-NX-BUILD-INTEGRITY.md + GEMINI.md

НЕ патчить studio-shell.page.ts.
Создать studio-editor.page.ts + studio.routes.ts (:id → editor).
grep PiStudioBlocksService studio-editor.page.ts → MUST match.

Gates → evidence → archive S3 → push.
```

---

**Старт: ТОЛЬКО после archive REGISTRY + green nx build на main.**  
Полная инструкция — блок ниже.

```text
Ты — executor kppdf-8.0 (Freebuff #2). Репо: D:\kppdf-8.0, ветка main.
Волна: TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS

═══════════════════════════════════════════════════════════════
HARD GATE — ПЕРЕД ЛЮБЫМ КОДОМ (повторять пока не PASS)
═══════════════════════════════════════════════════════════════
1) git fetch origin ; git merge origin/main
2) ЕСЛИ существует tasks/_active/TZ-NX-REGISTRY-CRUD-UNIFY.md → STOP, жди, не кодь
3) cd frontend-nx && pnpm exec nx build kppdf-web → exit 0
   ИНАЧЕ STOP — REGISTRY не закрыт или build сломан; не начинай S3
4) tasks/_active/ пуст кроме твоего claim

Контракт: GEMINI.md + kppdf-executor-loop + docs/TZ-NX-BUILD-INTEGRITY.md
Спека: tasks/TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS.md
Карта модуля: docs/architecture/nx-doc-studio.md §6 S3
Legacy reference (read-only): frontend/src/app/pages/doc-constructor/studio/

═══════════════════════════════════════════════════════════════
CLAIM
═══════════════════════════════════════════════════════════════
1) tasks/_active/TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS.md
2) docs/agent-checklists/TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS.md по _TEMPLATE.md
3) agent_id: freebuff-docstudio-s3 ; claimed_at ISO-8601
4) Conflict: НЕ трогать pages/registries/**

═══════════════════════════════════════════════════════════════
ЗАДАНИЕ (по TZ, шаги 1→5)
═══════════════════════════════════════════════════════════════

1) data-access: PiStudioBlocksService + types + tests
   API: studio-documents/:id/blocks, template-blocks/:id, blocks/layouts

2) studio shell: загрузка/сохранение блоков, revision gate, 409 toast

3) canvas: text blocks на .studio-sheet — add, drag, resize, select
   stopPropagation на блоке (не ломать S2 collapse панели)

4) панели Слои + Свойства (lock, visible, z-order)

5) browser evidence:
   docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS/
   добавить блок → drag → F5 → блок на месте; 0 console errors
   S2 инварианты: sheet ratio, panel 480px, Δ reflow = 0

═══════════════════════════════════════════════════════════════
ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════
- backend/**, frontend/**, registries/**
- TipTap toolbar (S4), tables (S6), PDF (S8)
- any в компонентах, raw HttpClient в pages

═══════════════════════════════════════════════════════════════
GATES (nx build — ПОСЛЕДНИМ)
═══════════════════════════════════════════════════════════════
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx && pnpm test
cd frontend-nx && pnpm lint
pnpm architecture:check
cd frontend-nx && pnpm exec nx build kppdf-web
node start.mjs --nx --no-browser + smoke /studio/:id

Archive → commit/push своих путей → отчёт: archive path, SHA, evidence paths.
```
