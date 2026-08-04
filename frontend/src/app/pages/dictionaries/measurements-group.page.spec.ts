import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MeasurementsGroupPage } from './measurements-group.page';

/**
 * TZ-DICT-308 smoke tests for MeasurementsGroupPage.
 *
 * Uses NO_ERRORS_SCHEMA to skip deep child rendering.
 * Provides ActivatedRoute mock for RouterLink dependency chain.
 */
describe('MeasurementsGroupPage (TZ-DICT-308)', () => {
  let fixture: ComponentFixture<MeasurementsGroupPage>;
  let component: MeasurementsGroupPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ReactiveFormsModule, FormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} }, params: of({}) } },
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
});
