import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MeasurementsGroupPage, UnitFormDialogComponent } from './measurements-group.page';
import { UnitsService, type Unit } from './units.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';

/**
 * TZ-DICT-308 smoke tests for MeasurementsGroupPage.
 *
 * Uses NO_ERRORS_SCHEMA to skip deep child rendering.
 * Provides ActivatedRoute mock for RouterLink dependency chain.
 */
describe('MeasurementsGroupPage (TZ-DICT-317)', () => {
  let fixture: ComponentFixture<MeasurementsGroupPage>;
  let component: MeasurementsGroupPage;
  let dialogOpen: jest.Mock;

  beforeEach(async () => {
    dialogOpen = jest.fn().mockReturnValue({
      closed: signal<unknown>(undefined),
      close: jest.fn(),
    });
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ReactiveFormsModule, FormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} }, params: of({}) } },
        { provide: PiDialogService, useValue: { open: dialogOpen } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MeasurementsGroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have chips with units', () => {
    expect(component.chips).toBeDefined();
    expect(component.chips.length).toBeGreaterThanOrEqual(1);
    const unitsChip = component.chips.find((c) => c.id === 'units');
    expect(unitsChip).toBeDefined();
    expect(unitsChip!.label).toBe('Единицы');
  });

  it('should render Единицы chip text', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Единицы');
  });

  it('opens the unit edit dialog with the selected unit', () => {
    const unit: Unit = {
      _id: 'u1',
      key: 'kg',
      label: 'Килограмм',
      symbol: 'кг',
      category: 'mass',
      isActive: true,
      isSystem: true,
      sortOrder: 1,
    };
    const page = component as unknown as { onEdit: (value: Unit) => void };
    page.onEdit(unit);

    expect(dialogOpen).toHaveBeenCalledWith(
      UnitFormDialogComponent,
      expect.objectContaining({ data: unit, width: 'md' }),
    );
  });

  it('does not open delete confirmation for a system unit', () => {
    const unit = {
      _id: 'u1',
      key: 'kg',
      label: 'Килограмм',
      isActive: true,
      isSystem: true,
      sortOrder: 1,
    } as Unit;
    const page = component as unknown as { onDelete: (value: Unit) => void };
    page.onDelete(unit);

    expect(dialogOpen).not.toHaveBeenCalled();
  });
});

describe('UnitFormDialogComponent (TZ-DICT-317)', () => {
  it('PATCHes label, symbol and category, then closes with the updated unit', async () => {
    const update = jest.fn().mockReturnValue(
      of({
        ok: true,
        data: {
          _id: 'u1',
          key: 'kg',
          label: 'Килограмм новый',
          symbol: 'кгн',
          category: 'mass',
          isActive: true,
          isSystem: true,
          sortOrder: 1,
        },
      }),
    );
    const close = jest.fn();
    await TestBed.configureTestingModule({
      imports: [UnitFormDialogComponent],
      providers: [
        {
          provide: PI_DIALOG_DATA,
          useValue: {
            _id: 'u1',
            key: 'kg',
            label: 'Килограмм',
            symbol: 'кг',
            category: 'mass',
            isActive: true,
            isSystem: true,
            sortOrder: 1,
          },
        },
        { provide: PI_DIALOG_REF, useValue: { closed: signal(undefined), close } },
        { provide: UnitsService, useValue: { update } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(UnitFormDialogComponent);
    fixture.detectChanges();
    const instance = fixture.componentInstance as unknown as {
      form: { controls: Record<string, { setValue(value: string): void }> };
      onSubmit: () => void;
    };
    instance.form.controls.label.setValue('Килограмм новый');
    instance.form.controls.symbol.setValue('кгн');
    instance.form.controls.category.setValue('mass');
    instance.onSubmit();

    expect(update).toHaveBeenCalledWith('kg', {
      label: 'Килограмм новый',
      symbol: 'кгн',
      category: 'mass',
    });
    expect(close).toHaveBeenCalledWith(expect.objectContaining({ label: 'Килограмм новый' }));
  });
});
