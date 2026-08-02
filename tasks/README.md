# Active TZ backlog index

**Verified:** 2026-08-02 · workspace `D:\kppdf-8.0` · branch `main`

| Folder | Meaning |
|--------|---------|
| `tasks/*.md` (root) | **Только** TZ, которые сейчас можно/нужно исполнять |
| `tasks/_backlog/` | Парк / следующие волны (не брать без PO) |
| `tasks/_archive/YYYY-MM/` | DONE / FAILED / DEFERRED — история |
| `tasks/_active/` | OrchestratorKit runtime (агент кладёт копию на время работы) |
| `tasks/README.md` | Этот индекс (не TZ) |

Агент: **одна** TZ за раз → conflict keys → checklist → код → archive → строка здесь.

Live focus map: [`docs/agent-checklists/_active-map.md`](../docs/agent-checklists/_active-map.md).  
Авторам: [`docs/TZ-AUTHORING.md`](../docs/TZ-AUTHORING.md).

---

## Active (root)

| ID | Category | Priority | Status | Notes |
|----|----------|---------:|--------|-------|
| — | — | — | **empty** | No root TZ. **TZ-DEPLOY-301 DONE** → [`_archive/2026-08/TZ-DEPLOY-301-prep-first-deploy.done.md`](_archive/2026-08/TZ-DEPLOY-301-prep-first-deploy.done.md). PO: VPN off → `.\deploy\synology\deploy.ps1`. |

Корневых DOC/UX/MATERIALS/DEPLOY TZ сейчас **нет** — закрыты в `_archive/2026-08/`.

---

## Parked (`_backlog/`) — не исполнять без PO

See [`_backlog/README.md`](_backlog/README.md) (audit 2026-08-02).

| Cluster | Examples |
|---------|----------|
| Production / Gantt | PRODUCTION-301…307, vision/GANT |
| Commerce lifecycle | CORE-301, INVENTORY-301, PROCUREMENT, SHIPPING, DOC-330 |
| People | UX-306 (rewrite) |
| Access residual | ACCESS-304 verification (nav mostly done); ACCESS-303 **DONE** |
| Z-series | `_backlog/z-series/` |

---

## Recently archived

| ID | Note |
|----|------|
| **DEPLOY-301** | First-deploy gate (auth A, compose, docs) — DONE; live smoke = VPN |
| DOC-324…326, 331…336 | Builder / texts / tables / photos / inspector — DONE |
| ACCESS-301/302, MATERIALS-307/309, UX-304, SALES-301 | DONE (see `_archive/2026-08/`) |

---

## Cleanup rule

После DONE: файл **только** в `_archive/…/*.done.md` (или `.failed` / `.deferred`).  
Не оставлять копию в root и в `_backlog` одновременно.
