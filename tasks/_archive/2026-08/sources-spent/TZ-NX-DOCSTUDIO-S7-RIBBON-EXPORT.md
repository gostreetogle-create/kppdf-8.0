# TZ-NX-DOCSTUDIO-S7-RIBBON-EXPORT — PDF + «В архив» + preview

**РОЛЬ:** executor · **ЗАВИСИМОСТИ:** S7-RAILS-DATA (для live rows в preview)  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `studio-editor.page.ts`

## ЧТО ДЕЛАТЬ

1. Ribbon **PDF** — скачивание через существующий API preview/pdf.
2. **В архив** — `finalize` + disabled states + toasts (wire если stub).
3. **Редактор | Просмотр** — preview iframe стабилен после правок слоёв.
4. Live smoke: login → `/studio/:id` → PDF bytes > 0.

## КРИТЕРИИ

- [ ] PDF кнопка не disabled на draft с блоками
- [ ] Finalize меняет статус документа
- [ ] build green
