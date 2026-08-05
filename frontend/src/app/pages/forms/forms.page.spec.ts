import { TestBed } from '@angular/core/testing';

import { FormsPage } from './forms.page';
import { PiToastService } from '../../shared/ui/toast';

describe('FormsPage (TZ-UI-TABLE-305)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsPage],
      providers: [{ provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } }],
    }).compileComponents();
  });

  it('renders the shared Flat table without a raw registry table', () => {
    const fixture = TestBed.createComponent(FormsPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-pi-table')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="forms-table"]')).toBeTruthy();
  });
});
