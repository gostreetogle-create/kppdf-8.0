import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/app/pages/doc-constructor');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, files);
    else if (entry.name.endsWith('.ts')) files.push(p);
  }
  return files;
}

function fix(content) {
  return content
    .replace(
      /oklch\(var\((--color-[a-z0-9-]+)\)\s*\/\s*([\d.]+)\)/g,
      (_, v, a) => {
        const pct = Math.round(parseFloat(a) * 100);
        return `color-mix(in oklch, var(${v}) ${pct}%, transparent)`;
      },
    )
    .replace(/oklch\(var\((--color-[a-z0-9-]+)\)\)/g, (_, v) => `var(${v})`);
}

let count = 0;
for (const file of walk(root)) {
  const original = fs.readFileSync(file, 'utf8');
  const next = fix(original);
  if (next !== original) {
    fs.writeFileSync(file, next);
    count += 1;
    console.log('fixed', path.relative(process.cwd(), file));
  }
}
console.log('files updated:', count);
