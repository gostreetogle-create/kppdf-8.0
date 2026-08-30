import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NavHistoryService } from './nav-history.service';

describe('NavHistoryService', () => {
  let events$: Subject<unknown>;
  let locationBack: jest.Mock;
  let locationForward: jest.Mock;
  let service: NavHistoryService;

  function start(trigger: 'imperative' | 'popstate'): void {
    events$.next(new NavigationStart(1, '/x', trigger));
  }
  function end(url: string): void {
    events$.next(new NavigationEnd(1, url, url));
  }

  beforeEach(() => {
    events$ = new Subject();
    locationBack = jest.fn();
    locationForward = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { events: events$.asObservable(), url: '/admin/devices' } },
        { provide: Location, useValue: { back: locationBack, forward: locationForward } },
      ],
    });
    service = TestBed.inject(NavHistoryService);
  });

  it('starts with a single-entry stack: no back, no forward', () => {
    expect(service.canGoBack()).toBe(false);
    expect(service.canGoForward()).toBe(false);
  });

  it('an imperative navigation grows the stack and enables back', () => {
    start('imperative');
    end('/admin/roles');

    expect(service.canGoBack()).toBe(true);
    expect(service.canGoForward()).toBe(false);
  });

  it('back()/forward() delegate to Location, never to router.navigate', () => {
    start('imperative');
    end('/admin/roles');

    service.back();
    expect(locationBack).toHaveBeenCalledTimes(1);
    expect(locationForward).not.toHaveBeenCalled();
  });

  it('does nothing when canGoBack/canGoForward is false', () => {
    service.back();
    service.forward();
    expect(locationBack).not.toHaveBeenCalled();
    expect(locationForward).not.toHaveBeenCalled();
  });

  it('a popstate navigation moves the index within the existing stack (enables forward)', () => {
    start('imperative');
    end('/admin/roles');
    start('imperative');
    end('/kit/overview');
    expect(service.canGoBack()).toBe(true);
    expect(service.canGoForward()).toBe(false);

    start('popstate');
    end('/admin/roles');

    expect(service.canGoBack()).toBe(true);
    expect(service.canGoForward()).toBe(true);
  });

  it('a same-url imperative tick (replaceUrl) does not grow the stack', () => {
    start('imperative');
    end('/admin/devices');
    expect(service.canGoBack()).toBe(false);
  });
});
