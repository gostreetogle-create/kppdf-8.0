# PROMPT — closeout WAVE UX-HYGIENE-440 (один Freebuff)

> Остаток волны: UX-440 **код готов, не закоммичен**; DESK-440 **код в git, archive не закрыт**.
> SHIP-440 уже DONE — не трогать.

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
docs/GIT-POLICY.md — commit/push своих путей.

Факт (Cursor cross-check):
- TZ-SHIP-440 DONE → tasks/_archive/2026-08/TZ-SHIP-440.done.md · c50d57f2
- TZ-DESK-440 feat e835003b + closeout 0b52a7cb — код ок; _active ещё лежит; archive не DONE
- TZ-UX-440 — diff уже в working tree (Почта / Офисный ПК / без catalogDirtyFields.join); checklist READY; НЕ в git

Сделай ТОЛЬКО closeout (не новые фичи):

A) TZ-UX-440
1) CLAIM если _active ещё есть (или продолжи)
2) Stage ТОЛЬКО conflict keys:
   supply-quick-order.component.ts
   people.page.ts · people-form-dialog.component.ts
   users-admin.page.ts · user-form-dialog.component.ts
   pairing-dialog.component.ts
   proposal-workspace.page.ts
   + docs/agent-checklists/TZ-UX-440.md · tasks/TZ-UX-440-ru-labels-kp-dirty.md
3) Commit conventional · push
4) Archive → tasks/_archive/2026-08/TZ-UX-440.done.md · lock · Status DONE
5) Удалить tasks/_active/TZ-UX-440-* и spent root TZ если дубль

B) TZ-DESK-440
1) Cursor/PO PASS принят по evidence e835003b (jest+tsc)
2) Archive → tasks/_archive/2026-08/TZ-DESK-440.done.md · lock
3) Checklist Status=DONE · closed_at ISO
4) Удалить tasks/_active/TZ-DESK-440-* · spent root TZ-DESK-440-*
5) progress.md одна строка

C) Гигиена очереди
- Обнови QUEUE-LIVE / _NOW: WAVE 440 DONE; NEXT = CATALOG-377
- НЕ трогай shipping (SHIP-440)
- НЕ deploy / wipe
- Чужой WIP (data/КП, tmp-registry.json) не stage

После: одна строка «WAVE 440 closeout DONE · shas: …»
```
