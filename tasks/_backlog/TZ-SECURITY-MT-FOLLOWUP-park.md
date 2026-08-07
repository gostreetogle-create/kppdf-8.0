═══════════════════════════════════════════════════════════════
TZ-SECURITY-MT-FOLLOWUP: Park — peer audit / multi-tenant residual
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — **не сегодня**; не блокирует 303.1
SOURCE: PO summary peer-audit 2026-08-07; docs/audits/2026-08-07-peer-audit-delta.md
NOTE: Файл `tasks/AUDIT-2026-08-07-first-look-project-audit.md` на диске не найден.
  Цепочка TZ-238…241 уже в `_archive/2026-08/` (foundation). Этот stub — только
  для residual findings **после** появления peer-файла с evidence.

РОЛЬ АГЕНТА: Backend security (после un-park + evidence)
ЗАВИСИМОСТИ: peer audit file on disk; 303.1 не связан
LAYER: 4

CONFLICT KEYS: _(заполнить только после чтения peer P0/P1 с путями)_

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ ПРИ UN-PARK
═══════════════════════════════════════════════════════════════

ШАГ 1 — Прочитать peer AUDIT; выписать только пункты с file:line evidence  
ШАГ 2 — Если org leak / auth bypass = P0 → thin child-TZ **до** демо  
ШАГ 3 — Roadmap multi-tenant без exploit evidence → оставить park  
ШАГ 4 — Не смешивать с production Gantt CONFLICT KEYS

НЕ ДЕЛАТЬ: стартовать без peer-файла; «на всякий случай» трогать OrgScope.

known_limitation: без файла evidence = нет executable AC.
