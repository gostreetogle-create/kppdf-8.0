# Audit — DocStudio text props: Токены/Значения + дубли выравнивания

date: 2026-09-13  
PO: «Значения» без видимой разницы; default должен быть Значения; два ряда align + надо слить размер/цвет наверх.

## Токены / Значения

| Факт | Путь |
|------|------|
| Mode signal default `tokens` | `studio-editor.page.ts` `tokenDisplayMode` |
| Canvas wired | `[tokenDisplayMode]` + `[substitutionBag]="editorSubstitutionBag()"` |
| Values resolve | `studioTextDisplayHtml` → `renderStudioTokensAsValues` |
| **Unresolved → тот же chip**, что и в Токены | `renderStudioTokensAsValues` L165–166 |

Если клиент не в bag / поле пустое — переключение **визуально no-op**. Не «кнопка мёртвая», а silent fail UX.

## Дубли align

| UI | Что делает |
|----|------------|
| TipTap toolbar (над RTE «Текст на листе») | `textAlign` **внутри** HTML абзаца |
| Нижний ряд в typo box | `block.style.align` → canvas `[style.text-align]` |

Для оператора оба = «выровнять текст» → дубль. Канон листа: **block.style** (PDF/холст). TipTap-align — лишний второй путь.

## Follow-up

`tasks/_ready/TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON.md` (после REVISION-RACE)
