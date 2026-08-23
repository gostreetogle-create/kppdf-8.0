# TZ-KP-WS-400 — Checklist (часть B · freebuff-1)

**agent_id:** freebuff-1 · **claimed_at:** 2026-08-23T00:00:00Z
**workspace:** D:\kppdf-8.0

## Claim slot

| Поле | Часть A (claude) | Часть B (freebuff-1) |
|------|------------------|----------------------|
| Артефакт | `docs/audits/2026-08-23-kp-workspace-implementation-audit.md` | `docs/pages/kp-workspace-rail-ia.md` |
| Статус | in progress (claim в `tasks/_active/`) | **DONE** |
| Conflict keys | audit doc | rail-ia doc |

## Часть B — шаги (docs only)

- [x] CLAIM часть B в `tasks/_active/TZ-KP-WS-400.md`
- [x] Собрать факты: demo `proposal-workspace-demo.page.*` (railItems, ribbon, data-test),
      create `proposal-create.page.ts` (7 `kp-create-toggle-*`, иконки, tier),
      product-rail/inspector/terms/table-editor data-test, chrome-rail (chrome-tool-{id})
- [x] Создать `docs/pages/kp-workspace-rail-ia.md`:
      - [x] Left ≥3 (Каталог/Шаблон/Клиент), Right ≥4 (Параметры/Таблица/Условия/…), ribbon список
      - [x] Lucide-иконка на каждую секцию
      - [x] Dedup иконок: конфликты demo vs create → резолюции (6 строк)
      - [x] Dedup кнопок: rail vs ribbon vs flyout (6 строк)
      - [x] Tier S/L панелей + дельта от create
      - [x] Сверка data-test: demo `chrome-tool-*` ↔ create `kp-create-toggle-*` → финал
- [x] НЕ трогал `docs/audits/2026-08-23-kp-workspace-implementation-audit.md` (часть A)
- [x] НЕ трогал `frontend/**`, `backend/**`, frozen spec
- [x] Archive `tasks/_archive/2026-08/TZ-KP-WS-400.done.md` с пометкой «часть B»

## AC (релевантные части B)

- [x] Rail IA doc: left ≥3 секции, right ≥4, ribbon actions listed, Lucide icon per section
- [x] Icon dedup: явный список конфликтов demo vs create → resolution
- [x] Tier S/L панелей описаны
- [ ] Parity test plan (часть A — audit doc)
- [ ] MCP readiness (часть A)
- [ ] Embedded settings (часть A)
- [ ] Multi-supplier (часть A)
- [ ] State ownership map (часть A)

**Примечание:** часть A (implementation-audit) ведёт claude параллельно; архив этого файла —
только по части B. Полный DoD TZ-400 собирается после merge обеих частей.
