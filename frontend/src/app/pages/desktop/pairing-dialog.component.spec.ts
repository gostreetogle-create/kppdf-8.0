/**
 * TZD-21: pairing dialog — issue key + copy packet (no session JWT in packet).
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { PairingDialogComponent } from './pairing-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast/pi-toast.service';
import {
  DEFAULT_DESKTOP_DOWNLOAD_URL,
  DESKTOP_DOWNLOAD_URL,
} from '../../core/desktop-download-url';
import { DesktopPairingService } from '../../shared/services/pi-desktop-pairing.service';

describe('PairingDialogComponent (TZD-21)', () => {
  let fixture: ComponentFixture<PairingDialogComponent>;
  let toastSuccessSpy: jest.Mock;
  let toastErrorSpy: jest.Mock;
  let refCloseSpy: jest.Mock;
  let issueSpy: jest.Mock;
  let listSpy: jest.Mock;
  let revokeSpy: jest.Mock;
  let clipboardWriteTextSpy: jest.Mock;

  const pairingPacket = {
    apiBaseUrl: 'http://127.0.0.1:3000',
    apiKey: 'kppd_testsecretvalue0001',
    username: 'admin',
    expiresAt: '2026-12-31T23:59:59.000Z',
  };

  beforeEach(async () => {
    refCloseSpy = jest.fn();
    toastSuccessSpy = jest.fn();
    toastErrorSpy = jest.fn();
    clipboardWriteTextSpy = jest.fn().mockResolvedValue(undefined);
    issueSpy = jest.fn().mockReturnValue(
      of({
        ok: true,
        data: {
          id: 'k1',
          apiKey: pairingPacket.apiKey,
          expiresAt: pairingPacket.expiresAt,
          label: 'Desktop',
          tokenPrefix: 'kppd_test',
          pairing: pairingPacket,
        },
      }),
    );
    listSpy = jest.fn().mockReturnValue(of({ ok: true, data: [] }));
    revokeSpy = jest.fn().mockReturnValue(of({ ok: true, data: { ok: true } }));

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWriteTextSpy },
      writable: true,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [PairingDialogComponent],
      providers: [
        {
          provide: PI_DIALOG_DATA,
          useValue: { apiBaseUrl: 'http://127.0.0.1:3000', username: 'admin' },
        },
        { provide: DESKTOP_DOWNLOAD_URL, useValue: DEFAULT_DESKTOP_DOWNLOAD_URL },
        {
          provide: PI_DIALOG_REF,
          useValue: { close: refCloseSpy, closed: signal(undefined) },
        },
        {
          provide: PiToastService,
          useValue: { success: toastSuccessSpy, error: toastErrorSpy },
        },
        {
          provide: DesktopPairingService,
          useValue: { issue: issueSpy, list: listSpy, revoke: revokeSpy },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PairingDialogComponent);
    fixture.detectChanges();
  });

  it('loads key list and does not embed a JWT-looking apiKey before issue', () => {
    expect(listSpy).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-test="pairing-issue-form"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="pairing-json-block"]')).toBeNull();
    expect(issueSpy).not.toHaveBeenCalled();
  });

  it('issues key via API and shows pairing JSON with opaque apiKey', () => {
    fixture.nativeElement.querySelector('[data-test="pairing-issue-button"]').click();
    fixture.detectChanges();
    expect(issueSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ttl: '30d',
        apiBaseUrl: 'http://127.0.0.1:3000',
      }),
    );
    const block = fixture.nativeElement.querySelector(
      '[data-test="pairing-json-block"]',
    ) as HTMLElement;
    expect(block.textContent).toContain('kppd_testsecretvalue0001');
    expect(block.textContent).not.toMatch(/eyJ[a-zA-Z0-9_-]+\./);
    expect(toastSuccessSpy).toHaveBeenCalled();
  });

  it('copy writes issued packet to clipboard', async () => {
    fixture.nativeElement.querySelector('[data-test="pairing-issue-button"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-test="pairing-copy-button"]').click();
    await Promise.resolve();
    expect(clipboardWriteTextSpy).toHaveBeenCalledWith(
      expect.stringContaining('kppd_testsecretvalue0001'),
    );
  });

  it('close calls dialog ref', () => {
    fixture.nativeElement.querySelector('[data-test="pairing-close-button"]').click();
    expect(refCloseSpy).toHaveBeenCalled();
  });
});
