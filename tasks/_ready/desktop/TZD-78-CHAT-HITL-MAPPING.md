═══════════════════════════════════════════════════════════════
TZD-78-CHAT-HITL-MAPPING: чат предлагает сопоставление → Импорт HITL
═══════════════════════════════════════════════════════════════

SIZE: L
РОЛЬ АГЕНТА: Desktop (agent_id: claude)
ЗАВИСИМОСТИ: TZD-77 DONE (Inbox в контексте)
LAYER: 3
PAGE_DOCS: desktop/docs/AI-PROVIDERS.md

CONFLICT KEYS: desktop/src/App.svelte; desktop/src/ChatPanel.svelte; desktop/src/core/ai/** ; desktop/src/core/inbox.ts (read); desktop/src/core/import-mapping*.ts / suggest-mapping; desktop/docs/AI-PROVIDERS.md; desktop/package.json; tauri.conf.json; Cargo.toml (bump 0.5.9→0.5.10)

---

### Preflight
- **Context read:** TZD-77 bridge; LIMITED_HELPER; suggestMapping already on Import tab
- **Key Constraints:** chat **не** пишет в API; максимум предложить mapping + открыть Импорт на шаге confirm
- **Deliverable:** из чата «разбери файл X» → preview mapping → CTA «Открыть в Импорте»; bump 0.5.10 + installer
- **Validation:** desktop gates; HEAD zip 200

## ЧТО ДЕЛАТЬ
1. Команда/кнопка в чате или распознавание intent: выбрать файл Inbox → audit headers → suggest mapping (reuse existing helpers).
2. Показать предложенную карту колонок в чате (кратко).
3. CTA открывает вкладку Импорт с этим файлом / mapping draft — запись только после HITL «Записать».
4. Копирайт: чат подсказывает, база — после подтверждения.
5. Version 0.5.10 + release-installer; docs.

## НЕ
Silent API write; TZD-76 GGUF NSIS deep; NX; dropDatabase.

## AC
- [ ] Из чата можно получить mapping draft для файла Inbox
- [ ] Запись в БД только через Импорт confirm
- [ ] 0.5.10 published; gates; archive

CLAIM: agent_id claude.
