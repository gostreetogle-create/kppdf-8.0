# Audit — Просмотр без фото, PDF с фото

date: 2026-09-13  
PO: в Просмотре broken/«Нет фото»; в скачанном PDF фото есть.

## Вердикт
Не orphan disk (иначе PDF тоже пустой). Preview HTML отдаёт `/uploads/…` в `srcdoc`; PDF перед рендером делает `inlineLocalUploadsForPdf`. Fix: тот же inline в `preview()`.

TZ: `tasks/_ready/TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE.md`
