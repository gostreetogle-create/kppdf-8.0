# NOW

updated_at: 2026-09-13T09:10:00Z

## ACTIVE / LIVE

- **Freebuff:** PARK
- **Claude:** IDLE — VERIFY enroll+VM52 done, verdict **WARN** (см. `docs/agent-checklists/VERIFY-2026-09-13-ENROLL-DEPLOY.md`)
- **Deploy:** прод на VM `.52` подтверждён — enroll-fix `9e1802fe` live, E2E enroll PASS (свежий инвайт); 2 SSH-only пункта (tunnel systemctl, secret hash) не закрыты — сессия без LAN-доступа к `.52`, successor `tasks/_ready/TZ-VERIFY-VM52-SSH-REMAINDER-2026-09-13.md`

## NEXT

_(пусто — `tasks/_active/` пуст)_ · в `tasks/_ready/`: `TZ-VERIFY-VM52-SSH-REMAINDER-2026-09-13` (XS, нужен реальный LAN-доступ), `TZ-OPS-DOCS-HOST-52-SYNC` (S, live doc `.103`→`.52`)

## DONE

- VERIFY enroll+deploy VM52: **WARN** — `docs/agent-checklists/VERIFY-2026-09-13-ENROLL-DEPLOY.md` (git-факты, все frontend-nx gates, prod E2E enroll ядро — все PASS; 2 SSH-only пункта не измерены, не дефект продукта)
- DocStudio waves fresh re-verify: **VERIFY PASS** — `docs/audits/2026-09-13-docstudio-waves-verify.md` (tip `7479caa7`; fe 122 suites/850 tests + tsc + build green; be 135 suites/1329 tests + tsc + lint green; architecture:check PASS; one unrelated pre-existing `nx lint kppdf-web` red — 38 a11y errors in supply/warehouse/other-studio-panel files, 0 in either wave's files, not hotfixed — out of scope)
- LIST-TEMPLATES-CLEAN (`7479caa7`)
- CATALOG-TABLE-IA (`b3908178`)

## PARK

- Deploy GO · Wipe · Soup
- Pre-existing `nx lint kppdf-web` a11y debt (38 errors, unrelated to DocStudio waves) — needs its own TZ, not filed automatically
