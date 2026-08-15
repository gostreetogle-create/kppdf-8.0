═══════════════════════════════════════════════════════════════
TZ-UX-325: Аудит — кандидаты page-tools → chrome-rail
═══════════════════════════════════════════════════════════════

STATUS: READY (docs-only audit)
ACTIVE: claim → tasks/_active/TZ-UX-325.md
DEPENDENCIES: TZ-UX-322 DONE; канон page-chrome.md § Page tools
LAYER: 2
SOURCE: PO 2026-08-15 — на всех страницах, где можно освободить место,
  переносить кнопки на chrome-панель (каждая страница — свой набор)

РОЛЬ АГЕНТА: docs / architect-executor (НЕ FE feature в этом TZ)
PAGES: multi
PAGE_DOCS: page-chrome.md ; PAGE-TZ-INDEX.md

CONFLICT KEYS:
docs/audits/2026-08-15-chrome-page-tools-migration-audit.md;
docs/pages/page-chrome.md;
docs/pages/PAGE-TZ-INDEX.md;
tasks/_backlog/WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE.md;
docs/agent-checklists/TZ-UX-325.md;
progress.md

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM (docs only)

ШАГ 2 — Inventory (read-only code)
Пройти `frontend/src/app/pages/**` и зафиксировать кандидатов, где:
- горизонтальный toolbar / sticky tools ест высоту;
- постоянный боковой rail / docked panel ест ширину;
- icon-only действия (фильтр, обновить, экспорт, вид) можно в chrome-rail;
- studio-like layout (КП rails уже icon-rail — отметить «уже studio / не дублировать»).

Для каждого кандидата таблица:
| Route | Сейчас | Что в L/R chrome | Выигрыш | Priority | Conflict risk |

ШАГ 3 — Audit doc
Создать `docs/audits/2026-08-15-chrome-page-tools-migration-audit.md`
с вердиктом P0/P1/P2 и явным НЕ (не переносить H1, желтое меню, lifecycle
кнопки КП savebar-запрет, destructive без confirm).

ШАГ 4 — WAVE backlog
`tasks/_backlog/WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE.md` — очередь successor TZ
(по одному разделу/странице), без старта кода в 325.

ШАГ 5 — page-chrome.md: ссылка на audit + правило «новые dense UI — сразу
chrome tools, не локальная колонка 48px».

ШАГ 6 — Archive. Product-код ЗАПРЕЩЁН.

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. Audit файл с ≥5 конкретными route-кандидатами или честным «мало кандидатов».
2. WAVE backlog со списком будущих TZ ids (черновик имён).
3. Нет frontend/backend diff.
4. git diff --check PASS.

Промпт:
`Прочитай GEMINI.md + tasks/TZ-UX-325-chrome-page-tools-migration-audit.md. Только docs: аудит кандидатов переноса toolbar/rails → PiChromeToolsService. Код не трогать.`
