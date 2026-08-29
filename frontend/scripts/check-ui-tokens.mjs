import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* global console, process */

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(frontendRoot, 'src');
const includeRe = /(?:\.component|\.page)\.(?:css|scss)$/i;
const rawSpacingRe =
  /\b(?:padding|padding-block|padding-inline|padding-top|padding-right|padding-bottom|padding-left|margin|margin-block|margin-inline|margin-top|margin-right|margin-bottom|margin-left)\s*:\s*[^;{}]*?\b(?:-?\d+(?:\.\d+)?|-?\.\d+)px\b/gi;
const rawColorRe =
  /\b(?:color|background|background-color|border(?:-(?:top|right|bottom|left))?-color|outline-color|fill|stroke)\b\s*:\s*[^;{}]*?#[0-9a-f]{3,8}\b/gi;

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else if (includeRe.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function withoutComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
}

function findViolations(filePath) {
  const text = withoutComments(fs.readFileSync(filePath, 'utf8'));
  const violations = [];
  const relativePath = path.relative(frontendRoot, filePath);
  const lineNumber = (index) => text.slice(0, index).split(/\r?\n/).length;

  for (const match of text.matchAll(rawSpacingRe)) {
    violations.push(`${relativePath}:${lineNumber(match.index ?? 0)}: raw spacing`);
  }
  for (const match of text.matchAll(rawColorRe)) {
    violations.push(`${relativePath}:${lineNumber(match.index ?? 0)}: raw color`);
  }
  return violations;
}

const violations = walk(sourceRoot).flatMap(findViolations);
if (violations.length > 0) {
  console.error(`UI token check failed: ${violations.length} violation(s)`);
  for (const violation of violations) console.error(`  ${violation}`);
  process.exitCode = 1;
} else {
  console.log('UI token check passed: no raw component/page spacing or colors found.');
}
