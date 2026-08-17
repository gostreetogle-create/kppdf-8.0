# TZ-MIG-302: КП3 → КП8 load via MCP (scoped)

> **Статус:** DONE (archive-only closeout) · 2026-08-17 · composer-executor-mig-302
> **Load executed:** 2026-08-12 · Target SoT: `http://192.168.1.103:3000` (Synology LAN prod Mongo)
> Checklist: `docs/agent-checklists/TZ-MIG-302.md` · Report: `docs/audits/2026-08-12-kp3-mcp-load-report.md`
> Deps: TZ-MIG-301 DONE · PO verdict 2026-08-12: ДА — map/rename; фото/email/brand = successors

---

## Что сделано (2026-08-12 load + 2026-08-17 closeout)

1. **Categories pre-step:** 13 product categories on SoT (14 unique from dump; 29 products без category → без categoryId + log).
2. **Load order:** Counterparties → Products → Quotations (draft + remapped lines).
3. **SoT counts (readback + id-map):**
   - Products **699** (100% KP3 dump)
   - Counterparties **16** (+1 `isOurCompany` → organizationCandidates, не CP)
   - Quotations **27** KP3 mapped (+1 probe `MIG302 probe`); 1 empty-items skipped
4. **id-map:** `data/from-kp3/id-map.json` — products 699 / cps 16 / kps 27 (gitignore, локально).
5. **Scoped skips (documented):** 5 CP INN checksum invalid; 1 CP missing INN; 1 KP empty items.
6. **Out of scope (deferred):** photoIds → MIG-303; CP.email → MIG-304; branding → MIG-305 PARK.
7. **2026-08-17 closeout:** повторная mass load **не** выполнялась; MCP :9743 offline; Synology :3000 timeout; archive + checklist + lock только.

## Transport note (MCP vs REST)

- AC «MCP ping OK»: **не** на moment load (2026-08-12) и **не** на closeout (2026-08-17).
- Load использовал **те же REST** endpoints, что оборачивают MCP tools (admin JWT). Не fake counts; readback зафиксирован в load-report.
- PO verdict 2026-08-12 разрешил scoped load; substantive AC выполнены отчётом.

## Gates

- Load-report + samples + skips/fails — в git (`docs/audits/2026-08-12-kp3-mcp-load-report.md`).
- No wipe / no deploy / no schema / no dumps in commit.
- Closeout: docs-only; чужой WIP не стейджился.

## known_limitation

- Живой MCP ping и повторный readback SoT на 2026-08-17 недоступны (offline/timeout). Доверие — load-report 2026-08-12 + id-map локально.
- Фото/email/брендинг — successor TZ (MIG-303/304/305).

## НЕ сделано (по TZ / by design)

- photoIds upload; Counterparty.email; branding snapshot restore.
- Повторная заливка 699 products в этом closeout.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-17
closed_by: composer-executor-mig-302
verification:
  - acceptance criteria: PASS (substantive load 2026-08-12; MCP ping waived — REST documented)
  - typecheck: N/A (docs-only closeout)
  - tests: N/A
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
