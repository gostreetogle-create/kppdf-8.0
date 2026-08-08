import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
  CatalogReturnStore,
  canCatalogHistoryBack,
  catalogBackLabel,
  normalizeCatalogUrl,
} from './catalog-return.util';

describe('catalog-return.util (TZ-UX-313)', () => {
  describe('normalizeCatalogUrl', () => {
    it('strips query/hash and trailing slash', () => {
      expect(normalizeCatalogUrl('/products?x=1#y')).toBe('/products');
      expect(normalizeCatalogUrl('/modules/')).toBe('/modules');
      expect(normalizeCatalogUrl('/')).toBe('/');
    });
  });

  describe('canCatalogHistoryBack', () => {
    it('false when previous empty (bookmark)', () => {
      expect(canCatalogHistoryBack(null, '/modules/1')).toBe(false);
      expect(canCatalogHistoryBack('', '/modules/1')).toBe(false);
    });

    it('false when previous equals current', () => {
      expect(canCatalogHistoryBack('/modules/1', '/modules/1')).toBe(false);
      expect(canCatalogHistoryBack('/modules/1/', '/modules/1')).toBe(false);
    });

    it('true when previous differs', () => {
      expect(canCatalogHistoryBack('/products', '/modules/1')).toBe(true);
      expect(canCatalogHistoryBack('/products/abc', '/modules/1')).toBe(true);
    });
  });

  describe('catalogBackLabel', () => {
    it('uses ← Назад when referrer known', () => {
      expect(catalogBackLabel('/products', '/modules/1', '← К модулям')).toBe('← Назад');
    });

    it('falls back to list label without referrer', () => {
      expect(catalogBackLabel(null, '/modules/1', '← К модулям')).toBe('← К модулям');
    });
  });

  describe('CatalogReturnStore.navigateBackOr', () => {
    let events$: Subject<NavigationEnd>;
    let locationBack: jest.Mock;
    let navigateByUrl: jest.Mock;
    let store: CatalogReturnStore;

    beforeEach(() => {
      events$ = new Subject<NavigationEnd>();
      locationBack = jest.fn();
      navigateByUrl = jest.fn().mockResolvedValue(true);

      TestBed.configureTestingModule({
        providers: [
          CatalogReturnStore,
          { provide: Location, useValue: { back: locationBack } },
          {
            provide: Router,
            useValue: {
              url: '/modules/mod-1',
              events: events$.asObservable(),
              lastSuccessfulNavigation: null,
              serializeUrl: (t: { toString: () => string }) => t.toString(),
              navigateByUrl,
            },
          },
        ],
      });

      store = TestBed.inject(CatalogReturnStore);
    });

    it('calls Location.back when previousUrl set', () => {
      store.setPreviousUrlForTests('/products');
      store.navigateBackOr('/modules');
      expect(locationBack).toHaveBeenCalledTimes(1);
      expect(navigateByUrl).not.toHaveBeenCalled();
    });

    it('navigates to fallback when no previousUrl', () => {
      store.setPreviousUrlForTests(null);
      store.navigateBackOr('/modules');
      expect(locationBack).not.toHaveBeenCalled();
      expect(navigateByUrl).toHaveBeenCalledWith('/modules');
    });

    it('tracks previous across NavigationEnd', () => {
      events$.next(new NavigationEnd(1, '/modules/mod-1', '/modules/mod-1'));
      events$.next(new NavigationEnd(2, '/products/p1', '/products/p1'));
      expect(store.previousUrl).toBe('/modules/mod-1');
      expect(store.currentUrl).toBe('/products/p1');
    });
  });
});
