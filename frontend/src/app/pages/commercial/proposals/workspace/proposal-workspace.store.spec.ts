import { ProposalWorkspaceStore } from './proposal-workspace.store';

describe('ProposalWorkspaceStore', () => {
  let store: ProposalWorkspaceStore;

  beforeEach(() => {
    store = new ProposalWorkspaceStore();
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
    store.toggleSection('output');
    expect(store.activeRight()).toBe('output');
    expect(store.activeLeft()).toBeNull();
    expect(store.panelOpen()).toBe(true);
  });

  it('closePanel hides the panel but keeps the active section', () => {
    store.openSection('template');
    store.closePanel();
    expect(store.panelOpen()).toBe(false);
    expect(store.activeLeft()).toBe('template');
  });

  it('setOrientation updates orientation and quotationId stores the draft id', () => {
    store.setOrientation('landscape');
    expect(store.orientation()).toBe('landscape');
    store.quotationId.set('q-123');
    expect(store.quotationId()).toBe('q-123');
  });

  it('panelTitle is empty while no section is active', () => {
    store.closePanel();
    expect(store.panelTitle()).toBe('');
  });
});
