import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { UnitsPage } from './units.page';
import { UnitsService } from '../dictionaries/units.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

async function settle(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe('UnitsPage', () => {
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
        { provide: UnitsService, useValue: { remove } },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renders the canonical entity-list and loads units', async () => {
    const fixture = TestBed.createComponent(UnitsPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const request = http.expectOne((r) => r.url === `${baseUrl}/units` && r.method === 'GET');
    request.flush({ items: [{ _id: 'u-1', key: 'kg', label: 'Килограмм' }], total: 1 });
    await settle();

    expect(fixture.nativeElement.querySelector('app-pi-entity-list')).toBeTruthy();
  });

  it('does not open delete confirmation for a system unit', () => {
    const fixture = TestBed.createComponent(UnitsPage);
    const page = fixture.componentInstance as unknown as {
      onDelete: (row: unknown) => void;
    };

    page.onDelete({ key: 'kg', label: 'Килограмм', isSystem: true });

    expect(dialog.open).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('opens the unit form in create mode', async () => {
    const fixture = TestBed.createComponent(UnitsPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    http.expectOne((r) => r.url === `${baseUrl}/units`).flush({ items: [], total: 0 });
    await settle();

    (fixture.componentInstance as unknown as { openCreate: () => void }).openCreate();

    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: null, width: 'md' }),
    );
  });
});
