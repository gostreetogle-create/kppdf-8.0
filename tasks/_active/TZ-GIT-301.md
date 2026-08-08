═══════════════════════════════════════════════════════════════
TZ-GIT-301: Merge FORM-302→305 branch → main
═══════════════════════════════════════════════════════════════

STATUS: READY · **NEXT #1**

РОЛЬ: Executor (git + conflict resolve FE only)

LAYER: 3 (merge)

Проверено: commits на
  `origin/freebuff/executor-kppdf-8-27b6af5d-6e1c-4846-ad15-e1bb83be400c`
  7bc88e17…e485f521; **не** в origin/main. NAV-302 уже на main (`b3f6948b`).

CONFLICT KEYS:
(merge) frontend/src/app/shared/ui/quick-create/**;
frontend/src/app/shared/ui/form-section/**;
frontend/src/app/shared/ui/photo/**;
frontend/src/app/pages/**/**form*dialog*.ts;
docs/agent-checklists/_active-map.md;
tasks/_archive/2026-08/TZ-UX-FORM-30*.done.md;
tasks/_backlog/TZ-UX-FORM-302*.md;
tasks/_backlog/TZ-UX-FORM-303*.md;
tasks/_backlog/TZ-UX-FORM-304*.md;
tasks/_backlog/TZ-UX-FORM-305*.md;

НЕ: deploy; rewrite NAV-302 IA; desktop WIP unrelated

---

## ЧТО ДЕЛАТЬ

1. `git fetch` · checkout main · pull --ff-only.
2. Merge `origin/freebuff/executor-kppdf-8-27b6af5d-6e1c-4846-ad15-e1bb83be400c` в main.
3. Conflicts: сохранить NAV-302 nav/chips; сохранить FORM sections/photo/BOM в QuickCreate.
   Не откатывать чужое.
4. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` + точечный jest quick-create / form-section / photo.
5. Удалить stubs FORM-302..305 из `_backlog` (архивы придут с merge).
6. Обновить `_active-map.md`; commit merge; push main.
7. Archive этот TZ-GIT-301.

## AC

- [ ] FORM-302..305 commits ancestors of origin/main
- [ ] tsc + jest PASS
- [ ] backlog stubs FORM-302..305 removed
- [ ] push; deploy нет
