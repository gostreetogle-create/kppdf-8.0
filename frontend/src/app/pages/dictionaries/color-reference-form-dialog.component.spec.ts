import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ColorReferenceFormDialogComponent } from './color-reference-form-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiColorReferencesService } from '../../shared/services/pi-color-references.service';
import { PiToastService } from '../../shared/ui/toast';
import type { ColorReference } from '../../shared/services/pi-color-references.service';

describe('ColorReferenceFormDialogComponent (TZ-DICT-318)', () => {
  let fixture: ComponentFixture<ColorReferenceFormDialogComponent>;
  let create: jest.Mock;
  let update: jest.Mock;
  let close: jest.Mock;

  async function setup(data: ColorReference | null): Promise<void> {
    create = jest.fn().mockReturnValue(of({ ok: true, data }));
    update = jest.fn().mockReturnValue(of({ ok: true, data }));
    close = jest.fn();
    await TestBed.configureTestingModule({
      imports: [ColorReferenceFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: { closed: signal(undefined), close } },
        { provide: PiColorReferencesService, useValue: { create, update } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    })
      .overrideComponent(ColorReferenceFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(ColorReferenceFormDialogComponent);
    fixture.detectChanges();
  }

  it('creates a prefixed RAL name from digits and an optional title', async () => {
    await setup(null);
    const component = fixture.componentInstance as unknown as {
      form: {
        controls: {
          ralCode: { setValue(value: string): void };
          title: { setValue(value: string): void };
        };
      };
      onSubmit: () => void;
    };
    component.form.controls.ralCode.setValue('9003');
    component.form.controls.title.setValue('Сигнальный белый');
    component.onSubmit();

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'RAL 9003 — Сигнальный белый' }),
    );
    expect(close).toHaveBeenCalled();
  });

  it('parses an existing RAL name into the digit code and title controls', async () => {
    await setup({
      _id: 'c1',
      name: 'RAL 9010 — Белый',
      slug: 'ral-9010-belyy',
      isActive: true,
      isSystem: false,
      isDefault: false,
    });
    const component = fixture.componentInstance as unknown as {
      isRalMode: () => boolean;
      form: { controls: { ralCode: { value: string }; title: { value: string } } };
    };

    expect(component.isRalMode()).toBe(true);
    expect(component.form.controls.ralCode.value).toBe('9010');
    expect(component.form.controls.title.value).toBe('Белый');
  });

  it('keeps non-RAL names in the legacy name control', async () => {
    await setup({
      _id: 'c2',
      name: 'Локальный оттенок',
      slug: 'local-shade',
      isActive: true,
      isSystem: false,
      isDefault: false,
    });
    const component = fixture.componentInstance as unknown as {
      isRalMode: () => boolean;
      form: { controls: { name: { value: string } } };
    };

    expect(component.isRalMode()).toBe(false);
    expect(component.form.controls.name.value).toBe('Локальный оттенок');
  });
});
