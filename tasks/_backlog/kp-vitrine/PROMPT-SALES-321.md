# Промпт — TZ-SALES-321 (починить превью шаблона в Create КП)

Оркестратор: **319 visual FAIL**. Агент чинит фон, позиции (баг mongoose spread) и scale без скроллов.

Скопируй блок ниже:

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-SALES-321.md + checklist docs/agent-checklists/TZ-SALES-321.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) Чужие _active на proposal-create* / document-template.service → STOP
5) Team Room claim best-effort

Прочитай:
- docs/audits/2026-08-09-kp-create-template-preview-fidelity-fail.md
- tasks/_backlog/kp-vitrine/TZ-SALES-321-create-kp-preview-fidelity.md
- GEMINI.md + docs/PO-DIARY.md §1–§4

Суть (обязательно все три):
A) BE: в resolveBlockContent / resolveTableBlock НЕ делать { ...mongooseDoc }. Клонировать через toObject() (или pick с layout). Build HTML должен сохранять position:absolute из layout.
B) FE: A4 в center без H/V scroll — transform scale contain в sheet.
C) FE: фон /uploads виден в iframe (allow-same-origin без scripts ИЛИ absolute rewrite на API origin).

Желательно: empty table RU «Нет данных», не «Нет sample rows…».

Gates:
  cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
  cd backend && pnpm test -- --testPathPattern=document-templates-build
  cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
  cd frontend && pnpm test -- --testPathPattern=proposal-create

READY FOR REVIEW + Executor report. Archive только после Cursor/PO visual PASS
(шаблон с фоном + 4 блока ≈ как в builder). Заодно закрой TZ-SALES-319 если ещё в _active.
Deploy: НЕТ.
```
