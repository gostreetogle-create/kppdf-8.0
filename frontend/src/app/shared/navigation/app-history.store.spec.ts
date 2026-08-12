import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AppHistoryStore } from './app-history.store';

describe('AppHistoryStore (TZ-UX-317 site-wide history)', () => {
  let events: Subject<NavigationStart | NavigationEnd>;
  let locationBack: jest.Mock;
  let locationForward: jest.Mock;

  const navStart = (
    url: string,
    trigger: 'imperative' | 'popstate' = 'imperative',
  ): NavigationStart => new NavigationStart(1, url, trigger);
  const navEnd = (url: string): NavigationEnd => new NavigationEnd(1, url, url);

  function createStore(url: string): AppHistoryStore {
    events = new Subject<NavigationStart | NavigationEnd>();
    locationBack = jest.fn();
    locationForward = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            url,
            events: events.asObservable(),
            lastSuccessfulNavigation: undefined,
            serializeUrl: (tree: unknown) => String(tree),
          },
        },
        { provide: Location, useValue: { back: locationBack, forward: locationForward } },
      ],
    });
    return TestBed.inject(AppHistoryStore);
  }

  function navigate(
    store: AppHistoryStore,
    url: string,
    trigger: 'imperative' | 'popstate' = 'imperative',
  ): void {
    events.next(navStart(url, trigger));
    events.next(navEnd(url));
    // Пробросить микротаски? Нет — события синхронные, сигналы обновились.
    void store;
  }

  it('starts with a single-entry stack on a fresh landing — both buttons disabled', () => {
    const store = createStore('/doc-constructor/templates');
    expect(store.canGoBack()).toBe(false);
    expect(store.canGoForward()).toBe(false);
    store.back();
    store.forward();
    expect(locationBack).not.toHaveBeenCalled();
    expect(locationForward).not.toHaveBeenCalled();
  });

  it('imperative navigations push the stack; back becomes enabled', () => {
    const store = createStore('/proposals/create');
    navigate(store, '/doc-constructor/builder/tpl-1');

    expect(store.canGoBack()).toBe(true);
    expect(store.canGoForward()).toBe(false);

    store.back();
    expect(locationBack).toHaveBeenCalledTimes(1);
  });

  it('popstate (browser ←) moves back within the stack and enables →', () => {
    const store = createStore('/proposals/create');
    navigate(store, '/doc-constructor/builder/tpl-1');
    expect(store.canGoBack()).toBe(true);

    // Браузер вернул нас на Create (наш back() → Location.back() → popstate).
    navigate(store, '/proposals/create', 'popstate');
    expect(store.canGoBack()).toBe(false);
    expect(store.canGoForward()).toBe(true);

    store.forward();
    expect(locationForward).toHaveBeenCalledTimes(1);
  });

  it('new navigation after back truncates forward entries', () => {
    const store = createStore('/a');
    navigate(store, '/b');
    navigate(store, '/c');
    navigate(store, '/b', 'popstate');
    expect(store.canGoForward()).toBe(true);

    navigate(store, '/d');
    expect(store.canGoForward()).toBe(false);
  });

  it('replaceUrl-style same normalized URL does not grow the stack', () => {
    const store = createStore('/doc-constructor/builder/tpl-1');
    navigate(store, '/doc-constructor/builder/tpl-1?categoryId=cat-7');
    expect(store.canGoBack()).toBe(false);
    expect(store.canGoForward()).toBe(false);
  });

  it('forward() is a no-op when nothing is ahead', () => {
    const store = createStore('/a');
    store.forward();
    expect(locationForward).not.toHaveBeenCalled();
  });
});
