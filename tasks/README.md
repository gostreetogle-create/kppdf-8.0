# Active TZ backlog index

**Verified:** 2026-08-03 · Stabilization Wave **DONE** · workspace `D:\kppdf-8.0` · branch `main`

| Folder | Meaning |
|--------|---------|
| `tasks/*.md` (root) | **Только** TZ, которые сейчас можно/нужно исполнять |
| `tasks/_backlog/` | Парк / следующие волны (не брать без PO) |
| `tasks/_archive/YYYY-MM/` | DONE / FAILED / DEFERRED — история |
| `tasks/_active/` | OrchestratorKit runtime |
| `tasks/README.md` | Этот индекс |

Волна: [`docs/STABILIZATION-WAVE-2026-08.md`](../docs/STABILIZATION-WAVE-2026-08.md)  
Map: [`docs/agent-checklists/_active-map.md`](../docs/agent-checklists/_active-map.md)  
Авторам: [`docs/TZ-AUTHORING.md`](../docs/TZ-AUTHORING.md) · Dialog: [`docs/DIALOG-COOKBOOK.md`](../docs/DIALOG-COOKBOOK.md)

---

## Active (root)

Сейчас **пусто** по Stabilization Wave. Следующую работу берёт PO из `_backlog/` (не Z-002 без явного указа).

---

## Parked (`_backlog/`) — не исполнять без PO

See [`_backlog/README.md`](_backlog/README.md).

| Cluster | Examples |
|---------|----------|
| People | **UX-306** (после вертикали шаблонов — вертикаль закрыта) |
| Production / Gantt | PRODUCTION-301…307 |
| Z-series | `_backlog/z-series/` — **Z-002 PARKED** |

---

## Recently archived

| ID | Note |
|----|------|
| **DOC-337…341** | Stabilization: pageSize, category, duplicate, mobile dialog, docs |
| **UX-DIALOG-301** | 375px clamp materials/product/table |
| **PROC-301** | Deploy smoke checklist |
| DEPLOY-301 | First-deploy gate DONE |
| DOC-324…336 | Builder / texts / tables polish DONE |

---

## Cleanup rule

После DONE: только `_archive/…/*.done.md`. Не дублировать root + backlog.
