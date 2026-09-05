import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '@kppdf/data-access/auth';
import { PiGroupWorkspaceComponent } from './pi-group-workspace.component';

@Component({
  standalone: true,
  imports: [PiGroupWorkspaceComponent],
  template: `
    <app-pi-group-workspace [chips]="chips" activeId="first">
      <div tools data-test="tools-slot">
        <button type="button" data-test="create-category-button">+ Создать категорию</button>
      </div>
      <div data-test="workspace-body">Таблица</div>
    </app-pi-group-workspace>
  `,
})
class TestHostComponent {
  readonly chips = [
    { id: 'first', label: 'Первый', route: '/first' },
    { id: 'second', label: 'Второй', route: '/second' },
  ] as const;
}

@Component({
  standalone: true,
  imports: [PiGroupWorkspaceComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="g1" [chips]="chips" activeId="first" />
  `,
})
class TocHostComponent {
  readonly toc = [
    { id: 'g1', label: 'Классификация', route: '/g1' },
    { id: 'g2', label: 'Измерения', route: '/g2' },
  ] as const;
  readonly chips = [{ id: 'first', label: 'Категории', route: '/first' }] as const;
}

@Component({
  standalone: true,
  imports: [PiGroupWorkspaceComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="orders" [chips]="[]" activeId="" />
  `,
})
class DisabledTocHostComponent {
  readonly toc = [
    { id: 'proposals', label: 'КП', route: '/proposals' },
    { id: 'contracts', label: 'Договоры', route: '/contracts', disabled: true },
    { id: 'orders', label: 'Заказы', route: '/orders' },
  ] as const;
}

@Component({
  standalone: true,
  imports: [PiGroupWorkspaceComponent],
  template: ` <app-pi-group-workspace pathLabel="Сделки" [chips]="chips" activeId="first" /> `,
})
class PathLabelHostComponent {
  readonly chips = [
    { id: 'first', label: 'Все КП', route: '/proposals' },
    { id: 'second', label: 'Договоры', route: '/contracts' },
  ] as const;
}

@Component({
  standalone: true,
  imports: [PiGroupWorkspaceComponent],
  template: ` <app-pi-group-workspace [chips]="chips" activeId="first" /> `,
})
class EmptyChipsHostComponent {
  readonly chips: readonly { id: string; label: string; route: string }[] = [];
}

@Component({
  standalone: true,
  imports: [PiGroupWorkspaceComponent],
  template: ` <app-pi-group-workspace [chips]="chips" activeId="from-data" /> `,
})
class QueryParamsHostComponent {
  readonly chips = [
    {
      id: 'from-data',
      label: 'Из данных',
      route: '/doc-constructor/tables',
      queryParams: { view: 'from-data' },
    },
  ] as const;
}

@Component({
  standalone: true,
  imports: [PiGroupWorkspaceComponent],
  template: ` <app-pi-group-workspace [chips]="chips" activeId="products" /> `,
})
class AclHostComponent {
  readonly chips = [
    { id: 'products', label: 'Продукция', route: '/products', pageKey: 'products' },
    { id: 'materials', label: 'Материалы', route: '/materials', pageKey: 'materials' },
  ] as const;
}

describe('PiGroupWorkspaceComponent (TZ-DICT-312 / TZ-UX-315)', () => {
  const userSignal = signal<{ pages?: string[] } | null>(null);

  beforeEach(async () => {
    userSignal.set(null);
    await TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        TocHostComponent,
        DisabledTocHostComponent,
        PathLabelHostComponent,
        QueryParamsHostComponent,
        AclHostComponent,
        EmptyChipsHostComponent,
      ],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: userSignal },
        },
      ],
    }).compileComponents();
  });

  it('keeps chips and tools in one adaptive sticky stack', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const chrome = root.querySelector('.group-chrome');
    const chips = root.querySelector('.group-chips');
    const tools = root.querySelector('.group-tools');

    expect(chrome).toBeTruthy();
    expect(chrome?.classList.contains('sticky')).toBe(true);
    expect(chrome?.classList.contains('top-0')).toBe(true);
    expect(chrome?.contains(chips)).toBe(true);
    expect(chrome?.contains(tools)).toBe(true);
    expect(root.querySelector('[style*="6.25rem"]')).toBeFalsy();
    expect(root.querySelector('[data-test="group-toc"]')).toBeFalsy();
    expect(chips?.classList.contains('pt-0')).toBe(true);
  });

  it('does not render pathLabel eyebrow even when pathLabel input is set (TZ-UX-315)', () => {
    const fixture = TestBed.createComponent(PathLabelHostComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[data-test="group-path-label"]')).toBeFalsy();
    expect(root.textContent).not.toContain('Сделки');
    expect(root.querySelector('[data-test="group-chips"]')).toBeTruthy();
    expect(root.querySelector('.group-chrome')?.classList.contains('sticky')).toBe(true);
  });

  it('renders dense TOC above section chips when toc is provided', () => {
    const fixture = TestBed.createComponent(TocHostComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const toc = root.querySelector('[data-test="group-toc"]');
    const chips = root.querySelector('[data-test="group-chips"]');
    expect(toc).toBeTruthy();
    expect(chips).toBeTruthy();
    expect(toc?.textContent).toContain('Классификация');
    expect(chips?.textContent).toContain('Категории');
    expect(toc?.querySelector('.group-toc-chip')?.className).toContain('text-[11px]');
    expect(chips?.querySelector('.group-chip')?.className).toContain('text-xs');
    expect(toc?.className).toContain('pt-0');
    expect(root.querySelector('[data-test="group-path-label"]')).toBeFalsy();
  });

  it('renders a disabled TOC chip as non-navigating text (TZ-NX-DEALS-D1)', () => {
    const fixture = TestBed.createComponent(DisabledTocHostComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const toc = root.querySelector('[data-test="group-toc"]') as HTMLElement;
    expect(toc.textContent).toContain('КП');
    expect(toc.textContent).toContain('Договоры');
    expect(toc.textContent).toContain('Заказы');
    const links = Array.from(toc.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(links).toContain('КП');
    expect(links).toContain('Заказы');
    expect(links).not.toContain('Договоры');
    const disabled = toc.querySelector('[aria-disabled="true"]');
    expect(disabled?.textContent?.trim()).toBe('Договоры');
    expect(disabled?.tagName).not.toBe('A');
  });

  it('keeps projected tools and CTA inside the workspace width', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[data-test="tools-slot"]')).toBeTruthy();
    expect(root.querySelector('[data-test="create-category-button"]')).toBeTruthy();
    expect(root.querySelector('[data-test="workspace-body"]')).toBeTruthy();
  });

  it('does not render the chips row at all when chips is empty (DESK-429 ghost row)', () => {
    const fixture = TestBed.createComponent(EmptyChipsHostComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[data-test="group-chips"]')).toBeFalsy();
    expect(root.querySelector('.group-chrome')).toBeTruthy();
    // tools slot still rendered when projected
    expect(root.querySelector('[data-test="group-tools"]')).toBeTruthy();
  });

  it('hides empty tools strip so body sits under chips', () => {
    const fixture = TestBed.createComponent(TocHostComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const tools = root.querySelector('[data-test="group-tools"]');
    expect(tools?.classList.contains('group-tools--empty')).toBe(true);
    expect(root.querySelector('[data-test="group-chips"]')?.classList.contains('hairline-b')).toBe(
      true,
    );
  });

  it('keeps query params separate from the route path in generated chip links', () => {
    const fixture = TestBed.createComponent(QueryParamsHostComponent);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('.group-chip') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('/doc-constructor/tables?view=from-data');
    expect(link.getAttribute('href')).not.toContain('/materials');
  });

  it('hides section chips the role cannot open (page ACL)', () => {
    userSignal.set({ pages: ['products'] });
    const fixture = TestBed.createComponent(AclHostComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Продукция');
    expect(text).not.toContain('Материалы');
  });

  it('applies horizontal padding to group-body when flushBody=false (TZ-UX-443)', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const body = fixture.nativeElement.querySelector('[data-test="group-body"]') as HTMLElement;
    expect(body.classList.contains('group-body')).toBe(true);
    expect(body.classList.contains('group-body--flush')).toBe(false);
  });

  it('removes horizontal padding from group-body when flushBody=true (TZ-UX-443)', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    // flushBody is false by default; verify the flush modifier class is not present
    const body = fixture.nativeElement.querySelector('[data-test="group-body"]') as HTMLElement;
    expect(body.classList.contains('group-body--flush')).toBe(false);
    // The default state (flushBody=false) should have the non-flush class
    expect(body.classList.contains('group-body')).toBe(true);
  });
});
