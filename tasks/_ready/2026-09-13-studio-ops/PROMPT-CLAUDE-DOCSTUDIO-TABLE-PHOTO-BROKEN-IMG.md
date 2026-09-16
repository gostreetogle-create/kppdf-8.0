# PROMPT — Claude: битое фото в таблице студии

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace D:\kppdf-8.0.

=== UNATTENDED ===
PO AFK. Не спрашивай «продолжать?». Claim → TZ до конца → gates → archive/commit/push → отчёт.
Секреты не печатать.
=== /UNATTENDED ===

ЗАДАЧА: tasks/_ready/2026-09-13-studio-ops/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.md
Скрин PO: в таблице студии у SKU 356 / «021» — broken-image icon; сосед — «Нет фото».
Промпт-файл: tasks/_ready/2026-09-13-studio-ops/PROMPT-CLAUDE-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.md

1) Claim + conflict check (_active).
2) ШАГ 0 evidence обязателен (Network src+status, Mongo photoIds/storageUrl, disk).
3) Fix по TZ: единый uploads root с UPLOAD_DIR; canvas img onerror → «Нет фото»; ветка nginx/absolute URL — только если evidence требует.
4) Category/Save — НЕ трогать (Freebuff: TZ-NX-CATALOG-CATEGORY-INLINE-CREATE).
5) Gates + archive + push. Отчёт: root cause одной строкой + SHA.

ЗАПРЕЩЕНО: wipe, deploy.ps1, category forms, photo multer rewrite, commit секретов.
```
