// Live demo dispatcher — uses ES modules (.mjs) to avoid package.json `"type": "module"` conflict.
// Reads system prompt from file, takes user prompt from CLI, POSTs to LM Studio.

import { readFileSync, writeFileSync } from 'node:fs';
import http from 'node:http';

const SYSTEM_PROMPT = readFileSync('scripts/SYSTEM_PROMPT_GEMMA4.txt', 'utf8');
const USER_PROMPT = process.argv.slice(2).join(' ').replace(/\\n/g, '\n');
const MODEL = 'google/gemma-4-12b-qat';
const MAX_TOKENS = 4000;

if (!USER_PROMPT || USER_PROMPT.length < 20) {
  console.error('Usage: node scripts/_demo_dispatch_esm.mjs "<user prompt>"');
  process.exit(2);
}

const payload = JSON.stringify({
  model: MODEL,
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: USER_PROMPT },
  ],
  max_tokens: MAX_TOKENS,
  temperature: 0.1,
});

const t0 = Date.now();
const req = http.request({
  hostname: 'localhost',
  port: 1234,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
  timeout: 120000,
}, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    const elapsed_sec = ((Date.now() - t0) / 1000).toFixed(2);
    const meta = { status: res.statusCode, elapsed_sec, body_length: body.length };
    writeFileSync('reports/_demo_response_meta.json', JSON.stringify(meta, null, 2));
    writeFileSync('reports/_demo_response_body.json', body);

    try {
      const parsed = JSON.parse(body);
      console.log('--- LIVE DISPATCH META ---');
      console.log('HTTP', res.statusCode);
      console.log('elapsed', elapsed_sec + 's');
      console.log('model:', parsed.model);
      if (parsed.usage) console.log('usage:', JSON.stringify(parsed.usage));
      console.log('finish_reason:', parsed.choices?.[0]?.finish_reason);
      console.log('\n--- MODEL OUTPUT (first 1800 chars) ---');
      console.log(parsed.choices[0].message.content.substring(0, 1800));
    } catch (e) {
      console.log('HTTP', res.statusCode, '(body saved but unparseable)');
      console.log(body.substring(0, 600));
    }
  });
});

req.on('error', (e) => { console.error('REQUEST ERROR:', e.message); process.exit(1); });
req.on('timeout', () => { console.error('TIMEOUT after 120s'); req.destroy(); });
req.write(payload);
req.end();
