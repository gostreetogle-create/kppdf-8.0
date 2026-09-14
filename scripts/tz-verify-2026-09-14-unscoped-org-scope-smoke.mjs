/**
 * TZ-VERIFY-2026-09-14-DOCSTUDIO-FOLLOWUPS — live smoke #2 (independent verify).
 *
 * Re-verifies TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE (19087f1b), which had only
 * BE+FE unit coverage in the original wave, no live smoke against the real
 * API. Reproduces the exact regression scenario: an UNSCOPED admin (real
 * seeded `admin`/`admin123` JWT — confirmed decoded orgId: null) creates a
 * document, switches its «Исполнитель» (StudioDocument.organizationId
 * itself, via the same PATCH shape as `onIssuerOrgChange`) to a different
 * real organization, then calls addBlock (the same "+Фото"/"+Текст" write
 * path) — before the fix this 404'd/403'd the caller out of their own
 * just-created document; the fix must return 201.
 *
 * Usage: node scripts/tz-verify-2026-09-14-unscoped-org-scope-smoke.mjs
 * Writes reports/TZ-VERIFY-2026-09-14-unscoped-org-scope-smoke.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const apiBase = process.env.KPPDF_API_BASE || 'http://127.0.0.1:3000/api';
const suffix = Date.now().toString(36);

function auth(token) { return { Authorization: `Bearer ${token}` }; }
function decodeJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
}

async function login() {
  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  if (!res.ok) throw new Error(`Login failed: HTTP ${res.status}`);
  return res.json();
}
async function get(pathname, tokens) {
  const res = await fetch(`${apiBase}${pathname}`, { headers: auth(tokens.access) });
  return { status: res.status, ok: res.ok, body: res.ok ? await res.json() : await res.text() };
}
async function post(pathname, tokens, body) {
  const res = await fetch(`${apiBase}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth(tokens.access) },
    body: JSON.stringify(body),
  });
  return { status: res.status, ok: res.ok, body: res.ok ? await res.json() : await res.text() };
}
async function patch(pathname, tokens, body) {
  const res = await fetch(`${apiBase}${pathname}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...auth(tokens.access) },
    body: JSON.stringify(body),
  });
  return { status: res.status, ok: res.ok, body: res.ok ? await res.json() : await res.text() };
}

const checks = [];
function check(name, pass, detail) { checks.push({ name, pass: !!pass, detail }); }

const tokens = await login();
const jwtPayload = decodeJwt(tokens.access);
check('admin_jwt_is_genuinely_unscoped', jwtPayload.orgId === null, jwtPayload);

const orgsRes = await get('/organizations?limit=5', tokens);
check('organizations_list_fetched', orgsRes.ok, { status: orgsRes.status });
const orgs = orgsRes.body.items ?? orgsRes.body.data?.items ?? [];
if (orgs.length < 2) throw new Error('Need at least 2 seeded organizations to test an issuer switch');

const docRes = await post('/studio-documents', tokens, { name: `Verify UNSCOPED-ORG-SCOPE ${suffix}` });
check('doc_created', docRes.status === 201, { status: docRes.status });
const doc = docRes.body;

const otherOrg = orgs.find((o) => o._id !== String(doc.organizationId)) ?? orgs[0];
check('found_a_different_org_to_switch_to', !!otherOrg && otherOrg._id !== String(doc.organizationId), { docOrg: doc.organizationId, otherOrg: otherOrg?._id });

// Same shape as onIssuerOrgChange's PATCH.
const issuerSwitchRes = await patch(`/studio-documents/${doc._id}`, tokens, {
  expectedRevision: doc.revision ?? 1,
  organizationId: otherOrg._id,
});
check('issuer_switch_patch_succeeds', issuerSwitchRes.ok, { status: issuerSwitchRes.status, body: typeof issuerSwitchRes.body === 'string' ? issuerSwitchRes.body.slice(0, 300) : issuerSwitchRes.body });
const docAfterSwitch = issuerSwitchRes.body;

// THE regression: +Текст / +Фото immediately after the issuer switch.
const addTextRes = await post(`/studio-documents/${doc._id}/blocks`, tokens, {
  expectedRevision: docAfterSwitch.revision,
  type: 'text',
  order: 0,
  content: '<p>post-issuer-switch smoke</p>',
  layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.1 },
});
check(
  'add_text_block_after_issuer_switch_returns_201_not_403',
  addTextRes.status === 201,
  { status: addTextRes.status, body: typeof addTextRes.body === 'string' ? addTextRes.body.slice(0, 300) : undefined },
);

// Follow-up GET (findById unscoped) must also still work — the other half of the fix.
const getAfterRes = await get(`/studio-documents/${doc._id}`, tokens);
check('get_document_after_issuer_switch_returns_200_not_404', getAfterRes.status === 200, { status: getAfterRes.status });

const pass = checks.every((c) => c.pass);
const report = { task: 'VERIFY-UNSCOPED-ORG-SCOPE', docId: doc._id, docOrgBefore: doc.organizationId, switchedTo: otherOrg._id, checks, pass };
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'TZ-VERIFY-2026-09-14-unscoped-org-scope-smoke.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass, checks }, null, 2));
process.exit(pass ? 0 : 1);
