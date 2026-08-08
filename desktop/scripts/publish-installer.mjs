/**
 * Publish kppdf-desktop-setup.exe (+ ZIP) into frontend download staging
 * and live browser tree.
 *
 * Usage (from desktop/): pnpm run publish-installer
 *
 * ZIP contains a single entry `kppdf-desktop-setup.exe` (no wrapper folder).
 * Default web button → `/downloads/kppdf-desktop-setup.zip` (TZD-24).
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync, crc32 } from 'node:zlib';

const desktopRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(desktopRoot, '..');

const EXE_NAME = 'kppdf-desktop-setup.exe';
const ZIP_NAME = 'kppdf-desktop-setup.zip';

const candidates = [
  join(desktopRoot, 'dist-installers', EXE_NAME),
  join(
    desktopRoot,
    'src-tauri',
    'target',
    'release',
    'bundle',
    'nsis',
    'KPPDF Desktop_0.1.0_x64-setup.exe',
  ),
];

const src = candidates.find((p) => existsSync(p));
if (!src) {
  console.error(
    'No setup.exe found. Run: cd desktop && pnpm tauri build\nExpected:',
    candidates.join('\n  '),
  );
  process.exit(1);
}

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
  const exeDest = join(dir, EXE_NAME);
  const zipDest = join(dir, ZIP_NAME);
  copyFileSync(src, exeDest);
  writeSingleFileZip(exeDest, zipDest, EXE_NAME);
  console.log('OK', exeDest, `(${statSync(exeDest).size} bytes)`);
  console.log('OK', zipDest, `(${statSync(zipDest).size} bytes)`);
}

console.log(
  'Web button → /downloads/kppdf-desktop-setup.zip (Nest serves frontend/browser or staging downloads; .exe still published alongside)',
);
