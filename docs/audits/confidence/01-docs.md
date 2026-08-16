# LEDGER-01 — Docs hygiene
date: 2026-08-16T15:20:00+03:00
agent: Buffy (freebuff)

## Score (0–100)
overall: 89
subscores:
  evidence_quality: 92
  sync_code_docs: 90
  risk_holes: 85

## What I opened (paths)
- docs/pages/PAGE-TZ-INDEX.md — index page↔TZ; programmatic link check (26 md-links)
- docs/pages/people.page.md — sample page: routes/pageKey/API/dialog/limits
- docs/pages/storage-items.page.md — sample page: envelope contract, filters, TZ refs
- docs/pages/enroll.page.md — sample page: device enroll flow, RU errors
- docs/pages/dashboard.page.md — sample page: home stats stub, couplings table
- docs/pages/orders.page.md — sample page: lifecycle hub, freeze, write-path notes
- docs/agent-checklists/_NOW.md — ACTIVE/NEXT/park map
- tasks/_park/README.md + tasks/_park/ listing — park semantics
- docs/DOCS-INTEGRITY.md — protocol for docs hygiene
- tasks/_active/{TZ-NAV-303,TZ-OPS-SITE-SMOKE-401,TZ-PHOTO-304}.md — claim markers

## PASS evidence
- PAGE-TZ-INDEX.md структурирован по разделам (Doc-constructor / Catalog / Deals / Admin / Warehouse), упоминает актуальные DONE TZ (UX-340/341/342, CATALOG-374/375, PRODUCTION-337, ORDERS-336/337) — совпадает с _NOW.md DONE-секцией.
- 5 случайных page.md: все имеют Route / API / TZ reference; ссылки внутри них резолвятся (0 broken в 5 файлах); контент не противоречит _NOW (storage-items envelope, enroll 303/304, dashboard NAV-303 stub — согласованы).
- tasks/_park/README.md честный: «Не в очереди. Возврат только по решению PO»; parked файлы (AUTH-307, SALES-320-PARKED, PRODUCTION-30x…) лежат в _park, _NOW их не выдаёт за live («park», «не брать без PO»).
- _NOW.md ACTIVE содержит реально in-progress TZ-PHOTO-304 (маркер в tasks/_active/ совпадает).
- docs/DOCS-INTEGRITY.md прочитан; мой umbrella — docs-only, FIC/page.md/SECTION-READINESS = N/A.

## FINDINGS
| id | sev | area | repro/proof | action |
|----|-----|------|-------------|--------|
| F-01 | P2 | PAGE-TZ-INDEX | 15 битых относительных ссылок из docs/pages/ (напр. `../tasks/_archive/2026-08/TZ-UX-301.done.md` резолвится в docs/tasks/…; файл существует по `../../tasks/…`). Систематическая ошибка префикса `../` вместо `../../` для tasks/, и `../docs/…` вместо `../…` для agent-checklists/audits; `../../tasks/_backlog/catalog/README.md` — каталога больше нет | fix-now → TZ-OPS-313 (файл = conflict key NAV-303 с чужим uncommitted WIP, сам не правлю) |
| F-02 | P2 | _NOW.md | tasks/_active/ содержит 3 маркера (NAV-303 READY FOR REVIEW, SITE-SMOKE-401 IN PROGRESS, PHOTO-304), а ACTIVE-секция _NOW.md — только PHOTO-304; NAV-303/SITE-SMOKE-401 не упомянуты | TZ (обновить _NOW когда владельцы сядут; см. rollup) |
| F-03 | P3 | PAGE-TZ-INDEX | «377 PARK continuation bg+table» — файл лежит в tasks/_backlog/ (TZ-SALES-377-…), а не в _park; это «backlog, не брать без PO», не park | fix-now (вместе с F-01) |
| F-04 | P3 | TZ-PHOTO-304 | маркер tasks/_active/TZ-PHOTO-304.md говорит IN PROGRESS, checklist — READY FOR REVIEW (внутренняя рассинхронизация владельца) | accept (owner) |

## TZ drafted (if any)
- tasks/_backlog/TZ-OPS-313-fix-page-tz-index-links.md (F-01 + F-03)

## Confidence note for Cursor
- PAGE-TZ-INDEX: большая часть содержимого актуальна, но ссылочные пути требуют починки; после фикса — полная проверка скриптом.
- _NOW.md не обновлялся после CLAIM NAV-303/SITE-SMOKE-401 (гигиена хромает, семантика честная).
- Глубокий drift «page.md ↔ код» за пределами выборки из 5 страниц не доказан и не опровергнут (лимит lane).
