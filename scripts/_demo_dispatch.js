// Robust single-shot dispatcher demo.
// Reads system prompt from file + user prompt from CLI arg,
// builds JSON payload, POSTs to LM Studio, prints reply.
// Eliminates bash quoting issues with multi-line strings.

const fs = require('fs');
const http = require('http');

const SYSTEM_PROMPT = fs.readFileSync('scripts/SYSTEM_PROMPT_GEMMA4.txt', 'utf8');
const USER_PROMPT = process.argv.slice(2).join(' ').replace(/\\n/g, '\n');
const MODEL = 'google/gemma-4-12b-qat';
const MAX_TOKENS = 1500;

const payload = JSON.stringify({
  model: MODEL,
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: USER_PROMPT },
  ],
  max_tokens: MAX_TOKENS,
  temperature: 0.2,
});

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
    const meta = {
      status: res.statusCode,
      elapsed_sec: ((Date.now() - t0) / 1000).toFixed(2),
      content_length: body.length,
    };
    fs.writeFileSync('reports/_demo_response_meta.json', JSON.stringify(meta, null, 2));
    fs.writeFileSync('reports/_demo_response_body.json', body);
    try {
      const parsed = JSON.parse(body);
      console.log('HTTP', res.statusCode);
      console.log('elapsed', meta.elapsed_sec + 's');
      console.log('model:', parsed.model);
      if (parsed.usage) {
        console.log('usage:', parsed.usage);
      }
      console.log('---OUTPUT (first 2000 chars)---');
      console.log(parsed.choices[0].message.content.substring(0, 2000));
    } catch (e) {
      console.log('HTTP', res.statusCode, '(raw body saved)');
      console.log(body.substring(0, 500));
    }
  });
});

const t0 = Date.now();
req.on('error', (e) => { console.error('REQUEST ERROR:', e.message); process.exit(1); });
req.on('timeout', () => { console.error('TIMEOUT after 120s'); req.destroy(); });
req.write(payload);
req.end();
