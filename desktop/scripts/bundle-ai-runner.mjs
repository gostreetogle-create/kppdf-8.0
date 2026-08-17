/**
 * TZD-56: собирает ai-runner в Tauri resource для NSIS.
 *
 * Dev (`tauri dev`) этот скрипт не вызывает — там живой tsx + src/ai-runner.
 * `tauri build` → beforeBuildCommand гоняет его до упаковки.
 *
 * Результат (gitignored, кроме README):
 *   src-tauri/resources/ai-runner/ai-runner.mjs
 *   src-tauri/resources/ai-runner/package.json
 *   src-tauri/resources/ai-runner/node_modules/  (node-llama-cpp + win-x64 CPU)
 */
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(desktopRoot, 'src-tauri', 'resources', 'ai-runner');
const SKIP_NATIVE = process.argv.includes('--skip-native');

const NATIVE_SKIP = new Set([
  'win-arm64',
  'win-x64-cuda',
  'win-x64-cuda-ext',
  'win-x64-vulkan',
  'linux-arm64',
  'linux-armv7l',
  'linux-riscv64',
  'linux-x64',
  'linux-x64-cuda',
  'linux-x64-cuda-ext',
  'linux-x64-vulkan',
  'mac-arm64-metal',
  'mac-x64',
]);

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyPackageFiles(src, dest) {
  const stat = fs.lstatSync(src);
  if (stat.isSymbolicLink()) {
    copyPackageFiles(fs.realpathSync(src), dest);
    return;
  }
  if (stat.isDirectory()) {
    if (path.basename(src) === 'node_modules') return;
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyPackageFiles(path.join(src, name), path.join(dest, name));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function listNmEntries(nmDir) {
  const out = [];
  if (!fs.existsSync(nmDir)) return out;
  for (const name of fs.readdirSync(nmDir)) {
    if (name === '.bin') continue;
    const p = path.join(nmDir, name);
    if (name.startsWith('@')) {
      if (!fs.statSync(p).isDirectory()) continue;
      for (const sub of fs.readdirSync(p)) out.push(path.join(p, sub));
    } else {
      out.push(p);
    }
  }
  return out;
}

function copyNative() {
  const llamaLink = path.join(desktopRoot, 'node_modules', 'node-llama-cpp');
  if (!fs.existsSync(llamaLink)) {
    throw new Error(`bundle-ai-runner: нет ${llamaLink} — pnpm install в desktop/`);
  }
  const llamaRoot = fs.realpathSync(llamaLink);
  const destNm = path.join(outDir, 'node_modules');
  rmrf(destNm);

  const copyPkgNested = (realDir, dest, stack) => {
    if (stack.has(realDir)) return;
    if (fs.existsSync(path.join(dest, 'package.json'))) return;
    const pkgFile = path.join(realDir, 'package.json');
    if (!fs.existsSync(pkgFile)) return;
    let name;
    try {
      name = JSON.parse(fs.readFileSync(pkgFile, 'utf8')).name;
    } catch {
      return;
    }
    if (typeof name !== 'string') return;
    if (name.startsWith('@node-llama-cpp/')) {
      const plat = name.slice('@node-llama-cpp/'.length);
      if (NATIVE_SKIP.has(plat)) return;
    }
    stack.add(realDir);
    copyPackageFiles(realDir, dest);
    for (const child of listNmEntries(path.dirname(realDir))) {
      let childReal;
      try {
        childReal = fs.realpathSync(child);
      } catch {
        continue;
      }
      if (childReal === realDir) continue;
      let childName;
      try {
        childName = JSON.parse(fs.readFileSync(path.join(childReal, 'package.json'), 'utf8')).name;
      } catch {
        continue;
      }
      if (typeof childName !== 'string' || childName === name) continue;
      copyPkgNested(childReal, path.join(dest, 'node_modules', ...childName.split('/')), stack);
    }
    stack.delete(realDir);
  };

  copyPkgNested(llamaRoot, path.join(destNm, 'node-llama-cpp'), new Set());
  if (!fs.existsSync(path.join(destNm, 'node-llama-cpp', 'package.json'))) {
    throw new Error('bundle-ai-runner: node-llama-cpp не скопирован');
  }
  const winCpu = path.join(destNm, 'node-llama-cpp', 'node_modules', '@node-llama-cpp', 'win-x64');
  if (!fs.existsSync(winCpu)) {
    console.warn('bundle-ai-runner: нет @node-llama-cpp/win-x64 — модель на CPU в install может не загрузиться');
  }
}

function dirSizeMb(dir) {
  let bytes = 0;
  const walk = (p) => {
    if (!fs.existsSync(p)) return;
    const st = fs.lstatSync(p);
    if (st.isSymbolicLink()) return;
    if (st.isDirectory()) {
      for (const name of fs.readdirSync(p)) walk(path.join(p, name));
    } else {
      bytes += st.size;
    }
  };
  walk(dir);
  return bytes / (1024 * 1024);
}

async function bundleJs() {
  fs.mkdirSync(outDir, { recursive: true });
  await build({
    configFile: false,
    root: desktopRoot,
    logLevel: 'warn',
    build: {
      ssr: true,
      sourcemap: false,
      minify: false,
      emptyOutDir: false,
      outDir,
      rollupOptions: {
        input: path.join(desktopRoot, 'src', 'ai-runner', 'index.ts'),
        external: ['node-llama-cpp', /^node:/],
        output: {
          format: 'es',
          entryFileNames: 'ai-runner.mjs',
        },
      },
    },
  });
  const entry = path.join(outDir, 'ai-runner.mjs');
  if (!fs.existsSync(entry)) {
    throw new Error(`bundle-ai-runner: нет ${entry}`);
  }
  fs.writeFileSync(
    path.join(outDir, 'package.json'),
    `${JSON.stringify({ name: 'kppdf-ai-runner', private: true, type: 'module' }, null, 2)}\n`,
  );
}

async function main() {
  rmrf(path.join(outDir, 'ai-runner.mjs'));
  await bundleJs();
  if (!SKIP_NATIVE) copyNative();
  const mb = dirSizeMb(outDir);
  console.log(`bundle-ai-runner: ${outDir} (${mb.toFixed(1)} MB${SKIP_NATIVE ? ', skip-native' : ''})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
