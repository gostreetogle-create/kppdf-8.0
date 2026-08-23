# PROMPT — Claude / Cursor executor: post-KP closeout

> После `TZ-KP-WS-409.done` на origin. Deploy только по PO «кати».

```text
Репо: D:\kppdf-8.0
GEMINI.md + kppdf-executor-loop

STOP KEYS (Freebuff на KP):
- proposals/workspace/** пока 409 не archived

ОЧЕРЕДЬ:
1) TZ-UI-DEN-552 — `tasks/_backlog/ui-density/TZ-UI-DEN-552-kp-workspace-density.md`
   (только после TZ-KP-WS-409.done)

2) PO sign-off — заполнить 5 routes в docs/agent-checklists/UI-DENSITY-GUARDS.md

Gates 552:
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test -- proposal-workspace && pnpm lint

DoD density program: 552 archived + PO table filled + «кати» по желанию PO.
```
