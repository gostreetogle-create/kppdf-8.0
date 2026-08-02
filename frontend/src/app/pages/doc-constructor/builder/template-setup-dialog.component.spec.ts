/**
 * TZ-DOC-268 — regression tests for TemplateSetupDialogComponent.
 *
 * Locks the dialog lifecycle contract:
 *   - «Создать» closes the dialog EXACTLY ONCE with the selected page
 *     size / orientation (default A4/portrait, or the user's chips).
 *   - A double-click on «Создать» (second `onConfirm` call before the CDK
 *     overlay teardown) is a NO-OP — `submitted` guard means the first
 *     confirm wins and `ref.close` fires exactly once (no second dialog
 *     result, no second template POST in the caller).
 *   - Cancel closes WITHOUT a value (the caller's `onDialogCloseOnce`
 *     filters falsy → no POST, no navigation).
 *   - Smoke test instantiates the dialog through TestBed → template
 *     compilation is forced → guards against NG5xxx regressions (the bug
 *     class TZ-261 fixed, which tsc does not catch).
 *
 * TZ-DOC-308 — category-flow contract (added on top):
 *   - the active default category is auto-selected on load;
 *   - the user can choose ANOTHER active category — the confirm result
 *     carries the selected categoryId (never a free-text field);
 *   - loading (list pending) blocks confirm until the default is known;
 *   - a failed category load surfaces an error and blocks silent submit;
 *   - zero active categories shows an empty hint and blocks submit;
 *   - the category select is keyboard-focusable (a11y basic scenario).
 *
 * IMPORTANT (fixture timing): the component constructor calls
 * `categoriesSvc.list()` synchronously, so the list() mock MUST be
 * configured BEFORE `TestBed.createComponent(...)`. The shared
 * `createFixture()` helper enforces that ordering — each test sets its
 * list() return value first, then creates the fixture.
 *
 * TestBed strategy mirrors the project's dialog spec convention
 * (reset-password / user-form / role-form dialogs): overrideComponent with
 * empty imports + NO_ERRORS_SCHEMA, dialog ref/data injected via the
 * PI_DIALOG_REF / PI_DIALOG_DATA tokens.
 */
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import {
  TemplateSetupDialogComponent,
  type TemplateSetupResult,
} from './template-setup-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { DocumentTemplateCategoriesService } from '../../../shared/services/pi-document-template-categories.service';

