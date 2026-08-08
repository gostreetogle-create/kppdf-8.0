# Audit: Org assets vs AI text bootstrap (2026-08-09)

## Vision (PO)

1. Долгосрочно: у Organization — vault (лого, печать, подписи, фоны) + Desktop MCP грузит материалы → draft КП.
2. Сейчас реалистично: ИИ готовит **текстовые блоки** по категориям; менеджер раскладывает на холсте.

## Slice now — TZD-30

- MCP: list/create text-block drafts (`isActive=false`, tag `ai-draft`).
- Агент сам создаёт категорию-полочку при необходимости.
- Todo → `/doc-constructor/texts?editId=…`.
- Не автосборка КП, не upload картинок.

## Park

| ID | Что |
|----|-----|
| TZ-ORG-DOC-ASSETS-301 | Typed roles logo/seal/signature/background на Organization |
| later | MCP photo upload + bind to template |
| later | Layout-AI на canvas |

## Already done

- TZD-28 empty template draft · TZD-29 manager todos.
