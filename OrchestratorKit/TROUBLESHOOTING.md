# 🆘 Troubleshooting — common issues with OrchestratorKit

> **First line of defense:** run `bash OrchestratorKit/kit-doctor.sh`. It
> diagnoses most issues and gives specific fix commands.

---

## ❌ verify-status.sh shows FAIL

### "FAIL [FWD]: TZ-NN в корне kit-а, ожидаем ≥1 упоминания в ⏳ READY"

The TZ file is in the kit's root but not in the `⏳ READY` table of `STATUS.md`.

**Fix 1** (recommended): add a row to `⏳ READY` in `STATUS.md`:
```markdown
| TZ-NN | <название> | <CONFLICT KEYS> | <зависит> |
```

**Fix 2** (faster): re-scaffold with `make-tz.sh`:
```bash
bash OrchestratorKit/make-tz.sh "<название>"
```

---

### "FAIL [FWD]: TZ-NN в _active/, ожидаем ≥1 упоминания в 🔥 IN WORK"

The agent moved the TZ to `_active/` (ШАГ 0) but forgot to update `STATUS.md`.

**Fix:** add a row to `🔥 IN WORK` in `STATUS.md`:
```markdown
| TZ-NN | <название> | <CONFLICT KEYS> | <дата старта> |
```

The agent should have done this automatically. If you see this often, your agent
isn't following `AGENTS.md` — re-read it.

---

### "FAIL [REV]: TZ-NN в ⏳ READY, но нет TZ-NN.txt в корне kit-а"

`STATUS.md` references a TZ whose file is missing.

**Fix 1** (file was lost): remove the stale row from `STATUS.md`.
**Fix 2** (file should exist): re-create it:
```bash
bash OrchestratorKit/make-tz.sh "<название>"
```

---

### "FAIL [REV]: TZ-NN в ✅ DONE, но нет .done.txt в _archive/"

Archive file missing. Re-archive it:
```bash
bash OrchestratorKit/auto-archive.sh TZ-NN done
```

This recreates the archive, lock file, and updates `STATUS.md` in one shot.

---

### "FATAL: STATUS.md отсутствует"

The status file is gone. Restore it:
```bash
cp OrchestratorKit/_templates/STATUS-template.md OrchestratorKit/STATUS.md
```

Then re-run `verify-status.sh` to confirm.

---

### "WARN: секция «⏳ READY» отсутствует в STATUS.md"

One of the 4 sections (READY/IN WORK/DONE/FAILED) is missing. Add it manually
following the format in `STATUS-template.md`.

---

## ❌ Agent says "task closed" but the file isn't in the archive

The agent skipped **ШАГ 6** (archive). The kit is strict: "closed" means
`TZ-NN.done.txt` exists in `_archive/<YYYY-MM>/`.

Tell the agent:
> "You said 'closed', but `_archive/<YYYY-MM>/TZ-NN.done.txt` doesn't exist.
> That's ШАГ 6 not done. Do it now, then give the final report again."

Or run it manually:
```bash
bash OrchestratorKit/auto-archive.sh TZ-NN done "Progress entry" "Arch row"
```

---

## ❌ CONFLICT KEYS conflict with a parallel TZ

Two TZs are about to touch the same file. The agent must self-defer:

1. Move `TZ-NN.txt` from `_active/` to `_archive/<YYYY-MM>/TZ-NN.deferred.txt`
2. Add a `DEFERRED` marker block (see `TZF-00.txt` §ПРАВИЛА ПАРАЛЛЕЛЬНОЙ РАБОТЫ)
3. Update `STATUS.md` (remove the IN WORK row, or leave a comment "DEFERRED")
4. Report to PO: "TZ-NN deferred due to conflict with TZ-MM"

Then PO decides: wait for TZ-MM to finish, or re-issue as TZ-(NN+1).

---

## ❌ STATUS.md got polluted / inconsistent

If `STATUS.md` got too messy, you can rebuild it from the filesystem:

```bash
# 1. Save the current (messy) version
cp OrchestratorKit/STATUS.md /tmp/STATUS.md.bak

# 2. Reset
cp OrchestratorKit/_templates/STATUS-template.md OrchestratorKit/STATUS.md

# 3. Re-populate manually OR use auto-archive for each TZ:
for tz in $(ls OrchestratorKit/_archive/*/TZ-*.done.txt | sed 's/.*TZ-\([0-9]*\)\.done\.txt/TZ-\1/'); do
  echo "Found done: $tz"
done
```

Then re-run `verify-status.sh` to confirm.

---

## ❌ Bash scripts don't work on Windows

- Use **Git Bash** or **WSL** (not PowerShell — bash is required).
- If `chmod` doesn't work: run scripts as `bash ./script.sh` instead of `./script.sh`.
- If emoji in `STATUS.md` aren't parsed: ensure your locale is UTF-8
  (`export LANG=en_US.UTF-8` or similar).

---

## ❌ Agent gets confused about the 8-step cycle

Tell the agent:
> "Re-read `OrchestratorKit/AGENTS.md §1 (ЦИКЛ РАБОТЫ — 8 ШАГОВ)`. Don't
> skip ШАГ 0, ШАГ 6, ШАГ 6+, ШАГ 7."

Or be more explicit:
> "The cycle is: read TZ → ШАГ 0 (move to _active) → ШАГ 1 (verify) → ШАГ 2
> (build) → ШАГ 3 (progress.md) → ШАГ 4 (ARCHITECTURE.md) → ШАГ 5 (lock) →
> ШАГ 6 (archive) → ШАГ 6+ (verify-status PASS) → ШАГ 7 (report). If any
> step fails, fix it before moving on."

---

## ❌ How to re-issue TZ-NN after a fix

TZF-00 §6 forbids archiving over an existing file. So:

1. Create `TZ-(NN+1).txt` (next available number).
2. In its `ЗАВИСИМОСТИ:` field, write: `TZ-NN (FAILED)`.
3. Add a comment: "successor-TZ для починки TZ-NN".
4. Add to `STATUS.md` ⏳ READY.
5. The old `TZ-NN.failed.txt` stays in the archive as history.

---

## ❌ The lock file prevents my new TZ from working

If a previous TZ locked a file you need to edit:

**Option 1 (recommended):** Create a successor-TZ:
```bash
bash OrchestratorKit/make-tz.sh "Refactor X after TZ-NN" --deps TZ-NN
```

The lock prevents accidental overwrites. To unlock, get orchestrator approval
and delete the lock file:
```bash
rm .mimocode/locks/TZ-NN-*.lock
```

---

## 📖 Still stuck?

1. Run `bash OrchestratorKit/kit-doctor.sh` — it diagnoses 80% of issues.
2. Read `OrchestratorKit/AGENTS.md §6 «Самые частые грабли»` — 6 typical
   agent mistakes with solutions.
3. Read the script source itself — it's well-commented.
4. Run `bash OrchestratorKit/kit-smoke-test.sh` — if this fails, the kit is
   broken; reinstall from the source.
