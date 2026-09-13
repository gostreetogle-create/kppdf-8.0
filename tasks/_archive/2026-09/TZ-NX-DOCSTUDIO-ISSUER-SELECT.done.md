> **STATUS: DONE** — 2026-09-13. Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-ISSUER-SELECT.md`. Evidence: `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-ISSUER-SELECT.txt`. Wave: `docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` (2.5, WAVE2_DONE).

# TZ-NX-DOCSTUDIO-ISSUER-SELECT: выбрать «Исполнитель» (наша фирма) в Данные → Ещё

> **SIZE:** S · **PACK:** single  
> **РОЛЬ:** Claude / Freebuff  
> **LAYER:** 3  
> **SUPERSEDES:** `TZ-NX-DOCSTUDIO-ISSUER-HINT.md` (только hint недостаточен — PO нужен **select**)

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.spec.ts; backend/src/modules/studio-document/dto/update-studio-document.dto.ts; backend/src/modules/studio-document/studio-document.service.ts; backend/src/modules/studio-document/studio-document.service.spec.ts; docs/pages/document-studio.page.md`

(+ при починке мёртвого nav: `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` **или** route `/organizations` — выбрать минимальный путь в ШАГ 0)

**PAGES:** `/studio/:id` → Данные → Ещё  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  
**PO:** нет кнопки «Наши организации» в UI; read-only «Исполнитель» непонятен; при нескольких фирмах нужен выбор **в данных документа**.

IMPLICIT CONFLICT: nx build kppdf-web

---

## Domain preflight

- **Имена:** Исполнитель / наша фирма = **`Organization`**, не Counterparty (Поставщик/Клиент).
- **Проверено:** UI `studio-issuer-readonly` ← `document.organizationId` → `PiOrganizationsService.getById`. PATCH DTO **не** принимает `organizationId` (create — только с JWT). `assertSameScope` режет чужой org.  
- **Nav:** в `nav-categories` есть `/organizations`, но **отдельного NX route нет** → пункт выкидывается фильтром `existingPaths`. Карточки фирм живут в **Реестры → Организации** (`organizations.registry`). Отсюда «нету кнопки».  
- **Список org:** `OrganizationService.findAll` при `user.organizationId` отдаёт **только свою** (single-org policy); admin/bootstrap без binding — полный список.  
- **Necessity:** select в Ещё = операторский путь; отдельно починить discoverability карточек фирм.

## ИСХОДНОЕ

1. Ещё: Поставщик = select; Исполнитель = текст.  
2. Смена фирмы на документе через API сейчас невозможна.  
3. Админ→«Наши организации» в NX — мёртвая ссылка (нет route).

## ЧТО ДЕЛАТЬ

**ШАГ 0 — Evidence.** Сколько Organization в стенде PO; JWT `organizationId` admin vs manager; что отдаёт `GET /organizations`. Зафиксировать в evidence.

**ШАГ 1 — Discoverability (минимум).**  
Не обещать несуществующий `/organizations`. Либо:  
- (A) nav item → `/registries` с query/hash на registry `organizations`, **или**  
- (B) тонкий NX route `/organizations` → redirect на registries.  
Выбрать A если быстрее. Убрать/починить мёртвый path.

**ШАГ 2 — BE: смена issuer на документе.**  
`UpdateStudioDocumentDto`: optional `organizationId` (MongoId).  
`update()`: если передан — проверить, что org существует и **входит в список, который видит этот user** (та же политика, что `OrganizationService.findAll` / findById). Затем `doc.organizationId = …`, revision++.  
Если user bound к одной org и пытается другую → 403/404 как сейчас (IDOR).  
Spec: admin/unscoped может сменить на другую существующую; bound user — только свою (или 403).

**ШАГ 3 — FE: select в Ещё.**  
Заменить readonly на `app-pi-select` «Исполнитель (наша фирма)»: options = list orgs (name/shortName); value = `document.organizationId`; change → PATCH через тот же revision write-path / documentWriteChain если есть.  
Hint: «Юрлицо бланка и `{{organization.*}}`. Карточки фирм — Реестры → Организации.»  
Если в списке 1 org — select disabled или один option (честно, не притворяться multi).  
После смены — `loadIssuerOrg` / document.set; preview refresh если active.

**ШАГ 4 — Docs.**  
`document-studio.page.md`: Исполнитель выбирается в Ещё; Реестры для реквизитов; убрать «только JWT read-only».

## НЕ

- Путать с Поставщиком (Counterparty).  
- Ломать tenant IDOR (нельзя ставить чужую org bound-user’у).  
- Полный port legacy OrganizationsPage.  
- wipe/deploy.

## ACCEPT

1. В Ещё есть select Исполнитель; смена (когда список >1 и права позволяют) сохраняется, preview/токены нашей фирмы соответствуют выбранной.  
2. Bound user с 1 org — не может «уйти» на чужую; UI не врёт.  
3. Пункт nav «Наши организации» ведёт в живое место (registries) или скрыт.  
4. Specs BE+FE; page.md; gates / nx build.

## known_limitation

Список документов по-прежнему scoped одной org (`resolveOrganizationId`) — после смены issuer документ может «пропасть» из текущего списка admin, если list всё ещё фильтрует fallback-org. Если воспроизведётся — WARN + successor «list by selected org / admin all-orgs», не блокировать этот TZ если select+PATCH+preview ок на открытом документе.
