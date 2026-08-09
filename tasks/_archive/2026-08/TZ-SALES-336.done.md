# TZ-SALES-336 — DONE

- closed_at: `2026-08-09T19:44:49Z`
- agent: `buffy`
- workspace: `D:\kppdf-8.0`
- status: DONE
- scope: `accepted` = «Оплачена» hard-lock, saved template snapshot source while locked, unlock to draft, and duplicate-to-new-draft.

## Acceptance evidence

- Create КП autosaved one draft with template and firm; UI showed «Сохранено».
- «Отметить как «Оплачена»» returned HTTP 200 and showed «Оплачена · бланк заблокирован»; product rail, quantity, firm/client and table/template controls were disabled.
- «Снять «Оплачена»» returned HTTP 200 and restored editable controls.
- Accepted reopen path uses saved `templateSnapshot.html` and skips live template build; focused regression covers this.
- `Сделки → КП → Копировать` returned HTTP 201 and opened `/proposals/create?id=…` as a new draft with Russian toast «Создана копия …».

## Gates

- frontend tsc PASS
- backend tsc PASS
- focused proposal/Create + proposals Jest: 44/44 PASS
- focused quotation service Jest: 27/27 PASS
- frontend ESLint PASS
- Prettier PASS
- diff-check PASS
- Deploy: NO

## Files

- feature: quotation accepted hard-lock; Create UI lock/unlock and snapshot resume; product/table guards; list copy action; focused tests and page docs.
- closeout: checklist, archive, lock, progress, active-map.
- foreign DOC-343/344 and `system-role.guard*`/`roles-admin*` WIP excluded.