describe('TemplateSetupDialogComponent (TZ-DOC-268 + TZ-DOC-308)', () => {
  let fixture: ComponentFixture<TemplateSetupDialogComponent>;
  let close: jest.Mock;
  let ref: DialogRef<TemplateSetupResult>;
  let listMock: jest.Mock;

  const CATS = [
    {
      _id: 'cat-1',
      name: 'Общие',
      slug: 'common',
      isActive: true,
      isSystem: false,
      isDefault: true,
      sortOrder: 0,
    },
    {
      _id: 'cat-2',
      name: 'Коммерческие предложения',
      slug: 'commercial-proposals',
      isActive: true,
      isSystem: false,
      isDefault: false,
      sortOrder: 10,
    },
  ];

  beforeEach(async () => {
    close = jest.fn();
    ref = {
      closed: signal<TemplateSetupResult | undefined>(undefined),
      close: (v?: TemplateSetupResult) => close(v),
    } as DialogRef<TemplateSetupResult>;
    // Default: no active categories. Tests override BEFORE createFixture().
    listMock = jest.fn().mockReturnValue(of({ ok: true, data: [] }));

    await TestBed.configureTestingModule({
      imports: [TemplateSetupDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: PI_DIALOG_REF, useValue: ref },
        {
          provide: DocumentTemplateCategoriesService,
          useValue: { list: listMock },
        },
      ],
    })
      .overrideComponent(TemplateSetupDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  /**
   * Create the component AFTER the list() mock is configured. The
   * constructor consumes list() synchronously, so ordering matters.
   */
  function createFixture(): ComponentFixture<TemplateSetupDialogComponent> {
    fixture = TestBed.createComponent(TemplateSetupDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  /** Access the protected handlers the same way sibling dialog specs do. */
  function handlers(): {
    onConfirm: () => void;
    onCancel: () => void;
    pageSize: () => 'A3' | 'A4' | 'A5';
    orientation: () => 'portrait' | 'landscape';
    categoryId: () => string;
  } {
    return fixture.componentInstance as unknown as {
      onConfirm: () => void;
      onCancel: () => void;
      pageSize: () => 'A3' | 'A4' | 'A5';
      orientation: () => 'portrait' | 'landscape';
      categoryId: () => string;
    };
  }

  // ═══ TZ-DOC-268 lifecycle ═══

  it('smoke: instantiates and compiles the template', () => {
    createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('«Создать» closes the dialog exactly once with the default A4/portrait result', () => {
    listMock.mockReturnValue(of({ ok: true, data: [CATS[0]] }));
    createFixture();

    handlers().onConfirm();
    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith({
      pageSize: 'A4',
      orientation: 'portrait',
      categoryId: 'cat-1',
    });
  });

  it('double-click on «Создать» (second onConfirm) is a no-op — close fires exactly once', () => {
    listMock.mockReturnValue(of({ ok: true, data: [CATS[0]] }));
    createFixture();

    handlers().onConfirm();
    handlers().onConfirm();
    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith({
      pageSize: 'A4',
      orientation: 'portrait',
      categoryId: 'cat-1',
    });
  });

  it('a second confirm after cancel is also a no-op (first decision wins)', () => {
    listMock.mockReturnValue(of({ ok: true, data: [CATS[0]] }));
    createFixture();

    handlers().onCancel();
    handlers().onConfirm();
    expect(close).toHaveBeenCalledTimes(1);
    // ref.close() is invoked without a value → the mock receives explicit undefined.
    expect(close).toHaveBeenCalledWith(undefined);
  });

  it('cancel closes WITHOUT a value — the caller must not POST', () => {
    listMock.mockReturnValue(of({ ok: true, data: [CATS[0]] }));
    createFixture();

    handlers().onCancel();
    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith(undefined);
  });

  it('user-selected chips are reflected in the confirm result', () => {
    listMock.mockReturnValue(of({ ok: true, data: [CATS[0]] }));
    createFixture();

    // Click the A5 and landscape chips (native buttons inside the form).
    const chips = Array.from(fixture.nativeElement.querySelectorAll<HTMLButtonElement>('.chip'));
    const a5 = chips.find((c) => c.textContent?.trim() === 'A5');
    const landscape = chips.find((c) => c.textContent?.trim() === 'Альбомная');
    expect(a5).toBeTruthy();
    expect(landscape).toBeTruthy();
    a5!.click();
    landscape!.click();
    fixture.detectChanges();

    handlers().onConfirm();
    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith({
      pageSize: 'A5',
      orientation: 'landscape',
      categoryId: 'cat-1',
    });
  });

  // ═══ TZ-DOC-308 category contract ═══

  it('auto-selects the ACTIVE DEFAULT category on load', () => {
    listMock.mockReturnValue(of({ ok: true, data: CATS }));
    createFixture();

    expect(handlers().categoryId()).toBe('cat-1');
  });

  it('lets the user choose ANOTHER active category — confirm carries that categoryId', () => {
    listMock.mockReturnValue(of({ ok: true, data: CATS }));
    createFixture();

    const select = fixture.nativeElement.querySelector<HTMLSelectElement>('#template-category');
    expect(select).toBeTruthy();
    select!.value = 'cat-2';
    select!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    handlers().onConfirm();
    expect(close).toHaveBeenCalledWith({
      pageSize: 'A4',
      orientation: 'portrait',
      categoryId: 'cat-2',
    });
  });

  it('blocks submit while categories are still loading (no silent default)', () => {
    // Never-emitting Observable → the dialog stays in the loading branch.
    listMock.mockReturnValue(new Observable(() => {}));
    createFixture();

    handlers().onConfirm();
    expect(close).not.toHaveBeenCalled();
  });

  it('shows an error and blocks submit when the category load fails (no silent submit)', () => {
    listMock.mockReturnValue(of({ ok: false, error: new Error('boom') }));
    createFixture();

    expect(handlers().categoryId()).toBe('');
    handlers().onConfirm();
    expect(close).not.toHaveBeenCalled();
  });

  it('shows an empty hint and blocks submit when there are no active categories', () => {
    // Default mock: no categories.
    createFixture();

    expect(handlers().categoryId()).toBe('');
    handlers().onConfirm();
    expect(close).not.toHaveBeenCalled();
  });

  it('category select is keyboard-focusable (basic a11y scenario)', () => {
    listMock.mockReturnValue(of({ ok: true, data: CATS }));
    createFixture();

    const select = fixture.nativeElement.querySelector<HTMLSelectElement>('#template-category');
    expect(select).toBeTruthy();
    expect(select!.getAttribute('aria-label')).toBe('Категория шаблона');
    select!.focus();
    expect(document.activeElement).toBe(select);
  });
});
