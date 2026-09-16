# PROMPT — continuous: Gantt UX + Dark Theme Pro

Ты executor (`agent_id: freebuff`). `D:\kppdf-8.0` main · UNATTENDED.

### Preflight
1. `tasks/_active/` пуст (hotfix DONE). Нет чужого `kppdf-web` claim.  
2. Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web`  
3. Pack: `tasks/_ready/2026-09-15-gantt-workers-dark/WAVE-MAP.md`  
4. Audits (обязательно):  
   - `docs/audits/2026-09-15-gantt-workers-unassigned-void.md`  
   - `docs/audits/2026-09-15-dark-theme-pro-zip.md` ← HEX + **typography «3 Files Changed»**  
5. Цвета → только наши `*-override` (`paper`/`gold`/`ink`…). **Не** порт React/`_tmp-dark-theme-pro`. **Не** Pro-имена `--bg-canvas`.  
6. Ink dark ≈ `#C9D1D9` (не `#F1F5F9` / не `#fff`); weight ~400; на gold → `text-on-gold` (`#0F1117`).  
7. 4 фиксированных HEX WT Ганта из Pro — **не** ломать `accentHue` каталога.

### Цепочка → STOP
0. `TZ-NX-GANTT-UNASSIGNED-AUTOEXPAND`  
1. `TZ-NX-GANTT-WORKERS-EMPTY-STATE`  
2. `TZ-NX-GANTT-SORT-MANUAL` — default № заказа; дата opt-in; UI у легенды  
3. `TZ-NX-GANTT-UNASSIGNED-DARK-WASH`  
4. `TZ-NX-DARK-PALETTE-PRO` (L)  
5. `TZ-NX-DARK-CONTRAST-SWEEP` (L)

Каждая: claim → code → gates из TZ → archive → commit → next.  
`nx build kppdf-web` — **последний** gate каждой TZ.

Не deploy. Не light redesign. Не копипаст Tailwind-макета. Не hotfix TZ заново.
