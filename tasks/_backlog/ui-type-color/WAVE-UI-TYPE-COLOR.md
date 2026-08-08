# WAVE — Typography scale + light/dark contrast

**Audit:** `docs/audits/2026-08-08-typography-and-theme-contrast-audit.md`  
**Goal:** спокойная 5-ролевая шкала текста + закрыть P0/P1 контраст light/dark.  
**Order (strict):** TYPE-301 → TYPE-302 → COLOR-301  
**SoT:** `D:\kppdf-8.0` main  
**Deploy:** только по команде PO

| # | TZ | Файл |
|---|-----|------|
| 1 | TZ-UI-TYPE-301 | `../TZ-UI-TYPE-301-type-scale-canon.md` |
| 2 | TZ-UI-TYPE-302 | `../TZ-UI-TYPE-302-apply-type-scale-hotspots.md` |
| 3 | TZ-UI-COLOR-301 | `../TZ-UI-COLOR-301-contrast-light-dark-sweep.md` |

## Ban

- Не трогать desktop/mcp, supply, import-todo  
- Не φ=1.618 заголовки  
- Не builder user-content recolor  
- Не PRODUCTS-307 / UX-313 в этой волне (другие keys) — можно параллелить **другим** агентом

## Checkpoint

- [ ] TYPE-301 DONE  
- [ ] TYPE-302 DONE  
- [ ] COLOR-301 DONE  
- [ ] Manual: `/modules/:id` light+dark — meta читается без прищура  
