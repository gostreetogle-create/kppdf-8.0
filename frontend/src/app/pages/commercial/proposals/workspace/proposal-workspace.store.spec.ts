import { TestBed } from '@angular/core/testing';
import { signal, type WritableSignal } from '@angular/core';

import type { DocumentTemplate } from '../../../../shared/services/pi-document-templates.service';
import { ProposalWorkspaceStore } from './proposal-workspace.store';
import { ProposalWorkspaceDraftService } from './proposal-workspace-draft.service';

function templateWith(orientation: DocumentTemplate['orientation']): DocumentTemplate {
  return {
    _id: 'tpl-1',
    name: 'Шаблон',
    tags: [],
    organizationId: 'org-1',
    docTypeId: 'dt-1',
    isDefault: false,
    isActive: true,
    pageSize: 'A4',
    backgroundImage: [],
    defaultBackgroundIndex: 0,
    backgroundOpacity: 1,
    orientation,
    version: 1,
  } satisfies DocumentTemplate;
}

describe('ProposalWorkspaceStore', () => {
  let store: ProposalWorkspaceStore;
  let selectedTemplate: WritableSignal<DocumentTemplate | null>;

  beforeEach(() => {
    selectedTemplate = signal<DocumentTemplate | null>(null);
    TestBed.configureTestingModule({
      providers: [
        ProposalWorkspaceStore,
        {
          provide: ProposalWorkspaceDraftService,
          useValue: { selectedTemplate },
        },
      ],
    });
    store = TestBed.inject(ProposalWorkspaceStore);
  });

  it('starts closed with no active section and portrait orientation', () => {
    expect(store.activeLeft()).toBeNull();
    expect(store.activeRight()).toBeNull();
    expect(store.panelOpen()).toBe(false);
    expect(store.orientation()).toBe('portrait');
    expect(store.activeSection()).toBeNull();
    expect(store.panelTitle()).toBe('');
  });

  it('openSection on a left section activates it, opens panel, clears right', () => {
    store.openSection('catalog');
    expect(store.activeLeft()).toBe('catalog');
    expect(store.activeRight()).toBeNull();
    expect(store.panelOpen()).toBe(true);
    expect(store.activeSection()).toBe('catalog');
    expect(store.panelTitle()).toBe('Каталог');
    expect(store.panelSide()).toBe('left');
  });

  it('openSection on a right section activates it, opens panel, clears left', () => {
    store.openSection('table');
    expect(store.activeRight()).toBe('table');
    expect(store.activeLeft()).toBeNull();
    expect(store.panelOpen()).toBe(true);
    expect(store.panelTitle()).toBe('Редактор таблицы');
    expect(store.panelSide()).toBe('right');
  });

  it('switching sections keeps panel open and moves active', () => {
    store.openSection('catalog');
    store.openSection('template');
    expect(store.activeLeft()).toBe('template');
    expect(store.activeRight()).toBeNull();
    expect(store.panelOpen()).toBe(true);
  });

  it('left↔right switch clears the other side', () => {
    store.openSection('catalog');
    store.openSection('params');
    expect(store.activeLeft()).toBeNull();
    expect(store.activeRight()).toBe('params');
    expect(store.panelOpen()).toBe(true);
  });

  it('toggleSection on the same open section closes the panel', () => {
    store.openSection('terms');
    expect(store.panelOpen()).toBe(true);
    store.toggleSection('terms');
    expect(store.panelOpen()).toBe(false);
    expect(store.activeSection()).toBe('terms'); // active kept for re-open
  });

  it('toggleSection on a closed same section opens it', () => {
    store.toggleSection('recipient');
    expect(store.panelOpen()).toBe(true);
    expect(store.activeLeft()).toBe('recipient');
  });

  it('toggleSection switches to a different section', () => {
    store.openSection('catalog');
    store.toggleSection('money');
    expect(store.activeRight()).toBe('money');
    expect(store.activeLeft()).toBeNull();
    expect(store.panelOpen()).toBe(true);
  });

  it('supports the IA-511 right rail order without an output section', () => {
    const sections = ['params', 'money', 'deadlines', 'table', 'terms'] as const;
    for (const section of sections) {
      store.openSection(section);
      expect(store.activeRight()).toBe(section);
      expect(store.panelTitle()).not.toBe('');
    }
    expect(store.activeRight()).toBe('terms');
  });

  it('closePanel hides the panel but keeps the active section', () => {
    store.openSection('template');
    store.closePanel();
    expect(store.panelOpen()).toBe(false);
    expect(store.activeLeft()).toBe('template');
  });

  it('orientation mirrors the template: portrait when no template or portrait template', () => {
    expect(store.orientation()).toBe('portrait');
    selectedTemplate.set(templateWith('portrait'));
    expect(store.orientation()).toBe('portrait');
  });

  it('orientation follows a landscape template with no user write on KP (TZ-KP-443)', () => {
    selectedTemplate.set(templateWith('landscape'));
    expect(store.orientation()).toBe('landscape');

    // No user-facing write-path for orientation on the workspace anymore.
    expect((store as unknown as { setOrientation?: unknown }).setOrientation).toBeUndefined();
  });

  it('quotationId stores the draft id', () => {
    store.quotationId.set('q-123');
    expect(store.quotationId()).toBe('q-123');
  });

  it('panelTitle is empty while no section is active', () => {
    store.closePanel();
    expect(store.panelTitle()).toBe('');
  });
});
