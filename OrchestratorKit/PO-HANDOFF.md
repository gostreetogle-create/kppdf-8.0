# 🚀 Quickstart for the new project owner

> TL;DR: drop this folder in your project, run **1 command**, create a task with **1 command**, hand to your AI agent with **1 sentence**. Everything else is automatic.

---

## Step 1: Drop the kit (10 sec)

```bash
cp -R /path/to/OrchestratorKit ./your-project/OrchestratorKit
```

Or drag the `OrchestratorKit/` folder into your project root in your IDE.

---

## Step 2: One command to bootstrap (5 sec)

```bash
cd your-project
bash OrchestratorKit/kit-init.sh
```

This sets up:
- `_active/`, `_archive/`, `.mimocode/locks/` (kit's internal directories)
- `progress.md`, `ARCHITECTURE.md` (root files the agents will update)
- **`STACK.md`** in the project root (auto-detected from your `package.json` / `requirements.txt` / `go.mod` / etc.)
- Makes all `.sh` scripts executable

You should see `✅ Kit initialized.` and `verify-status.sh` returning `PASS`.

> 💡 **STACK.md was just generated!** It auto-detected your stack (Angular, NestJS, FastAPI, Go, etc.) and rendered a project-specific doc. Edit it to fill in architecture decisions.

---

## Step 3: One command to create a task (10 sec)

```bash
bash OrchestratorKit/make-tz.sh "Build user auth with JWT"
```

Output: `TZ-01.txt` is created in the kit's root, and a row is added to
`OrchestratorKit/STATUS.md` (⏳ READY section). Open the file and fill in
4–5 sections: `ИСХОДНОЕ СОСТОЯНИЕ`, `ЧТО ДЕЛАТЬ`, `КРИТЕРИИ ПРИЁМКИ`,
plus `LAYER` (1/2/3/4) and `CONFLICT KEYS` if you didn't pass them as flags.

---

## Step 4: Hand it to your AI agent (1 sentence)

Open your AI agent (Claude Code, Cursor, Codebuff, etc.) and type:

> "Read `OrchestratorKit/AGENTS.md` and `OrchestratorKit/TZ-01.txt`,
> then execute TZ-01."

The agent will run **8 steps automatically** and report back:

- **ШАГ 0** — moves the TZ to `_active/`, updates `STATUS.md`
- **ШАГ 1–2** — verifies the task, runs build/typecheck
- **ШАГ 3–4** — updates `progress.md` and `ARCHITECTURE.md`
- **ШАГ 5** — creates a lock file in `.mimocode/locks/`
- **ШАГ 6** — archives the TZ to `_archive/<YYYY-MM>/TZ-01.done.txt`
- **ШАГ 6+** — runs `verify-status.sh` to confirm sync
- **ШАГ 7** — sends you a final report

---

## Step 5: Next task (10 sec)

```bash
bash OrchestratorKit/make-tz.sh "Next feature"
```

That's it. The kit handles all the bookkeeping (status, archive, lock files).

---

## 🎯 Cheat sheet

| Command | Purpose |
|---------|---------|
| `bash OrchestratorKit/kit-init.sh` | First-time setup (idempotent) — also auto-generates `STACK.md` |
| `bash OrchestratorKit/kit-stack.sh` | Regenerate `STACK.md` (auto-detect) — needs `--force` if file exists |
| `bash OrchestratorKit/kit-stack.sh --stack=cli-tool` | Force specific stack (skip auto-detect) |
| `bash OrchestratorKit/make-tz.sh "title"` | Create a new task |
| `bash OrchestratorKit/make-tz.sh "title" --layer 2 --keys "a.ts;b.ts"` | Create task with pre-filled LAYER/CONFLICT KEYS |
| `bash OrchestratorKit/verify-status.sh` | Check STATUS ↔ filesystem sync |
| `bash OrchestratorKit/kit-doctor.sh` | Diagnose issues with friendly advice |
| `bash OrchestratorKit/auto-archive.sh TZ-NN done` | Finalize a task (run by agent at the end) |
| `bash OrchestratorKit/kit-smoke-test.sh` | Validate the whole kit works (E2E) |

---

## 📁 What lives where

```
your-project/
├── OrchestratorKit/          ← this folder (the kit)
│   ├── AGENTS.md             ← AI agent's full manual
│   ├── STATUS.md             ← at-a-glance board
│   ├── TZ-01.txt             ← your task (root of kit)
│   ├── _active/              ← in-progress tasks
│   ├── _archive/             ← completed/failed tasks
│   ├── .mimocode/locks/      ← protected zones
│   └── _templates/           ← TZ skeleton, TZF-00, stack templates
├── progress.md               ← journal of completed work
├── ARCHITECTURE.md           ← architecture decisions + agent zones
└── ... your code ...
```

---

## ❓ If something breaks

1. **Run `bash OrchestratorKit/kit-doctor.sh`** — it gives specific advice for each problem.
2. **Read `OrchestratorKit/TROUBLESHOOTING.md`** — common issues and fixes.
3. **Read `OrchestratorKit/AGENTS.md §6`** — typical agent mistakes.

The kit is **professional-grade**: it works for any project, any tech stack, any AI agent.
Just drop it in, run `kit-init.sh`, and start working.
