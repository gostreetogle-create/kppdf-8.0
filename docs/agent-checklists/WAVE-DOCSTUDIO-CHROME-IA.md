# WAVE-DOCSTUDIO-CHROME-IA

**Цель:** чистая шапка модуля «Докум.» — три раздела + крошки; действия документа в chrome-rails.  
**Аудит:** `docs/audits/2026-09-06-docstudio-chrome-ia-audit.md`  
**PROMPT:** `tasks/PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA.md`  
**Статус: DONE (2026-09-06, Freebuff).** C1→C4 последовательно; каждый шаг закрыт `nx build kppdf-web` green.

| # | SIZE | TZ | Path | Dep | SHA |
|---|------|-----|------|-----|-----|
| 1 | S | C1 Landing list | `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-C1-LANDING-LIST.done.md` | — | `42b4df0f` |
| 2 | L | C2 Three sections | `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-C2-THREE-SECTIONS.done.md` | C1 | `85f1dc8e` |
| 3 | L | C3 Ribbon → rails | `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-C3-RIBBON-TO-RAILS.done.md` | C2 | `45d7e6b8` |
| 4 | S | C4 Docs closeout | `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-C4-DOCS-CLOSEOUT.done.md` | C3 | см. archive |

**Правило:** строго последовательно; каждый TZ заканчивается `nx build kppdf-web` green.  
**Не смешивать** с S45 / D55–D56 / warehouse в одном промпте.
