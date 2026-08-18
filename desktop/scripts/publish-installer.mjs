/**
 * Publish kppdf-desktop-setup-v{semver}.exe (+ ZIP) into frontend download staging
 * and live browser tree, plus stable unversioned aliases.
 *
 * Usage (from desktop/):
 *   pnpm run release-installer   — tauri build + publish (recommended)
 *   pnpm run publish-installer   — publish only (requires fresh NSIS for current semver)
 *
 * Canon (TZD-46): docs/audits/2026-08-12-desktop-download-version-naming-canon.md
 * Integrity gate (2026-08-18): NEVER relabel a stale exe — source must be
 * `KPPDF Desktop_{semver}_x64-setup.exe` from `pnpm tauri build`, or verified staging.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync, crc32 } from 'node:zlib';

const desktopRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(desktopRoot, '..');

const EXE_NAME = 'kppdf-desktop-setup.exe';
const ZIP_NAME = 'kppdf-desktop-setup.zip';

/** Sanitized semver `major.minor.patch` (canon TZD-46). */
const SEMVER_RE = /^[0-9]+\.[0-9]+\.[0-9]+$/;

/**
 * Semver SoT: desktop/package.json, asserted equal to tauri.conf.json.
 * Mismatch = FAIL publish with an explicit error (version drift is a packaging bug).
 */
function readSemver() {
  const pkg = JSON.parse(readFileSync(join(desktopRoot, 'package.json'), 'utf8'));
  const tauri = JSON.parse(readFileSync(join(desktopRoot, 'src-tauri', 'tauri.conf.json'), 'utf8'));
  const fromPkg = String(pkg.version ?? '');
  const fromTauri = String(tauri.version ?? '');
  if (!SEMVER_RE.test(fromPkg)) {
    console.error(`[publish-installer] FAIL: desktop/package.json version "${fromPkg}" is not major.minor.patch`);
    process.exit(1);
  }
  if (fromPkg !== fromTauri) {
    console.error(
      `[publish-installer] FAIL: version mismatch — desktop/package.json = ${fromPkg}, ` +
        `src-tauri/tauri.conf.json = ${fromTauri}. Keep both in sync before publishing (canon TZD-46).`,
    );
    process.exit(1);
  }
  return fromPkg;
}

/** Normalize PE FileVersion / ProductVersion to major.minor.patch for compare. */
function normalizePeSemver(raw) {
  const s = String(raw ?? '').trim().replace(/^v/i, '');
  const m = s.match(/^(\d+)\.(\d+)\.(\d+)/);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : null;
}

