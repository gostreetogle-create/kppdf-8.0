═══════════════════════════════════════════════════════════════
TZD-36: Desktop Import Studio — вкладки + chrome
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Desktop UI Engineer (Tauri/Svelte)
ЗАВИСИМОСТИ: Нет (можно параллельно WAVE-DICT-DEMO)
LAYER: 3 (desktop/src)
CONFLICT KEYS: desktop/src/App.svelte; desktop/src/App.css OR desktop/src/styles*; desktop/src/lib/** (если создаёшь); desktop/src-tauri/tauri.conf.json; desktop/docs/INSTALL.md; desktop/README.md; docs/agent-checklists/TZD-36.md

PAGES: (desktop app — не web route)
PAGE_DOCS: desktop/docs/INSTALL.md ; docs/audits/2026-08-10-desktop-excel-import-studio-audit.md

Проверено: App.svelte — stacked cards Подключение/MCP/Импорт/Inbox; окно 1100×760; excel parse есть; вкладок нет.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

PO показал коллегам десктоп: нужен **профессиональный** вход «кинул Excel → увидел таблицу», плюс отдельно MCP. Сейчас всё в одной простыне карточек — стыдно на демо.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Shell с вкладками (top)
  - Две вкладки: **«Импорт Excel»** (default) | **«MCP»**.
  - Вкладка MCP: pairing + статус подключения + Start/Stop MCP + URL + копирование mcp.json (перенести существующую логику, не дублировать host).
  - Header: бренд/заголовок компактно; connected user chip всегда виден.

ШАГ 2: Вкладка Импорт Excel — студия
  - Крупный dropzone (drag-drop + кнопка «Выбрать файл») на .xlsx/.xls/.csv.
  - Под ним **широкая** область превью-таблицы (основной viewport; не узкая карточка).
  - Пока без нового validation engine (это TZD-37): показать распознанные колонки/строки как сейчас умеет parse; кнопки существующих действий (создать ImportTask / expert propose / confirm) аккуратно в toolbar студии, не потерять.
  - Inbox-список файлов — вторичная панель или collapsible, не главнее таблицы.

ШАГ 3: Окно
  - Увеличить default width/height в `tauri.conf.json` под таблицу (напр. ≥1280×800); min size не Tiny.

ШАГ 4: UX polish
  - RU labels; пустые состояния: «Перетащите спецификацию Excel сюда».
  - Не ломать pairing/MCP start.
  - Docs: INSTALL/README — скрин-описание вкладок.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- `desktop/mcp/**` tool registry (кроме случайного typo — не трогать)
- BE Nest schemas
- WAVE-MCP-GAP TZD-31…34
- Composition import (TZD-38)
- `desktop/mcp-runtime/**`

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. При открытии Desktop видны вкладки «Импорт Excel» | «MCP»; переключение без потери pairing session.
2. На Импорт: dropzone + таблица занимают основной экран; файл Excel парсится в превью.
3. На MCP: можно подключить JSON и Start/Stop host как раньше.
4. `cd desktop && pnpm exec …` — существующие desktop/unit tests зелёные; ручной smoke описан в checklist.
5. Executor report (auto) + archive `tasks/_archive/2026-08/TZD-36.done.md` + commit/push.

known_limitation: статусы new/conflict и multi-sheet UI — TZD-37; BOM hierarchy — TZD-38.
