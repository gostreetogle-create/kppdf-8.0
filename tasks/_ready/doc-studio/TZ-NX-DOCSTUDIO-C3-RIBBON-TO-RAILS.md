# TZ-NX-DOCSTUDIO-C3: Ribbon → крошки + действия в rails

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Freebuff  
**ЗАВИСИМОСТИ:** TZ-NX-DOCSTUDIO-C2 DONE  
**LAYER:** 3  
**SIZE:** L  
**PACK:** WAVE-DOCSTUDIO-CHROME-IA · `tasks/PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA.md`

**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `document-studio.page.md` ; `kp-workspace-geometry.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.spec.ts` (если есть / создать focused) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-shell.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-shell.component.html` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-chrome.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/shell-tool-rail.service.ts` (только если нужен API disabled/busy — минимально) ;  
`docs/pages/document-studio.page.md` (§1.2 ribbon → целевое)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — полная сборка приложения (nx build kppdf-web)

---

### Preflight Check Output
- **Context read:** audit §3 table; `studio-editor.page.ts` ribbon ~165–224 + setTools ~757–779; `studio-workspace-shell.component.html` header; geometry law
- **Key Constraints:** A4 не reflow; overlay panels; Data/Selected left untouched; dirty guard на уход по крошке
- **Planned Deliverable:** верх = только crumbs; lifecycle на правом rail
- **Validation Path:** editor specs + browser smoke note; nx build; page.md §1.2

**Проверено:** Save as уже в `StudioTemplatePanelComponent`; openDocumentList + dirty dialog S38.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. `kpWsRibbonExtra` = rename button с именем; `kpWsRibbonActions` = 7 текстовых кнопок.
2. Shell badgeText/totalText дублируют имя/страницы в ribbon group.
3. Правый rail: elements/layers/pages/properties/template — **панели**, не document actions.
4. PO: сверху только крошки; кнопки — в вертикальные панели.

**Сбои:**
- Семь кнопок + имя + «Страниц: N» = визуальный шум.
- «Сохранить как» в двух местах.
- «К списку» не выглядит как навигация модуля.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Ribbon = только breadcrumbs
В editor (через shell и/или editor template):

Крошки (порядок):
1. **Документы** → `routerLink` `/studio` (вызывать тот же путь, что `openDocumentList()` / dirty guard — **не** голый navigate в обход guard).
2. **Студия** — текст без link (или link на текущий url no-op).
3. **Имя документа** — current; click → `openRenameDialog()` (как сейчас rename).

Убрать из ribbon:
- все `kp-ws-ribbon-btn` действий (К списку, Редактор, Сохранить, Сохранить как, Просмотр, PDF, В архив);
- дубли `badgeText` / `totalText` в ribbon group **если** они повторяют крошку (page count → status bar или pages panel — уже есть pageLabel в viewport toolbar).

Высота ribbon ≤ текущей (~36px); без второго H1. Стили: text-xs / font-display на current — как `pi-page-chrome`, можно inline в shell slot без ломки list pages.

### ШАГ 2 — Правый chrome-rail: режимы + действия
Расширить `shellTools.setTools` **right** (сверху вниз — рекомендуемый порядок):

| id | Поведение |
|----|-----------|
| `mode-editor` | `setViewMode('editor')`; `active` когда editor |
| `mode-preview` | `setViewMode('preview')`; `active` когда preview |
| `save` | `saveDocument()`; disabled когда `saving()` |
| `pdf` | `onDownloadPdf()`; disabled когда `pdfLoading()` |
| `archive` | `onFinalize()`; disabled когда не draft / `finalizing()` |
| затем | elements, layers, pages, properties, template (как сейчас) |

Иконки Lucide (Save, FileDown/FileText, Archive, PenLine, Eye — на усмотрение, RU `title`/`ariaLabel` обязательны).

**Сохранить как…** — **не** дублировать иконкой; остаётся CTA в панели «Шаблон».

Левый rail: **только** data + selected (без изменений D56).

### ШАГ 3 — Уход к списку через крошку
- Клик «Документы» должен проходить **dirty guard** (тот же диалог, что у `openDocumentList`).
- После ухода — `/studio` list (C1: без resume).

### ШАГ 4 — Shell API
Если `badgeText`/`totalText`/`kpWsRibbonActions` больше не нужны редактору — перестать передавать; не ломать API shell для гипотетических consumers (optional inputs ok empty).
Не возвращать desktop horizontal rail.

### ШАГ 5 — Tests + page.md §1.2
- Spec: в DOM редактора нет `data-test="studio-open-list"` text button **или** он отсутствует в ribbon; есть rail tool ids / titles.
- Сохранить / preview / pdf вызываются с rail (unit через stub shellTools или click handlers).
- Обновить `document-studio.page.md` §1.2: ribbon = crumbs only; таблица действий → §1.3 rails.

---

## ИЗМЕНЯТЬ
- CONFLICT KEYS.

## НЕ ИЗМЕНЯТЬ
- Backend finalize/PDF contracts.
- Data panel IA / vitrina.
- List/templates pages кроме ссылок уже сделанных в C2.
- `frontend/**` legacy KP workspace (закон геометрии читать, не портить).

---

## КРИТЕРИИ ПРИЁМКИ

1. В редакторе под app-header **нет** ряда текстовых «К списку / Сохранить / …»; видна крошка `Документы / Студия / {name}`.
2. Save / Preview / Editor / PDF / Archive доступны с **правого** chrome-rail; tooltips RU.
3. «Сохранить как…» только в панели Шаблон (ribbon duplicate gone).
4. Крошка «Документы» при dirty → диалог S38; Cancel остаётся в редакторе.
5. Open/close любой панели: Δ A4 ≤ 0.5px (закон geometry) — не регрессировать layout.
6. Gates PASS.

## BUILD INTEGRITY (обязательно)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM):
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Gates (закрытие, nx build — ПОСЛЕДНИЙ):
  cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  cd frontend-nx && pnpm test -- studio-editor studio-workspace
  cd frontend-nx && pnpm lint
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0  ← обязательно последним

Параллель: STOP если в tasks/_active/ другой TZ с kppdf-web/src/**

**Proof of adoption:** routed `/studio/:id` — единственный consumer; page.md обновлён в этом TZ (черновик §1.2) + C4 Integrity.

**known_limitation:** polish иконок / порядок rail можно тюнить successor; generated-documents archive не в scope.
