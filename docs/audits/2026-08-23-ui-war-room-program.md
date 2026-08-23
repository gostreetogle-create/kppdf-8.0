# UI War Room — предрелизная комиссия — 2026-08-23

**Режим:** Audit → triage → **пакет executable TZ** (product-код не менялся).
**База:** `docs/audits/2026-08-22-ui-consistency-audit.md` +
`docs/audits/2026-08-23-ui-standardization-program.md` + live re-verify
(Cursor + MCP Claude analysis-only).
**Storybook:** не добавляем (решение PO). SoT каталога = `/kit` после роутинга.
**Префикс Cursor (эта волна):** `TZ-UI-WR-*`. Параллельная чужая серия может
быть `TZ-UI-STD-*` — не смешивать ID; merge позже.
**Очередь TZ:** `tasks/TZ-UI-WR-50*.md` + `tasks/PROMPT-FREEBUFF-UI-WR-WAR-ROOM.md`.

---

## 1. Current state in one page

Paper & Ink **существует и в целом жив**: `PiDialogService` (~72 consumers),
`pi-form-field`, `PiTable` empty-state — реальный канон. Headless-слой
`@angular/cdk/overlay` + `ConfigurableFocusTrapFactory` уже внутри dialog/drawer/sheet.

**Проблема не «нет системы», а enforcement + 3 мёртвых подсистемы + 1 системная
a11y-дыра в фундаменте.**

| Зона | Вердикт |
|------|---------|
| Dialogs (formal) | Esc / trap / backdrop ✅; **return-focus ❌ везде** |
| Drawer scroll-lock | `reposition()` ≠ Dialog/Sheet `block()` |
| Z-index | **нет `--z-*`**, magic 20/40/50/100 + CDK 1000 |
| `PiSelect` open/close | **УЖЕ DONE** (`TZ-UI-401`) — аудит 23-го устарел |
| Hand-rolled overlays | desk flyout, KP catalog-review, builder flyout |
| Filter flyouts ×3 | a11y OK после UI-407; **код дублирован** |
| Menu system | `pi-dropdown-menu` **0 consumers**; nav-dropdown обходит из-за бага TemplatePortal |
| error-banner / skeleton / popover / tooltip | построены, **не adopted** на бизнес-страницах |
| `/kit` showcase | страницы есть, **не в `app.routes.ts`** — каталог мёртв |

---

## 2. Top problems ranked by severity

| Sev | ID | Проблема | Статус |
|-----|-----|----------|--------|
| CRITICAL | A11Y-RF | Return-focus отсутствует в Dialog/Drawer/Sheet | → **501** |
| CRITICAL | A11Y-BUILD | Builder flyout: нет Esc / outside / z-index | → **503** |
| HIGH | Z-SCALE | Нет токенов z-index | → **502** |
| HIGH | D-03 | Desk flyout: aria-modal без trap/return-focus | → **509** |
| HIGH | D-02 | KP catalog-review ручной; Esc **намеренно** блокирован | → **510** (formal exception + harden) |
| HIGH | MENU-BUG | TemplatePortal теряет `@for` → nav-dropdown bypass | → **508** |
| HIGH | C-01 | Fragile gold/text pairs (часть уже `text-on-gold`) | → **504** verify |
| MEDIUM | ERR-API | error-banner не принимает string → 0 adoption | → **505** |
| MEDIUM | KIT-DEAD | showcase не роутится | → **506** |
| MEDIUM | D-04 | 3× filter markup copy | → **507** |
| MEDIUM | ADOPT | skeleton/error inline chaos | → **511** |
| LOW | DOCS | нет паспортов primitives / review rules | → **500**, **512** |
| ~~HIGH~~ | S-01/C-02 | PiSelect broken | **STALE — TZ-UI-401 DONE** |

---

## 3. Canonical decisions

| Задача | Канон | Anti-pattern (freeze / запрет копировать) |
|--------|-------|-------------------------------------------|
| Modal / alert | `PiDialogService` + `app-pi-dialog` / `AlertDialog` | hand-rolled `role="dialog"` + backdrop |
| Side panel | `PiSheetService` / `PiDrawerService` | page-local absolute flyout (кроме hardened desk до миграции) |
| Menu | `pi-dropdown-menu` + trigger **после 508** | inline menu chrome copy |
| Select (длинный) | `PiOverflowSelect` | — |
| Select (короткий) | `app-pi-select` (уже fixed) | native `<select>` — batch later |
| Load GET error | `app-error-banner` (после 505) | inline `<p class="text-destructive">` |
| Loading | `app-pi-skeleton` | `<p>Загрузка…</p>` |
| Tooltip/popover | `piTooltip` / `piPopover` | `title=` допустим для однострочных chrome labels; не для rich content |
| Z-index | `--z-*` tokens (502) | magic `z-40` / `z-index: 100` |
| Showcase | `/kit/*` routes (506) | Storybook — **не** |
| Docs SoT | passport в `/kit` + `docs/paper-and-ink.md` | — |

**Legacy freeze (копировать нельзя, чинить только через TZ):**
- desk flyout shell до 509;
- KP catalog-review до 510 (formal NO-ESC exception + harden);
- builder flyout до 503;
- `PiNavDropdown` inline menu до 508.

**Deprecate / delete candidates (после adoption):**
- пустой namespace `shared/ui/orders/` если появится снова;
- `PiShowcaseCard` / `app-pi-dictionary-shell` — либо кит-пример, либо удалить.

