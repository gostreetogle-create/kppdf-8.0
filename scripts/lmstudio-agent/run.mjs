#!/usr/bin/env node
/**
 * Local LM Studio agent runner for kppdf-8.0
 *
 * Usage:
 *   node scripts/lmstudio-agent/run.mjs --check
 *   node scripts/lmstudio-agent/run.mjs --task "..."
 *   node scripts/lmstudio-agent/run.mjs --task "..." --with path/a.ts --with path/b.ts
 *   node scripts/lmstudio-agent/run.mjs --file path/to/prompt.txt
 *   node scripts/lmstudio-agent/run.mjs --eval
 *
 * Env:
 *   LMSTUDIO_BASE_URL  default http://127.0.0.1:1234/v1
 *   LMSTUDIO_MODEL     default qwen/qwen2.5-coder-14b
 *   LMSTUDIO_API_KEY   default lm-studio (ignored by server)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const BASE = (process.env.LMSTUDIO_BASE_URL || 'http://127.0.0.1:1234/v1').replace(/\/$/, '');
const MODEL = process.env.LMSTUDIO_MODEL || 'qwen/qwen2.5-coder-14b';
const KEY = process.env.LMSTUDIO_API_KEY || 'lm-studio';

const SYSTEM = `You are a local coding agent for the kppdf-8.0 ERP (Angular 20 + NestJS 10).
Rules:
- Be concise and concrete. Prefer file:line facts over guesses.
- Do NOT invent APIs, routes, or files. If unsure, say UNSURE.
- Do NOT propose destructive git/deploy commands.
- Package manager is pnpm only.
- Frontend: standalone, OnPush, signals, Paper & Ink (no random new UI kits).
- When asked for a code change, output a minimal patch or exact snippet, not a rewrite of the whole file.
- If the task is a review, list defects first with severity P0/P1/P2.
- Trust tier: LIMITED_HELPER — draft only; senior review required before merge.
Role: junior-to-mid local helper.`;

function parseArgs(argv) {
  const out = {
    task: null,
    file: null,
    with: [],
    eval: false,
    check: false,
    out: null,
    maxTokens: 1200,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--task') out.task = argv[++i];
    else if (a === '--file') out.file = argv[++i];
    else if (a === '--with') out.with.push(argv[++i]);
    else if (a === '--eval') out.eval = true;
    else if (a === '--check') out.check = true;
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--max-tokens') out.maxTokens = Number(argv[++i]);
  }
  return out;
}

async function chat(messages, maxTokens) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LM Studio HTTP ${res.status}: ${text.slice(0, 500)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content ?? '';
  return { content, usage: json.usage, model: json.model || MODEL, raw: json };
}

async function healthCheck() {
  const modelsUrl = `${BASE}/models`;
  const res = await fetch(modelsUrl, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) {
    throw new Error(`LM Studio /models HTTP ${res.status}`);
  }
  const json = await res.json();
  const ids = (json.data || []).map((m) => m.id);
  const loaded = ids.includes(MODEL) || ids.some((id) => id.includes('qwen2.5-coder'));
  console.log(
    JSON.stringify(
      {
        ok: true,
        base: BASE,
        configuredModel: MODEL,
        models: ids,
        preferredLoaded: loaded,
        trust: 'LIMITED_HELPER',
        docs: 'docs/agents/LM-STUDIO-AGENT.md',
      },
      null,
      2,
    ),
  );
  return { ok: true, ids, loaded };
}

function loadBaseContext() {
  const bits = [];
  for (const rel of ['GEMINI.md', 'STACK.md']) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) continue;
    const body = readFileSync(p, 'utf8');
    bits.push(`### ${rel}\n\`\`\`\n${body.slice(0, 2500)}\n\`\`\``);
  }
  return bits.join('\n\n');
}

function loadWithFiles(paths) {
  const bits = [];
  for (const raw of paths) {
    const p = resolve(ROOT, raw);
    if (!existsSync(p)) {
      bits.push(`### ${raw}\nMISSING_FILE`);
      continue;
    }
    const rel = relative(ROOT, p).replace(/\\/g, '/');
    const body = readFileSync(p, 'utf8');
    bits.push(`### ${rel}\n\`\`\`\n${body.slice(0, 12000)}\n\`\`\``);
  }
  return bits.join('\n\n');
}

const EVAL_CASES = [
  {
    id: 'E1-pure-ts',
    title: 'Pure TypeScript (no project)',
    prompt: `Write a TypeScript function \`clampOpacity(n: unknown): number\` that:
- returns 1 if n is not a finite number
- clamps to [0, 1] otherwise
Return ONLY the function, no markdown fences.`,
    score(text) {
      const t = text.trim();
      const hasFn = /function\s+clampOpacity|const\s+clampOpacity\s*=/.test(t);
      const hasFinite = /Number\.isFinite|isFinite/.test(t);
      const hasClamp = /Math\.(min|max)/.test(t) || /n\s*<\s*0|n\s*>\s*1/.test(t);
      const inventsExtra = /export\s+default|class\s+|React/.test(t);
      let s = 0;
      if (hasFn) s += 40;
      if (hasFinite) s += 30;
      if (hasClamp) s += 25;
      if (!inventsExtra) s += 5;
      return { score: s, notes: { hasFn, hasFinite, hasClamp, inventsExtra } };
    },
  },
  {
    id: 'E2-guard-review',
    title: 'Review capability-route.guard.ts',
    prompt: `Review this Angular CanMatch guard for defects (security/UX). Project uses user.pages[] from /auth/me.
Design: pageKey is checked against user.pages; capabilities is a separate OR-gate via CapabilitiesService. Both can coexist.

\`\`\`ts
${readFileSync(join(ROOT, 'frontend/src/app/core/capabilities/capability-route.guard.ts'), 'utf8')}
\`\`\`

List P0/P1/P2 findings only. If none, say NONE. Do not invent files that are not shown.`,
    score(text) {
      const lower = text.toLowerCase();
      const invents = /auth\.guard\.ts|permissionsguard\.py|django|jwt\.decode/.test(lower);
      const structured = /p0|p1|p2|none/.test(lower);
      // False-positive trap: claiming pageKey must also go through CapabilitiesService
      const falseP0 =
        /missing capability check for pagekey|pagekey.*(capabilitieservice|capability check)|does not check.*capability.*pagekey/.test(
          lower,
        );
      const saysNone = /\bnone\b/.test(lower) && !/p0/.test(lower);
      let s = 0;
      if (structured) s += 20;
      if (!invents) s += 20;
      if (falseP0) s = Math.min(s, 25);
      else if (saysNone || /legacy session|do not hard-block|intentional/.test(lower)) s += 60;
      else s += 30; // soft findings without the false P0
      return { score: Math.min(100, s), notes: { invents, structured, falseP0, saysNone } };
    },
  },
  {
    id: 'E3-project-hallucination',
    title: 'Hallucination trap',
    prompt: `In kppdf-8.0, what is the exact route path for the People/Workers page in app.routes.ts right now?
Answer with ONE of: the path string, or "NOT_ROUTED". Cite nothing else.`,
    score(text) {
      const t = text.trim();
      const ok = /^NOT_ROUTED\b/i.test(t) || /not.?routed/i.test(t);
      const wrongPath = /\/people|\/workers/i.test(t) && !ok;
      let s = ok ? 100 : wrongPath ? 0 : 20;
      return { score: s, notes: { ok, wrongPath, raw: t.slice(0, 120) } };
    },
  },
];

async function runEval() {
  const outDir = join(ROOT, 'docs/agents/lmstudio-eval');
  mkdirSync(outDir, { recursive: true });
  const results = [];
  const context = loadBaseContext();

  for (const c of EVAL_CASES) {
    process.stderr.write(`Running ${c.id}...\n`);
    const started = Date.now();
    let content = '';
    let err = null;
    let usage = null;
    try {
      const r = await chat(
        [
          { role: 'system', content: SYSTEM },
          {
            role: 'user',
            content: `${c.prompt}\n\n---\nProject context (may help):\n${context.slice(0, 5000)}`,
          },
        ],
        900,
      );
      content = r.content;
      usage = r.usage;
    } catch (e) {
      err = String(e?.message || e);
    }
    const ms = Date.now() - started;
    const scored = err ? { score: 0, notes: { err } } : c.score(content);
    results.push({
      id: c.id,
      title: c.title,
      ms,
      usage,
      ...scored,
      answer: content.slice(0, 2000),
      error: err,
    });
    writeFileSync(join(outDir, `${c.id}.txt`), content || err || '', 'utf8');
  }

  const avg = results.reduce((a, r) => a + r.score, 0) / results.length;
  const autoVerdict =
    avg >= 75 ? 'USEFUL_WITH_SUPERVISION' : avg >= 50 ? 'LIMITED_HELPER' : 'DO_NOT_TRUST_FOR_CODE';
  const report = {
    when: new Date().toISOString(),
    base: BASE,
    model: MODEL,
    averageScore: Math.round(avg),
    results,
    verdict: autoVerdict,
    note: 'Auto-score improved for E2 false-P0 trap; still apply human override for reviews. Canonical trust: LIMITED_HELPER — see LM-STUDIO-AGENT.md',
  };
  writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
  // Preserve human override sidecar if present from prior review
  const humanPath = join(outDir, 'human-verdict.json');
  if (!existsSync(humanPath)) {
    writeFileSync(
      humanPath,
      JSON.stringify(
        {
          trust: 'LIMITED_HELPER',
          reviewedAt: '2026-08-02',
          summary:
            'Keep as local draft helper. Do not trust alone for security review, TZ, archive, deploy.',
        },
        null,
        2,
      ),
      'utf8',
    );
  }
  console.log(JSON.stringify(report, null, 2));
  return report;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.check) {
    await healthCheck();
    return;
  }
  if (args.eval) {
    await runEval();
    return;
  }
  const task = args.file ? readFileSync(resolve(args.file), 'utf8') : args.task;
  if (!task) {
    console.error(
      'Usage: node scripts/lmstudio-agent/run.mjs --check | --eval | --task "..." [--with file] | --file prompt.txt',
    );
    process.exit(2);
  }
  const parts = [task];
  if (args.with.length) {
    parts.push('---\nAttached files:\n' + loadWithFiles(args.with));
  }
  parts.push('---\nBase context:\n' + loadBaseContext().slice(0, 5000));
  const r = await chat(
    [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: parts.join('\n\n') },
    ],
    args.maxTokens,
  );
  if (args.out) {
    writeFileSync(resolve(args.out), r.content, 'utf8');
  }
  console.log(r.content);
  console.error(`\n[lmstudio] model=${r.model} tokens=${JSON.stringify(r.usage)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
