import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { StockMovementFormDialogComponent } from './stock-movement-form-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { MaterialFormDialogComponent } from '../materials/material-form-dialog.component';
import { API_BASE_URL } from '../../core/api.tokens';
import type { Material } from '../../shared/services/materials.service';

type Harness = StockMovementFormDialogComponent & {
  openCreateMaterial(): void;
  form: { controls: { materialId: { value: string; setValue(v: string): void } } };
  materials(): { _id: string; name: string; unit?: string }[];
  qtyLabel(): string;
};

describe('StockMovementFormDialogComponent (TZ-QA-445B)', () => {
  let fixture: ComponentFixture<StockMovementFormDialogComponent>;
  let dialogOpen: jest.Mock;

  beforeEach(async () => {
    dialogOpen = jest.fn().mockReturnValue({
      closed: signal<Material | null | undefined>(undefined),
    });

    await TestBed.configureTestingModule({
      imports: [StockMovementFormDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PI_DIALOG_DATA, useValue: { mode: 'in' } },
        {
          provide: PI_DIALOG_REF,
          useValue: { close: jest.fn(), closed: signal(undefined) },
        },
        { provide: PiDialogService, useValue: { open: dialogOpen } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockMovementFormDialogComponent);
    fixture.detectChanges();
  });

  it('renders material select with + affordance (pi-select-add-row)', () => {
    const el = fixture.nativeElement as HTMLElement;
    const row = el.querySelector('app-pi-select-add-row') as HTMLElement;
    const select = el.querySelector('[data-test="mv-material"]');
    const add = el.querySelector('[data-test="mv-material-add"]') as HTMLButtonElement;
    expect(row).toBeTruthy();
    expect(select).toBeTruthy();
    expect(add).toBeTruthy();
    expect(add.textContent?.trim()).toBe('+');
    expect(add.classList.contains('pi-select-add-btn')).toBe(true);
  });

  it('openCreateMaterial opens MaterialFormDialog (shared catalog write-path)', () => {
    const comp = fixture.componentInstance as unknown as Harness;
    comp.openCreateMaterial();
    expect(dialogOpen).toHaveBeenCalledWith(
      MaterialFormDialogComponent,
      expect.objectContaining({ data: null, width: 'lg' }),
    );
  });

  it('qty label includes unit after material selection (autofill from card)', () => {
    const comp = fixture.componentInstance as unknown as Harness;
    // Inject option via createdMaterials path used after inline create
    (comp as unknown as { createdMaterials: { set(v: unknown): void } }).createdMaterials.set([
      { _id: 'm1', name: 'Лист', unit: 'м²' },
    ]);
    comp.form.controls.materialId.setValue('m1');
    fixture.detectChanges();
    expect(comp.qtyLabel()).toBe('Количество (м²)');
  });
});
