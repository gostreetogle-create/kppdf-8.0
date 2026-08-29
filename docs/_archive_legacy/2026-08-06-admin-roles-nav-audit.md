# Audit: Admin Roles / Users / Group Chips — 2026-08-06

**HEAD at diagnosis:** `40cbb1a` (= `origin/main`)  
**Fix commit:** (this PR / follow-up on main)  
**Gates (fix):** admin Jest **7 suites / 73 tests PASS** · FE `tsc` PASS · prettier/eslint allowlist clean (2 pre-existing HttpClient warnings)

---

## Вердикт

| Вопрос | Ответ |
|--------|--------|
| Откатили админку? | **Нет** — ADMIN-306 (`/admin` → `/admin/users`) остаётся |
| Галочки permissions «сломаны»? | **Нет** — catalog API жив; FE empty-state + submit gate добавлены |
| Куда делись чипы Users\|Roles? | **Не в main:** WIP Group Chip TOC лежал локально и ушёл в `stash` при rebase PRODUCTION-303 |
| Empty catalog на стенде? | **Нет** на живом API; UI теперь показывает RU empty-state |
| FE/BE RBAC gap? | **Закрыт вариантом A:** `systemRoles: ['admin']` на routes + nav |

**Главная причина жалобы PO:** reusable Group Chip chrome для Admin был подготовлен, но **не закоммичен** → локальный `main` после rebase выглядел «как будто насрали», Synology ещё держал вчерашний WIP.

---

## Root cause (процесс) — чтобы не повторилось

1. Admin TOC chips (`admin-group-chips.ts` + `PiGroupWorkspace` на users/roles) были **готовы к reuse**, но остались **uncommitted WIP**.
2. Перед rebase PRODUCTION-303 агент сделал `git stash` (`wip-kit-and-misc-before-303-rebase`), смешав admin chrome с kit/мусором.
3. На clean `main` остался крупный `PiPageHeader` «Пользователи» без TOC; Roles только по прямому URL.
4. `stash pop` **запрещён** (kit junk) — восстановление только **path-scoped** checkout из stash / rewrite UTF-8.
5. PowerShell `>` redirect один раз записал `admin-group-chips.ts` как UTF-16 → Jest/tsc «binary». Фикс: UTF-8 via .NET/`node`, `\uXXXX` для RU.

### Правила агентам

- Shared Group Chip / DSL chrome **коммитить в том же PR**, где страница переведена на `PiGroupWorkspace` — не оставлять «на потом».
- Не `stash` смешивать product UI с OrchestratorKit / lock / docs trash.
- Не `stash pop` грязного stash; доставать **конкретные пути**.
- Windows: не писать `.ts` через `Out-File` / `>` — только UTF-8 no BOM (Node / `[IO.File]::WriteAllText` / Write tool).
- Не откатывать ADMIN-306 ради «вернуть хаб»; чинить discoverability **TOC chips** (канон Group Chip Workspace).

Канон UX: `docs/superpowers/specs/2026-08-05-group-chip-workspace-canon.md`.

---

## Что сделано (fix)

| Phase | Change |
|-------|--------|
| A | `ADMIN_TOC_CHIPS` Users\|Roles; users/roles pages на `PiGroupWorkspace` |
| B | `capabilityRouteGuard` + `route.data.systemRoles` + layout filter `systemRoles: ['admin']` |
| C | `roleLabelRu` mojibake harden; `permissionsSummary`; role-form empty catalog RU; seed director label `Director` |
| D | Этот audit + PO-DIARY §5 |
| E | Inventory: не архивировать чужие TZ; admin chip WIP больше не в stash-зависимости |

---

## Как проверить

1. Admin login → `/admin` → `/admin/users` с TOC **Пользователи | Роли**.
2. Клик **Роли** → `/admin/roles`, тот же TOC.
3. «Создать роль» → checkbox matrix из catalog (или empty-state если API пуст).
4. Manager/director с `role:read` **не** видят admin nav и получают `/forbidden` на `/admin/*` (FE mirror BE `@Roles('admin')`).

Деплой — только по явной команде PO («деплой»).
