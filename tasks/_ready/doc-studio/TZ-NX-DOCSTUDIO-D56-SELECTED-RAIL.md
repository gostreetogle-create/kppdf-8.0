# TZ-NX-DOCSTUDIO-D56: «Выбрано» → левый chrome-rail под «Данные»

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Freebuff / Claude CLI  
**ЗАВИСИМОСТИ:** D55 DONE (тот же continuous prompt)  
**LAYER:** 3  
**SIZE:** S  
**PACK:** WAVE-DOCSTUDIO-DATA-IA-2 · `tasks/PROMPT-FREEBUFF-DOCSTUDIO-D55-D56.md`

**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-chrome.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/shell-tool-rail.service.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts` ;  
`docs/pages/document-studio.page.md` ;  
`docs/audits/2026-09-05-docstudio-data-panel-ia-audit.md` (пометка override §3)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — полная сборка приложения (nx build kppdf-web)

---

### Preflight Check Output
- **Context read:** D55 TZ; `studio-editor.page.ts` `shellTools.setTools` left=`[data]` ~744; `studio-workspace-chrome.ts` `StudioWorkspaceSection`; `ShellToolRailItem` (нет badge); audit §3 (TOC-only — **PO override**)
- **Key Constraints:** A4 не reflow; left rail + overlay; reuse selected buffer / insertTable emitters; не плодить write-path
- **Planned Deliverable:** section `selected` + 2-я left tool + TOC без «Выбрано»
- **Validation Path:** FIC UI; page.md §1.3; panel + editor tests; nx build

**Проверено:** `studio-editor.page.ts`; `shell-tool-rail.service.ts`; `app-shell.component.ts`; D51 buffer UI

Loose wording → канон: «меню выбрано» = буфер `catalogSelections` + party anchors + CTA «Вставить на лист» (D51/D52).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. После D50 «Выбрано» — TOC-вкладка **внутри** wide-панели «Данные».
2. Левый `ShellToolRailService` для студии = **одна** кнопка `data` («Данные»).
3. PO (скрин 2026-09-05): буфер «Выбрано» открывать **отдельной** кнопкой под «Данные» в вертикальном chrome-rail; из TOC «Данные» убрать.
4. Audit §3 раньше запрещал плодить chrome-иконки — **этот TZ = явное исключение PO**.

**Сбои:**
- Менеджер накопил 15 позиций → ищет буфер среди 5 TOC → путает с «Товары».
- Открыл «Связи» → потерял буфер из виду.
- Badge «15» только на TOC, не на rail.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Секция workspace
- `StudioWorkspaceSection` += `'selected'`.
- `studioPanelSide('selected')` → `'left'` (как data).
- `panelTitle` для `selected` → `'Выбрано'` (опционально с `(N)` если count > 0 — на усмотрение, не обязательно).
- `panelWide`: **только** `data` остаётся wide; `selected` = обычная ширина 340px (chips + CTA).

### ШАГ 2 — Левый rail
В `studio-editor` `setTools` left (порядок сверху вниз):

1. `data` — как сейчас  
2. `selected` — title/aria «Выбрано», icon lucide `ClipboardList` или `ListChecks` (уже в проекте / добавить import), `onClick → onSection('selected')`, `active` когда section===selected && !collapsed

### ШАГ 3 — Badge на rail (минимум)
- Расширить `ShellToolRailItem` опциональным `badge?: number` (или `badgeCount`).
- В `app-shell` на кнопке tool: если `badge > 0` — маленький счётчик (не ломать 36px rail; absolute corner; `data-test="shell-tool-badge"`).
- В editor: `badge` = тот же `selectedCount`, что был на TOC (anchors + Σ catalog chip counts). CSS: не раздувать кнопку — компактный badge.

### ШАГ 4 — Панель контента
- `@case ('selected')` в editor: рендер **того же** буфера (empty / chips / insert suggest), что сейчас `@case ('selected')` в data-panel.
  - Предпочтительно: `pi-studio-data-panel` с inputs `[mode]="'selected'"` **или** `[activeCategoryFixed]="'selected'"` + `[hideToc]="true"` + без внутреннего heading (уже снято в D55).
  - Либо тонкий extract `pi-studio-selected-panel` — только если mode раздует data-panel; **reuse emitters** (`catalogRemove`, `insertTable`) без копипасты write-path.
- Из TOC «Данные» **убрать** категорию `selected`. Остаётся: Товары | Кому | Связи | Ещё. Default = Товары.
- Провод всех inputs/outputs для selected-case как у data.

### ШАГ 5 — Тесты + docs
- Spec: TOC без «Выбрано»; data-panel mode selected без TOC.
- Editor/smoke: left tools содержат `shell-tool-left-selected`; клик открывает буфер.
- `document-studio.page.md` §1.3: слева **Данные** + **Выбрано**; TOC Данные без Выбрано.
- Audit: одна строка «PO override 2026-09-05: Выбрано = left rail tool (D56)».

---

## ИЗМЕНЯТЬ
Файлы из CONFLICT KEYS.

## НЕ ИЗМЕНЯТЬ
- Backend context / catalogSelections API  
- Витрина Товары → отдельный rail (не сейчас)  
- Правый rail  
- `ensureLinkedQuotation`  
- geometry law (sheet не reflow)

---

## КРИТЕРИИ ПРИЁМКИ

1. Под иконкой «Данные» в левом chrome-rail есть кнопка «Выбрано»; клик открывает left overlay с буфером (empty / chips / «Вставить на лист»).
2. В панели «Данные» TOC **нет** вкладки «Выбрано»; товары/кому/связи/ещё на месте.
3. При count > 0 на rail-кнопке виден badge с числом.
4. A4 лист не меняет размер при open/close selected (как data).
5. Gates PASS.

## BUILD INTEGRITY (обязательно)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM): уже green после D55

Gates (закрытие, nx build — ПОСЛЕДНИЙ):
  cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="studio-data-panel|studio-editor|app-shell"
  cd frontend-nx && pnpm exec nx lint kppdf-web
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0  ← обязательно последним

Параллель: STOP если другой kppdf-web active

## known_limitation
- Badge API на ShellToolRailItem — тонкий; не делать generic notification system.
- «Товары» на rail — successor по команде PO.

## Финализация
Executor report (auto) → archive `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-D56-SELECTED-RAIL.done.md` → обновить WAVE + `_NOW.md`.
