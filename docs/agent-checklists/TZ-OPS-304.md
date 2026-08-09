# TZ-OPS-304 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-OPS-304.md` (создать при CLAIM)
> Source: `tasks/_backlog/ops/TZ-OPS-304-domain-canon-map.md`
> Depends: TZ-OPS-302 DONE + TZ-OPS-303 DONE

## Claim slot (ОБЯЗАТЕЛЬНО до правок)

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0
- team_room_claim: yes | no | unavailable

## Preflight

- [ ] Workspace `D:\kppdf-8.0`; 302+303 DONE
- [ ] Нет чужого CLAIM на DOMAIN-MAP / PROJECT-MEMORY keys
- [ ] Claim slot заполнен; `_active` marker на месте
- [ ] Routes/modules только READ; write = docs only

## Acceptance

- [ ] `DOMAIN-MAP.md` ≤180 строк; ≥11 доменов; «Не путать» с 4 канонами
- [ ] Gap inventory route↔page.md без создания missing page.md
- [ ] Ссылки из PROJECT-MEMORY + DOCS-INTEGRITY
- [ ] ARCHITECTURE pointer ≤5 строк
- [ ] Нет product code в diff

## Integrity slot (docs-only)

- [ ] Тип: docs-only
- [ ] FIC: N/A
- [ ] page.md новых: N/A (только gaps)
- [ ] SECTION-READINESS: N/A unless touched
- [ ] Чужой WIP не в коммите

## Gates

- Verification из TZ

## Executor report (auto)

_(≤15 строк перед archive)_

## Closeout

- [ ] archive + progress + `_active-map` + Status DONE
- closed_at:
