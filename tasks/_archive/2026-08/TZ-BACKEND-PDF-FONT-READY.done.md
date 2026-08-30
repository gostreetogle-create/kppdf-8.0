# TZ-BACKEND-PDF-FONT-READY

ARCHIVE_MARKER: DONE

- status: DONE
- closed_at: 2026-08-30
- closed_by: freebuff-pdf-font-ready
- implementation: `font-display: block` для печати + bounded `document.fonts.ready` перед `page.pdf()` (коммиты a148711a, f721ee59)
- tests: PASS — backend typecheck; focused tests 2/2; full baseline 117 suites / 1090 tests
- live evidence: self-hosted `@font-face` (Tinos/Liberation/Carlito) в build-HTML, PDF-артефакт `docs/agent-checklists/evidence/TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE/live-render.pdf`
- known_limitation: бинарное извлечение встроенных шрифтов из PDF не выполнялось (локальный экстрактор недоступен); repo-wide lint 51 errors / 198 warnings и 3 legacy architecture-нарушения в `frontend/**` — вне файлов волны
- head_sha: c063df7853102b30e71a7c998daf6075e31ee02f
