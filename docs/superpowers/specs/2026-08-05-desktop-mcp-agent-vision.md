# Vision: Desktop companion + MCP agent socket

> **Status:** VISION / backlog — PO approved direction 2026-08-05.  
> **Prefix:** `TZD-*` (desktop).  
> **Not Cursor-tied:** MCP = universal socket; any AI client that speaks MCP + has network access to the local host can connect later.

---

## 1. Goal (plain language)

Manager (any user created by admin in the web app) installs **KPPDF Desktop** on Windows:

1. Pairs to the same backend (login / pairing packet — same RBAC as web).
2. Desktop can auto-start a **local MCP server** (localhost / LAN IP).
3. AI (in-app chat later, or external MCP client) uses tools to **read/write ERP data** via that socket.
4. Dangerous or bulk writes go through **propose → confirm** and leave a **reversible mutation journal** (not full DB dumps every time).

**Source of truth remains the Nest/Mongo backend.** Desktop and MCP are clients — never a second database of record.

---

## 2. What MCP is here

MCP = tool protocol for AI («розетка»).

| Layer | Role |
|-------|------|
| Backend REST + RBAC | SoT, auth, audit |
| Desktop (Tauri) | Installer UX, pairing, files/inbox, optional in-app AI, **hosts MCP** |
| MCP server | Thin adapter: tools → same REST (or shared service layer) |
| AI model | Brain only (Ollama / cloud API / future — swappable) |

We **prepare the socket first**. Which model plugs in is a later switch (`desktop/docs/AI-PROVIDERS.md`).

---

## 3. Users & auth

- Primary user: **manager** with web `User` (admin creates email/password).
- Desktop uses the same org/roles/permissions as web.
- No hard dependency on Cursor / Claude Desktop for production managers.
- External MCP clients (Cursor, Claude, etc.) are **optional** consumers of the same local socket for power users / future.

---

## 4. Safety: «human-in-the-loop» + rollback (chosen design)

**Human-in-the-loop** = before applying a write the agent **proposes** a change set; a human (or a strict policy gate) **confirms**. Then the server applies it.

**Do not** full-backup Mongo on every delete (too slow/heavy).

**Do** a **Mutation Journal** (entity-level):

1. Before apply: store `mutationId`, actor, tool name, list of `{ entityType, entityId, before, after }` (or before-only for deletes).
2. Apply via normal API (soft-delete where already used).
3. Keep a **ring buffer** of last **N = 50** mutation batches (configurable 20–50).
4. **Undo** = re-apply `before` snapshots (or undelete) for that `mutationId` if still in the ring.
5. Global/destructive tools (`purge`, multi-delete) always require confirm + journal entry.

This is closer to «server-side commit / undo stack» than GitHub commits or nightly backups.

---

## 5. Phasing vs existing desktop roadmap

Already in archive `TZD-00`: import skeleton v0.1–v0.3; planned **TZD-01…10** (AI pipeline, batch, pairing button, etc.).

> **Update 2026-08-08:** MCP stream **TZD-11…17, 20–22, 24 DONE**. Next brain = **TZD-23** (matching+HITL). PO bulk-migrate audit: `docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md`. Park succession: 23→26→18→19→27→28→29.

**New MCP stream (this doc): TZD-11…15** — historically phased below; most items now archived DONE.

| ID | Title | Depends |
|----|-------|---------|
| **TZD-11** | MCP server foundation (local bind, auth, tool registry) | pairing token available |
| **TZD-12** | MCP read tools (catalog/warehouse/org-scoped) | TZD-11 |
| **TZD-13** | MCP write tools + propose/confirm + mutation journal | TZD-11, journal API |
| **TZD-14** | Desktop hosts MCP (autostart, show URL/token, LAN option) | TZD-11 |
| **TZD-15** | Agent inbox workspace (folder drop → audit → propose fills) | TZD-12/13, importers |

Resume **TZD-01…10** when PO prioritizes in-app AI-import UX; MCP stream does not replace them.

---

## 6. Effort (rough)

| Slice | Effort | Notes |
|-------|--------|-------|
| TZD-11 foundation | M (3–5 d) | Node MCP SDK or Rust; localhost + Bearer |
| TZD-12 reads | M (3–5 d) | Map existing GET APIs |
| TZD-13 writes + journal | L (1–2 w) | Journal collection + undo + confirm protocol |
| TZD-14 desktop host | S–M (2–4 d) | Process lifecycle, UI status |
| TZD-15 inbox | L (1–2 w) | Watch folder + reuse importers |
| **Total MCP MVP** | **~4–7 weeks** calendar for one executor | After pairing works |

Open-source to lean on: official **MCP SDK**, **Ollama** (optional model), existing **Tauri desktop**.

---

## 7. Explicit non-goals (now)

- Bundling a multi-GB model inside the MSI as mandatory.
- Letting MCP bypass RBAC.
- Full database backup per mutation.
- Requiring Cursor for managers.
- Second SoT database on the desktop.

---

## 8. Success criteria (MVP)

1. Desktop paired as manager → MCP listening on `127.0.0.1:<port>`.
2. MCP client can **list/read** materials (or agreed entity) with org scope.
3. MCP client can **propose** create/update; after confirm, data appears in web.
4. Undo last mutation batch via journal within ring size.
5. Docs: connect URL + token; no Cursor-specific steps required.
