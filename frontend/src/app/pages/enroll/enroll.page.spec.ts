import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { API_BASE_URL } from '../../core/api.tokens';
import { AuthService } from '../../core/auth.service';
import { EnrollPage } from './enroll.page';

/**
 * TZ-AUTH-304 — EnrollPage unit spec.
 *
 * Covers the public one-time activation contract:
 *   - GET / render NEVER consumes the invite (no HTTP on construction);
 *   - submit with a device name POSTs /device/enroll exactly once;
 *   - on success the device session is applied (applyDeviceAccess, no
 *     refresh token) and the browser is navigated away with replaceUrl
 *     (the one-time token leaves history);
 *   - 409/410 are mapped to user-safe Russian copy.
 */
describe('EnrollPage', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let applyDeviceAccess: jest.Mock;
  let ensureUser: jest.Mock;

  const BASE_URL = '/api';

  beforeEach(async () => {
    applyDeviceAccess = jest.fn();
    ensureUser = jest.fn().mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: BASE_URL },
        {
          provide: AuthService,
          useValue: { applyDeviceAccess, ensureUser } as unknown as AuthService,
        },
      ],
    })
      .overrideComponent(EnrollPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function createPage(token: string): {
    fixture: ReturnType<typeof TestBed.createComponent<EnrollPage>>;
    page: EnrollPage;
  } {
    const fixture = TestBed.createComponent(EnrollPage);
    fixture.componentRef.setInput('token', token);
    fixture.detectChanges();
    return { fixture, page: fixture.componentInstance };
  }

  function submitName(page: EnrollPage, name: string): Promise<void> {
    page.deviceName = name;
    return page.onSubmit(new Event('submit'));
  }

  it('renders the activation form without consuming the invite on GET', () => {
    const { fixture } = createPage('secret-token');
    expect(fixture.nativeElement.textContent).toContain('Подключение компьютера');
    expect(fixture.nativeElement.querySelector('[data-test="enroll-submit"]')).not.toBeNull();
    // GET must not trigger any HTTP call (link scanners must not activate).
    httpMock.expectNone(`${BASE_URL}/device/enroll`);
  });

  it('refuses an empty device name without any HTTP call', async () => {
    const { page } = createPage('secret-token');
    await submitName(page, '   ');
    expect(page.error()).toBe('Введите имя компьютера.');
    httpMock.expectNone(`${BASE_URL}/device/enroll`);
  });

  it('activates with the device name, applies the device session and navigates with replaceUrl', async () => {
    const { page } = createPage('secret-token');
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const promise = submitName(page, 'Офис Марии');
    const req = httpMock.expectOne(`${BASE_URL}/device/enroll`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ secret: 'secret-token', deviceName: 'Офис Марии' });
    req.flush({
      access: 'device-access-jwt',
      deviceName: 'Офис Марии',
      role: 'manager',
      expiresAt: '2027-08-13T00:00:00.000Z',
      isOwner: false,
      sessionKind: 'device',
    });

    await promise;

    expect(applyDeviceAccess).toHaveBeenCalledWith('device-access-jwt');
    expect(ensureUser).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/', { replaceUrl: true });
    expect(page.error()).toBeNull();
    void http;
  });

  it('maps a 409 repeat-consumption to the used-link message', async () => {
    const { page } = createPage('secret-token');
    const promise = submitName(page, 'Цех');
    httpMock
      .expectOne(`${BASE_URL}/device/enroll`)
      .flush({ message: 'Приглашение уже использовано' }, { status: 409, statusText: 'Conflict' });
    await promise;
    expect(page.error()).toBe('Эта ссылка уже была использована.');
    expect(applyDeviceAccess).not.toHaveBeenCalled();
  });

  it('maps 410/400/404 to the generic invite message', async () => {
    const { page } = createPage('secret-token');
    const promise = submitName(page, 'Цех');
    httpMock
      .expectOne(`${BASE_URL}/device/enroll`)
      .flush(
        { message: 'Приглашение недействительно или истекло' },
        { status: 410, statusText: 'Gone' },
      );
    await promise;
    expect(page.error()).toBe(
      'Приглашение недействительно или истекло. Обратитесь к администратору.',
    );
    expect(applyDeviceAccess).not.toHaveBeenCalled();
  });

  it('surfaces the backend message on 5xx and a generic message on network errors', async () => {
    const { page } = createPage('secret-token');
    const serverError = submitName(page, 'Цех');
    httpMock
      .expectOne(`${BASE_URL}/device/enroll`)
      .flush({ message: 'Server exploded' }, { status: 500, statusText: 'Server Error' });
    await serverError;
    expect(page.error()).toBe('Server exploded');

    const networkError = submitName(page, 'Цех');
    httpMock.expectOne(`${BASE_URL}/device/enroll`).error(new ProgressEvent('error'));
    await networkError;
    expect(page.error()).toBe('Не удалось подключить компьютер. Попробуйте ещё раз.');
  });
});
