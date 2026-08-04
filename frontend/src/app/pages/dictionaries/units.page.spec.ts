import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { UnitsPage } from './units.page';
import { UnitsService } from './units.service';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../core/api.tokens';

describe('UnitsPage (TZ-DICT-304)', () => {
  let http: HttpTestingController;
  const service = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: UnitsService, useValue: service },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
      ],
    })
      .overrideComponent(UnitsPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  function createComp() {
    const fixture = TestBed.createComponent(UnitsPage);
    fixture.detectChanges();
    const req = http.expectOne((r) => r.url.includes('/units'));
    req.flush({ items: [], total: 0 });
    fixture.detectChanges();
    return fixture;
  }

  it('renders PiDictionaryShell chrome with sticky search + category filter + add CTA', () => {
    const fixture = createComp();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-pi-dictionary-shell')).toBeTruthy();
    expect(el.querySelector('[data-test="search-input"]')).toBeTruthy();
    expect(el.querySelector('[data-test="category-filter"]')).toBeTruthy();
    expect(el.querySelector('[data-test="add-button"]')).toBeTruthy();
    expect(el.querySelector('app-pi-page-header')).toBeFalsy();
    expect(el.querySelector('app-pi-section')).toBeFalsy();
  });

  it('posts a new unit via UnitsService.create when the inline form is valid', () => {
    service.create.mockReturnValue(of({ ok: true, data: {} }));
    const fixture = createComp();
    const c = fixture.componentInstance as unknown as {
      form: { setValue: (v: unknown) => void };
      onAdd: () => void;
    };
    c.form.setValue({ key: 'кг', label: 'Килограмм', symbol: 'кг', category: 'mass' });
    c.onAdd();
    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'кг', label: 'Килограмм', sortOrder: 100, isActive: true }),
    );
    fixture.detectChanges();
    for (const req of http.match((r) => r.url.includes('/units'))) {
      req.flush({ items: [], total: 0 });
    }
  });
});
