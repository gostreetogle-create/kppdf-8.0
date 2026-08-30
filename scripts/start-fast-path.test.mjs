import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseMongoInspect,
  shouldSkipMongoRecreate,
  computeReadyTiming,
  extractStopPids,
} from './start-fast-path-helpers.mjs';

describe('parseMongoInspect', () => {
  it('parses running healthy container', () => {
    assert.deepEqual(parseMongoInspect('true|healthy'), {
      running: true,
      healthStatus: 'healthy',
    });
  });

  it('returns null for missing container', () => {
    assert.equal(parseMongoInspect(''), null);
    assert.equal(parseMongoInspect(null), null);
  });

  it('marks missing health as none', () => {
    assert.deepEqual(parseMongoInspect('true|'), {
      running: true,
      healthStatus: 'none',
    });
  });
});

describe('shouldSkipMongoRecreate', () => {
  it('reuses healthy mongo with rs ready', () => {
    assert.equal(
      shouldSkipMongoRecreate({
        container: { running: true, healthStatus: 'healthy' },
        replicaSetOk: true,
      }),
      true,
    );
  });

  it('does not reuse when rs not ready', () => {
    assert.equal(
      shouldSkipMongoRecreate({
        container: { running: true, healthStatus: 'healthy' },
        replicaSetOk: false,
      }),
      false,
    );
  });

  it('does not reuse unhealthy container', () => {
    assert.equal(
      shouldSkipMongoRecreate({
        container: { running: true, healthStatus: 'starting' },
        replicaSetOk: true,
      }),
      false,
    );
  });
});

describe('computeReadyTiming', () => {
  it('uses wall-clock to last ready service, not fastest', () => {
    const t0 = 1_000_000;
    const timing = computeReadyTiming(
      {
        mongo: { status: 'ready', startedAt: t0, readyAt: t0 + 2_000 },
        backend: { status: 'ready', startedAt: t0 + 1_000, readyAt: t0 + 12_000 },
        frontend: { status: 'ready', startedAt: t0 + 1_000, readyAt: t0 + 6_000 },
      },
      t0,
      t0 + 12_000,
    );
    assert.equal(timing.wallClockSec, 12);
    assert.deepEqual(timing.perService, { mongo: 2, backend: 11, frontend: 5 });
    assert.equal(timing.allReady, true);
  });

  it('never reports faster-than-wall-clock total', () => {
    const t0 = 5_000_000;
    const timing = computeReadyTiming(
      {
        mongo: { status: 'ready', startedAt: t0, readyAt: t0 + 1_000 },
        backend: { status: 'ready', startedAt: t0, readyAt: t0 + 20_000 },
        frontend: { status: 'ready', startedAt: t0, readyAt: t0 + 3_000 },
      },
      t0,
      t0 + 20_000,
    );
    assert.ok(timing.wallClockSec >= timing.perService.frontend);
    assert.ok(timing.wallClockSec >= timing.perService.backend);
  });
});

describe('extractStopPids', () => {
  it('ignores startedAt and non-numeric keys', () => {
    assert.deepEqual(
      extractStopPids({ backend: 100, frontend: '200', startedAt: '2026-08-29T10:00:00Z' }),
      [
        { key: 'backend', pid: 100 },
        { key: 'frontend', pid: 200 },
      ],
    );
  });

  it('returns empty when pid file missing', () => {
    assert.deepEqual(extractStopPids(null), []);
  });
});
