# TZ-UX-311 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-UX-311.done.md`
> Commit/push: yes (PO)

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-08T09:32:42Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; checklist = SoT)
- closed_at: 2026-08-08T09:36:30Z

## Preflight

- [x] Claim before code; `_active/` empty of peers on conflict keys

## Acceptance

- [x] Мини-фото или placeholder у узла
- [x] Длинное имя — line-clamp-2, не под qty / за край
- [x] Product/module/order reuse same component; row click unchanged
- [x] gates PASS; archive; push; deploy нет

## Gates (факт)

```
cd frontend && pnpm exec jest src/app/shared/ui/composition/composition-tree.component.spec.ts --no-cache
→ 7/7 PASS
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit → PASS
cd backend && pnpm exec jest src/modules/catalog-graph/catalog-graph.service.spec.ts --no-cache
→ 13/13 PASS
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit → PASS
```

## Executor report

Thin BE photoUrl + FE thumb/wrap. Fixed pre-existing org-scope jest expectations for shared module parents (global, no $and). No QuickCreate/chrome/deploy.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: 2026-08-08T09:36:30Z
