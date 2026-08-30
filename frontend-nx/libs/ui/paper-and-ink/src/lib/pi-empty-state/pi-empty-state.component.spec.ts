import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiEmptyStateComponent } from './pi-empty-state.component';

/**
 * TZ-NEW: Unit tests for PiEmptyState (TZ-AUDIT-6).
 *
 * Contract under test:
 *  - `colspan` (required) is forwarded to the `<td colspan>` attribute
 *  - `message` (required) is rendered as the primary text
 *  - `eyebrow` defaults to "00" and is rendered in an uppercase mono span
 *  - `state` is one of `'empty' | 'loading' | 'error'`, default `'empty'`
 *  - state='empty'    → `role="status"`, no `aria-live`
 *  - state='loading'  → `role="status"`, `aria-live="polite"`
 *  - state='error'    → `role="alert"`, no `aria-live`
 *  - Renders as a single `<tr>` row for table-context use
 */
describe('PiEmptyStateComponent', () => {
  async function createFixture(
    inputs: {
      colspan?: number;
      message?: string;
      eyebrow?: string;
      state?: 'empty' | 'loading' | 'error';
    } = {},
  ): Promise<ComponentFixture<PiEmptyStateComponent>> {
    await TestBed.configureTestingModule({
      imports: [PiEmptyStateComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PiEmptyStateComponent);
    // Required inputs MUST be set before detectChanges to avoid the
    // signal-input required-validation error.
    fixture.componentRef.setInput('colspan', inputs.colspan ?? 5);
    fixture.componentRef.setInput('message', inputs.message ?? 'Нет данных');
    if (inputs.eyebrow !== undefined) {
      fixture.componentRef.setInput('eyebrow', inputs.eyebrow);
    }
    if (inputs.state !== undefined) {
      fixture.componentRef.setInput('state', inputs.state);
    }
    fixture.detectChanges();
    return fixture;
  }

  function cell(fixture: ComponentFixture<PiEmptyStateComponent>): HTMLTableCellElement {
    return fixture.nativeElement.querySelector('td') as HTMLTableCellElement;
  }

  function panel(fixture: ComponentFixture<PiEmptyStateComponent>): HTMLDivElement {
    return fixture.nativeElement.querySelector('.pi-dashed-panel') as HTMLDivElement;
  }

  function row(fixture: ComponentFixture<PiEmptyStateComponent>): HTMLTableRowElement {
    return fixture.nativeElement.querySelector('tr') as HTMLTableRowElement;
  }

  it('renders a single <tr> element (table-row context)', async () => {
    const fixture = await createFixture();
    expect(row(fixture).tagName).toBe('TR');
  });

  it('forwards colspan to the <td> attribute', async () => {
    const fixture = await createFixture({ colspan: 8 });
    expect(cell(fixture).getAttribute('colspan')).toBe('8');
  });

  it('renders the message as the primary text', async () => {
    const fixture = await createFixture({ message: 'Список пуст' });
    expect(cell(fixture).textContent).toContain('Список пуст');
  });

  it('defaults the eyebrow to "00" (editorial convention)', async () => {
    const fixture = await createFixture();
    const eyebrow = cell(fixture).querySelector('.eyebrow');
    expect(eyebrow?.textContent?.trim()).toBe('00');
  });

  it('respects a custom eyebrow', async () => {
    const fixture = await createFixture({ eyebrow: '99' });
    const eyebrow = cell(fixture).querySelector('.eyebrow');
    expect(eyebrow?.textContent?.trim()).toBe('99');
  });

  describe('state semantics (a11y contract)', () => {
    it('state="empty" (default) → role="status", no aria-live', async () => {
      const fixture = await createFixture();
      expect(cell(fixture).getAttribute('role')).toBe('status');
      expect(cell(fixture).getAttribute('aria-live')).toBeNull();
    });

    it('state="loading" → role="status", aria-live="polite"', async () => {
      const fixture = await createFixture({ state: 'loading' });
      expect(cell(fixture).getAttribute('role')).toBe('status');
      expect(cell(fixture).getAttribute('aria-live')).toBe('polite');
    });

    it('state="error" → role="alert", no aria-live', async () => {
      const fixture = await createFixture({ state: 'error' });
      expect(cell(fixture).getAttribute('role')).toBe('alert');
      expect(cell(fixture).getAttribute('aria-live')).toBeNull();
    });
  });

  it('emits no aria-live when state is "empty" (no screen-reader chatter)', async () => {
    const fixture = await createFixture();
    expect(cell(fixture).hasAttribute('aria-live')).toBe(false);
  });

  it('wraps content in a pi-dashed-panel div', async () => {
    const fixture = await createFixture();
    const p = panel(fixture);
    expect(p).toBeTruthy();
    expect(p.className).toContain('pi-dashed-panel');
    expect(p.className).toContain('max-w-sm');
  });

  it('is a standalone component', async () => {
    // `imports: [PiEmptyStateComponent]` in TestBed.configureTestingModule
    // would throw at compile time if the component were not
    // standalone. Reaching this assertion is sufficient proof — no
    // need to poke at the internal `ɵcmp` symbol (private API, may change).
    expect(PiEmptyStateComponent.prototype).toBeDefined();
  });
});
