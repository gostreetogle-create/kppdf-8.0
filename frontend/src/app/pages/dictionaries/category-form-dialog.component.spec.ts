import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CategoryFormDialogComponent } from './category-form-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../core/api.tokens';

describe('CategoryFormDialogComponent', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';

  const fakeCategory: Category = {
    _id: 'c1',
    name: 'Металлы',
    slug: 'metals',
    type: 'material',
    skuPrefix: 'MET',
    sortOrder: 1,
    isActive: true,
    description: 'Металлические материалы',
  };

  const mockDialogRef: DialogRef<Category | null> = {
    closed: { signal: () => undefined } as never,
    close: jest.fn(),
  };

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: PI_DIALOG_DATA, useValue: null },
        { provide: PI_DIALOG_REF, useValue: mockDialogRef },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(CategoryFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    jest.clearAllMocks();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the form with default values in create mode', () => {
    const fixture = TestBed.createComponent(CategoryFormDialogComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      form: { getRawValue: () => { name: string; slug: string; type: string; skuPrefix: string } };
      isEdit: () => boolean;
    };

    expect(comp.isEdit()).toBe(false);
    expect(comp.form.getRawValue().name).toBe('');
    expect(comp.form.getRawValue().type).toBe('material');
  });

  it('should populate form with existing data in edit mode', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: PI_DIALOG_DATA, useValue: fakeCategory },
        { provide: PI_DIALOG_REF, useValue: mockDialogRef },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(CategoryFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(CategoryFormDialogComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      form: { getRawValue: () => { name: string; slug: string; type: string; skuPrefix: string } };
      isEdit: () => boolean;
    };

    expect(comp.isEdit()).toBe(true);
    expect(comp.form.getRawValue().name).toBe('Металлы');
    expect(comp.form.getRawValue().slug).toBe('metals');
    expect(comp.form.getRawValue().type).toBe('material');
    expect(comp.form.getRawValue().skuPrefix).toBe('MET');
  });

  it('should call service.create on submit in create mode', async () => {
    const fixture = TestBed.createComponent(CategoryFormDialogComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      form: { patchValue: (v: Record<string, unknown>) => void; markAllAsTouched: () => void };
      onSubmit: () => void;
    };

    // Fill form with valid data
    comp.form.patchValue({
      name: 'Новая категория',
      slug: 'new-category',
      type: 'material',
      skuPrefix: 'NEW',
    });

    comp.onSubmit();
    fixture.detectChanges();

    // Expect POST request
    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/categories` && r.method === 'POST');
    expect(req.request.body).toEqual({
      name: 'Новая категория',
      slug: 'new-category',
      type: 'material',
      skuPrefix: 'NEW',
    });

    req.flush({ ...fakeCategory, _id: 'c-new', name: 'Новая категория' });
    await tickMicrotask();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should show validation errors when form is invalid', () => {
    const fixture = TestBed.createComponent(CategoryFormDialogComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      form: { markAllAsTouched: () => void };
      hasError: (name: string) => boolean;
      errorFor: (name: string) => string;
    };

    // Mark all as touched to trigger validation
    comp.form.markAllAsTouched();
    fixture.detectChanges();

    // Name is required
    expect(comp.hasError('name')).toBe(true);
    expect(comp.errorFor('name')).toBe('Обязательное поле');

    // Slug is required
    expect(comp.hasError('slug')).toBe(true);
    expect(comp.errorFor('slug')).toBe('Обязательное поле');

    // SKU prefix is required
    expect(comp.hasError('skuPrefix')).toBe(true);
    expect(comp.errorFor('skuPrefix')).toBe('Обязательное поле');
  });

  it('should validate slug format (lowercase, a-z, 0-9, -)', () => {
    const fixture = TestBed.createComponent(CategoryFormDialogComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      form: { patchValue: (v: Record<string, unknown>) => void; markAllAsTouched: () => void };
      errorFor: (name: string) => string;
    };

    comp.form.patchValue({ slug: 'INVALID SLUG!' });
    comp.form.markAllAsTouched();
    fixture.detectChanges();

    expect(comp.errorFor('slug')).toBe('Только строчные латинские, цифры, дефис');
  });

  it('should validate skuPrefix format (uppercase A-Z, 0-9, -)', () => {
    const fixture = TestBed.createComponent(CategoryFormDialogComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      form: { patchValue: (v: Record<string, unknown>) => void; markAllAsTouched: () => void };
      errorFor: (name: string) => string;
    };

    comp.form.patchValue({ skuPrefix: 'invalid!' });
    comp.form.markAllAsTouched();
    fixture.detectChanges();

    expect(comp.errorFor('skuPrefix')).toBe('Только заглавные A-Z, 0-9, дефис');
  });
});
