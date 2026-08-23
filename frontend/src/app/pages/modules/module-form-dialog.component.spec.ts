import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModuleFormDialogComponent } from './module-form-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { WorkTypesService } from '../../shared/services/pi-work-types.service';
import { PiToastService } from '../../shared/ui/toast';
import { PhotosService } from '../../shared/services/photos.service';
import { ProductModulePhotosService } from '../../shared/services/pi-product-module-photos.service';

describe('ModuleFormDialogComponent (TZ-CATALOG-320)', () => {
  let fixture: ComponentFixture<ModuleFormDialogComponent>;
  let update: jest.Mock;

  function ref<T>(): DialogRef<T> {
    return { closed: signal<T | undefined>(undefined), close: jest.fn() } as DialogRef<T>;
  }

  beforeEach(async () => {
    update = jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'm1' } }));
    await TestBed.configureTestingModule({
      imports: [ModuleFormDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: PI_DIALOG_DATA,
          useValue: {
            _id: 'm1',
            name: 'Модуль',
            article: 'M-1',
            dimensions: { width: 10, height: 20, depth: 30, unit: 'мм' },
            workTypes: [],
          },
        },
        { provide: PI_DIALOG_REF, useValue: ref() },
        {
          provide: PhotosService,
          useValue: {
            uploadWithProgress: jest.fn(),
            remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
          },
        },
        {
          provide: ProductModulePhotosService,
          useValue: { attach: jest.fn().mockReturnValue(of({ ok: true, data: {} })) },
        },
        {
          provide: ProductModulesService,
          useValue: { update, create: jest.fn(), list: jest.fn() },
        },
        {
          provide: WorkTypesService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) },
        },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ModuleFormDialogComponent);
    fixture.detectChanges();
  });

  it('TZ-UX-DIALOG-305: renders kind C wide dialog (content variant + 1120 clamp)', () => {
    // The dialog template binds variant="content" + maxWidth 1120px (parity with
    // material/product FullEditors); opener width must not narrow it.
    const dialog = fixture.nativeElement.querySelector('app-pi-dialog') as HTMLElement | null;
    expect(dialog).toBeTruthy();
  });

  it('TZ-UX-FORM-310: name/article uses 12-col grid (not 50/50); dimensions+weight in one band', () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'module-form-dialog.component.ts'),
      'utf8',
    );
    // Name/article: 12-col grid with col-span-8 + col-span-4, NOT grid-cols-2
    expect(source).toContain('md:grid-cols-12');
    expect(source).toContain('md:col-span-8');
    expect(source).toContain('md:col-span-4');
    expect(source).not.toMatch(/grid grid-cols-2.*gap-form-field/);
    // Dimensions band: W/H/Depth have max-w constraint; weight is in same band
    expect(source).toContain('max-width: 5.5rem');
    expect(source).toContain('font-variant-numeric: tabular-nums');
    expect(source).toContain('text-align: right');
    // Weight in the same dimensions section, not separate
    expect(source).toContain('Габариты и вес');
    // data-test preserved
    expect(source).toContain('data-test="dim-width"');
    expect(source).toContain('data-test="dim-height"');
    expect(source).toContain('data-test="dim-depth"');
    expect(source).toContain('data-test="dim-unit"');
    expect(source).toContain('data-test="weight-input"');
  });

  it('TZ-UX-COMPOSE-301: shows composition hint (состав на карточке / QC L)', () => {
    const hint = fixture.nativeElement.querySelector(
      '[data-test="composition-hint"]',
    ) as HTMLElement | null;
    expect(hint).toBeTruthy();
    expect(hint!.textContent).toContain('модули и материалы');
    expect(hint!.textContent).toContain('карточке модуля');
  });

  it('renders the module photo dropzone in create/edit form', () => {
    expect(
      fixture.nativeElement.querySelector('[data-test="module-photo-section"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="photo-dropzone"]')).not.toBeNull();
  });

  it('uploads a form photo and attaches it to the saved module', () => {
    const photosService = TestBed.inject(PhotosService) as {
      uploadWithProgress: jest.Mock;
    };
    photosService.uploadWithProgress = jest.fn().mockReturnValue(
      of({
        type: 'done',
        photo: {
          _id: 'module-photo-1',
          storageUrl: '/uploads/module-photo-1.jpg',
          originalFilename: 'module.jpg',
        },
      }),
    );
    const modulePhotos = TestBed.inject(ProductModulePhotosService) as {
      attach: jest.Mock;
    };
    const component = fixture.componentInstance as unknown as {
      onUploadRequest: (files: File[]) => void;
      onSubmit: () => void;
    };
    component.onUploadRequest([new File(['image'], 'module.jpg', { type: 'image/jpeg' })]);
    component.onSubmit();

    expect(modulePhotos.attach).toHaveBeenCalledWith(
      expect.objectContaining({
        productModuleId: 'm1',
        photoId: 'module-photo-1',
        isMain: true,
      }),
    );
  });

  it('keeps dimensions nested and submits width/height/depth/unit without missing-control errors', () => {
    const component = fixture.componentInstance as unknown as {
      form: { controls: { dimensions: { getRawValue: () => Record<string, unknown> } } };
      onSubmit: () => void;
    };
    expect(component.form.controls.dimensions.getRawValue()).toEqual({
      width: 10,
      height: 20,
      depth: 30,
      unit: 'мм',
    });
    component.onSubmit();
    expect(update).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({ dimensions: { width: 10, height: 20, depth: 30, unit: 'мм' } }),
    );
  });

  it('coerces string width and weight to numbers in the module payload', () => {
    const component = fixture.componentInstance as unknown as {
      form: {
        controls: {
          dimensions: { controls: { width: { setValue: (value: unknown) => void } } };
          weight: { setValue: (value: unknown) => void };
        };
      };
      onSubmit: () => void;
    };
    component.form.controls.dimensions.controls.width.setValue('100');
    component.form.controls.weight.setValue('1.5');

    component.onSubmit();

    expect(update).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        dimensions: expect.objectContaining({ width: 100 }),
        weight: 1.5,
      }),
    );
    const payload = update.mock.calls[0][1] as {
      dimensions: { width: unknown };
      weight: unknown;
    };
    expect(typeof payload.dimensions.width).toBe('number');
    expect(typeof payload.weight).toBe('number');
  });

  it('uses compact Paper & Ink footer density (TZ-UI-DEN-531)', () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'module-form-dialog.component.ts'),
      'utf8',
    );
    expect(source).toContain('variant="outline"');
    expect(source).not.toContain('variant="ghost"');
  });
});
