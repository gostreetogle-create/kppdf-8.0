# Audit — DocStudio: подстановки на холсте не «цветные»

date: 2026-09-13  
PO: `{{organization.shortName}}` на A4 как обычный текст; просил другой цвет в редакторе.

## Root cause

S44 повесил `color: oklch(var(--color-info))` на `.substitution-token`, но  
`studio-blocks-canvas.textHtml()` отдаёт `block.content` **без** `migratePlainTokensToNodes`.  
Plain `{{…}}` → нет класса → чёрный текст. TipTap красит только внутри RTE.

## Follow-up

`tasks/_ready/TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP.md` — chip + toggle **Токены|Значения** (default Токены) в Свойствах.
