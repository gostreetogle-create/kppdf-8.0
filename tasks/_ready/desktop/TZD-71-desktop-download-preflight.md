═══════════════════════════════════════════════════════════════
TZD-71: Desktop download preflight (до порта NX)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: docs + минимальный prep NX index/meta/deploy hook. **Не** полный PairingDialog (это TZD-72).

ЗАВИСИМОСТИ: TZD-70 DONE. Аудит: `docs/audits/2026-09-05-nx-desktop-download-port-audit.md` §4.

LAYER: 2–3
**SIZE:** S
**PACK:** WAVE-DESKTOP-EXCEL-NX-ALIGN

CONFLICT KEYS: `frontend-nx/apps/kppdf-web/src/index.html` ; `deploy/**` (только если inject meta для NX) ; `docs/audits/2026-09-05-nx-desktop-download-port-audit.md` (evidence) ; `docs/agent-checklists/TZD-71.md`

IMPLICIT CONFLICT: `nx build kppdf-web` если трогаешь index.html

STATUS: READY

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Пройти checklist аудита §4 с evidence (URL, HEAD, semver, alias bytes).
2. Добавить в NX `index.html` meta `kppdf-desktop-download-url` (как legacy) — даже пустой.
3. Если deploy inject только legacy `frontend/` — добавить зеркало для NX browser dist (minimal diff); иначе зафиксировать known_limitation + successor.
4. Короткий отчёт в checklist: PASS/FAIL по каждому пункту §4.
5. **Не** открывать pairing UI; **не** добавлять permission ещё (TZD-72).

НЕ: App.svelte Desktop Excel; полный NX dialog; wipe/deploy prod без PO.

AC:
- [ ] Evidence table в checklist
- [ ] NX index.html имеет meta tag
- [ ] nx build green если index тронут

Финализация: archive 2026-09.
