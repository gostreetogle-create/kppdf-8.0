import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { CurrenciesPage } from './currencies.page';
import { CurrencyService } from '../../shared/services/pi-currency.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

async function settle(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe('CurrenciesPage', () => {
  let http: HttpTestingController;
  const baseUrl = '/api';
  const dialog = { open: jest.fn().mockReturnValue({}) };
  const remove = jest.fn().mockReturnValue(of({ ok: true, data: undefined }));

  beforeEach(async () => {
    dialog.open.mockClear();
    remove.mockClear();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: CurrencyService, useValue: { remove } },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renders the canonical entity-list and loads currencies', async () => {
    const fixture = TestBed.createComponent(CurrenciesPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const request = http.expectOne((r) => r.url === `${baseUrl}/currencies` && r.method === 'GET');
    request.flush({ items: [{ _id: 'c-1', key: 'RUB', label: 'Рубль' }], total: 1 });
    await settle();

    expect(fixture.nativeElement.querySelector('app-pi-entity-list')).toBeTruthy();
  });

  it('does not open delete confirmation for a system currency', () => {
    const fixture = TestBed.createComponent(CurrenciesPage);
    const page = fixture.componentInstance as unknown as {
      onDelete: (row: unknown) => void;
    };

    page.onDelete({ key: 'RUB', label: 'Рубль', isSystem: true });

    expect(dialog.open).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('opens the currency form in create mode', async () => {
    const fixture = TestBed.createComponent(CurrenciesPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    http.expectOne((r) => r.url === `${baseUrl}/currencies`).flush({ items: [], total: 0 });
    await settle();

    (fixture.componentInstance as unknown as { openCreate: () => void }).openCreate();

    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: null, width: 'lg' }),
    );
  });
});
