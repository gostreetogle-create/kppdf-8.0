═══════════════════════════════════════════════════════════════
TZD-73: Smoke Excel + NX Desktop download + CAPABILITY-LEDGER
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: docs + smoke checklist evidence. Минимальный code только если ledger/page pointer.

ЗАВИСИМОСТИ: TZD-72 DONE.

LAYER: 1
**SIZE:** S
**PACK:** WAVE-DESKTOP-EXCEL-NX-ALIGN

CONFLICT KEYS: `docs/CAPABILITY-LEDGER.md` ; `docs/pages/registries.page.md` ; `desktop/README.md` ; `docs/agent-checklists/WAVE-DESKTOP-EXCEL-NX-ALIGN.md` ; `docs/agent-checklists/TZD-73.md`

STATUS: READY

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. CAPABILITY-LEDGER: строка **Desktop Excel Form Studio** (TZD-50/51 + 68–70) = included; строка **NX Desktop pairing/download** = included (TZD-72) с note про `desktop:admin`.
2. `registries.page.md`: явно «массовый Excel = Desktop Form Studio; на NX registries кнопок Excel нет».
3. `desktop/README.md`: 3 кнопки — шаблон / с данными / импорт+валидация; RBAC скачивания приложения — на сайте NX.
4. WAVE checklist DoD отметить.
5. Smoke script/checklist (ручной ok):
   - Desktop: template → 2 rows (ok+dup) → reject dup
   - Desktop: export materials → edit → re-import
   - Desktop: worker form 1 row
   - NX admin: видит кнопку, скачивает, выпускает ключ
   - NX user без desktop:admin: кнопки нет

НЕ: product features; Excel в registries.

AC: ledger+page+README+WAVE DoD; smoke list в checklist с PASS/SKIP.

Финализация: archive 2026-09; wave STATUS DONE.
