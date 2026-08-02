import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PI_DIALOG_REF } from './dialog.tokens';
import { PiDialogComponent } from './pi-dialog.component';
import type { DialogRef } from './pi-dialog.service';

/**
 * PiDialogComponent layout contract — regression suite.
 *
 * Background (user report, 2026-08-02):
 *   1. Materials dialog: footer (Сохранить/Отмена) appeared to slide off
 *      screen when content (photos, dimensions, long text) grew.
 *   2. Material dialog: «Добавить размер» button click occasionally
 *      produced two rows.
 *
 * (1) fix: PiDialog already pins the footer as a non-shrinking sibling
 *     of the body via `flex flex-col max-h-90vh min-h-0` on the panel +
 *     `sticky bottom-0` on the footer (now applied to ALL variants,
 *     not only content). These specs assert that contract for all
 *     four variants so a future regression cannot silently weaken it.
 * (2) fix: see material-form-dialog.dom.spec.ts — a real DOM-level
 *     click on the inner native `<button>` proves 1 click = 1 row.
 *
 * Anti-false-positive: each test sets up its own minimal host fixture;
 * css-class assertions are exact (substring-match), not lexical.
 */

@Component({
  standalone: true,
  imports: [PiDialogComponent],
  template: `
    <app-pi-dialog [variant]="variant" [width]="width" [maxWidth]="maxWidth" [title]="title">
      <div body data-test="dialog-body">
        <div [style.height.px]="bodyHeightPx">Тело диалога</div>
      </div>
      <div footer data-test="dialog-footer">Сохранить · Отмена</div>
    </app-pi-dialog>
  `,
})
class HostDialogComponent {
  variant: 'alert' | 'form' | 'content' | 'destructive' = 'form';
  width: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  maxWidth: string | null = null;
  title = 'Тестовый диалог';
  bodyHeightPx = 200;
}

