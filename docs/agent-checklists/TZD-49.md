# TZD-49 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-49.md` (удалён после archive)
> Commit/push: desktop zone по запросу PO

## Claim slot

- agent_id: subagent (desktop executor, TZD-49)
- claimed_at: 2026-08-18T22:10:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (LAYER 3; параллель TZD-58 на publish-installer.mjs — не трогали)

## Acceptance (критерии из TZ)

- [x] PO CAD xlsx: пустое имя модуля → fallback name=article + warning, confirm не блокируется
- [x] Длина/Ширина/Толщина/Масса → dimensions + weight на create module/product
- [x] Spec confirm lookup по article/sku (search API), не blind limit=100
- [x] Journal hint: spec confirm пишет в каталог сразу (не журнал)
- [x] Tests: specification-import.test.ts (+4 кейса)
- [x] Gates PASS (tsc, svelte-check 0/0, desktop tests 75/75)

## Gates (факт)

```text
cd desktop && npx tsc --noEmit
cd desktop && npx svelte-check --threshold error
cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts
```

- [x] tsc — PASS
- [x] svelte-check — PASS 0/0
- [x] desktop tests — PASS 75/75

## Smoke PO (ручной, после deploy/installer)

1. Desktop v0.5.6 → Импорт → CAD xlsx `6104 test Tigran…` → confirm состав без 83× missing_name block

## Known limits

- Редактирование имён в превью спецификации — не scope (fallback only)
- Полный journal unify для spec confirm — отдельный TZ
- Модули lookup: полный GET /api/modules (нет search endpoint)
