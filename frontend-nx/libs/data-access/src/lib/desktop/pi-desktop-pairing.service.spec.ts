import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { API_BASE_URL } from '@kppdf/util-http';
import { PiDesktopPairingService } from './pi-desktop-pairing.service';

describe('PiDesktopPairingService (TZD-72)', () => {
  let service: PiDesktopPairingService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    });
    service = TestBed.inject(PiDesktopPairingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('issues a pairing key', () => {
    const payload = { ttl: '30d' as const, label: 'Офисный ПК', apiBaseUrl: 'https://kppdf.example' };
    service.issue(payload).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/desktop/pairing-keys`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      id: 'k1',
      apiKey: 'kppd_abc',
      expiresAt: null,
      label: 'Офисный ПК',
      tokenPrefix: 'kppd_abc',
      pairing: { apiBaseUrl: payload.apiBaseUrl, apiKey: 'kppd_abc', username: 'alice', expiresAt: null },
    });
  });

  it('lists pairing keys', () => {
    service.list().subscribe();
    const request = httpMock.expectOne(`${baseUrl}/desktop/pairing-keys`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('revokes a pairing key', () => {
    service.revoke('k1').subscribe();
    const request = httpMock.expectOne(`${baseUrl}/desktop/pairing-keys/k1/revoke`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush({ ok: true });
  });

  it('reads compat info', () => {
    service.compat().subscribe();
    const request = httpMock.expectOne(`${baseUrl}/desktop/compat`);
    expect(request.request.method).toBe('GET');
    request.flush({
      minDesktopVersion: '0.5.0',
      recommendedDesktopVersion: '0.5.7',
      downloadUrl: '/downloads/kppdf-desktop-setup-v0.5.7.zip',
      serverBuildId: '2026-09-05',
    });
  });
});
