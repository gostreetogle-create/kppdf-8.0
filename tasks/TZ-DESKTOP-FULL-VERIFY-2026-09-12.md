# TZ-DESKTOP-FULL-VERIFY-2026-09-12: полная проверка desktop после PO-SWEEP

**РОЛЬ АГЕНТА:** Executor — claude  
**ЗАВИСИМОСТИ:** WAVE-NX-PO-SWEEP COMPLETE `41c758d0`; AI-IMPORT-BASELINE COMPLETE  
**LAYER:** 0–2 (desktop) · **SIZE:** M  
**PAGES:** N/A (desktop companion)  

**CONFLICT KEYS:**  
`desktop/**` только если мини-фикс красных gates (в scope verify);  
`docs/audits/2026-09-12-desktop-full-verify.md` (create);  
`docs/agent-checklists/DESKTOP-VERIFY-2026-09-12.md` (checklist);  
`docs/agent-checklists/DEPLOY-READY.md` — только поле `desktop_zip` / note;  
`docs/agent-checklists/_NOW.md` ; STREAM-QUEUE

### Preflight Check Output
- **Context read:** `desktop/package.json` scripts; WAVE-DESKTOP-AI-IMPORT-BASELINE DONE; DEPLOY-NX-PROD; GIT-POLICY
- **Key Constraints:** проверка ≠ publish installer ≠ deploy; Soup PARK; wipe NO
- **Planned Deliverable:** green gates evidence + audit + обновлённый desktop_zip статус в DEPLOY-READY
- **Validation Path:** typecheck/check/tests/build/mcp; optional live smoke vs :3000

**Проверено:** PO запросил полную проверку desktop после web PO-sweep; деплой отдельно.

---

## ЧТО ДЕЛАТЬ

### ШАГ 0 — Baseline
`git status` / branch main; `_active` пуст или свой claim only.  
Claim: `tasks/_active/TZ-DESKTOP-FULL-VERIFY-2026-09-12.md`.

### ШАГ 1 — Gates (обязательно, все)
```
cd desktop
pnpm run typecheck
pnpm run check
npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts
pnpm run build
pnpm run mcp:check
```
Красное в scope desktop → мини-фикс + re-run. Красное вне desktop / нужен wipe → DEFERRED_TZ / BLOCKED.

### ШАГ 2 — Контракт с NX backend (если :3000 жив)
- Health `GET http://127.0.0.1:3000/api/health`
- Если desktop умеет pairing/ping — smoke documented path (AI providers ping / known desktop health). Без Ollama: честно SKIP live model, не FAIL.
- Excel importers: unit tests уже в шаге 1; live Excel file — только если fixture есть в repo (не invent PII).

### ШАГ 3 — Installer / downloads
- Проверь `backend`/`downloads` путь к `kppdf-desktop-setup.zip` (как в TZD-75): есть ли файл, отвечает ли HEAD/GET через backend static если сервер up.
- **Не** `pnpm run release-installer` / tauri build release без отдельной команды PO.
- В `DEPLOY-READY.md`: `desktop_zip: accept-stale` **или** `fresh` + note SHA/time; если zip отсутствует — отметить gap, не блокируй verify gates.

### ШАГ 4 — Evidence
Создай `docs/audits/2026-09-12-desktop-full-verify.md`: таблица команд → PASS/FAIL/SKIP + counts.  
Checklist `docs/agent-checklists/DESKTOP-VERIFY-2026-09-12.md` все `[x]`.

### ШАГ 5 — Closeout
Archive TZ; `_NOW` IDLE или NEXT=deploy-prep если PO уже просил; commit+push; Executor report.

## НЕ ИЗМЕНЯТЬ

`soup train`; wipe; `deploy.ps1`; NX product pages; orphan photo wipe; publish installer без PO.

## КРИТЕРИИ ПРИЁМКИ

1. Все команды шага 1 PASS (или documented baseline debt с PO-visible note).  
2. Audit + checklist заполнены.  
3. DEPLOY-READY desktop поле обновлено.  
4. Нет release-installer / deploy.
