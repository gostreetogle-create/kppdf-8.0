# TZ-PARTY-302 checklist

> Status: **DONE** · Wave: PARTY-DOCS #2 · Depends: PARTY-301 DONE
> Source: `tasks/_archive/2026-08/TZ-PARTY-302.done.md`

## Claim slot
- agent_id: agent-3e757640b7 (Cursor executor, this chat)
- claimed_at: 2026-08-08T19:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — registry syncs only `tasks/*.md`

## Acceptance
- [x] Org FullEditor kind C 1120 (секции Основные / Реквизиты / Банк / Подписант / Паспорт ИП)
- [x] Schema-поля сохраняются (банк, ОГРН/ОГРНИП, signer, legalType, сроки/НДС, паспорт ИП)
- [x] `isOurCompany` редактируется в диалоге + бейдж «наша фирма» в списке; `GET /organizations/current`
      доступен через `OrganizationsService.findCurrent()`
- [x] `docs/pages/organizations.page.md` + `PAGE-TZ-INDEX` обновлены
- [x] Photos typed roles — НЕ сделано намеренно (→ ASSETS-301)

## Gates
- [x] `cd frontend && pnpm run typecheck` — PASS
- [x] `cd frontend && pnpm run build:dev` — PASS (template typecheck; ловил `type="date"` вне `PiInputType`)
- [x] `cd frontend && pnpm exec jest --runTestsByPath organizations/*` — PASS (13 tests)
- [x] `cd frontend && pnpm exec eslint src/app/pages/organizations …` — 0 errors
- [x] `git diff --check` — PASS

## Closeout
- [x] Archive `tasks/_archive/2026-08/TZ-PARTY-302.done.md` + lock + progress
- [x] Commit + push `origin/main`; deploy NO

## Evidence
- `frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts` — kind C shell,
  5 секций, паспорт ИП под условием `legalType = ip`, payload без пустых строк
  (`forbidNonWhitelisted` на API).
- `organizations.page.ts` — create и edit ведут в **один** FullEditor; бейдж «наша фирма» на колонке
  названия; старый узкий `organization-form-dialog.component.ts` удалён (не два write-path).
- `organization-full-editor-dialog.component.spec.ts` — prefill всех реквизитов, PATCH с банком/
  подписантом/`isOurCompany`, паспорт только для ИП, пустые поля не отправляются.

## known_limitation
- Логотип / печать / фото — типизированное хранилище в `TZ-ORG-ASSETS-301`; `photoIds` в диалоге не трогаем.
- ИНН-lookup (DaData/ФНС) — `TZ-INN-301` PARKED.
- `contactPersonId` пока не выбирается в диалоге (нужен people-picker) — отдельный тонкий TZ.
- Клиентская сортировка списка по-прежнему только по текущей странице (backend без `sortBy`).
