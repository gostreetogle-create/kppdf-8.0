# Trigger eval — tz-authoring

20 queries (10 should-trigger / 10 should-not-trigger) for description optimization.

## Re-run (Claude Code terminal)

```bash
cd ~/.claude/plugins/marketplaces/claude-plugins-official/plugins/skill-creator/skills/skill-creator
PYTHONUTF8=1 python -m scripts.run_loop \
  --eval-set D:/kppdf-8.0/.agents/skills/tz-authoring/evals/trigger-eval.json \
  --skill-path D:/kppdf-8.0/.agents/skills/tz-authoring \
  --max-iterations 3 --num-workers 1 --verbose
```

Skill body has Cyrillic — set `PYTHONUTF8=1` on Windows.
