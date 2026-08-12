# TZ-MIG-301 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-MIG-301.done.md`
> Commit/push: **YES** (executor continuous; только audit + checklist + archive + wave docs; НЕ дампы/media)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-buffy
- claimed_at: 2026-08-12T19:05:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-MIG-301; CLI сканирует tasks/*.md, не _backlog) — Claim slot = source of truth

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на keys (`data/from-kp3/**`, audit, TZ-MIG-301)
- [x] TZ / канон / deps прочитаны (AI-AGENT-GUIDE, TZ-AUTHORING §1, kp3-data-copy-access, WAVE, TZ-MIG-301)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-MIG-301.md` на месте

## Acceptance

- [x] SSH BatchMode OK на `root@130.49.129.240` + `ls /opt/kppdf`
- [x] `data/from-kp3/raw/{products,counterparties,kps}.json` + manifest.json; counts 699 / 23 / 28
- [x] `data/from-kp3/media/**` + photos-index.json; missing-media.txt (0 битых ссылок)
- [x] `docs/audits/2026-08-12-kp3-to-kp8-field-map.md` с вердиктами map/rename-synonym/drop-ok/gap-block
- [x] `data/from-kp3/id-map.template.json` с полным набором source ids (699/23/28)
- [x] Checklist + Executor report (auto); archive `tasks/_archive/2026-08/TZ-MIG-301.done.md` + lock
- [x] Нет коммита бинарных media/JSON-дампов в git (только audit + checklist + archive)

## Integrity slot (до READY / archive)

- [x] Тип изменения: **docs-only + local data pack** (нет product UI/backend schema patches)
- [x] FIC §A–E: N/A — не трогаем FE/BE schema; только выгрузка + аудит маппинга
- [x] page.md / PAGE-TZ-INDEX: N/A (нет UI route)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md (audit в docs/audits/)

## Gates (факт)

- SSH BatchMode `echo OK` + `ls /opt/kppdf` → PASS (collections products 699 / counterparties 23 / kps 28)
- mongoexport (mongosh JSON.stringify) → PASS: 699 / 23 / 28, `_id` и вложенные ObjectId как строки
- media tar-stream → PASS: 690 файлов (products 684, kp 6, specs 0), 82 MB
- `git check-ignore -v data/from-kp3/raw/products.json` → PASS (`data/from-kp3/raw/`), media + `**/*.json` тоже игнорируются
- `git diff --check` → (см. итог) PASS

## Executor report

- Выгружен КП3 (SSH key `kppdf8-kp3-data-copy`) read-only: 3 коллекции Mongo `kp-app` + media 690 файлов → `data/from-kp3/`.
- Staging: `raw/{products,counterparties,kps}.json` + `manifest.json` (counts, host, db, git HEAD, method) + `photos-index.json` (661) + `id-map.template.json` (699/23/28) + `missing-media.txt` (пуст) + `orphan-media.txt` (35) + `media-prefix-mismatch.txt` (10).
- Аудит `docs/audits/2026-08-12-kp3-to-kp8-field-map.md`: полные таблицы Products / Counterparties(+Organization) / KPs→Quotation(+items) / Photos с вердиктами.
- gap-block (3): фото (нет MCP upload tool), Counterparty.email (нет поля), брендинг КП (нет слота). Pre-step: category string→Category словарь.
- Ничего не писал в Mongo/API КП8; не deploy; не менял FE/BE schema; дампы/media не в git.

## Ask PO (после PASS)

- gap-block: (1) фото `photoIds` — MCP upload tool отсутствует; (2) `Counterparty.email` (10/23) — нет поля на Counterparty/Organization; (3) брендинг КП `companySnapshot.assets`/`brandingTemplates` — нет слота в Organization.assets/DocumentTemplate.
- Можно ли стартовать MIG-302 для map/rename части (продукты без фото, контрагенты без email/фото, КП→Quotation)? Фото/email/брендинг — отдельные successor-TZ.
