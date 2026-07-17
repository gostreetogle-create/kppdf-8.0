#!/usr/bin/env python3
"""
orchestrate.py — Dispatcher для continuous worker loop на kppdf-8.0.

Берёт задачи из DEFAULT_BACKLOG (5 priority) или external backlog.json,
отправляет в LM Studio (http://localhost:1234/v1/chat/completions с gemma-4-12b-qat),
валидирует output по per-task-type checklist'у, persist state, retry с rephrasing.

Pure stdlib: urllib, json, re, dataclasses, argparse, time, pathlib. ZERO deps.

Usage:
  python scripts/orchestrate.py --once
  python scripts/orchestrate.py --run 3
  python scripts/orchestrate.py --loop
  python scripts/orchestrate.py --status
  python scripts/orchestrate.py --retry-task audit-TZ-104.1-form-primitives
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

LM_STUDIO_BASE = "http://localhost:1234/v1/chat/completions"
DEFAULT_MODEL = "google/gemma-4-12b-qat"
SYSTEM_PROMPT_FILE = "scripts/SYSTEM_PROMPT_GEMMA4.txt"
STATE_FILE = Path("scripts/orchestration-state.json")
REPORTS_DIR = Path("reports")


# ────────────────────────────────────────────────────────────────────
# Task definitions (initial backlog — 5 priority items)
# ────────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class BacklogTask:
    id: str
    type: str           # audit | draft | analysis | refactor-plan | test-mock
    title: str
    description: str
    input_prompt: str
    expected_keywords: tuple[str, ...] = ()
    expected_patterns: tuple[str, ...] = ()
    failure_keywords: tuple[str, ...] = ()
    system_prompt_override: str = ""    # extra context appended to system
    token_budget: int = 1024
    retry_rephrase: tuple[str, ...] = () # extra hint on retry attempts
    rephrase_threshold: int = 1  # retry with rephrasing from attempt N+1 onward (default: rephrase immediately on 2nd attempt)


DEFAULT_BACKLOG: list[BacklogTask] = [
    BacklogTask(
        id="audit-TZ-104.1-form-primitives",
        type="audit",
        title="TZ-104.1 audit: 5 form-dialogs raw inputs",
        description=(
            "TZ-104.1: 3 form-dialogs + 2 textarea — replace native "
            "<input type=\"checkbox\">, <textarea>, <select> with Pi-* primitives."
        ),
        input_prompt=(
            "Просканируй указанные файлы kppdf-8.0 и найди НАРУШЕНИЯ conventions:\n"
            "  1. frontend/src/app/pages/products/product-form-dialog.component.ts\n"
            "  2. frontend/src/app/pages/materials/material-form-dialog.component.ts\n"
            "  3. frontend/src/app/pages/orders/order-form-dialog.component.ts\n"
            "  4. frontend/src/app/pages/doc-constructor/texts/text-block-dialog.component.ts\n"
            "  5. frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts\n\n"
            "Что искать:\n"
            "  - <input type=\"checkbox\"> (нарушение — должно быть <app-pi-checkbox>)\n"
            "  - <textarea (нарушение — должно быть <app-pi-textarea>)\n"
            "  - <select (нарушение — должно быть <app-pi-select>)\n"
            "  - любой hand-roll когда есть Pi-* primitive\n\n"
            "Output format (ОБЯЗАТЕЛЬНО):\n\n"
            "## Summary\n"
            "1-2 предложения: сколько нарушений найдено и общий характер.\n\n"
            "## Findings\n\n"
            "| # | file | line(s) | pattern | suggested_pi_replacement |\n"
            "|---|------|---------|---------|-------------------------|\n"
            "| 1 | path/to/file.ts | ~190 | <input type=\"checkbox\"> | <app-pi-checkbox> |\n"
            "(...таблица до 20 строк)\n\n"
            "## Severity distribution\n"
            "- HIGH: ручные switch / checkbox: N\n"
            "- MEDIUM: ручные textarea / select: N\n"
            "- LOW: minor styling issues: N\n\n"
            "Будь конкретен: line numbers from grep output (если знаешь) или use ~lineN approximation. "
            "Не придумывай файлы вне списка."
        ),
        expected_keywords=(
            "app-pi-checkbox", "app-pi-textarea", "app-pi-select",
            "Summary", "Findings", "Severity",
        ),
        expected_patterns=(
            r"<\s*app-pi-(checkbox|textarea|select)",
            r"\|\s*\d+\s*\|",  # markdown table row
            r"^##\s+(Summary|Findings|Severity)",
        ),
        failure_keywords=(
            "<button",         # фокус НЕ на button types
            "approve",        # не просить разрешения
        ),
        token_budget=3500,
        retry_rephrase=(
            "Используй ТОЛЬКО markdown-формат. Никакого prose между разделами.",
            "Каждая строка таблицы должна быть verb-bounded: pattern → fix.",
        ),
    ),
    BacklogTask(
        id="draft-TZ-90-phase-C-migration",
        type="draft",
        title="TZ-90 Phase C migration order для 13 dialogs",
        description=(
            "TZ-90 определяет что dialogs должны использовать polymorphic "
            "<app-pi-dialog variant=\"...\"> вместо ad-hoc лейаутов. "
            "Существующие 13 dialogs требуют миграции. "
            "Нужен пошаговый план."
        ),
        input_prompt=(
            "В kppdf-8.0 есть 13 существующих Angular dialog components "
            "(модульная форма + alertTemplate + content + destructive):\n"
            "  - module-form-dialog, work-type-form-dialog, product-form-dialog\n"
            "  - contract-form-dialog, material-form-dialog, order-form-dialog\n"
            "  - organization-form-dialog, module-materials-form-dialog\n"
            "  - product-module-picker-dialog, text-block-dialog, table-template-dialog\n"
            "  - cost-calculation-detail-dialog (deferred TZ-85D)\n"
            "  - pi-confirm-destructive-dialog (deferred TZ-90 §7)\n\n"
            "ТЗ-90 спека фиксирует 4 templates × 4 widths через polymorphic wrapper.\n\n"
            "Напиши draft migration plan который я могу commit как tasks/TZ-90-extension.md.\n\n"
            "Output format:\n\n"
            "## 1. Migration order\n"
            "Список из 4 батчей по 3-4 dialogs. Каждый батч: какие dialogs + estimated LOC diff.\n\n"
            "## 2. Per-dialog criteria\n"
            "Что считается 'done' для каждого dialog: использует polymorphic wrapper, "
            "variant соответствует category (T1 Alert | T2 Form | T3 Content | T4 Destructive), "
            "width aligned с reference, radius 8px, backdrop 50%.\n\n"
            "## 3. Prerequisites\n"
            "Что должно быть готово до старта: TZ-103 PiDialogService (?), TZ-87 F.3 evidence (?).\n\n"
            "## 4. Risks\n\n"
            "| Risk | P | Mitigation |\n\n"
            "## 5. Definition of Done per batch\n"
            "Per-batch verifier: какой typecheck, какие visual checks, какие e2e specs.\n\n"
            "Be concise. Без prose-отступлений между разделами. "
            "Конкретные path references."
        ),
        expected_keywords=(
            "module-form-dialog", "TZ-90", "variant", "T1 Alert", "T2 Form",
            "Migration order", "Prerequisites",
        ),
        expected_patterns=(
            r"^##\s+\d\.",
            r"\|\s*Risk\s*\|",
            r"polymorphic|variant=",
        ),
        token_budget=3500,
        retry_rephrase=(
            "Избегай generic рекомендаций — называй конкретные файлы.",
        ),
    ),
    BacklogTask(
        id="analysis-bom-schema-leftover",
        type="analysis",
        title="Analysis: bom.schema.ts legacy ObjectId TODO",
        description=(
            "В backend/src/modules/bom/bom.schema.ts есть TODO про legacy "
            "ObjectId refs от удалённой ProductComponent. Документируй "
            "root cause + remediation."
        ),
        input_prompt=(
            "В kppdf-8.0 файл `backend/src/modules/bom/bom.schema.ts` имеет TODO:\n"
            "  '// TODO: existing boms в БД могут содержать СТАРЫЕ ObjectId из удалённой'\n\n"
            "Контекст:\n"
            "  - TZ-83 в Phase A удалил ProductComponent schema.\n"
            "  - bom.schema.ts теперь ref'ит на 'ProductModule' вместо 'ProductComponent'.\n"
            "  - Существующие boms в БД могут содержать dangling ObjectId references.\n\n"
            "Напиши analysis report (1-2 страницы):\n\n"
            "## 1. Root cause\n"
            "Почему dangling refs возможны — schema migration limbo.\n\n"
            "## 2. Impact\n"
            "Что сломается если BOM с dangling ref queried.\n\n"
            "## 3. Remediation candidates\n"
            "2-3 варианта: zero-touch / on-read-cleanup / data-migration-script.\n"
            "Для каждого — pros / cons / effort estimate / risk.\n\n"
            "## 4. Recommended path\n"
            "Конкретное решение — какой вариант выбрать + почему.\n\n"
            "## 5. Action items\n"
            "Список из 3-5 конкретных next-steps (file changes, TZ draft, scripts).\n\n"
            "НЕ пиши code. Только analysis. Цитируй реальные TODO + production paths."
        ),
        expected_keywords=(
            "ProductComponent", "bom.schema.ts", "dangling",
            "migration", "Remediation", "Action items",
            "TZ-83",
        ),
        expected_patterns=(
            r"^##\s+\d\.",
            r"recommend|Recommended",
            r"dangling|orphan|stale",
        ),
        token_budget=3000,
        retry_rephrase=(
            "Если output уклоняется от конкретных path → re-prompt с explicit list of files.",
        ),
    ),
    BacklogTask(
        id="refactor-plan-materials-page-pi-switch",
        type="refactor-plan",
        title="TZ-104.2 refactor plan: 8-10 pages → <app-pi-switch>",
        description=(
            "TZ-104.2 миграция: hand-roll <button role=\"switch\"> → <app-pi-switch> "
            "в 8-10 list-pages. Per-page minimal-diff sketch."
        ),
        input_prompt=(
            "TZ-104.2 задача: мигрировать hand-roll `<button role=\"switch\">` "
            "на `<app-pi-switch>` в 8-10 list-pages kppdf-8.0.\n\n"
            "Affected list-pages (предположительно):\n"
            "  texts, tables, products, orders, organizations, dictionaries, materials, "
            "work-types, contracts, modules.\n\n"
            "Напиши per-page refactor plan:\n\n"
            "## 1. Scope\n"
            "Сколько файлов + estimated LoC diff.\n\n"
            "## 2. Per-file changes\n\n"
            "Для каждого из 3 representative pages (texts, materials, products):\n\n"
            "### `pages/{page}/{page}.page.ts` line ~NNN\n"
            "ПОКАЖИ minimal before/after:\n"
            "```html\n"
            "BEFORE: <button [attr.aria-checked]=\"x\" (click)=\"onToggle(x)\">\n"
            "AFTER:  <app-pi-switch [checked]=\"x.isActive\" (checkedChange)=\"...\">\n"
            "```\n"
            "+ TypeScript изменения: onToggleActive → onCheckedChange signature.\n\n"
            "## 3. Common pitfalls\n"
            "Что может пойти не так в миграции: data-test propagation, "
            "visual drift (animate width difference), spec-rewrite needs.\n\n"
            "## 4. Batch sequence\n"
            "Предложи оптимальный rolling-out: 2-3 pages per atomic commit, "
            "чтобы review friendly.\n\n"
            "## 5. Risks\n\n"
            "| Risk | Mitigation |\n\n"
            "Будь конкретен — file paths, code snippets."
        ),
        expected_keywords=(
            "app-pi-switch", "texts.page", "materials.page",
            "BEFORE", "AFTER", "checkedChange",
        ),
        expected_patterns=(
            r"### `[^`]+`",
            r"BEFORE.*AFTER",
        ),
        token_budget=3500,
        retry_rephrase=(
            "Минимальные code blocks максимум 6 lines per snippet.",
        ),
    ),
    BacklogTask(
        id="test-mock-builder-inspector",
        type="test-mock",
        title="jest spec scaffold для builder-inspector.component.ts",
        description=(
            "builder-inspector.component.ts (TZ-86) — комплексная форма "
            "без test coverage. Сгенерируй jest spec scaffold."
        ),
        input_prompt=(
            "Напиши jest spec scaffold для "
            "`frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts`.\n\n"
            "Component receives: `block: TemplateBlock | null` input + "
            "`update: output<Partial<TemplateBlock> & { _id: string }>` + "
            "`delete: output<string>`.\n\n"
            "Покрой по 4 test areas:\n\n"
            "1. Empty state когда block=null — все inputs hidden.\n"
            "2. Render с text block — content textarea visible.\n"
            "3. Render с table block — tableTemplateId field visible.\n"
            "4. Update emission when user changes isActive toggle.\n\n"
            "Output spec с использованием canonical kppdf-8.0 patterns:\n"
            "  - TestBed + provideHttpClientTesting\n"
            "  - API_BASE_URL injection\n"
            "  - SilentResult<T> discriminated union\n"
            "  - jest.fn() для output assertion\n\n"
            "Code only — без analysis prose. ~80-120 lines per test area, total ~250-400 lines."
        ),
        expected_keywords=(
            "TestBed", "describe", "provideHttpClientTesting",
            "SilentResult", "(update)", "(delete)",
        ),
        expected_patterns=(
            r"describe\(",
            r"it\(",
            r"TestBed",
        ),
        token_budget=4000,
        retry_rephrase=(
            "Без русского prose — только code.",
        ),
    ),
]


# ────────────────────────────────────────────────────────────────────
# HTTP client
# ────────────────────────────────────────────────────────────────────

def _http_post(url: str, payload: dict, timeout: int = 120) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.URLError as e:
        raise RuntimeError(f"HTTP error: {e}") from e
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Invalid JSON from endpoint: {e}") from e


def query_model(system: str, user: str, model: str, max_tokens: int) -> tuple[str, float]:
    """Return (output_text, latency_ms)."""
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.2,
    }
    t0 = time.monotonic()
    data = _http_post(LM_STUDIO_BASE, payload)
    latency_ms = round((time.monotonic() - t0) * 1000.0, 1)
    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError(f"No choices in response: {data}")
    return choices[0]["message"]["content"], latency_ms


# ────────────────────────────────────────────────────────────────────
# Validation per task_type
# ────────────────────────────────────────────────────────────────────

def validate_output(task: BacklogTask, output: str) -> dict[str, Any]:
    """Return {verdict, checks: {<rule>: PASS/FAIL}, score, error_category}."""
    out_lower = output.lower()
    expected_hits = [k for k in task.expected_keywords if k.lower() in out_lower]
    failure_hits = [k for k in task.failure_keywords if k.lower() in out_lower]
    pattern_hits = [p for p in task.expected_patterns if re.search(p, output, re.IGNORECASE | re.MULTILINE)]

    n_exp = len(task.expected_keywords)
    n_pat = len(task.expected_patterns)
    n_fail = len(task.failure_keywords)

    score = 0.0
    if n_exp > 0:
        score += 0.6 * len(expected_hits) / n_exp
    if n_pat > 0:
        score += 0.4 * len(pattern_hits) / n_pat
    if n_fail > 0:
        score -= 0.5 * len(failure_hits) / n_fail
    score = max(0.0, min(1.0, score))

    if score >= 0.7 and not failure_hits:
        verdict = "PASS"
    elif score >= 0.4:
        verdict = "PARTIAL"
    else:
        verdict = "FAIL"

    return {
        "verdict": verdict,
        "score": round(score, 3),
        "checks": {
            "keyword_match": f"{len(expected_hits)}/{n_exp}",
            "pattern_match": f"{len(pattern_hits)}/{n_pat}",
            "failure_hits": len(failure_hits),
        },
        "expected_keyword_hits": expected_hits,
        "expected_keyword_misses": [k for k in task.expected_keywords if k not in expected_hits],
        "pattern_hits": pattern_hits,
        "failure_keyword_hits": failure_hits,
    }


# ────────────────────────────────────────────────────────────────────
# State management
# ────────────────────────────────────────────────────────────────────

@dataclass
class TaskRunRecord:
    task_id: str
    attempt: int            # 1, 2, 3
    timestamp_start: str
    timestamp_end: str
    latency_ms: float
    input_tokens_est: int
    output_tokens_est: int
    verdict: str
    score: float
    rephrased: bool = False
    output_file: str = ""
    error_category: str = ""
    error: str = ""


def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {
        "queue": [t.id for t in DEFAULT_BACKLOG],
        "completed": [],
        "failed": [],
        "history": [],
        "last_updated": "",
    }


def save_state(state: dict) -> None:
    """Atomic write via temp file + rename. SIGINT-safe + concurrent-safe within single process."""
    state["last_updated"] = datetime.now(timezone.utc).isoformat()
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = STATE_FILE.with_suffix(".json.tmp")
    tmp_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    # os.replace is atomic on POSIX; on Windows it's atomic within same filesystem.
    os.replace(tmp_path, STATE_FILE)


# ────────────────────────────────────────────────────────────────────
# Dispatcher core loop
# ────────────────────────────────────────────────────────────────────

def run_one_task(task: BacklogTask, attempt: int = 1, rephrased: bool = False) -> TaskRunRecord:
    """Single dispatch attempt. Returns TaskRunRecord (logged but not committed)."""
    if not os.path.exists(SYSTEM_PROMPT_FILE):
        return TaskRunRecord(
            task_id=task.id, attempt=attempt,
            timestamp_start="", timestamp_end="",
            latency_ms=0.0, input_tokens_est=0, output_tokens_est=0,
            verdict="FAIL", score=0.0,
            error_category="infra",
            error=f"Missing {SYSTEM_PROMPT_FILE}",
        )

    system_prompt = Path(SYSTEM_PROMPT_FILE).read_text(encoding="utf-8")
    if task.system_prompt_override:
        system_prompt += "\n\n" + task.system_prompt_override

    user_prompt = task.input_prompt
    if rephrased and task.retry_rephrase:
        user_prompt += "\n\nRephrase hints:\n" + "\n".join(f"- {h}" for h in task.retry_rephrase)

    timestamp_start = datetime.now(timezone.utc).isoformat()
    try:
        output, latency_ms = query_model(
            system_prompt, user_prompt, DEFAULT_MODEL, task.token_budget,
        )
    except urllib.error.URLError as e:
        return TaskRunRecord(
            task_id=task.id, attempt=attempt,
            timestamp_start=timestamp_start, timestamp_end=datetime.now(timezone.utc).isoformat(),
            latency_ms=0.0, input_tokens_est=0, output_tokens_est=0,
            verdict="FAIL", score=0.0,
            error_category="network",
            error=str(e),
        )
    except json.JSONDecodeError as e:
        return TaskRunRecord(
            task_id=task.id, attempt=attempt,
            timestamp_start=timestamp_start, timestamp_end=datetime.now(timezone.utc).isoformat(),
            latency_ms=0.0, input_tokens_est=0, output_tokens_est=0,
            verdict="FAIL", score=0.0,
            error_category="parse",
            error=str(e),
        )
    except Exception as e:
        return TaskRunRecord(
            task_id=task.id, attempt=attempt,
            timestamp_start=timestamp_start, timestamp_end=datetime.now(timezone.utc).isoformat(),
            latency_ms=0.0, input_tokens_est=0, output_tokens_est=0,
            verdict="FAIL", score=0.0,
            error_category="unknown",
            error=str(e),
        )

    timestamp_end = datetime.now(timezone.utc).isoformat()
    val = validate_output(task, output)

    output_file = _save_output(task, attempt, output)

    return TaskRunRecord(
        task_id=task.id, attempt=attempt,
        timestamp_start=timestamp_start, timestamp_end=timestamp_end,
        latency_ms=latency_ms,
        input_tokens_est=len(user_prompt) // 4,
        output_tokens_est=len(output) // 4,
        verdict=val["verdict"], score=val["score"],
        rephrased=rephrased, output_file=output_file,
    )


def _save_output(task: BacklogTask, attempt: int, output: str) -> str:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    fname = f"{task.id}__attempt-{attempt}.md"
    path = REPORTS_DIR / fname
    path.write_text(
        f"# {task.title} — attempt {attempt}\n\n"
        f"**Task ID**: `{task.id}`\n"
        f"**Type**: `{task.type}`\n"
        f"**Description**: {task.description}\n"
        f"**Timestamp**: {datetime.now(timezone.utc).isoformat()}\n\n"
        f"---\n\n"
        f"## Output\n\n{output}\n",
        encoding="utf-8",
    )
    return str(path)


def process_queue(state: dict, max_tasks: int = 1) -> None:
    """Process up to max_tasks from queue. Updates state."""
    system_prompt_exists = os.path.exists(SYSTEM_PROMPT_FILE)
    if not system_prompt_exists:
        print(f"ERROR: {SYSTEM_PROMPT_FILE} not found", file=sys.stderr)
        return

    backlog_by_id = {t.id: t for t in DEFAULT_BACKLOG}
    processed = 0

    while state["queue"] and processed < max_tasks:
        task_id = state["queue"][0]
        task = backlog_by_id.get(task_id)
        if task is None:
            state["queue"].pop(0)
            continue

        print(f"\n[{processed + 1}/{max_tasks}] Processing {task.id}…", file=sys.stderr)

        # 3 attempts: initial + 2 retries (1st retry uses rephrasing if rephrase_threshold >= 1)
        for attempt in range(1, 4):
            rephrased = attempt > 1 and attempt >= task.rephrase_threshold + 1
            record = run_one_task(task, attempt=attempt, rephrased=rephrased)
            state["history"].append(asdict(record))
            print(f"   attempt {attempt}: verdict={record.verdict} score={record.score} "
                  f"latency={record.latency_ms}ms", file=sys.stderr)
            if record.verdict == "PASS":
                break
            if not rephrased and task.retry_rephrase and attempt == 1:
                # Next attempt will use rephrasing
                pass

        # Move out of queue
        state["queue"].pop(0)
        last_record = state["history"][-1]
        if last_record["verdict"] == "PASS":
            state["completed"].append(task_id)
        else:
            state["failed"].append(task_id)

        save_state(state)
        processed += 1


# ────────────────────────────────────────────────────────────────────
# CLI
# ────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(
        description="Dispatcher для gemma-4-12b-qat worker на kppdf-8.0",
    )
    ap.add_argument("--once", action="store_true", help="Process exactly 1 task from queue head")
    ap.add_argument("--run", type=int, default=0, metavar="N", help="Process up to N tasks")
    ap.add_argument("--loop", action="store_true", help="Process until queue empty (anti-idleness)")
    ap.add_argument("--status", action="store_true", help="Show state.json summary")
    ap.add_argument("--retry-task", metavar="ID", help="Reset a failed task back to queue head")
    args = ap.parse_args()

    state = load_state()

    if args.status:
        print(json.dumps(state, ensure_ascii=False, indent=2))
        return 0

    if args.retry_task:
        if args.retry_task in state["failed"]:
            state["failed"].remove(args.retry_task)
            state["queue"].insert(0, args.retry_task)
            save_state(state)
            print(f"Reset {args.retry_task} → queue head", file=sys.stderr)
            return 0
        print(f"ERROR: {args.retry_task} not in failed list", file=sys.stderr)
        return 1

    if args.once:
        process_queue(state, max_tasks=1)
    elif args.run > 0:
        process_queue(state, max_tasks=args.run)
    elif args.loop:
        process_queue(state, max_tasks=len(state["queue"]))
    else:
        ap.print_help()
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(main())
