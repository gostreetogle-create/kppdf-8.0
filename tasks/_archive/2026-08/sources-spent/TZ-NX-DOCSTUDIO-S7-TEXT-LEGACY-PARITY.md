# TZ-NX-DOCSTUDIO-S7-TEXT-LEGACY-PARITY — инструменты текста из legacy конструктора

**РОЛЬ:** executor · **ЗАВИСИМОСТИ:** S7-WIP-CLOSEOUT DONE  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `studio-text-properties.component.ts`; `studio-blocks-canvas.component.ts`

**Референс:** `frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts`

## ЧТО ДЕЛАТЬ

1. **Шрифт** — select из whitelist (Times New Roman, Arial, Calibri) → `block.style.fontFamily`.
2. **Межстрочный** — `lineHeight` (опционально compact UI).
3. **Вставка поля данных** — кнопка «⊕ Поле…» → picker токенов `{{…}}` (TipTap SubstitutionToken уже в PiRichText).
4. Мультиколоночный текст — **out of scope** unless PO insists; зафиксировать в known_limitation.

## КРИТЕРИИ

- [ ] fontFamily на листе и в preview PDF совпадают (backend BlockStyle)
- [ ] Токен вставляется в rich-text
- [ ] build + studio tests green
