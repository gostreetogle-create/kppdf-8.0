# DOCS-INTEGRITY — протокол «не забыть / не разъехаться»

> TZ-OPS-303 · docs-only · канон агента: `docs/AI-AGENT-GUIDE.md` + `GEMINI.md` + `docs/PROJECT-MEMORY.md`

## 1. Правило

**Код + релевантные docs/списки = один PR/TZ.** «Потом допишем» = **не DONE**.
Перед `READY FOR REVIEW` и перед archive исполнитель обязан пройти Integrity slot в своём checklist
(шаблон: `docs/agent-checklists/_TEMPLATE.md` → секция `## Integrity slot`).

## 2. Матрица «триггер → файлы»

| Изменение | Обязательно обновить |
|-----------|----------------------|
| Route / nav / chips | FIC §A + `docs/pages/<x>.page.md` + `docs/pages/PAGE-TZ-INDEX.md` / `pages/README.md` |
| Permission / role seed | FIC §B + RU labels (`permission-labels.ru.ts`) |
| Backend module / API | FIC §C (+ page.md, если есть UI) |
| User-visible section status | `docs/SECTION-READINESS.md` |
| MCP / desktop tool | FIC §E + `desktop/docs/MCP.md` |
| Доменный SoT / write-path | page.md + при необходимости audit/vision; канон не менять молча |
| Только refactor без UX/API | progress + checklist; page.md только если изменилось UX-поведение |
| Доменная карта | строка в `docs/DOMAIN-MAP.md` (OPS-304) при смене контура |

## 3. Integrity slot (обязателен в checklist)

Агент отмечает в checklist перед READY FOR REVIEW / archive:

```md
## Integrity slot (до READY / archive)

- [ ] Тип изменения определён: page | permission | module | MCP | docs-only | other
- [ ] FIC §A–E пройдены **или** N/A с причиной одной строкой
- [ ] page.md / PAGE-TZ-INDEX обновлены **или** N/A (нет UI route)
- [ ] SECTION-READINESS обновлён **или** N/A
- [ ] Чужой WIP не в коммите; conflict keys соблюдены
- [ ] Канон: docs/DOCS-INTEGRITY.md
```

Для docs-only задач: тип = `docs-only`, FIC = N/A (нет page/permission/module/MCP),
page.md = N/A, SECTION-READINESS = N/A — и так явно в Acceptance.

## 4. Анти-дрейф

- При конфликте «doc vs code» побеждают **код + живая schema** (`backend/src/modules/<x>/`).
- Doc чинится в **той же TZ** или сразу в successor; заведомо ложный page.md оставлять запрещено.
- `docs/data-model.md` может отставать от schema — сверяйся с живым кодом, правь data-model
  отдельным аккуратным изменением (не «заодно»).
- Массовый backfill старых checklist’ов до OPS-303 не требуется (known_limitation 303).

## 5. Ссылки

- Списки интеграции: `docs/FEATURE-INTEGRATION-CHECKLIST.md` (FIC §A–E)
- Тонкий склад: `docs/PROJECT-MEMORY.md`
- Карта доменов: `docs/DOMAIN-MAP.md` (OPS-304)
- Готовность разделов: `docs/SECTION-READINESS.md`
- Шаблон checklist: `docs/agent-checklists/_TEMPLATE.md`

---

*Живой файл: обновляй при смене протокола. Лимит: ≤100 строк.*