/** Read embedded file version from a Windows PE (NSIS setup). Returns null if unavailable. */
function readPeFileVersion(exePath) {
  if (process.platform !== 'win32') {
    return null;
  }
  try {
    const escaped = exePath.replace(/'/g, "''");
    const out = execSync(
      `powershell -NoProfile -Command "(Get-Item -LiteralPath '${escaped}').VersionInfo.FileVersion"`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    ).trim();
    return normalizePeSemver(out) ?? (out || null);
  } catch {
    return null;
  }
}

function assertEmbeddedSemver(exePath, expectedSemver) {
  const embedded = readPeFileVersion(exePath);
  if (!embedded) {
    return;
  }
  if (embedded !== expectedSemver) {
    console.error(
      `[publish-installer] FAIL: embedded PE version "${embedded}" ≠ package semver ${expectedSemver} ` +
        `in ${exePath}. Run: cd desktop && pnpm tauri build — do NOT relabel an old installer.`,
    );
    process.exit(1);
  }
}

function versionedNsisPath(semver) {
  return join(
    desktopRoot,
    'src-tauri',
    'target',
    'release',
    'bundle',
    'nsis',
    `KPPDF Desktop_${semver}_x64-setup.exe`,
  );
}

function versionedStagingExe(semver) {
  return join(repoRoot, 'frontend', 'downloads', `kppdf-desktop-setup-v${semver}.exe`);
}

/**
 * Resolve installer source. Strict order — stale unversioned copies are rejected.
 * Override for emergency only: KPPDF_PUBLISH_ALLOW_STALE=1 (still checks PE version on Windows).
 */
function resolveInstallerSource(semver) {
  const nsis = versionedNsisPath(semver);
  if (existsSync(nsis)) {
    assertEmbeddedSemver(nsis, semver);
    return { src: nsis, label: 'fresh NSIS (tauri build)' };
  }

  const staging = versionedStagingExe(semver);
  if (existsSync(staging)) {
    assertEmbeddedSemver(staging, semver);
    return { src: staging, label: `verified staging ${staging}` };
  }

  const allowStale = process.env.KPPDF_PUBLISH_ALLOW_STALE === '1';
  const distLegacy = join(desktopRoot, 'dist-installers', EXE_NAME);
  if (allowStale && existsSync(distLegacy)) {
    assertEmbeddedSemver(distLegacy, semver);
    console.warn(
      `[publish-installer] WARN: KPPDF_PUBLISH_ALLOW_STALE=1 — using dist-installers copy. ` +
        `Prefer pnpm run release-installer next time.`,
    );
    return { src: distLegacy, label: 'dist-installers (explicit stale override)' };
  }

  const staleHints = [];
  if (existsSync(distLegacy)) {
    const pe = readPeFileVersion(distLegacy);
    staleHints.push(
      `  dist-installers/${EXE_NAME} exists` + (pe ? ` (embedded ${pe})` : '') + ' — NOT used (would mislabel)',
    );
  }
  for (const other of ['0.5.4', '0.5.2', '0.5.1', '0.1.0']) {
    if (other === semver) continue;
    const p = versionedNsisPath(other);
    if (existsSync(p)) {
      staleHints.push(`  older NSIS: ${p}`);
    }
  }

  console.error(
    `[publish-installer] FAIL: no installer for semver ${semver}.\n` +
      `Run: cd desktop && pnpm run release-installer\n` +
      `Expected NSIS: ${nsis}`,
  );
  if (staleHints.length) {
    console.error('Stale artifacts on disk (ignored):\n' + staleHints.join('\n'));
  }
  process.exit(1);
}

const SEMVER = readSemver();
const V_TAG = `v${SEMVER}`;
const EXE_VERSIONED = `kppdf-desktop-setup-${V_TAG}.exe`;
const ZIP_VERSIONED = `kppdf-desktop-setup-${V_TAG}.zip`;

const { src, label } = resolveInstallerSource(SEMVER);
console.log(`[publish-installer] source: ${label}`);

/**
 * Minimal single-file ZIP (DEFLATE) — no third-party deps.
 * Spec: local file header + data + central directory + EOCD.
 */
function writeSingleFileZip(exePath, zipPath, arcname) {
  const uncompressed = readFileSync(exePath);
  const compressed = deflateRawSync(uncompressed);
  const nameBuf = Buffer.from(arcname, 'utf8');
  const crc = crc32(uncompressed) >>> 0;

  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0); // signature
  localHeader.writeUInt16LE(20, 4); // version needed
  localHeader.writeUInt16LE(0, 6); // flags
  localHeader.writeUInt16LE(8, 8); // deflate
  localHeader.writeUInt16LE(0, 10); // time
  localHeader.writeUInt16LE(0, 12); // date
  localHeader.writeUInt32LE(crc, 14);
  localHeader.writeUInt32LE(compressed.length, 18);
  localHeader.writeUInt32LE(uncompressed.length, 22);
  localHeader.writeUInt16LE(nameBuf.length, 26);
  localHeader.writeUInt16LE(0, 28); // extra len

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4); // version made by
  central.writeUInt16LE(20, 6); // version needed
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt16LE(0, 12);
  central.writeUInt16LE(0, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(uncompressed.length, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt16LE(0, 30); // extra
  central.writeUInt16LE(0, 32); // comment
  central.writeUInt16LE(0, 34); // disk start
  central.writeUInt16LE(0, 36); // int attr
  central.writeUInt32LE(0, 38); // ext attr
  central.writeUInt32LE(0, 42); // relative offset of local header

  const eocd = Buffer.alloc(22);
  const centralOffset = localHeader.length + nameBuf.length + compressed.length;
  const centralSize = central.length + nameBuf.length;
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8); // entries this disk
  eocd.writeUInt16LE(1, 10); // total entries
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  eocd.writeUInt16LE(0, 20);

  writeFileSync(
    zipPath,
    Buffer.concat([localHeader, nameBuf, compressed, central, nameBuf, eocd]),
  );
}

const downloadRoots = [
  join(repoRoot, 'frontend', 'downloads'),
  join(repoRoot, 'frontend', 'browser', 'downloads'),
];

for (const dir of downloadRoots) {
  mkdirSync(dir, { recursive: true });
  const exeVerDest = join(dir, EXE_VERSIONED);
  const zipVerDest = join(dir, ZIP_VERSIONED);
  const exeDest = join(dir, EXE_NAME);
  const zipDest = join(dir, ZIP_NAME);
  copyFileSync(src, exeVerDest);
  copyFileSync(src, exeDest);
  writeSingleFileZip(exeVerDest, zipVerDest, EXE_VERSIONED);
  copyFileSync(zipVerDest, zipDest); // alias = same bytes
  const pe = readPeFileVersion(exeVerDest);
  console.log('OK', exeVerDest, `(${statSync(exeVerDest).size} bytes${pe ? `, PE ${pe}` : ''})`);
  console.log('OK', zipVerDest, `(${statSync(zipVerDest).size} bytes)`);
  console.log('alias', exeDest, `(same bytes as ${EXE_VERSIONED})`);
  console.log('alias', zipDest, `(same bytes as ${ZIP_VERSIONED})`);
}

console.log(
  `Published ${V_TAG}. Versioned URL → /downloads/${ZIP_VERSIONED} ` +
    `(Nest serves frontend/browser or staging downloads; alias /downloads/${ZIP_NAME} = same bytes; .exe published alongside).`,
);
