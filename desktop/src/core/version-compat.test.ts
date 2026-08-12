import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  compareSemver,
  decideCompat,
  resolveDownloadUrl,
  type DesktopCompatInfo,
} from './version-compat';

const compat = (min: string, recommended: string): DesktopCompatInfo => ({
  minDesktopVersion: min,
  recommendedDesktopVersion: recommended,
  downloadUrl: '/downloads/kppdf-desktop-setup.zip',
  serverBuildId: 'test',
});

describe('compareSemver (TZD-40)', () => {
  it('сравнивает major/minor/patch', () => {
    assert.equal(compareSemver('0.4.9', '0.5.0'), -1);
    assert.equal(compareSemver('0.5.0', '0.5.0'), 0);
    assert.equal(compareSemver('0.5.1', '0.5.0'), 1);
    assert.equal(compareSemver('1.0.0', '0.9.9'), 1);
  });

  it('невалидный semver → 0 (fail-open)', () => {
    assert.equal(compareSemver('v0.5', '0.5.0'), 0);
    assert.equal(compareSemver('', '0.5.0'), 0);
    assert.equal(compareSemver('0.5.0', 'banana'), 0);
    assert.equal(compareSemver('0.5', '0.6'), 0);
  });
});

describe('decideCompat (TZD-40)', () => {
  it('ниже min → block', () => {
    assert.equal(decideCompat('0.4.9', compat('0.5.0', '0.5.1')), 'block');
  });

  it('между min и recommended → warn', () => {
    assert.equal(decideCompat('0.5.0', compat('0.5.0', '0.5.1')), 'warn');
  });

  it('≥ recommended → ok', () => {
    assert.equal(decideCompat('0.5.1', compat('0.5.0', '0.5.1')), 'ok');
    assert.equal(decideCompat('0.6.0', compat('0.5.0', '0.5.1')), 'ok');
  });

  it('невалидная версия приложения → ok (fail-open)', () => {
    assert.equal(decideCompat('', compat('0.5.0', '0.5.1')), 'ok');
  });
});

describe('resolveDownloadUrl (TZD-40)', () => {
  it('абсолютный URL остаётся как есть', () => {
    assert.equal(
      resolveDownloadUrl('https://kppdf-crm.ru/a.exe', 'https://kppdf-crm.ru'),
      'https://kppdf-crm.ru/a.exe',
    );
  });

  it('относительный резолвится от apiBaseUrl', () => {
    assert.equal(
      resolveDownloadUrl('/downloads/a.zip', 'https://kppdf-crm.ru'),
      'https://kppdf-crm.ru/downloads/a.zip',
    );
  });

  it('невалидная база → возвращает путь как есть', () => {
    assert.equal(resolveDownloadUrl('/a.zip', 'not-a-base'), '/a.zip');
  });
});
