# TZ-COMP-401 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-COMP-401.md` (должен существовать, пока не archive)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Gemini
- claimed_at: 2026-08-18T03:48:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: yes

## Preflight

- [ ] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [ ] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [ ] TZ `tasks/TZ-COMP-401.md` прочитан
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZ-COMP-401.md` на месте

## Acceptance

- [ ] Анонимный GET `/legal/privacy` = 200
- [ ] Enroll: одно поле + ссылка на политику
- [ ] `/` без cookie = 401
- [ ] register = 410
- [ ] ng test privacy.page.spec PASS; tsc app; ng build PASS
- [ ] robots Disallow: /

## Integrity slot

- [ ] Тип: page
- [ ] page.md + PAGE-TZ-INDEX
- [ ] Чужой WIP не в коммите

## Gates

- tsc: PASS
- tests: PASS (privacy.page.spec.ts)
- build: PASS
- deploy: BLOCKED (SSH 192.168.1.103 unreachable)
- nginx/robots: BLOCKED (VPS unreachable via VM jump)

## Executor report (auto)

- outcome: PARTIAL / BLOCKED
- verification: local gates PASS, live smoke BLOCKED due to SSH timeout.
- files: frontend/src/app/app.routes.ts, frontend/src/app/pages/enroll/enroll.page.ts, frontend/src/app/pages/login/login.page.ts, frontend/src/app/pages/legal/privacy.page.ts, frontend/src/app/pages/legal/privacy.page.spec.ts, docs/pages/legal-privacy.page.md, docs/pages/enroll.page.md, docs/pages/PAGE-TZ-INDEX.md, docs/ops/home-host-access.md
- next_steps: PO needs to ensure VM is in LAN or VPN is off, then deploy and apply nginx config.