---

## 4–7. Fix now / batch / freeze / deprecate

**Fix immediately (Wave A+B):** 500, 501, 502, 503, 504, 505  
**Batch migrate:** 506 → 512, 507, 508, 511, native select waves  
**Freeze legacy:** desk / KP review / builder shells до своих TZ  
**Deprecate after kit live:** dead showcase-only primitives without consumers  

---

## 8–9. Docs + review rules

См. **TZ-UI-WR-500** (правила в `AI-AGENT-GUIDE.md` §3) и **TZ-UI-WR-512**
(паспорта `/kit`).

Минимум review gate:
1. Новый overlay/menu/dialog вручную → reject.
2. Overlay без Esc + return-focus → reject.
3. Новый `shared/ui/*` без примера в `/kit` → reject.
4. Inline load/error без исключения в TZ → reject.
5. Обход primitive молча → reject; нужен adoption mini-TZ (не GitHub Issue).
6. **Proof of adoption** на каждый canonical fix → иначе reject closeout:
   routed consumer + тест + kit/docs + migration note + leftover list.
   (Канон: `docs/TZ-AUTHORING.md` § Proof of adoption.)

---

## 10. First 10 concrete actions (file targets)

1. `TZ-UI-WR-500` — rules + audit stale patch  
2. `TZ-UI-WR-501` — `pi-dialog.service.ts` / `pi-drawer.service.ts` / `pi-sheet.service.ts`  
3. `TZ-UI-WR-502` — `styles.css` + overlay services/directives  
4. `TZ-UI-WR-503` — `builder-tool-pane.component.ts`  
5. `TZ-UI-WR-504` — gold contrast sweep (listed files)  
6. `TZ-UI-WR-505` — `error-banner.component.ts`  
7. `TZ-UI-WR-506` — `app.routes.ts` + kit-layout  
8. `TZ-UI-WR-507` — products/modules/materials filter shell → shared  
9. `TZ-UI-WR-508` — `pi-dropdown-menu` + `pi-nav-dropdown`  
10. `TZ-UI-WR-509` — `manager-desk.page.ts` flyout a11y  

---

## 11. Verification checklist (программа)

- [ ] Dialog close возвращает фокус на trigger (Jest + ручной Tab)  
- [ ] Drawer scroll = `block()` как Dialog/Sheet  
- [ ] `--z-dialog` > `--z-drawer` > `--z-popover` > `--z-toast` задокументированы  
- [ ] Builder flyout: Esc + outside close  
- [ ] `/kit/overlays` открывается в браузере  
- [ ] `rg "Загрузка…" frontend/src/app/pages` падает по волнам 511  
- [ ] `rg 'role="dialog"' frontend/src/app/pages` — только documented exceptions  
- [ ] FE tsc + focused jest + lint на каждый TZ  

---

## 12. Risks and open unknowns

| Риск | Mitigation |
|------|------------|
| `manager-desk` hot file (DESK-423/424) | 509 последним; claim check `_NOW` |
| KP Esc block intentional | **510** formal exception KP-CATALOG-REVIEW-NO-ESC + harden trap |
| TemplatePortal bug hard | 508 characterization test first |
| Native select 60+ sites | не в первой волне; после 501+505 |
| Deploy queue TEST-421 | UI-WR **не блокирует** deploy; стартовать после READY или параллельно без conflict keys TEST-421 |
| Audit 23-го пометил S-01 open | **ложь** — помечено STALE здесь и в патче аудита |

---

## TZ index (после merge — 10 TZ, 3 агента)

| ID | Agent | Title |
|----|-------|-------|
| TZ-UI-WR-500 | A | Canon rules + Proof of adoption |
| TZ-UI-WR-501 | A | Overlay platform: return-focus + z-* (**ex-502**) |
| TZ-UI-WR-503 | A | Builder flyout Esc/outside |
| TZ-UI-WR-504 | C | Gold/on-gold (после 508) |
| TZ-UI-WR-505 | B | ErrorBanner string API |
| TZ-UI-WR-506 | B | /kit routes + passports (**ex-512**) |
| TZ-UI-WR-507 | C | Catalog filter + skeleton/error (**ex-511**; после 501+505) |
| TZ-UI-WR-508 | C | Dropdown portal + nav |
| TZ-UI-WR-509 | A | Desk flyout a11y |
| TZ-UI-WR-510 | A | KP catalog-review Esc=B |

Удалены (влиты): WR-502, WR-511, WR-512.  
Промты: `PROMPT-FREEBUFF-UI-WR-A.md` / `-B.md` / `-C.md` · индекс `-WAR-ROOM.md`.

Deps: A `500→501→503|509|510`; B `505→506`; C `508→504→(501∧505)→507`.

---

## Proof of adoption (обязательно для каждой STD TZ)

TZ **не считается DONE**, пока в archive `.done.md` нет блока:

```markdown
## Proof of adoption
- consumer: <route + component>   # routed production, не только /kit
- test: <spec file / pattern>
- docs: </kit/... or *.md path>
- migration note: <что запрещено делать вручную>
- legacy leftover: <список или none>
```

Иначе снова «компонент готов, им никто не пользуется». Зафиксировано в
`docs/TZ-AUTHORING.md` + `TZ-UI-WR-500` → `AI-AGENT-GUIDE.md` + continuous prompt.
