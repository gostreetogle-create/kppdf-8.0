# TZ-OPS-GANTT-401-CLOSE: archive уже залитого GANTT-401

РОЛЬ: Docs / closeout  
LAYER: 1  
STATUS: READY  

CONFLICT KEYS: `tasks/_active/TZ-GANTT-401.md` ; `docs/agent-checklists/TZ-GANTT-401.md` ; `docs/agent-checklists/_NOW.md` ; `progress.md` ; `.mimocode/locks/TZ-GANTT-401*.lock`

Код уже на main: `036b5fd5`. Checklist READY FOR REVIEW, `_active` ещё висит.

## ЧТО ДЕЛАТЬ

1. Сверить gates из checklist (перезапусти focused production/gantt tests если указаны).  
2. `tasks/_archive/2026-08/TZ-GANTT-401.done.md` + ARCHIVE_MARKER + SHA `036b5fd5`.  
3. Удалить `_active/TZ-GANTT-401.md`.  
4. Lock + checklist Status=DONE + `_NOW` + progress.  
5. Commit docs only + push.

## НЕ

- Менять production/** код  
- Deploy  

## AC

- [ ] archive + нет _active GANTT-401  
- [ ] push  
