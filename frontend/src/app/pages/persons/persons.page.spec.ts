import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { PersonsPage } from './persons.page';
import { PersonService } from '../../shared/services/pi-person.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

async function settle(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe('PersonsPage', () => {
  let http: HttpTestingController;
  const baseUrl = '/api';
  const dialog = { open: jest.fn().mockReturnValue({}) };

  beforeEach(async () => {
    dialog.open.mockClear();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: PersonService,
          useValue: {
            remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
          },
        },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renders the canonical entity-list and loads persons', async () => {
    const fixture = TestBed.createComponent(PersonsPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const request = http.expectOne((r) => r.url === `${baseUrl}/persons` && r.method === 'GET');
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('limit')).toBe('20');
    request.flush({ items: [{ _id: 'p-1', lastName: 'Петров', firstName: 'Иван' }], total: 1 });
    await settle();

    expect(fixture.nativeElement.querySelector('app-pi-entity-list')).toBeTruthy();
    expect(
      (fixture.componentInstance as unknown as { fullName: (row: unknown) => string }).fullName({
        lastName: 'Петров',
        firstName: 'Иван',
        patronymic: 'Иванович',
      }),
    ).toBe('Петров Иван Иванович');
  });

  it('opens the person form in create mode', async () => {
    const fixture = TestBed.createComponent(PersonsPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    http.expectOne((r) => r.url === `${baseUrl}/persons`).flush({ items: [], total: 0 });
    await settle();

    (fixture.componentInstance as unknown as { openCreate: () => void }).openCreate();

    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: null, width: 'md' }),
    );
  });
});
