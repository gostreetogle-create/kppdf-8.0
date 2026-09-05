import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiWarehousesService, type WarehouseWritePayload } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { WarehouseFormDialogComponent } from './warehouse-form-dialog.component';

describe('WarehouseFormDialogComponent (W1)', () => {
  let fixture: ComponentFixture<WarehouseFormDialogComponent>;
  let ref: { close: jest.Mock };
  let service: { create: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    ref = { close: jest.fn() };
    service = { create: jest.fn().mockReturnValue(of({ ok: true, data: undefined })), update: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [WarehouseFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: {} },
        { provide: PI_DIALOG_REF, useValue: ref as unknown as DialogRef<unknown> },
        { provide: PiWarehousesService, useValue: service },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(WarehouseFormDialogComponent);
    fixture.detectChanges();
  });

  it('emits a thin create payload with fixed main type and no zones UI', () => {
    const name = fixture.nativeElement.querySelector('[data-test="warehouse-form-name"]') as HTMLInputElement;
    name.value = 'Металл';
    name.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-test="warehouse-form-submit"]') as HTMLButtonElement).click();

    expect(ref.close).toHaveBeenCalledWith({
      name: 'Металл',
      type: 'main',
      zoneNames: [],
      description: undefined,
      isActive: true,
    } satisfies WarehouseWritePayload);
    expect(fixture.nativeElement.querySelector('[data-test="warehouse-form-type"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="warehouse-form-zones"]')).toBeNull();
  });
});
