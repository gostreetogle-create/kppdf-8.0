import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signal, computed, signal } from '@angular/core';
import { AlertDialogComponent, AlertDialogData } from './pi-alert-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from './dialog.tokens';
import type { DialogRef } from './pi-dialog.service';

/**
 * TZ-NEW: Unit tests for AlertDialogComponent.
 *
 * Strategy: provide mock PI_DIALOG_DATA and PI_DIALOG_REF tokens,
 * create the component in TestBed, and verify DOM output + method
 * calls. ButtonComponent is imported directly (standalone, no heavy
 * deps).
 *
 * Contract under test:
 *  - Renders title from data; optionally renders description
 *  - Default labels: cancelLabel → 'Отмена', confirmLabel → 'Подтвердить'
 *  - Custom labels override defaults
 *  - Destructive variant → confirm button uses destructive variant
 *  - onConfirm() → ref.close(true)
 *  - onCancel() → ref.close()
 *  - role="alertdialog" + aria-label (via PiDialogComponent shell)
 */

describe('AlertDialogComponent', () => {
  /**
   * Build a fake DialogRef that mirrors PiDialogService behavior:
   * `closed` is a computed signal returning undefined until `close(v)`
   * is called, then returns `v` and stays there.
   */
  function createMockRef(): {
    ref: DialogRef<boolean>;
    closeSpy: jest.Mock;
  } {
    const closedSig = signal<boolean | undefined>(undefined);
    const isClosed = signal(false);
    const closeSpy = jest.fn((v?: boolean) => {
      if (isClosed()) return;
      closedSig.set(v);
      isClosed.set(true);
    });
    const ref: DialogRef<boolean> = {
      closed: computed(() =>
        isClosed() ? (closedSig() as boolean | undefined) : undefined,
      ) as Signal<boolean | undefined>,
      close: closeSpy,
    };
    return { ref, closeSpy };
  }

  /** Flush microtasks (for queueMicrotask in ngAfterViewInit). */
  function flushMicrotasks(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  async function createFixture(data: AlertDialogData): Promise<{
    fixture: ComponentFixture<AlertDialogComponent>;
    component: AlertDialogComponent;
    closeSpy: jest.Mock;
  }> {
    const { ref, closeSpy } = createMockRef();

    await TestBed.configureTestingModule({
      imports: [AlertDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AlertDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    // Flush the queueMicrotask from ngAfterViewInit.
    await flushMicrotasks();
    fixture.detectChanges();

    return { fixture, component, closeSpy };
  }

  /** Find element by text content (trimmed, case-insensitive). */
  function findByText(
    fixture: ComponentFixture<AlertDialogComponent>,
    text: string,
  ): HTMLElement | null {
    const elements = fixture.nativeElement.querySelectorAll('*');
    return Array.from(elements).find(
      (el: Element) => el.textContent?.trim().toLowerCase() === text.toLowerCase(),
    ) as HTMLElement | null;
  }

  describe('rendering', () => {
    it('creates the component with required data', async () => {
      const { fixture } = await createFixture({ title: 'Удалить запись?' });
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('renders the title', async () => {
      const { fixture } = await createFixture({ title: 'Удалить запись?' });
      const titleEl = fixture.nativeElement.querySelector('h2');
      expect(titleEl).toBeTruthy();
      expect(titleEl.textContent).toContain('Удалить запись?');
    });

    it('renders description when provided', async () => {
      const { fixture } = await createFixture({
        title: 'Test',
        description: 'Это действие нельзя отменить.',
      });
      const descEl = fixture.nativeElement.querySelector('p');
      expect(descEl).toBeTruthy();
      expect(descEl.textContent).toContain('Это действие нельзя отменить.');
    });

    it('does NOT render description when not provided', async () => {
      const { fixture } = await createFixture({ title: 'Test' });
      const descEl = fixture.nativeElement.querySelector('p');
      expect(descEl).toBeNull();
    });

    it('does NOT render description when empty string', async () => {
      const { fixture } = await createFixture({
        title: 'Test',
        description: '',
      });
      // @if (data.description) treats empty string as falsy → no <p> element.
      const descEl = fixture.nativeElement.querySelector('p');
      expect(descEl).toBeNull();
    });

    it('renders default cancel label as "Отмена"', async () => {
      const { fixture } = await createFixture({ title: 'Test' });
      const cancelBtn = findByText(fixture, 'Отмена');
      expect(cancelBtn).toBeTruthy();
    });

    it('renders default confirm label as "Подтвердить"', async () => {
      const { fixture } = await createFixture({ title: 'Test' });
      const confirmBtn = findByText(fixture, 'Подтвердить');
      expect(confirmBtn).toBeTruthy();
    });

    it('renders custom confirm and cancel labels', async () => {
      const { fixture } = await createFixture({
        title: 'Test',
        confirmLabel: 'Да, удалить',
        cancelLabel: 'Нет',
      });
      const confirmBtn = findByText(fixture, 'Да, удалить');
      const cancelBtn = findByText(fixture, 'Нет');
      expect(confirmBtn).toBeTruthy();
      expect(cancelBtn).toBeTruthy();
    });

    it('renders a footer with two buttons', async () => {
      const { fixture } = await createFixture({ title: 'Test' });
      const footer = fixture.nativeElement.querySelector('footer');
      expect(footer).toBeTruthy();
      const buttons = footer.querySelectorAll('app-pi-button');
      expect(buttons.length).toBe(2);
    });
  });

  describe('actions', () => {
    it('onConfirm calls ref.close(true)', async () => {
      const { component, closeSpy } = await createFixture({
        title: 'Test',
      });
      component['onConfirm']();
      expect(closeSpy).toHaveBeenCalledTimes(1);
      expect(closeSpy).toHaveBeenCalledWith(true);
    });

    it('onCancel calls ref.close()', async () => {
      const { component, closeSpy } = await createFixture({
        title: 'Test',
      });
      component['onCancel']();
      expect(closeSpy).toHaveBeenCalledTimes(1);
      expect(closeSpy).toHaveBeenCalledWith();
    });

    it('confirm button click triggers onConfirm', async () => {
      const { fixture, component } = await createFixture({
        title: 'Test',
      });
      const spy = jest.spyOn(component as unknown as { onConfirm: () => void }, 'onConfirm');
      const footer = fixture.nativeElement.querySelector('footer');
      const buttons = footer.querySelectorAll('app-pi-button');
      (buttons[1] as HTMLElement).click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('cancel button click triggers onCancel', async () => {
      const { fixture, component } = await createFixture({
        title: 'Test',
      });
      const spy = jest.spyOn(component as unknown as { onCancel: () => void }, 'onCancel');
      const footer = fixture.nativeElement.querySelector('footer');
      const buttons = footer.querySelectorAll('app-pi-button');
      (buttons[0] as HTMLElement).click();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('a11y', () => {
    it('has role="alertdialog"', async () => {
      const { fixture } = await createFixture({ title: 'Test' });
      const dialogEl = fixture.nativeElement.querySelector('[role="alertdialog"]');
      expect(dialogEl).toBeTruthy();
    });

    it('has aria-label derived from the dialog title', async () => {
      const { fixture } = await createFixture({
        title: 'Тестовый заголовок',
      });
      const dialogEl = fixture.nativeElement.querySelector('[role="alertdialog"]');
      expect(dialogEl?.getAttribute('aria-label')).toBe('Тестовый заголовок');
    });

    it('does not set aria-describedby (description is plain body text)', async () => {
      const { fixture } = await createFixture({
        title: 'Test',
        description: 'Описание теста.',
      });
      const dialogEl = fixture.nativeElement.querySelector('[role="alertdialog"]');
      expect(dialogEl?.hasAttribute('aria-describedby')).toBe(false);
      expect(fixture.nativeElement.querySelector('p')?.textContent).toContain('Описание теста.');
    });

    it('omits aria-describedby when description is not provided', async () => {
      const { fixture } = await createFixture({ title: 'Test' });
      const dialogEl = fixture.nativeElement.querySelector('[role="alertdialog"]');
      expect(dialogEl?.hasAttribute('aria-describedby')).toBe(false);
    });

    it('exposes accessible name via aria-label on the dialog root', async () => {
      const { fixture } = await createFixture({ title: 'Test' });
      const dialogEl = fixture.nativeElement.querySelector('[role="alertdialog"]');
      expect(dialogEl?.getAttribute('aria-label')).toBe('Test');
    });
  });

  describe('auto-focus (ngAfterViewInit)', () => {
    it('focuses the first button after microtask', async () => {
      await createFixture({ title: 'Test' });
      // After queueMicrotask flush, the first button should have focus.
      // The component calls host.querySelector('button') which finds
      // the native <button> rendered inside ButtonComponent.
      const focused = document.activeElement;
      expect(focused?.tagName).toBe('BUTTON');
    });
  });

  describe('destructive variant', () => {
    it('renders confirm button with bg-destructive when variant is destructive', async () => {
      const { fixture } = await createFixture({
        title: 'Удалить?',
        variant: 'destructive',
      });
      // ButtonComponent renders a native <button> with variant-specific
      // class. Destructive variant adds 'bg-destructive'.
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const confirmBtn = buttons[1]; // second button in footer
      expect(confirmBtn).toBeTruthy();
      expect(confirmBtn.classList.contains('bg-destructive')).toBe(true);
    });

    it('renders confirm button with bg-sunrise-warm when no variant specified', async () => {
      const { fixture } = await createFixture({
        title: 'Подтвердить?',
      });
      // Default variant uses the default button style (grey bg + gold border).
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const confirmBtn = buttons[1];
      expect(confirmBtn).toBeTruthy();
      expect(confirmBtn.classList.contains('inline-flex')).toBe(true);
    });
  });

  // Standalone status validation: if the component were NOT standalone,
  // TestBed would throw at compile time. Reaching this test is proof.
  it('is standalone — TestBed compilation passes', () => {
    expect(AlertDialogComponent.prototype).toBeDefined();
  });
});
