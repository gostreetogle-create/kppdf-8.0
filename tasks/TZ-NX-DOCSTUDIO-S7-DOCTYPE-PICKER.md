# TZ-NX-DOCSTUDIO-S7-DOCTYPE-PICKER — тип документа для save-as-template

**РОЛЬ:** executor · **ЗАВИСИМОСТИ:** S7-RAILS-TEMPLATE DONE  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `studio-template-panel.component.ts`; `studio-editor.page.ts`

## ЧТО ДЕЛАТЬ

1. Select «Тип документа» в панели «Шаблон» (список doc types из API).
2. PATCH `docTypeId` на studio document (`UpdateStudioDocumentPayload` + `expectedRevision`).
3. Save-as-template enabled только когда `docTypeId` задан (hint если пусто).

## КРИТЕРИИ

- [ ] Выбор типа сохраняется после F5
- [ ] Save-as-template работает после выбора типа
- [ ] build green

**QUEUE:** после S7-3 или параллельно если другой hot file — иначе queued после S7-4.
