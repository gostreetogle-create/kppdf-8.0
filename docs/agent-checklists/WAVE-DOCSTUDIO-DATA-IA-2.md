# WAVE — Doc Studio Data IA-2 (PO screenshot follow-up)

date: 2026-09-05
prompt: `tasks/PROMPT-FREEBUFF-DOCSTUDIO-D55-D56.md`
agent: Freebuff (sequential S; один `kppdf-web` slot)

## Цель

После Data IA D50–D54 убрать KP-жаргон в «Связи», дать сброс селектов, снять двойной заголовок «Данные», вынести буфер «Выбрано» в левый chrome-rail (PO override TOC-only IA).

## Цепочка

| SIZE | ID | Path | Статус |
|------|-----|------|--------|
| S | D55 | `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-D55-LINKS-COPY-CLEAR.md` | DONE — archive `97d72e9f` |
| S | D56 | `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-D56-SELECTED-RAIL.md` | DONE — `efb647b8` + `3792c773` |

## Правила

- Один агент, строго D55 → archive → D56.
- `nx build kppdf-web` baseline до первого claim; last gate каждой TZ.
- Не параллелить с другим `kppdf-web` TZ.

## Done when

Оба archived + Executor report (auto) + `_NOW.md` обновлён.
