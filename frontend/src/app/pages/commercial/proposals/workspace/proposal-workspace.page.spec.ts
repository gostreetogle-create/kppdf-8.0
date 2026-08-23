import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import {
  ContactRound,
  FileText,
  Package,
  Printer,
  ScrollText,
  SlidersHorizontal,
  TableProperties,
} from 'lucide-angular';

import { AuthService } from '../../../../core/auth.service';
import { PiChromeToolsService } from '../../../../shared/chrome/pi-chrome-tools.service';
import { ProposalWorkspacePage } from './proposal-workspace.page';
import { ProposalWorkspaceStore } from './proposal-workspace.store';

describe('ProposalWorkspacePage', () => {
  let fixture: ComponentFixture<ProposalWorkspacePage>;
  let chromeTools: PiChromeToolsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalWorkspacePage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: signal({ pages: ['proposals'] }) },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    chromeTools = TestBed.inject(PiChromeToolsService);
    fixture = TestBed.createComponent(ProposalWorkspacePage);
    fixture.detectChanges();
  });

  afterEach(() => {
    chromeTools.clear('proposal-workspace');
  });

  it('registers left rail: Каталог · Шаблон · Клиент with unique Lucide icons and RU labels', () => {
    const left = chromeTools.leftTools();
    expect(left.map((t) => t.id)).toEqual(['catalog', 'template', 'recipient']);
    expect(left.map((t) => t.title)).toEqual(['Каталог', 'Шаблон', 'Клиент']);
    expect(left.map((t) => t.icon)).toEqual([Package, FileText, ContactRound]);
  });

  it('registers right rail: Параметры · Редактор таблицы · Условия · Вывод', () => {
    const right = chromeTools.rightTools();
    expect(right.map((t) => t.id)).toEqual(['params', 'table', 'terms', 'output']);
    expect(right.map((t) => t.title)).toEqual([
      'Параметры',
      'Редактор таблицы',
      'Условия',
      'Вывод',
    ]);
    expect(right.map((t) => t.icon)).toEqual([
      SlidersHorizontal,
      TableProperties,
      ScrollText,
      Printer,
    ]);
  });

  it('uses 7 distinct icons — no duplicate Template vs Terms (dedup IA)', () => {
    const icons = [...chromeTools.leftTools(), ...chromeTools.rightTools()].map((t) => t.icon);
    expect(new Set(icons).size).toBe(7);
  });

  it('clicking a chrome tool opens the panel with the section active', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    expect(store.panelOpen()).toBe(false);

    const catalog = chromeTools.leftTools().find((t) => t.id === 'catalog')!;
    catalog.onClick();
    fixture.detectChanges();

    expect(store.panelOpen()).toBe(true);
    expect(store.activeSection()).toBe('catalog');
    expect(fixture.nativeElement.querySelector('.kp-ws-panel__head')?.textContent).toContain(
      'Каталог',
    );
  });

  it('repeat click on the same section collapses the panel', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    const terms = chromeTools.rightTools().find((t) => t.id === 'terms')!;
    terms.onClick();
    expect(store.panelOpen()).toBe(true);
    terms.onClick();
    expect(store.panelOpen()).toBe(false);
  });

  it('clicking the A4 sheet closes the panel', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('params');
    fixture.detectChanges();
    expect(store.panelOpen()).toBe(true);

    const sheet = fixture.nativeElement.querySelector('[data-test="kp-a4-sheet"]') as HTMLElement;
    sheet.click();
    fixture.detectChanges();
    expect(store.panelOpen()).toBe(false);
  });

  it('Escape key closes the panel', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('table');
    expect(store.panelOpen()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(store.panelOpen()).toBe(false);
  });

  it('does not register demo-only sections (composition / client split per IA)', () => {
    const ids = [...chromeTools.leftTools(), ...chromeTools.rightTools()].map((t) => t.id);
    expect(ids).not.toContain('composition');
    expect(ids).not.toContain('client');
  });
});
