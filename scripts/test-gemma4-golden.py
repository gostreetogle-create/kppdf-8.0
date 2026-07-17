#!/usr/bin/env python3
"""
test-gemma4-golden.py — Golden Test-Harness для Gemma 4 12B QAT на kppdf-8.0.

5 категорий проверок:
  T1 UI primitives recognition     (<app-pi-switch> vs hand-roll <button role="switch">)
  T2 TZ-specific knowledge         (TZ-91 §2 Decision 1 — конкретные детали)
  T3 Multi-step workflow adherence (read spec → recon → plan → implement → validate)
  T4 Russian prose quality         (грамотный русский без transliteration)
  T5 Anti-pattern detection        (window.confirm → PiDialogService.open(AlertDialogComponent))

Использование:
  # Ollama по умолчанию (localhost:11434):
  python scripts/test-gemma4-golden.py

  # vLLM с OpenAI-compatible interface:
  python scripts/test-gemma4-golden.py \\
      --endpoint-kind vllm \\
      --endpoint http://localhost:8000/v1/chat/completions \\
      --model google/gemma-4-12b-qat

  # Verbose + JSON report:
  python scripts/test-gemma4-golden.py -v --json-out reports/golden_2026-07-12.json

Зависимости: только Python 3.10+ stdlib (urllib, json, re, dataclasses, argparse).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

DEFAULT_ENDPOINTS: dict[str, str] = {
    "ollama": "http://localhost:11434/api/generate",
    "vllm":   "http://localhost:8000/v1/chat/completions",
    "openai": "http://localhost:8000/v1/chat/completions",
}

DEFAULT_SYSTEM_PROMPT_FILE = "scripts/SYSTEM_PROMPT_GEMMA4.txt"
DEFAULT_MODEL = "gemma4:12b-qat"


# ────────────────────────────────────────────────────────────────────
# Golden test definitions
# ────────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class GoldenTest:
    id: str
    category: str
    description: str
    user_prompt: str
    expected_keywords: tuple[str, ...] = ()
    expected_patterns: tuple[str, ...] = ()
    failure_keywords: tuple[str, ...] = ()
    token_budget: int = 512


GOLDEN_TESTS: tuple[GoldenTest, ...] = (
    GoldenTest(
        id="T1_pi_switch_primitives",
        token_budget=768,
        category="UI primitives recognition",
        description=(
            "Проверяет: Gemma использует <app-pi-switch> вместо "
            "hand-rolling <button role=\"switch\">. Это критично — "
            "Pi-* primitive обеспечивает accessibility + консистентность."
        ),
        user_prompt=(
            "У меня в kppdf-8.0 список товаров с колонкой isActive. "
            "Я хочу сделать inline переключатель active/inactive для каждой строки.\n"
            "Напиши фрагмент Angular 20 template с правильной реализацией "
            "по conventions проекта."
        ),
        expected_keywords=(
            "app-pi-switch",
            "shared/ui/switch",
            "PiSwitch",
        ),
        expected_patterns=(
            r"<app-pi-switch\b",
            r"\[(?:checked|formControl|boundControl)\]",
        ),
        failure_keywords=(
            'role="switch"',
            "<button",
            "translate-x",
            "aria-checked",
        ),
    ),
    GoldenTest(
        id="T2_tz_knowledge",
        token_budget=512,
        category="TZ-specific knowledge",
        description=(
            "Проверяет: Gemma знает конкретные TZ-91 детали "
            "(не generic answer про RBAC best practices)."
        ),
        user_prompt=(
            "Что такое TZ-91 §2 Decision 1 в проекте kppdf-8.0? "
            "Объясни в 2-3 предложениях когда будет удалён @Public() "
            "с endpoint /register."
        ),
        expected_keywords=(
            "@Public",
            "TZ-91-extension",
            "invite",
            "admin",
            "chicken-and-egg",
        ),
        expected_patterns=(
            r"D\w*\s*TO\s*TZ-91",
            r"admin.{0,80}invite|invite.{0,80}admin",
            r"bootstrap",
        ),
        failure_keywords=(
            "лучшая практика",
            "general security",
            "best practice",
            "RBAC best",
            "industry standards",
        ),
    ),
    GoldenTest(
        id="T3_workflow_adherence",
        category="Multi-step workflow",
        description=(
            "Проверяет: Gemma следует Workflow из system prompt\u2019а \u2014 "
            "read TZ spec first \u2192 recon \u2192 plan \u2192 implement \u2192 validate. "
            "Не skip\u2019ает этапы, не editates наивно."
        ),
        token_budget=896,
        user_prompt=(
            "Я хочу закрыть TZ-87 в kppdf-8.0: добавить backend "
            "dev-fixtures seed (Organization + Counterparty + DocTypes) "
            "с idempotency + production-guard. "
            "Опиши пошаговый план как бы ты это сделал по conventions проекта."
        ),
        expected_keywords=(
            "tasks/TZ-87",
            "OnModuleInit",
            "findOne",
            "app.module",
            "tsconfig",
            "NODE_ENV",
        ),
        expected_patterns=(
            # Bilingual: matches English ("1. Read the spec") OR Russian ("Шаг 1: прочитать спецификацию")
            r"(?:^|\s)(?:1[\.\\:]|шаг\s*1|первый\s*шаг|step\s*1|first\s*step).{0,100}(?:read|spec|специ|спеку|задач|task)",
            r"findOne\(",
            r"tsc.*--noEmit|tsconfig\.build",
            r"NODE_ENV|production.{0,40}guard|defer.*production|skip.*production",
            r"write_todos|todo[_-]?list|plan.*step",
        ),
        failure_keywords=(
            "просто напишите код",
            "вот готовый код",
            "используйте Mongoose model directly",
            "skip validation",
        ),
    ),
    GoldenTest(
        id="T4_russian_prose",
        token_budget=384,
        category="Russian language quality",
        description=(
            "Проверяет: Gemma выдаёт грамотный русский ответ, "
            "не кальку с английского, не транслитерацию."
        ),
        user_prompt=(
            "Объясни в 3-5 предложениях что такое TZ-87 (Document Constructor "
            "F.3 close-out) в kppdf-8.0 и почему он важен для проекта."
        ),
        expected_keywords=(
            "конструктор",
            "документ",
            "шаблон",
            "браузер",
            "dev",
        ),
        expected_patterns=(
            # Capitalised start + Cyrillic letters + period end → Russian sentence shape
            r"^[А-ЯЁ][А-яё]+\s*[А-яё]",
            r"[а-яё]\.",
        ),
        failure_keywords=(
            "tz-87",
            "document constructor",
            "ф3 close-out",
            "тз-87",
            "close-out",
        ),
    ),
    GoldenTest(
        id="T5_anti_pattern",
        token_budget=768,
        category="Anti-pattern detection",
        description=(
            "Проверяет: Gemma определяет window.confirm() anti-pattern и "
            "предлагает PiDialogService.open(AlertDialogComponent) — канон "
            "TZ-90 polymorphic dialog system."
        ),
        user_prompt=(
            "Я нашёл в коде kppdf-8.0 такое:"
            "\n```html"
            '\n<button type="button" (click)="onConfirmDelete()">Удалить</button>'
            "\n```"
            "\n\nЧто с этим не так по conventions проекта? "
            "Предложи правильный fix."
        ),
        expected_keywords=(
            "PiDialogService",
            "AlertDialog",
            "confirm",
            "TZ-90",
            "polymorphic",
        ),
        expected_patterns=(
            r"PiDialogService\.open\(",
            r"AlertDialogComponent",
            r"window\.confirm|confirm\(\)",
        ),
        failure_keywords=(
            "callback is fine",
            "не нужно менять",
            "просто удалите event",
            "это нормально",
        ),
    ),
)


# ────────────────────────────────────────────────────────────────────
# Endpoint clients (Ollama + OpenAI-compatible /v1/chat/completions)
# ────────────────────────────────────────────────────────────────────

def _http_post(url: str, payload: dict, timeout: int = 180) -> dict:
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


def query_ollama(endpoint: str, model: str, system: str, user: str, max_tokens: int) -> str:
    payload = {
        "model": model,
        "system": system,
        "prompt": user,
        "stream": False,
        "options": {"num_predict": max_tokens, "temperature": 0.2},
    }
    data = _http_post(endpoint, payload)
    return data.get("response", "")


def query_openai_chat(endpoint: str, model: str, system: str, user: str, max_tokens: int) -> str:
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.2,
    }
    data = _http_post(endpoint, payload)
    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError(f"No choices in response: {data}")
    return choices[0]["message"]["content"]


def query_endpoint(endpoint_kind: str, endpoint: str, model: str,
                   system: str, user: str, max_tokens: int) -> str:
    dispatch = {
        "ollama": query_ollama,
        "vllm":   query_openai_chat,
        "openai": query_openai_chat,
    }
    fn = dispatch[endpoint_kind]
    return fn(endpoint, model, system, user, max_tokens)


# ────────────────────────────────────────────────────────────────────
# Scoring
# ────────────────────────────────────────────────────────────────────

def score_test(test: GoldenTest, output: str) -> dict[str, Any]:
    out_lower = output.lower()
    expected_hits = [k for k in test.expected_keywords if k.lower() in out_lower]
    expected_misses = [k for k in test.expected_keywords if k.lower() not in out_lower]
    failure_hits = [k for k in test.failure_keywords if k.lower() in out_lower]
    pattern_hits = [p for p in test.expected_patterns if re.search(p, output, re.IGNORECASE | re.MULTILINE)]

    n_exp = len(test.expected_keywords)
    n_pat = len(test.expected_patterns)
    n_fail = len(test.failure_keywords)

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
        "expected_keyword_hits": expected_hits,
        "expected_keyword_misses": expected_misses,
        "pattern_hits": pattern_hits,
        "failure_keyword_hits": failure_hits,
        "score": round(score, 3),
        "verdict": verdict,
        "output_excerpt": output[:400] + ("…" if len(output) > 400 else ""),
        "output_length": len(output),
    }


# ────────────────────────────────────────────────────────────────────
# Runner
# ────────────────────────────────────────────────────────────────────

def run_tests(endpoint_kind: str, endpoint: str, model: str,
              system_prompt: str, verbose: bool = False) -> dict[str, Any]:
    results: dict[str, Any] = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "endpoint_kind": endpoint_kind,
        "endpoint": endpoint,
        "model": model,
        "system_prompt_length": len(system_prompt),
        "system_prompt_first_100": system_prompt[:100],
        "tests": [],
        "summary": {"pass": 0, "partial": 0, "fail": 0, "total": 0},
    }

    for test in GOLDEN_TESTS:
        if verbose:
            print(f"\n──── Running {test.id} ────")
            print(f"Category : {test.category}")
            print(f"Prompt   : {test.user_prompt[:200]}…")

        try:
            import time as _time
            t0 = _time.monotonic()
            output = query_endpoint(
                endpoint_kind, endpoint, model,
                system_prompt, test.user_prompt, test.token_budget,
            )
            latency_ms = round((_time.monotonic() - t0) * 1000.0, 1)
        except urllib.error.URLError as e:
            results["tests"].append({
                "id": test.id, "category": test.category, "description": test.description,
                "error": str(e), "error_category": "network",
                "verdict": "FAIL", "score": 0.0, "latency_ms": None,
            })
            results["summary"]["fail"] += 1
            results["summary"]["total"] += 1
            continue
        except json.JSONDecodeError as e:
            results["tests"].append({
                "id": test.id, "category": test.category, "description": test.description,
                "error": str(e), "error_category": "parse",
                "verdict": "FAIL", "score": 0.0, "latency_ms": None,
            })
            results["summary"]["fail"] += 1
            results["summary"]["total"] += 1
            continue
        except (KeyError, IndexError) as e:
            results["tests"].append({
                "id": test.id, "category": test.category, "description": test.description,
                "error": str(e), "error_category": "shape",
                "verdict": "FAIL", "score": 0.0, "latency_ms": None,
            })
            results["summary"]["fail"] += 1
            results["summary"]["total"] += 1
            continue
        except Exception as e:
            results["tests"].append({
                "id": test.id, "category": test.category, "description": test.description,
                "error": str(e), "error_category": "unknown",
                "verdict": "FAIL", "score": 0.0, "latency_ms": None,
            })
            results["summary"]["fail"] += 1
            results["summary"]["total"] += 1
            if verbose:
                print(f"  ERROR : {e}")
            continue

        scored = score_test(test, output)
        results["summary"]["total"] += 1
        if scored["verdict"] == "PASS":
            results["summary"]["pass"] += 1
        elif scored["verdict"] == "PARTIAL":
            results["summary"]["partial"] += 1
        else:
            results["summary"]["fail"] += 1

        if verbose:
            print(f"Score    : {scored['score']}  Verdict : {scored['verdict']}")
            print(f"Excerpt  : {scored['output_excerpt'][:200]}")

        results["tests"].append({
            "id": test.id,
            "category": test.category,
            "description": test.description,
            **scored,
            "latency_ms": latency_ms,
        })

    return results


# ────────────────────────────────────────────────────────────────────
# Pretty printer
# ────────────────────────────────────────────────────────────────────

def print_summary(results: dict[str, Any], verbose: bool = False) -> None:
    bar = "=" * 78
    print(f"\n{bar}")
    print("  GOLDEN TEST RESULTS — Gemma 4 12B QAT on kppdf-8.0")
    print(f"  Model     : {results['model']}")
    print(f"  Endpoint  : {results['endpoint']}  ({results['endpoint_kind']})")
    print(f"  Timestamp : {results['timestamp']}")
    print(bar)

    s = results["summary"]
    print(f"\n  PASSED : {s['pass']} / {s['total']}    "
          f"PARTIAL : {s['partial']}    FAILED : {s['fail']}\n")

    for t in results["tests"]:
        marker = {"PASS": "✓", "PARTIAL": "~", "FAIL": "✗"}.get(t["verdict"], "?")
        score = t.get("score", 0)
        print(f"  {marker} [{t['id']}] {t['category']} — score={score}")
        if verbose:
            print(f"      description           : {t['description']}")
            print(f"      expected keyword hits : {t.get('expected_keyword_hits', [])}")
            print(f"      expected misses       : {t.get('expected_keyword_misses', [])}")
            print(f"      pattern hits          : {t.get('pattern_hits', [])}")
            print(f"      failure keyword hits  : {t.get('failure_keyword_hits', [])}")
            print(f"      output length         : {t.get('output_length', 0)}")
        if t.get("error"):
            print(f"      ERROR                 : {t['error']}")

    print(f"\n{bar}")
    if s["fail"] == 0 and s["partial"] == 0:
        print("  ✓ Setup корректен: модель следует conventions kppdf-8.0.")
    elif s["fail"] == 0:
        print(f"  ~ Setup работает, но {s['partial']} test(s) PARTIAL — тюнинг system prompt'а желателен.")
    else:
        print(f"  ✗ {s['fail']} test(s) FAILED — setup issues. Детали выше.")
    print(bar)


# ────────────────────────────────────────────────────────────────────
# CLI entrypoint
# ────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(
        description="Golden Test-Harness для Gemma 4 12B QAT на kppdf-8.0",
    )
    ap.add_argument("--endpoint-kind", choices=sorted(DEFAULT_ENDPOINTS.keys()),
                    default="ollama")
    ap.add_argument("--endpoint", default=None, help="Override API endpoint URL")
    ap.add_argument("--model", default=DEFAULT_MODEL, help=f"Model name (default: {DEFAULT_MODEL})")
    ap.add_argument("--system-prompt-file", default=DEFAULT_SYSTEM_PROMPT_FILE,
                    help=f"Path to system prompt file (default: {DEFAULT_SYSTEM_PROMPT_FILE})")
    ap.add_argument("-v", "--verbose", action="store_true",
                    help="Verbose output (expected_/failure keywords, scores per test)")
    ap.add_argument("--json-out", default=None, help="Write full JSON report to file")
    args = ap.parse_args()

    endpoint = args.endpoint or DEFAULT_ENDPOINTS[args.endpoint_kind]

    if not os.path.exists(args.system_prompt_file):
        print(f"ERROR: system prompt file not found: {args.system_prompt_file}",
              file=sys.stderr)
        print(f"Сначала сохрани system prompt для Gemma 4 в этот файл.", file=sys.stderr)
        print(f"(См. suggested prompt в нашей беседе с Buffy.)", file=sys.stderr)
        return 2

    with open(args.system_prompt_file, "r", encoding="utf-8") as f:
        system_prompt = f.read()

    print(f"[test-gemma4-golden] using endpoint {endpoint} ({args.endpoint_kind}) "
          f"with model {args.model}…", file=sys.stderr)

    results = run_tests(
        endpoint_kind=args.endpoint_kind,
        endpoint=endpoint,
        model=args.model,
        system_prompt=system_prompt,
        verbose=args.verbose,
    )

    print_summary(results, args.verbose)

    if args.json_out:
        os.makedirs(os.path.dirname(args.json_out) or ".", exist_ok=True)
        with open(args.json_out, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\nFull JSON report → {args.json_out}", file=sys.stderr)

    return 0 if results["summary"]["fail"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
