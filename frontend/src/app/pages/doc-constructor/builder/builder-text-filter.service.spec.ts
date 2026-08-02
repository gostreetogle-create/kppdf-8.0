import { TestBed } from '@angular/core/testing';
import { BuilderTextFilterService } from './builder-text-filter.service';

describe('BuilderTextFilterService (TZ-DOC-317)', () => {
  let svc: BuilderTextFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BuilderTextFilterService] });
    svc = TestBed.inject(BuilderTextFilterService);
  });

  it('starts with null categoryId («Все»)', () => {
    expect(svc.categoryId()).toBeNull();
  });

  it('set categoryId propagates to consumers', () => {
    svc.categoryId.set('cat-1');
    expect(svc.categoryId()).toBe('cat-1');
  });

  it('reset() clears back to null', () => {
    svc.categoryId.set('cat-1');
    svc.reset();
    expect(svc.categoryId()).toBeNull();
  });
});
