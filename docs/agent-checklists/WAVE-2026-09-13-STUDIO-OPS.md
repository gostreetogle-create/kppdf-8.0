# WAVE — Studio ops 2026-09-13 (3 волны)

> SoT pack: `tasks/_ready/2026-09-13-studio-ops/`  
> Обновляет исполнитель **после каждого TZ** (не только в конце волны).  
> Cursor/PO смотрят этот файл = «где агент сейчас».

updated_at: 2026-09-13T12:35:00+03:00  
agent_slot: Claude  
current_wave: **1**  
current_tz: 1.2  
status: IN_WORK_WAVE1

---

## VERIFY (предшественник) — закрыт WARN

| | |
|--|--|
| TZ | `TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52` → archive / commit `984172c1` |
| Verdict | **WARN** (окружение без LAN→`.52`, не дефект деплоя) |
| Публичный enroll E2E | PASS |
| SSH remainder | `tasks/_ready/TZ-VERIFY-VM52-SSH-REMAINDER-2026-09-13.md` — **только** сессия с домашней LAN / PO вручную; **не** в волнах Claude ниже |
| Ops stale `.103` | `TZ-OPS-DOCS-HOST-52-SYNC` → волна 3 |

---

## Карта волн (conflict)

| Волна | TZ по порядку | Conflict hot | Старт |
|-------|---------------|--------------|-------|
| **1** | PHOTO-BROKEN-IMG → ADD-PAGE-WRITE-SERIAL → SELECTED-REPLACE-JUMP | resolver/canvas → editor → data-panel+editor | **сейчас** |
| **2** | NECESSITY-CLEANUP этапы A→B→C (COL-WIDTH внутри C) | editor+props+defaults+canvas | после отчёта волны 1 |
| **3** | CATEGORY-INLINE-CREATE → OPS-DOCS-HOST-52-SYNC | forms / docs ops | после волны 2 (или Freebuff параллельно волне 2 **только** CATEGORY, если Necessity уже claimed Claude) |

**Superseded (не брать):** TABLE-KIND-IA · TABLE-SOURCE-FIX · INSERT-APPLY-KIND.

---

## Волна 1 — прогресс (агент заполняет)

| # | TZ path | Claim | Evidence | Gates | Archive | Commit SHA | Status |
|---|---------|-------|----------|-------|---------|------------|--------|
| 1.1 | `…/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.md` | claude 2026-09-13T09:35:00Z | `evidence/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.txt` | BE 135/1330 + FE 123/852+7skip + arch + build PASS | `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.done.md` | `8d2d722d` | DONE |
| 1.2 | `…/TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.md` | claude 2026-09-13T10:20:00Z | `evidence/TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.txt` | FE 124/856+7skip + arch + build + live Playwright PASS | `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.done.md` | (this commit) | DONE |
| 1.3 | `…/TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP.md` | | | | | | PENDING |

**Правило строки Status:** `PENDING` → `CLAIMED` → `IN_WORK` → `GATES` → `DONE` | `BLOCKED` | `FAILED`.  
При остановке mid-wave: Status текущего = `BLOCKED`/`IN_WORK` + 3–7 строк в §Checkpoint ниже + не стартовать следующий TZ.

### Checkpoint (live log — append only)

```
2026-09-13T09:35:00Z | WAVE1 | started | HEAD=984172c1
2026-09-13T09:35:00Z | 1.1 PHOTO-BROKEN-IMG | CLAIMED
2026-09-13T10:20:00Z | 1.1 PHOTO-BROKEN-IMG | DONE | commit=8d2d722d | successor filed: tasks/_ready/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.md (out-of-scope vitrina bug found live, not fixed here)
2026-09-13T10:20:00Z | 1.2 ADD-PAGE-WRITE-SERIAL | CLAIMED
2026-09-13T11:10:00Z | 1.2 ADD-PAGE-WRITE-SERIAL | DONE | commit=(this commit, SHA backfilled at next transition) | live Playwright evidence PASS (3x add-page, 3x200, strictly increasing revision)
```

_(агент дописывает строки сюда после каждого перехода статуса)_

---

## Волна 2 — прогресс (не стартовать до DONE волны 1)

| # | Этап | Status |
|---|------|--------|
| 2.A | NECESSITY IA | PENDING |
| 2.B | NECESSITY SoT + source round-trip | PENDING |
| 2.C | NECESSITY dead controls / COL-WIDTH | PENDING |

Checklist волны 2: создать при старте промпта 2 (или расширить этот файл секцией).

---

## Волна 3 — прогресс

| # | TZ | Status |
|---|-----|--------|
| 3.1 | CATEGORY-INLINE-CREATE | PENDING |
| 3.2 | OPS-DOCS-HOST-52-SYNC | PENDING |
| — | VERIFY-VM52-SSH-REMAINDER | OUT_OF_BAND (LAN) |

---

## Антиспешка

- Не «быстро закрыть три TZ». Каждый TZ: Claim → full ACCEPT → Integrity → archive → push → **обновить эту таблицу** → только потом следующий.
- Не трогать superseded hint-TZ.
- Не deploy/wipe.
- Не править `PO-CANON` / чужой live WIP без нужды.
