# QUEUE-LIVE

> 2026-08-23 · качество > скорость · PO: вариант **А** для снабжения

## Только что DONE (локально, не push)

| TZ | SHA | Что проверить глазом |
|----|-----|----------------------|
| PLUS-601 | `a8ef3a22` | Карточка заказчика → контакт → **зелёный квадратный +** в одной строке со списком |
| SUPPLY-308R | `e8c5a54a` | Снабжение → быстрый заказ → expand → **▸ Поставщик / ▸ Детали** отдельно |
| PLUS-602 | `a6d8cee` | Изделие: категория + · Материал: поставщик + |
| PLUS-603 | `a4bd2d19` | Заказ: заказчик + · объект + |

Программа: `docs/audits/2026-08-23-site-ui-quality-wave.md`

## NEXT

- **Deploy-Ready:** `docs/agent-checklists/DEPLOY-READY.md` → READY @ `167865c9`
- PO: любому ИИ — «сделай деплой по документации» (VPN off; без тестов)
- Done: TZ-SUPPLY-316/317 material filter + supplier blur-persist

- PLUS-604: оставшиеся blocking selects (КП form / pickers)
- Каталог expand уже есть (products/modules) — не трогать без бага
