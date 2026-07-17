# ORCHESTRATION CHECKLIST — gemma-4-12b-qat как local executor для kppdf-8.0

**Версия:** 2026-07-12 (TZ-87 docs sync + session)  
**Архитектор:** Buffy (cloud minimax-m3)  
**Worker:** local gemma-4-12b-qat @ LM Studio `http://localhost:1234/v1/chat/completions`  
**System prompt для worker'а:** `scripts/SYSTEM_PROMPT_GEMMA4.txt` (70 lines tuned для 12B QAT)  
**Dispatcher:** `scripts/orchestrate.py` (state-aware, anti-idleness loop)

────────────────────  OBJECTIVE  ────────────────────

Использовать gemma-4-12b-qat как **continuous local worker** для kppdf-8.0, чтобы он:
- Не простаивал (continuous backlog + retry budget)
- Приносил конкретную пользу проекту (audit / draft / analysis / refactoring plan)
- Производил outputs которые я (orchestrator) могу review + integrate в проект

Cloud модель (Buffy) делает:
- Plan / prioritize tasks в backlog
- Compose prompt packets (system + user + code excerpts)
- Validate worker output через checklists
- Commit integrated outputs back в project (status flip, docs sync, lock files)

Worker (12B QAT) делает:
- Pure text generation (analysis / draft / RFC / audit)
- Per-task: ~500–2000 input tokens, ~500–2000 output tokens
- Following system prompt's 8 hard rules + workflow + tone

────────────────────  TASK TYPES (поддерживаются сейчас)  ────────────────────

| Task type | Output shape | Examples |
|----|----|----|
| `audit` | severity-classified findings table | code anti-patterns, dead-code, unused imports, missing tests |
| `draft` | structured markdown document (sections + lists + tables) | TZ spec drafts, RFC, migration plans |
| `analysis` | narrative report with citations | "explain why X fails", "compare A vs B" |
| `refactor-plan` | per-file change list + risk assessment + rollback | safe refactoring proposals before implementation |
| `test-mock` | jest test scaffold (without running) | unit test skeletons for components without coverage |

**НЕ подходит** (deferred до pnpm/docker infra available):
- ❌ Real typecheck (`pnpm exec tsc`)
- ❌ Real e2e tests
- ❌ Git commits / pushes
- ❌ npm install / deps changes
- ❌ Database mutations

────────────────────  PER-TASK CHECKLISTS  ────────────────────

### `audit` (code anti-patterns / dead code)

```yaml
required_sections:
  - summary: краткий 1-paragraph overview
  - findings_table: | file | pattern | severity | line | fix |
    min_rows: 1
    max_rows: 50  # не давать больше — модель галлюцинирует
required_columns_in_table:
  - file (должен быть существующим path в проекте)
  - pattern (что нарушено)
  - severity: HIGH | MEDIUM | LOW
  - suggested_fix (Pi-* primitive или convention)
validation_rules:
  - file path patterns:
      - frontend: "frontend/src/app/.*\\.(ts|html)$"
      - backend: "backend/src/.*\\.ts$"
  - severity_distribution: high_max=5 (если больше — модель "накручивает")
```

### `draft` (TZ-spec / RFC / migration plan)

```yaml
required_sections:
  - intro: 1-2 paragraphs background / motivation
  - dependencies: list (TZ deps, file deps)
  - phases: ordered list with verification criteria each
  - risks: table | risk | P | mitigation |
required_text:
  - references specific TZ numbers (TZ-NN) if applicable
  - cites specific file paths from kppdf-8.0
  - uses "READ before edit" / "follow conventions" verbiage
validation_rules:
  - min_words: 400
  - max_words: 1500 (avoid runaway generation)
  - no placeholder strings: "TODO later", "[your text here]"
```

### `analysis` (root cause / comparison)

```yaml
required_sections:
  - question: restatement of what was asked
  - citations: list of files / commit hashes / TZ ids referenced
  - findings: 2-5 numbered key observations
  - conclusion: actionable quote
validation_rules:
  - citations grounded in actual project state (no hallucinated commits)
  - conclusion is concrete (not vague "best practice")
```

### `refactor-plan`

```yaml
required_sections:
  - scope: number of files + class/method names affected
  - changes: per-file before/after minimal diff sketch
  - risks: backward-compat + spec compliance test names
  - rollback: 2-3 concrete revert steps
validation_rules:
  - all cited files exist (path-pattern grep should find)
  - no regression to existing TZ-NN.done patterns
```

### `test-mock`

```yaml
required_sections:
  - describe_blocks: full jest describe-tree for component
  - it_blocks: 3-5 test cases each (happy + edge + error)
  - mocks: list of `provideHttpClientTesting` patterns if applicable
validation_rules:
  - imports from existing test patterns in same module:
      "TestBed + provideHttpClientTesting"
      "API_BASE_URL injection"
      "SilentResult<T> assertions"
```

────────────────────  ANTI-IDLENESS RULES  ────────────────────

Модель не должна простаивать. Правила для loop'а:

