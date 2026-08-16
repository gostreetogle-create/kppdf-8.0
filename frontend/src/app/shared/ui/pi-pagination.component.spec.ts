import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pi-pagination.component';
import { PI_DEFAULT_PAGE_SIZE } from './pi-pagination.constants';

describe('PaginationComponent (TZ-UX-340)', () => {
  @Component({
    standalone: true,
    imports: [PaginationComponent],
    template: `
      <app-pi-pagination
        [total]="total"
        [pageSize]="pageSize"
        [currentPage]="page"
        [showPageSize]="showPageSize"
        (pageChange)="onPage($event)"
        (pageSizeChange)="onSize($event)"
      />
    `,
  })
  class Host {
    total = 61;
    pageSize = PI_DEFAULT_PAGE_SIZE;
    page = 1;
    showPageSize = true;
    pages: number[] = [];
    sizes: number[] = [];
    onPage(p: number): void {
      this.pages.push(p);
    }
    onSize(s: number): void {
      this.sizes.push(s);
    }
  }

  let fixture: ComponentFixture<Host>;
  let host: Host;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders range + prev/next + page numbers + page-size select', () => {
    const info = fixture.nativeElement.querySelector('[data-test="pager-info"]') as HTMLElement;
    const prev = fixture.nativeElement.querySelector('[data-test="pager-prev"]');
    const next = fixture.nativeElement.querySelector('[data-test="pager-next"]');
    const current = fixture.nativeElement.querySelector('[data-test="pager-page"]') as HTMLElement;
    const size = fixture.nativeElement.querySelector(
      '[data-test="pager-page-size"]',
    ) as HTMLSelectElement;

    expect(info.textContent?.trim()).toBe('1–10 из 61');
    expect(prev).toBeTruthy();
    expect(next).toBeTruthy();
    expect(current.textContent?.trim()).toBe('1');
    expect(size).toBeTruthy();
    expect(Array.from(size.options).map((o) => o.value)).toEqual(['10', '25', '50']);
  });

  it('hides nav when total ≤ pageSize', () => {
    host.total = 5;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="pi-pagination"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="pager-info"]')).toBeNull();
  });

  it('default pageSize is PI_DEFAULT_PAGE_SIZE (10)', () => {
    expect(PI_DEFAULT_PAGE_SIZE).toBe(10);
    expect(host.pageSize).toBe(10);
  });

  it('next emits pageChange', () => {
    const next = fixture.nativeElement.querySelector(
      '[data-test="pager-next"]',
    ) as HTMLButtonElement;
    next.click();
    expect(host.pages).toEqual([2]);
  });

  it('prev on page 1 does not emit', () => {
    const prev = fixture.nativeElement.querySelector(
      '[data-test="pager-prev"]',
    ) as HTMLButtonElement;
    prev.click();
    expect(host.pages).toEqual([]);
  });

  it('page-size select emits pageSizeChange (parent resets to page 1)', () => {
    const size = fixture.nativeElement.querySelector(
      '[data-test="pager-page-size"]',
    ) as HTMLSelectElement;
    size.value = '25';
    size.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.sizes).toEqual([25]);
  });

  it('showPageSize=false hides size select', () => {
    host.showPageSize = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="pager-page-size"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="pager-info"]')).toBeTruthy();
  });

  it('range updates for middle page', () => {
    host.page = 3;
    fixture.detectChanges();
    const info = fixture.nativeElement.querySelector('[data-test="pager-info"]') as HTMLElement;
    expect(info.textContent?.trim()).toBe('21–30 из 61');
  });
});
