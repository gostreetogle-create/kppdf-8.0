# Trigger eval — kppdf-executor-loop

20 queries (10 should-trigger / 10 should-not-trigger) for description optimization.

## Re-run (Claude Code terminal, not Cursor shell)

Windows `run_loop.py` may fail on parallel `claude -p` (WinError 10038). Prefer WSL or:

```bash
cd ~/.claude/plugins/marketplaces/claude-plugins-official/plugins/skill-creator/skills/skill-creator
PYTHONUTF8=1 python -m scripts.run_loop \
  --eval-set D:/kppdf-8.0/.agents/skills/kppdf-executor-loop/evals/trigger-eval.json \
  --skill-path D:/kppdf-8.0/.agents/skills/kppdf-executor-loop \
  --max-iterations 3 --num-workers 1 --verbose
```

Apply `best_description` from JSON output to `SKILL.md` frontmatter.
