═══════════════════════════════════════════════════════════════
TZD-75-AI-TAB-SOON-AND-0.5.8: спрятать локальный чат + bump + installer
═══════════════════════════════════════════════════════════════

SIZE: L
РОЛЬ АГЕНТА: Desktop (Tauri UI + version bump + publish)
ЗАВИСИМОСТИ: TZD-74 DONE; design `docs/peer/gemini-desktop-ai-ux-design.md`; runner plan `docs/peer/gemini-desktop-ai-runner-plan.md`
LAYER: 3
PAGE_DOCS: desktop/README.md; desktop/docs/MCP.md; desktop/docs/AI-PROVIDERS.md

CONFLICT KEYS: desktop/package.json; desktop/src-tauri/tauri.conf.json; desktop/src-tauri/Cargo.toml (если version); desktop/src/App.svelte; desktop/src/core/aiRunner.ts (только UI-gating/copy, не deep llama fix); desktop/README.md; desktop/docs/MCP.md; desktop/docs/AI-PROVIDERS.md

---

### Preflight
- **Context read:** `docs/peer/gemini-desktop-ai-ux-design.md` + evidence PNG; runner-plan; TZD-74
- **Key Constraints:** MCP must keep working; no install/download/chat CTAs; no «раннер»; semver in footer
- **Deliverable:** MCP-плашка по Gemini wireframe; зона чата = «Скоро»; version **0.5.8** + release-installer
- **Validation:** desktop gates + HEAD zip 200 + footer 0.5.8

## ЧТО ДЕЛАТЬ

### ШАГ 1 — UX (канон Gemini + правка Cursor)
- Прочитать `docs/peer/gemini-desktop-ai-ux-design.md` и скрин `docs/peer/evidence/gemini-desktop-ai-ux-preview.png`.
- **MCP сверху:** компактная плашка (~56 px): StatusDot + статус RU + URL + «Скопировать mcp.json» (primary) + «Перезапустить сервер» (secondary). Порт/URL из реального конфига.
- **Чат снизу:** оболочка «Чат на этом компьютере» + **одно** спокойное «Скоро» (без Установить / Скачать / Повторить / input / тройных ошибок).
- Спеки ПК / TokenRouter / каталог моделей — не на первом экране (шторка «Параметры и спеки» или свернуть).
- Не рисовать чужие ERP-вкладки «Заказы/Склад» внутри AI — Desktop chrome уже есть.
- Стиль: Paper & Ink (бумага/hairline/графит из design.md), без фиолетового AI-неона.

### ШАГ 2 — Version
- Bump **0.5.7 → 0.5.8** lockstep: `desktop/package.json`, `tauri.conf.json`, Cargo.toml если канон требует.
- `pnpm run release-installer` → zip+exe+aliases в `frontend/downloads/`.
- Не коммитить binaries.

### ШАГ 3 — Docs
- README/AI-PROVIDERS: локальный чат = not ready; MCP = supported.
- Checklist + archive.

## НЕ
- Не чинить node-llama NSIS end-to-end в этом TZ (→ TZD-76).
- Не ломать pairing/Excel/MCP.
- Не dropDatabase.

## AC
1. В UI нет рабочих кнопок скачивания/чата, которые ведут к спаму ошибок (или они disabled с «Скоро»).
2. MCP start/copy json работает.
3. Footer / installer **0.5.8**; `HEAD :3000/downloads/kppdf-desktop-setup.zip` 200 после publish.
4. Gates: tsc/svelte-check/focused desktop tests как в TZD-74.
5. Push docs+code; binaries gitignored.

CLAIM: agent_id claude.
