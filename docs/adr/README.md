# ADR — индекс решений

> Не писать сюда новые журналы «заодно». Это **указатель** на уже принятые решения.
> Живой вкус PO: `docs/PO-CANON.md`. История сессий: `docs/PO-DIARY.md` §5.
> Новое необратимое решение (схема, 152-ФЗ, write-path) → короткий memo + строка в этой таблице.

| Тема | Где зафиксировано |
|------|-------------------|
| GitHub = только хранилище, без Actions | `docs/GIT-POLICY.md`, `_NOW.md` |
| Покупатель ≠ наша фирма | `docs/CONTEXT.md`, `docs/TZ-AUTHORING.md` §1.1 |
| Север продаж → цех | `docs/audits/2026-08-08-sales-to-shop-flow-canon.md` |
| Комбайн: ряд = изделие | `docs/methods/combine-product-row-kanban.md` |
| 152-ФЗ / путь A (без VPN) | `docs/compliance/COMPLIANCE-RULES.md`, `docs/compliance/2026-08-18-DECISION-MEMO.md` |
| Стол `/desk` chrome | `docs/pages/page-chrome.md`, `docs/pages/manager-desk.page.md` |
| Снабжение: каталог = SoT строки | `docs/audits/2026-08-19-supply-quick-order-design-canon.md` |
| Опасные ops / wipe | `docs/ops/DANGEROUS-OPS.md` |
| Ритуалы агентов vs mattpocock/skills | `docs/agents/SKILLS-MAP.md` |
| Desktop локальная LLM = GGUF llama.cpp, не Ollama | `docs/superpowers/specs/2026-08-22-desktop-local-ai-onboarding.md` |

Не создавать `docs/prd/` и `docs/issues/`: спека = `tasks/TZ-*.md`, тикет = `tasks/_active/`.
