// qa_smoke.mjs — Anti-idleness smoke test для kppdf-8.0 orchestration.
//
// 5 simple factual Q&A tasks модель МОЖЕТ ответить в few tokens
// (vs complex audit/draft которых она не может без escaping reasoning loop).
// Per-task CoT-detection: explicit failure если output starts с "User:" / "Context:" / "Constraints:" markers.
//
// Использование: node scripts/qa_smoke.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import http from 'node:http';

const ENDPOINT = 'http://localhost:1234/v1/chat/completions';
const MODEL = 'google/gemma-4-12b-qat';
const SYSTEM_PROMPT_PATH = 'scripts/SYSTEM_PROMPT_GEMMA4.txt';

const SYSTEM_PROMPT = readFileSync(SYSTEM_PROMPT_PATH, 'utf8');

// Pattern для detect "talking about the request, not answering it"
const COT_LEAK_PATTERNS = [
  /^\s*[-*]\s*(User|Context|Constraints?|Hint):/im,
  /^\s*(User says:|Context:|Constraints:|I am a senior)/im,
  /^\s*\*\s+\*?Steps?/im,
];

const TASKS = [
  {
    id: 'qa-1-role-tz87',
    question: 'Что такое TZ-87 в kppdf-8.0? Дай ответ в 1 предложении.',
    expected_keywords: ['TZ-87', 'F.3', 'close-out'],
    expected_patterns: [/[^.!?]+\.$/],
  },
  {
    id: 'qa-2-decision-tz91',
    question: 'Что фиксирует TZ-91 §2 Decision 1? 1-2 предложения.',
    expected_keywords: ['@Public', 'TZ-91-extension', 'invite'],
    expected_patterns: [/[^.!?]+\.$/],
  },
  {
    id: 'qa-3-pi-primitives',
    question: 'Какие Pi-* UI primitives доступны во frontend kppdf-8.0 для form inputs? Назови 3.',
    expected_keywords: ['app-pi-checkbox', 'app-pi-textarea', 'app-pi-select'],
    expected_patterns: [/(?:\d\.|\-)/],
  },
  {
    id: 'qa-4-dev-fixtures',
    question: 'Какие 3 entity seedятся через dev-fixtures.seed.ts в kppdf-8.0? Назови в list format.',
    expected_keywords: ['Organization', 'Counterparty', 'DocType'],
    expected_patterns: [/[A-Z]\w+,\s*[A-Z]\w+/],
  },
  {
    id: 'qa-5-routes',
    question: 'Какие 4 NAV_CATEGORIES в верхнем nav kppdf-8.0? 1 line, через запятую.',
    expected_keywords: ['Каталог', 'Сделки', 'Справочники', 'Конструктор'],
    expected_patterns: [/,\s*/],
  },
];

function looksLikeCoTPreamble(output) {
  for (const pat of COT_LEAK_PATTERNS) {
    if (pat.test(output.slice(0, 400))) return true;
  }
  return false;
}

function scoreTask(task, output) {
  const out = output || '';
  if (looksLikeCoTPreamble(out)) {
    return { verdict: 'FAIL', reason: 'cot_preamble', score: 0.0, length: out.length };
  }
  if (out.trim().length < 5) {
    return { verdict: 'FAIL', reason: 'empty', score: 0.0, length: out.length };
  }
  const kHits = task.expected_keywords.filter((k) => out.toLowerCase().includes(k.toLowerCase()));
  const pHits = task.expected_patterns.filter((re) => re.test(out));
  const score = (kHits.length / Math.max(1, task.expected_keywords.length)) * 0.7
              + (pHits.length / Math.max(1, task.expected_patterns.length)) * 0.3;
  const verdict = score >= 0.7 ? 'PASS' : score >= 0.4 ? 'PARTIAL' : 'FAIL';
  return { verdict, score, keyword_hits: kHits, pattern_hits: pHits.length, length: out.length };
}

function dispatch(question, maxTokens) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
    });
    const t0 = Date.now();
    const req = http.request({
      hostname: 'localhost',
      port: 1234,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 60000,
    }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
        try {
          const parsed = JSON.parse(body);
          if (!parsed.choices || !parsed.choices[0]) {
            return reject(new Error(`No choices: ${body.slice(0, 200)}`));
          }
          resolve({
            content: parsed.choices[0].message.content || '',
            reasoning: parsed.choices[0].message.reasoning_content || null,
            finish_reason: parsed.choices[0].finish_reason,
            usage: parsed.usage,
            elapsed_sec: parseFloat(elapsed),
            status: res.statusCode,
          });
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}; body=${body.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout 60s')); });
    req.write(payload);
    req.end();
  });
}

(async () => {
  console.log('===== QA SMOKE TEST — gemma-4-12b-qat на kppdf-8.0 =====\n');
  const results = [];
  for (const task of TASKS) {
    process.stdout.write(`→ ${task.id} ... `);
    try {
      const resp = await dispatch(task.question, 1500);
      const scored = scoreTask(task, resp.content);
      results.push({ task_id: task.id, ...resp, scored });
      const m = scored.verdict === 'PASS' ? '✓' : scored.verdict === 'PARTIAL' ? '~' : '✗';
      console.log(`${m} ${scored.verdict} score=${scored.score.toFixed(2)} ` +
        `len=${resp.content.length} finish=${resp.finish_reason} ` +
        `(${scored.reason || 'eval'}) in ${resp.elapsed_sec}s`);
      if (resp.content.length > 0) {
        console.log(`    output: "${resp.content.replace(/\n/g, ' ').slice(0, 200)}"`);
      }
      if (resp.reasoning) {
        console.log(`    reasoning: ${resp.reasoning.slice(0, 200)}…`);
      }
    } catch (e) {
      console.log(`✗ NETWORK: ${e.message}`);
      results.push({ task_id: task.id, error: e.message });
    }
  }
  const passed = results.filter((r) => r.scored?.verdict === 'PASS').length;
  const partial = results.filter((r) => r.scored?.verdict === 'PARTIAL').length;
  const failed = results.filter((r) => !r.scored || r.scored.verdict === 'FAIL').length;
  console.log(`\n===== SUMMARY =====`);
  console.log(`PASS: ${passed} / 5    PARTIAL: ${partial}    FAIL: ${failed}`);
  console.log(`If FAILED all → модель locked in reasoning, pivot recommended.`);
  console.log(`If 2+ PASS → strategy works, scale to full BACKLOG.`);

  writeFileSync('reports/qa_smoke_2026-07-12.json', JSON.stringify(results, null, 2));
})();
