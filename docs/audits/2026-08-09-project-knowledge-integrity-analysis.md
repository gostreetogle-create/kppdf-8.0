# Audit — Project Knowledge Integrity (агентский «склад»)

**Date:** 2026-08-09  
**Mode:** Process / docs audit · no product code · no Graphify  
**Trigger:** PO — нужна целостность знаний проекта: ничего не терять, агенты находят логику без full-repo scan.

---

## 1. Verdict (1 абзац)

Система **процессно зрелая** (CLAIM, TZ FSM, checklists, FEATURE-INTEGRATION, page docs, SECTION-READINESS), но **знаниевая целостность ещё не закрыта**: нет одного тонкого «памятного пакета», нет обязательного Integrity-слота на closeout, нет канон-карты домен→код→страница. Из-за этого агенты то перечитывают лишнее, то забывают обновить списки — и SoT **дрейфует**. Graphify / code-graph **не** закрывает эту дыру.

**Зрелость:** ~70% процесса · ~45% knowledge-sync. Цель волны OPS-302…304: довести knowledge-sync до «агент не теряет и не ломает».

---

## 2. Что уже есть (не ломать)

| Слой | Путь | Роль |
|------|------|------|
| Онбординг | `docs/AI-AGENT-GUIDE.md`, `docs/how-to-connect-ai.md` | компас входа |
| PO / вкус | `docs/PO-DIARY.md` | intent, не код |
| Архитектура / домен | `ARCHITECTURE.md`, `docs/data-model.md`, `STACK.md` | большая карта |
| Паттерны + интеграция | `DEVELOPMENT-PATTERNS.md`, `FEATURE-INTEGRATION-CHECKLIST.md` | «не забыть списки» |
| Страницы | `docs/pages/*.page.md`, `PAGE-TZ-INDEX.md` | локальная правда UI |
| Готовность разделов | `docs/SECTION-READINESS.md` | можно ли жить боевыми данными |
| Работа агентов | `tasks/`, checklists, `_active-map`, Team Room, `GEMINI.md` | бронь / очередь / archive |
| Vision потоков | audits sales-to-shop, warehouse-workshop, desktop import | север продукта |

Это **не** пустой репозиторий. Это склад **человеко-документный + процессный**.

---

## 3. Реальные дыры (P0–P2)

| Sev | Gap | Эффект для PO |
|-----|-----|----------------|
| **P0** | Нет тонкого **Project Memory** (≤~120 строк), обязательного после CLAIM | агент либо тонет в ARCHITECTURE, либо пропускает канон |
| **P0** | Closeout не требует явного **Integrity slot** (page.md / FIC / PAGE-TZ-INDEX / readiness) | «код готов, списки устарели» → меню/права/доки разъезжаются |
| **P1** | Нет **DOMAIN-MAP** (домен → BE module → route → page.md → SoT docs) | связность логики держится в головах моделей |
| **P1** | `data-model.md` / большие docs могут отставать от schema без протокола «когда обновлять» | агент верит устаревшему |
| **P2** | Два контура STATUS (root vs OrchestratorKit) | путаница путей `_active` |
| **P2** | Нет авто-drift gate (скрипт routes↔page.md) | ручной аудит только |  
| **N/A** | Graphify / AST knowledge graph | не чинит checklists, FIC, claim, page docs |

---

## 4. Что НЕ делать

- Не ставить Graphify / Neo4j / vector DB «на всякий случай».
- Не переписывать ARCHITECTURE.md целиком.
- Не требовать от исполнителя заполнить все missing `*.page.md` в одной TZ.
- Не трогать product FE/BE в этой волне.
- Не смешивать с KP-vitrine / DOC-344 / DOC-TABLES-305.

---

## 5. Remediation wave (исполняемая)

| TZ | Цель | Outcome |
|----|------|---------|
| **TZ-OPS-302** | `docs/PROJECT-MEMORY.md` + проводка в GUIDE / GEMINI / how-to-connect | агент стартует с тонкого пакета |
| **TZ-OPS-303** | `docs/DOCS-INTEGRITY.md` + Integrity slot в `_TEMPLATE` + §F FIC | closeout без «забыли списки» |
| **TZ-OPS-304** | `docs/DOMAIN-MAP.md` + gap-таблица routes без page.md | связность домен↔код↔UI; gaps → successors |

Индекс волны: `tasks/_backlog/ops/WAVE-PROJECT-KNOWLEDGE.md`  
Промпт: `tasks/_backlog/ops/PROMPT-OPS-KNOWLEDGE-CONTINUOUS.md`

---

## 6. Definition of done для «склада» (после волны)

Агент после CLAIM:

1. Читает PROJECT-MEMORY (не весь репо).
2. По DOMAIN-MAP находит модуль/страницу/SoT за ≤2 минуты.
3. Перед archive заполняет Integrity slot — иначе не DONE.
4. Чужой WIP / чужие conflict keys не коммитит.
5. Новая страница/право/MCP без FIC = блокер archive.

---

## 7. Success metrics (качественные)

- Новый исполнитель находит «где правда по складу/КП/builder» без grep всего `docs/`.
- Закрытая TZ с UI/route не уходит в archive без строки page.md / PAGE-TZ-INDEX (если применимо).
- PO может сказать «проверь очередь OPS» — и файлов в git достаточно без чата.

---

_Автор: Cursor Mode A · 2026-08-09_
