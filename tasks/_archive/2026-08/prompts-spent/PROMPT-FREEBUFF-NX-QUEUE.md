# PROMPT — Freebuff queue (после F3 + kit audit)

Три задачи **последовательно**. `_active/` пуст.

---

## 0) OPS-320 — DONE (в start.mjs)

Порт hygiene: netstat IPv4/IPv6, повтор перед spawn, `CI=1` + `--port` для nx.

---

## 1) GATES-2 (после OPS-320 или параллельно если старт уже ок)

```text
CLAIM: tasks/_active/TZ-NX-GATES-2-nx-scoped.md
agent_id: freebuff-nx-gates-2 · claimed_at ISO

Выполни tasks/TZ-NX-GATES-2-nx-scoped.md:
- nx-only architecture check (0 violations в frontend-nx)
- ui:tokens:nx с baseline для миграционного долга Pi
- package.json scripts + README

Gates из AC → archive TZ-NX-GATES-2.done.md
Не чинить legacy frontend colors.
```

---

## 2) Kit dev link (после GATES-2 archive)

```text
CLAIM: tasks/_active/TZ-NX-SHELL-kit-dev-link.md
agent_id: freebuff-nx-shell

Выполни tasks/TZ-NX-SHELL-kit-dev-link.md:
кнопка «UI Kit» в kit-layout + environment.showKitNav

nx build + lint → archive
```

---

## Параллельно (опционально, Claude)

`tasks/PROMPT-CLAUDE-NX-KIT-AUDIT.md` фаза A уже DONE. Фаза B DONE. Не нужно.

---

**Бизнес-модули (F5+)** — только по указанию PO. Не стартовать.
