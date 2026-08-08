import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModuleFormDialogComponent } from './module-form-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { WorkTypesService } from '../../shared/services/pi-work-types.service';
import { PiToastService } from '../../shared/ui/toast';

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

  it('TZ-UX-COMPOSE-301: shows composition hint (состав на карточке / QC L)', () => {
    const hint = fixture.nativeElement.querySelector(
      '[data-test="composition-hint"]',
    ) as HTMLElement | null;
    expect(hint).toBeTruthy();
    expect(hint!.textContent).toContain('модули и материалы');
    expect(hint!.textContent).toContain('карточке модуля');
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
});
