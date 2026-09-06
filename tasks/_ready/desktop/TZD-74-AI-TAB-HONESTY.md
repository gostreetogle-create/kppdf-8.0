═══════════════════════════════════════════════════════════════
TZD-74-AI-TAB-HONESTY: вкладка «ИИ» — честный UI вокруг рабочего MCP
═══════════════════════════════════════════════════════════════

SIZE: L
РОЛЬ АГЕНТА: Desktop UI (Tauri/web UI в desktop/)
ЗАВИСИМОСТИ: TZ-OPS-DESKTOP-INSTALLER-LOCAL archived (v0.5.7 на машине PO)
LAYER: 3
PAGES: N/A (Desktop app tab «ИИ»)
PAGE_DOCS: desktop/README.md; desktop/docs/MCP.md; docs/ui-density-canon.md

CONFLICT KEYS: desktop/src/** (AI tab components + aiRunner status wiring — точные файлы зафиксировать в claim после grep `ИИ`/`ai-tab`); desktop/README.md; desktop/docs/MCP.md; docs/audits/2026-09-06-desktop-ai-tab-honesty-audit.md

---

### Preflight
- **Context read:** audit 2026-09-06; PO screenshot; MCP.md; ui-density-canon Desktop
- **Key Constraints:** MCP блок не ломать; Excel/Import без модели; RU copy без слова «раннер»
- **Deliverable:** один спокойный экран; локальный чат не орёт ошибками если выключен
- **Validation:** visual AC + MCP start/copy json smoke; optional runner hide

## ИСХОДНОЕ

PO v0.5.7: вкладка «ИИ» — 4 панели, тройной дубль ошибки порта, «Запустить раннер» непонятно; зелёный только «MCP для агентов».

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Информационная архитектура (жёстко)
Экран «ИИ» = **две зоны**, не четыре равноправных карточки:

1. **Главное (верх/лево, акцент):** «Для Cursor / Claude» = текущий MCP (статус, URL, копировать mcp.json, Стоп/Перезапуск). Заголовок человеческий, не жаргон.
2. **Локальный помощник (низ или вторичная секция):**  
   - если runner **не** healthy → **одно** спокойное состояние: «Локальный чат пока недоступен» + одна кнопка «Попробовать запустить» (не «раннер») + короткий hint «нужна скачанная модель ~2 ГБ».  
   - **Запрет:** повторять одну и ту же ошибку в 2–3 местах; запрет стены простыни про VRAM в primary view (убрать в «Подробнее»/disclosure).
3. **API / TokenRouter:** свернуть в disclosure «Подключить облачную модель» или скрыть до P1, если пусто и путает.

### ШАГ 2 — Copy
- «Раннер» → «Локальный помощник» / «Движок модели» (один термин везде).
- Баннер: импорт Excel работает без модели (оставить, короче).

### ШАГ 3 — Status single source
- Один store/флаг health MCP и health local helper; UI читает его, не клонирует fetch-ошибки в каждый виджет.

### ШАГ 4 — Docs
- README + MCP.md: «вкладка ИИ: MCP = обязательно для агентов; локальный чат = опционально».
- Audit note DONE.

## НЕ
- Не удалять вкладку целиком.
- Не чинить node-llama стабильность end-to-end в этом TZ (отдельный TZD-75, только по слову PO).
- Не трогать pairing / Excel Form Studio / NX web.

## AC

1. Скрин: нет тройного дубля одной ошибки; MCP сразу виден и понятен.
2. Нет слова «раннер» в UI (или только в advanced disclosure).
3. MCP copy json + статус «Запущен» регрессии нет.
4. Локальный блок либо работает с одной CTA, либо честно «недоступен» без красного спама.
5. Gates: desktop unit tests затронутых модулей + ручной smoke note.

CLAIM agent_id: claude (Desktop) или freebuff если Claude занят — предпочтение **claude**.
