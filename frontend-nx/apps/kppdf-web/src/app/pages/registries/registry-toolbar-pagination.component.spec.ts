import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistryToolbarPaginationComponent } from './registry-toolbar-pagination.component';

describe('RegistryToolbarPaginationComponent (TZ-NX-REGISTRIES-TOOLBAR-FINALIZE)', () => {
  let fixture: ComponentFixture<RegistryToolbarPaginationComponent>;

  function setup(inputs: { total: number; pageSize: number; currentPage: number }): void {
    fixture = TestBed.createComponent(RegistryToolbarPaginationComponent);
    fixture.componentRef.setInput('total', inputs.total);
    fixture.componentRef.setInput('pageSize', inputs.pageSize);
    fixture.componentRef.setInput('currentPage', inputs.currentPage);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegistryToolbarPaginationComponent],
    });
  });

  it('shows pagination when total <= pageSize (single page)', () => {
    setup({ total: 5, pageSize: 25, currentPage: 1 });

    const el = fixture.nativeElement;
    expect(el.querySelector('[data-test="registry-toolbar-pagination"]')).toBeTruthy();
    expect(el.querySelector('[data-test="pager-info"]').textContent).toContain('1–5 из 5');
    expect((el.querySelector('[data-test="pager-prev"]') as HTMLButtonElement).disabled).toBe(true);
    expect((el.querySelector('[data-test="pager-next"]') as HTMLButtonElement).disabled).toBe(true);
  });

  it('hides pagination when total is zero', () => {
    setup({ total: 0, pageSize: 25, currentPage: 1 });
    expect(fixture.nativeElement.querySelector('[data-test="registry-toolbar-pagination"]')).toBeNull();
  });

  it('exposes navigation role and aria-label for a11y', () => {
    setup({ total: 12, pageSize: 25, currentPage: 1 });
    const nav = fixture.nativeElement.querySelector('[data-test="registry-toolbar-pagination"]');
    expect(nav.getAttribute('role')).toBe('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Пагинация');
  });

  it('emits pageChange when next is clicked on multi-page set', () => {
    setup({ total: 50, pageSize: 25, currentPage: 1 });
    const emit = jest.fn();
    fixture.componentInstance.pageChange.subscribe(emit);

    (fixture.nativeElement.querySelector('[data-test="pager-next"]') as HTMLButtonElement).click();
    expect(emit).toHaveBeenCalledWith(2);
  });
});
