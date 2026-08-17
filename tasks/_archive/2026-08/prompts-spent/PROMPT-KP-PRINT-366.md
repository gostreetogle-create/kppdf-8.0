# PROMPT — TZ-SALES-366 (браузерная «Печать» КП)

Скопируй блок **«Промпт»** целиком в чат исполнителя (Gemini / Buffy / Claude / local).  
Одна TZ → DONE → commit/push. Deploy **не** запускать.

---

## Промпт (копировать отсюда)

```text
Ты — исполнитель kppdf-8.0. Одна задача: TZ-SALES-366.
Корень: D:\kppdf-8.0 · ветка main · pnpm only.

Читай по порядку:
1. GEMINI.md
2. .agents/skills/kppdf-executor-continuous/SKILL.md
3. OrchestratorKit/AGENTS.md
4. docs/PO-DIARY.md §1–§4
5. tasks/_backlog/kp-vitrine/TZ-SALES-366-kp-browser-print-sandbox.md  ← вся спека и AC

════════════════════════════════════════════════════════
CLAIM (до любого кода)
════════════════════════════════════════════════════════
node OrchestratorKit/team-room/cli.mjs join
node OrchestratorKit/team-room/cli.mjs inbox
# claim TZ-SALES-366; проверь tasks/_active/ на пересечение CONFLICT KEYS

git fetch origin && git checkout main && git pull --ff-only

════════════════════════════════════════════════════════
ЦЕЛЬ
════════════════════════════════════════════════════════
«Скачать ▾ → Печать» должна открывать системный диалог печати.
Сейчас print() зовут внутри sandboxed A4 iframe → Chrome: Ignored call to 'print()'.
Плюс ViewChild #previewFrame видит только первый лист многостраничного КП.

PDF (puppeteer) и «Архив документов» УЖЕ DONE — не трогай.
Третий «серверный print» / unpark TZ-SALES-320 — ЗАПРЕЩЕНО.

════════════════════════════════════════════════════════
CONFLICT KEYS (только эти)
════════════════════════════════════════════════════════
frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts
frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.spec.ts  (создать если нет)
docs/pages/proposals-create.page.md

proposal-create.page.ts — НЕ править без крайней нужды (вызов templateCenter.printPreview() оставить).
Не трогать: quotation-output*, puppeteer, table-editor, Desktop, ruvector.db.

════════════════════════════════════════════════════════
ЧТО СДЕЛАТЬ
════════════════════════════════════════════════════════
1) Превью iframe оставить sandbox="allow-same-origin" БЕЗ allow-scripts (консоль Blocked script — шум, не чинить scripts).
2) printPreview(): собрать HTML ВСЕХ страниц превью → временное окно/iframe печати (parent-owned) → print() → убрать.
   Допустимо allow-modals только на ВРЕМЕННОМ кадре, не на ленте превью.
3) 2+ листа → одна Печать печатает все; пустое превью → без пустого диалога (toast уже на page).
4) Jest: print path существует; превью sandbox без allow-scripts.
5) page.md — одна честная строка про print вне sandbox-превью.

════════════════════════════════════════════════════════
GATES → CLOSEOUT
════════════════════════════════════════════════════════
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern="proposal-create-template-center|proposal-create.page" --no-coverage

Затем: archive tasks/_archive/2026-08/TZ-SALES-366.done.md + lock + checklist +
Checkpoint в docs/agent-checklists/_active-map.md + commit + push origin/main.

Deploy НЕ. Не жди «ок / поехали». Короткий отчёт PO: SHA + что починил.

НАЧИНАЙ с CLAIM. Поехали.
```

## Промпт (конец)

---

| Артефакт | Путь |
|----------|------|
| TZ | `tasks/_backlog/kp-vitrine/TZ-SALES-366-kp-browser-print-sandbox.md` |
| Параллель с KP-рефактором | да — ключи ≈ `template-center` only |
| Deploy | только по слову PO |
