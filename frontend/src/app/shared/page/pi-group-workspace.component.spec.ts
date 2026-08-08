import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../core/auth.service';
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
  template: ` <app-pi-group-workspace [chips]="chips" activeId="products" /> `,
})
class AclHostComponent {
  readonly chips = [
    { id: 'products', label: 'Продукция', route: '/products', pageKey: 'products' },
    { id: 'materials', label: 'Материалы', route: '/materials', pageKey: 'materials' },
  ] as const;
}

describe('PiGroupWorkspaceComponent (TZ-DICT-312)', () => {
  const userSignal = signal<{ pages?: string[] } | null>(null);

  beforeEach(async () => {
    userSignal.set(null);
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TocHostComponent, AclHostComponent],
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
  });

  it('keeps projected tools and CTA inside the workspace width', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[data-test="tools-slot"]')).toBeTruthy();
    expect(root.querySelector('[data-test="create-category-button"]')).toBeTruthy();
    expect(root.querySelector('[data-test="workspace-body"]')).toBeTruthy();
  });

  it('hides section chips the role cannot open (page ACL)', () => {
    userSignal.set({ pages: ['products'] });
    const fixture = TestBed.createComponent(AclHostComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Продукция');
    expect(text).not.toContain('Материалы');
  });
});
