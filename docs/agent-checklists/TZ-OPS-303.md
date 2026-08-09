# TZ-OPS-303 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-OPS-303.md` (создать при CLAIM)
> Source: `tasks/_backlog/ops/TZ-OPS-303-docs-integrity-closeout.md`
> Depends: TZ-OPS-302 DONE

## Claim slot (ОБЯЗАТЕЛЬНО до правок)

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0
- team_room_claim: yes | no | unavailable

## Preflight

- [ ] Workspace `D:\kppdf-8.0`; 302 archived/DONE
- [ ] Нет чужого CLAIM на `_TEMPLATE` / FIC / DOCS-INTEGRITY
- [ ] Claim slot заполнен; `_active` marker на месте

## Acceptance

- [ ] `docs/DOCS-INTEGRITY.md` ≤100 строк + матрица + анти-дрейф
- [ ] `_TEMPLATE.md` содержит Integrity slot
- [ ] FIC §F пункт про Integrity slot
- [ ] PROJECT-MEMORY ссылается на DOCS-INTEGRITY
- [ ] GUIDE или GEMINI упоминает Integrity slot
- [ ] Нет product code diff

## Integrity slot (docs-only)

- [ ] Тип: docs-only
- [ ] FIC: N/A с причиной (мета-процесс)
- [ ] page.md: N/A
- [ ] SECTION-READINESS: N/A
- [ ] Чужой WIP не в коммите

## Gates

- Verification из TZ

## Executor report (auto)

_(≤15 строк перед archive)_

## Closeout

- [ ] archive + progress + `_active-map` + Status DONE
- closed_at:
