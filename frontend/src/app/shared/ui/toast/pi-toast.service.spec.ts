import { TestBed } from '@angular/core/testing';
import { PiToastService } from './pi-toast.service';

/**
 * TZ-NEW: Unit tests for PiToastService.
 *
 * Strategy: service is `providedIn: 'root'`, so TestBed.inject()
 * gives us a fresh instance per test. We use jest fake timers
 * to control the auto-dismiss setTimeout.
 *
 * Contract under test:
 *  - show(message) enqueues a toast with default variant='default', duration=4000
 *  - success/error/warning set the variant but otherwise behave like show
 *  - show() returns a unique id (string starting with 'toast-')
 *  - dismiss(id) removes one toast by id
 *  - dismiss() (no arg) clears the entire queue
 *  - subscribe(cb) returns an unsubscribe fn; cb receives a copy of the queue
 *  - subscribe fires on every enqueue + dismiss
 *  - auto-dismiss via setTimeout(duration) — verified with fake timers
 *  - duration=0 means "no auto-dismiss" (toast stays until explicit dismiss)
 */
describe('PiToastService', () => {
  let service: PiToastService;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PiToastService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function snapshot(): ReturnType<PiToastService['subscribe']> extends () => void
    ? never
    : unknown[] {
    let captured: unknown[] = [];
    service.subscribe((q) => (captured = [...q]));
    return captured;
  }

  it('starts with an empty queue', () => {
    expect(snapshot()).toEqual([]);
  });

  describe('show()', () => {
    it('enqueues a toast with the given message', () => {
      service.show('Hello');
      const queue = snapshot() as Array<{ message: string }>;
      expect(queue).toHaveLength(1);
      expect(queue[0].message).toBe('Hello');
    });

    it('returns a string id starting with "toast-"', () => {
      const id = service.show('Hi');
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^toast-/);
    });

    it('default variant is "default"', () => {
      service.show('Hi');
      const queue = snapshot() as Array<{ variant: string }>;
      expect(queue[0].variant).toBe('default');
    });

    it('default duration is 4000ms', () => {
      service.show('Hi');
      const queue = snapshot() as Array<{ duration: number }>;
      expect(queue[0].duration).toBe(4000);
    });

    it('multiple shows enqueue in order (FIFO)', () => {
      service.show('A');
      service.show('B');
      service.show('C');
      const queue = snapshot() as Array<{ message: string }>;
      expect(queue.map((t) => t.message)).toEqual(['A', 'B', 'C']);
    });
  });

  describe('variant shortcuts', () => {
    it('success() sets variant="success"', () => {
      service.success('Done');
      const queue = snapshot() as Array<{ variant: string }>;
      expect(queue[0].variant).toBe('success');
    });

    it('error() sets variant="error"', () => {
      service.error('Oops');
      const queue = snapshot() as Array<{ variant: string }>;
      expect(queue[0].variant).toBe('error');
    });

    it('warning() sets variant="warning"', () => {
      service.warning('Heads up');
      const queue = snapshot() as Array<{ variant: string }>;
      expect(queue[0].variant).toBe('warning');
    });
  });

  describe('dismiss()', () => {
    it('dismiss(id) removes one toast by id', () => {
      const id1 = service.show('A');
      const id2 = service.show('B');
      service.dismiss(id1);
      const queue = snapshot() as Array<{ id: string }>;
      expect(queue.map((t) => t.id)).toEqual([id2]);
    });

    it('dismiss() with no arg clears the entire queue', () => {
      service.show('A');
      service.show('B');
      service.show('C');
      service.dismiss();
      expect(snapshot()).toEqual([]);
    });

    it('dismiss(unknownId) is a no-op (queue unchanged)', () => {
      service.show('A');
      service.dismiss('toast-doesnotexist');
      const queue = snapshot() as unknown[];
      expect(queue).toHaveLength(1);
    });
  });

  describe('auto-dismiss via setTimeout', () => {
    it('toast auto-dismisses after duration ms', () => {
      service.show('Hi', { duration: 1000 });
      expect(snapshot()).toHaveLength(1);
      jest.advanceTimersByTime(1000);
      expect(snapshot()).toEqual([]);
    });

    it('multiple toasts each dismiss independently at their own duration', () => {
      service.show('A', { duration: 1000 });
      service.show('B', { duration: 3000 });
      jest.advanceTimersByTime(1000);
      const q1 = snapshot() as Array<{ message: string }>;
      expect(q1.map((t) => t.message)).toEqual(['B']);

      jest.advanceTimersByTime(2000);
      expect(snapshot()).toEqual([]);
    });

    it('duration=0 means no auto-dismiss (toast stays until explicit dismiss)', () => {
      service.show('Sticky', { duration: 0 });
      jest.advanceTimersByTime(60_000);
      expect(snapshot()).toHaveLength(1);
    });
  });

  describe('subscribe()', () => {
    it('returns an unsubscribe function', () => {
      const unsub = service.subscribe(() => {});
      expect(typeof unsub).toBe('function');
      unsub();
    });

    it('fires callback immediately with current queue copy', () => {
      service.show('Existing');
      const cb = jest.fn();
      service.subscribe(cb);
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb.mock.calls[0][0]).toHaveLength(1);
    });

    it('fires callback on every enqueue', () => {
      const cb = jest.fn();
      service.subscribe(cb);
      service.show('A');
      service.show('B');
      expect(cb).toHaveBeenCalledTimes(3); // initial + 2 enqueues
    });

    it('stops firing after unsubscribe', () => {
      const cb = jest.fn();
      const unsub = service.subscribe(cb);
      const callsAtUnsub = cb.mock.calls.length;
      unsub();
      service.show('After unsub');
      expect(cb.mock.calls.length).toBe(callsAtUnsub);
    });

    it('passes a copy of the queue (not the live array)', () => {
      let captured: unknown[] = [];
      service.subscribe((q) => (captured = q));
      service.show('A');
      // Mutating captured must not affect the service's queue.
      (captured as unknown[]).push('rogue');
      expect(snapshot()).toHaveLength(1);
    });
  });
});