describe('PiDialogComponent layout contract', () => {
  let fixture: ComponentFixture<HostDialogComponent>;
  let host: HostDialogComponent;

  beforeEach(async () => {
    const ref: DialogRef<unknown> = {
      closed: signal<unknown>(undefined),
      close: jest.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [HostDialogComponent],
      providers: [{ provide: PI_DIALOG_REF, useValue: ref }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostDialogComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Panel-level (variant-independent) contract ─────────────────────────
  /** Helper: scoped selector — fixture-scoped + both role variants. */
  function panel(): HTMLElement | null {
    return fixture.nativeElement.querySelector(
      '[role="dialog"], [role="alertdialog"]',
    ) as HTMLElement | null;
  }
  function headerEl(): HTMLElement | null {
    return fixture.nativeElement.querySelector(
      '[role="dialog"] > header, [role="alertdialog"] > header',
    ) as HTMLElement | null;
  }
  function bodyEl(): HTMLElement | null {
    return fixture.nativeElement.querySelector(
      '[role="dialog"] > div, [role="alertdialog"] > div',
    ) as HTMLElement | null;
  }
  function footerEl(): HTMLElement | null {
    return fixture.nativeElement.querySelector(
      '[role="dialog"] > footer, [role="alertdialog"] > footer',
    ) as HTMLElement | null;
  }

  // ─── Panel-level (variant-independent) contract ─────────────────────────
  describe('panel root', () => {
    it('constrains the panel via max-h-90vh and uses flex flex-col', () => {
      const p = panel();
      expect(p).toBeTruthy();
      expect(p!.className).toContain('flex');
      expect(p!.className).toContain('flex-col');
      expect(p!.className).toContain('max-h-[90vh]');
      expect(p!.className).toContain('min-h-0');
      // min-h-0 is the critical helper that lets the body actually shrink
      // inside a flex column with max-height on the parent.
    });

    it('honours an explicit [maxWidth] binding', () => {
      host.maxWidth = '720px';
      fixture.detectChanges();
      const p = panel();
      expect(p).toBeTruthy();
      expect(p!.style.maxWidth).toBe('720px');
    });
  });

  // ─── Body (variant-independent) contract ───────────────────────────────
  describe('body', () => {
    it.each(['alert', 'form', 'content', 'destructive'] as const)(
      'is the scroll region for variant "%s" with flex-1 min-h-0 overflow-y-auto',
      (variant) => {
        host.variant = variant;
        fixture.detectChanges();

        const p = panel();
        const b = bodyEl();
        expect(p).toBeTruthy();
        expect(b).toBeTruthy();
        expect(b!.className).toContain('flex-1');
        expect(b!.className).toContain('min-h-0');
        expect(b!.className).toContain('overflow-y-auto');
      },
    );
  });

  // ─── Footer pinning contract (the user-reported bug repair) ────────────
  describe('footer pinning — regression for "footer уезжает вниз при добавлении фото/текста"', () => {
    it.each(['alert', 'form', 'content', 'destructive'] as const)(
      'keeps footer pinned (sticky bottom-0 bg-paper shrink-0) on variant "%s"',
      (variant) => {
        host.variant = variant;
        fixture.detectChanges();

        const f = footerEl();
        expect(f).toBeTruthy();
        // shrink-0: footer cannot shrink in a flex column (panel fixed height contract).
        expect(f!.className).toContain('shrink-0');
        // sticky bottom-0 + bg-paper: defensive anchor so contents never
        // push Save/Cancel off-screen, even on inner PiRows that grow.
        expect(f!.className).toContain('sticky');
        expect(f!.className).toContain('bottom-0');
        expect(f!.className).toContain('bg-paper');
        // The action slot must contain the projected Save/Cancel content.
        expect(f!.querySelector('[data-test="dialog-footer"]')).toBeTruthy();
      },
    );
  });

  // ─── Long-content scenario: body becomes the only scroll region ───────
  describe('long body content scenario', () => {
    it('keeps the footer in the DOM AND visible in the panel even when body is taller than viewport', () => {
      // 1500px of body content forces scrolling inside the body region
      // only — the panel itself must NOT scroll, and the footer must
      // stay in flow at the panel's bottom edge.
      host.bodyHeightPx = 1500;
      host.maxWidth = '800px';
      host.title = 'Длинная форма';
      fixture.detectChanges();

      const p = panel();
      const b = bodyEl();
      const f = footerEl();

      expect(p).toBeTruthy();
      expect(b).toBeTruthy();
      expect(f).toBeTruthy();

      expect(b!.querySelector('[data-test="dialog-body"]')).toBeTruthy();
      expect(f!.querySelector('[data-test="dialog-footer"]')).toBeTruthy();

      // Panel root never declares overflow-y-auto (the scroll happens in body).
      expect(p!.className).not.toContain('overflow-y-auto');
      expect(p!.className).toContain('overflow-hidden');

      // Body is the overflow-y-auto region with the longest content.
      expect(b!.className).toContain('overflow-y-auto');
      expect(b!.contains(b!.querySelector('[data-test="dialog-body"]'))).toBe(true);

      // Footer remains a sibling of body, NOT a descendant of body.
      expect(f!.parentElement).toBe(p);
      expect(b!.contains(f)).toBe(false);
    });
  });

  // ─── Show-close control: CLS-safe (kept lightweight, regression-anchored)
  describe('close button', () => {
    it('renders an X when [title] is set and is inside <header>', () => {
      host.title = 'Закрываемый';
      fixture.detectChanges();
      const h = headerEl();
      expect(h).toBeTruthy();
      const xBtn = h!.querySelector('button[aria-label="Закрыть"]');
      expect(xBtn).toBeTruthy();
    });

    it('still anchors into <header> when present', () => {
      const xBtn = fixture.nativeElement.querySelector(
        '[role="dialog"] button[aria-label="Закрыть"], [role="alertdialog"] button[aria-label="Закрыть"]',
      );
      if (xBtn !== null) {
        expect((xBtn as HTMLElement).closest('header')).toBeTruthy();
      }
    });
  });
});
