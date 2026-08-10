═══════════════════════════════════════════════════════════════
TZ-UX-315: Убрать pathLabel над chips (дубль топ-меню) + плотный chrome
═══════════════════════════════════════════════════════════════

STATUS: READY
DEPENDS ON: нет (параллель OK, если не трогать чужие CLAIM keys)
LAYER: 3
PAGES: все с `app-pi-group-workspace`
PAGE_DOCS: (кратко обновить 1–2 page docs / shared note)
CHECKLIST: docs/agent-checklists/TZ-UX-315.md

РОЛЬ: Frontend

CONFLICT KEYS:
frontend/src/app/shared/page/pi-group-workspace.component.ts;
frontend/src/app/shared/page/pi-group-workspace.component.spec.ts;
docs/agent-checklists/TZ-UX-315.md;

Опционально (только если файл НЕ в чужом `_active` CLAIM):
frontend/src/app/pages/**/*.ts с `pathLabel=` — снять атрибут;
docs/pages/*.page.md при упоминании pathLabel.

Проверено: `pathLabel` рендерит eyebrow над TOC/chips (`data-test="group-path-label"`);
топ-навигация уже подсвечивает раздел (Сделки/Документы/…); PO 2026-08-09 —
дубль «Сделки» лишний; крошки вплотную под главным меню без зазора от pathLabel.
Каталог (products) уже без pathLabel — эталон.

---

## ИСХОДНОЕ

На Сделках и др. страницах над chips видно «Сделки» / «Документы» / … —
то же, что жёлтый пункт главного меню. Лишняя строка + отступ.

---

## ЧТО ДЕЛАТЬ

1. В `PiGroupWorkspaceComponent`:
   - **не показывать** `pathLabel` (удалить блок `@if (pathLabel())` из template
     или оставить input deprecated no-op с JSDoc «unused — top nav is SoT»).
   - Уплотнить верх chrome: без eyebrow; первая строка (toc или chips)
     `pt` минимальный / 0 так, чтобы sticky chips **вплотную** под app header
     (без «воздуха» от бывшего pathLabel). Не ломать hairline tools.
2. Jest: нет `group-path-label` при переданном pathLabel; chrome всё ещё sticky;
   toc+chips рендерятся.
3. Grep `pathLabel=`: снять атрибуты с pages **кроме** файлов из чужого
   `_active` CONFLICT KEYS (сейчас часто `proposals.page.ts` у SALES-313 —
   атрибут можно оставить мёртвым до 313 DONE, компонент уже скрывает).
4. Коротко PO-diary / page note: раздел = топ-меню, не pathLabel.

---

## НЕ

- Не менять TOC/chips логику, ACL, routes.
- Не трогать содержимое SALES-313 (family) / create studio логику.
- Не deploy.

---

## AC

1. На `/proposals`, `/contracts`, `/documents` (и др. бывших pathLabel) **нет**
   строки «Сделки»/«Документы» над chips.
2. Визуально chips/TOC прилипают к зоне под главным меню плотнее (нет пустой
   eyebrow-полосы).
3. `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit`
4. `pnpm --dir frontend exec jest src/app/shared/page/pi-group-workspace.component.spec.ts`
5. Archive + commit/push; Checkpoint: не сбивать NEXT KP-VITRINE если 313 in flight.

ARCHIVE: `tasks/_archive/2026-08/TZ-UX-315.done.md`