1. **Continuous backlog**: минимум 5 задач в очереди всегда. Если все done — orchestrator вырабатывает новые.
2. **Retry budget per task**: 3 попытки (initial + 2 retries с rephrasing)
3. **Rephrase strategies (если FAIL 3 раза)**:
   - Add explicit English-Russian bilingual requirement
   - Reduce token_budget per-task expectations
   - Add 1-2 worked examples в prompt
   - Switch task_type fallback (draft → analysis если draft FAIL)
4. **Stall detector**: если 5 consecutive task FAIL — orchestrator pause loop + diagnose system (LM Studio down? model changed?)
5. **State persistence**: `scripts/orchestration-state.json` — после каждого task update. При restart — resume from last completed.

────────────────────  RECOVERY STRATEGIES (per failure mode)  ────────────────────

| Failure | Detection | Action |
|----|----|----|
| HTTP timeout (10s+) | `urllib.error.URLError` with TimeoutError | Retry once with 30s timeout |
| HTTP 5xx | Status code in response | Retry with exponential backoff: 1s, 2s, 4s. After 3 fails — task marked `infra_error` |
| HTTP 4xx | Bad request | Don't retry. Mark task as `prompt_error`, log for debugging |
| Empty response | `choices[0].message.content == ""` | Retry once with max_tokens += 50% |
| Hallucinated paths | `grep` for paths in output returns 0 matches | Mark `audit-quality-low`, replace with auto-generated placeholder |
| Russian transliteration | Output contains "tz-87", "close-out", etc. | Mark `i18n-quality-low`, request English version + manual Russian rewrite |
| Token overflow | Output truncated mid-sentence | Increase `token_budget` 1.5x, retry once |
| LM Studio down | Connection refused / DNS fail | Pause loop 60s, retry. After 3 minutes → surface to user |

────────────────────  PER-TASK METRICS LOGGED  ────────────────────

Каждый dispatch записывает в `reports/orchestration-{date}.jsonl`:

```json
{
  "task_id": "backlog-3",
  "task_type": "audit",
  "timestamp_start": "2026-07-12T23:55:00Z",
  "timestamp_end": "2026-07-12T23:55:42Z",
  "latency_ms": 42000,
  "input_tokens": 1820,
  "output_tokens": 950,
  "verdict": "PASS" | "PARTIAL" | "FAIL",
  "checklist_results": {
    "min_rows_pass": true,
    "severity_distribution_pass": true,
    ...
  },
  "output_file": "reports/audit-TZ-104.1-form-migration.md",
  "error_category": null | "infra" | "prompt" | "quality"
}
```

────────────────────  USAGE (orchestrator session)  ────────────────────

```bash
# 1. Single dispatch (one task from backlog)
python scripts/orchestrate.py --once

# 2. Run 3 dispatches (process queue head)
python scripts/orchestrate.py --run 3

# 3. Continuous loop (idle prevention — runs until backlog_empty_signal)
python scripts/orchestrate.py --loop

# 4. Inspect state
python scripts/orchestrate.py --status

# 5. Re-run failed task with rephrase
python scripts/orchestrate.py --retry-task backlog-3
```

────────────────────  INITIAL BACKLOG (5 priority tasks)  ────────────────────

Built into `scripts/orchestrate.py` `DEFAULT_BACKLOG` literal:

| # | id | type | scope | priority |
|---|---|---|---|---|
| 1 | `audit-TZ-104.1-form-primitives` | audit | Detect raw `<input type="checkbox">`, `<textarea>`, `<select>` in 5 form-dialogs | HIGH |
| 2 | `draft-TZ-90-phase-C-migration` | draft | TZ-90 dialog system migration plan for 11 existing dialogs | HIGH |
| 3 | `analysis-bom-schema-leftover` | analysis | Document the legacy `ProductComponent` ObjectId references in bom.schema.ts + remediation path | MEDIUM |
| 4 | `refactor-plan-materials-page-pi-switch` | refactor-plan | TZ-104.2 scope: 8-10 list-pages with hand-roll `<button role="switch">` → `<app-pi-switch>` migration | MEDIUM |
| 5 | `test-mock-builder-inspector` | test-mock | jest spec scaffold for `builder-inspector.component.ts` (currently without coverage) | LOW |

────────────────────  SUCCESS CRITERIA — orchestrator monitoring surface  ────────────────────

Per-day report (`reports/orchestration-{YYYY-MM-DD}.jsonl`) должен показывать:
- ≥5 dispatches processed (anti-idleness: continuous loop не пустой)
- ≥80% PASS verdicts (quality: model + checklist effective)
- max retry count per task ≤3 (anti-runaway)

Если criteria не выполнены → orchestrator diagnose + tune.

────────────────────  INTEGRATION WITH kpdf-8.0  ────────────────────

После каждого PASS dispatch:
1. Orchestrator reviews output (read + summarize)
2. Если output может быть committed в project (e.g., audit findings → GitHub issue, draft → `docs/drafts/`) — orchestrator makes commit
3. Cross-reference в `progress.md` если draft касается TZ scope
4. Commit message follows project convention: `chore(docs): TZ-NN model-assisted draft via gemma-4-12b-qat`
