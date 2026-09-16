# PROMPT — Freebuff/Claude: ширина колонок таблицы студии

```
Ты executor kppdf-8.0. Workspace D:\kppdf-8.0. UNATTENDED.

ЗАДАЧА: tasks/_ready/2026-09-13-studio-ops/TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY.md
(сначала перенеси в tasks/_active/ + Claim; НЕ параллелить с TABLE-PHOTO-BROKEN-IMG)

Факт: цифры width в «Структура колонок» сохраняются, но renderStudioTableHtml
делит 100/n поровну, canvas th без width — поэтому PO «меняю — ничего».

Сделай: % из col.width на canvas + preview/PDF; hint «Ширина, %».
Gates + archive + push.
```
