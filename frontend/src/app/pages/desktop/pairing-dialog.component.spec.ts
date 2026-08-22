/**
 * TZD-21 / TZD-57: pairing dialog — issue key + copy packet + download toolbar.
 * TZD-59: version label never renders the literal `v?` (loading / error / no data).
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NEVER, of } from 'rxjs';

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
  let compatSpy: jest.Mock;
  let clipboardWriteTextSpy: jest.Mock;

  const pairingPacket = {
    apiBaseUrl: 'http://127.0.0.1:3000',
    apiKey: 'kppd_testsecretvalue0001',
    username: 'admin',
    expiresAt: '2026-12-31T23:59:59.000Z',
  };

  async function setupModule(desktopUrl: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [PairingDialogComponent],
      providers: [
        {
          provide: PI_DIALOG_DATA,
          useValue: { apiBaseUrl: 'http://127.0.0.1:3000', username: 'admin' },
        },
        { provide: DESKTOP_DOWNLOAD_URL, useValue: desktopUrl },
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
          useValue: { issue: issueSpy, list: listSpy, revoke: revokeSpy, compat: compatSpy },
        },
      ],
    }).compileComponents();
  }

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
    compatSpy = jest.fn().mockReturnValue(
      of({
        ok: true,
        data: {
          minDesktopVersion: '0.1.0',
          recommendedDesktopVersion: '0.5.1',
          // Canon TZD-46: versioned URL (alias stays as fallback).
          downloadUrl: '/downloads/kppdf-desktop-setup-v0.5.1.zip',
          serverBuildId: 'test',
        },
      }),
    );

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWriteTextSpy },
      writable: true,
      configurable: true,
    });

    await setupModule(DEFAULT_DESKTOP_DOWNLOAD_URL);

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

  it('shows version subtitle in toolbar when compat available (TZD-57)', () => {
    expect(compatSpy).toHaveBeenCalled();
    const toolbar = fixture.nativeElement.querySelector('[data-test="pairing-toolbar"]');
    expect(toolbar).toBeTruthy();
    const hint = toolbar.querySelector('[data-test="pairing-compat-hint"]') as HTMLElement;
    expect(hint.textContent).toContain('Актуальная сборка');
    expect(hint.textContent).toContain('мин. v0.1.0');
  });

  it('download button is in toolbar and label contains version (TZD-57)', () => {
    const toolbar = fixture.nativeElement.querySelector('[data-test="pairing-toolbar"]');
    const btn = toolbar.querySelector('[data-test="pairing-download-button"]') as HTMLElement;
    expect(btn).toBeTruthy();
    expect(btn.textContent).toContain('Скачать Desktop');
    expect(btn.textContent).toContain('v0.5.1');
  });

  it('footer has only close button, no download duplicate (TZD-57)', () => {
    expect(
      fixture.nativeElement.querySelectorAll('[data-test="pairing-download-button"]').length,
    ).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-test="pairing-close-button"]')).toBeTruthy();
  });

  it('download button opens compat versioned URL (TZD-57)', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    fixture.nativeElement.querySelector('[data-test="pairing-download-button"]').click();
    expect(openSpy).toHaveBeenCalledWith(
      '/downloads/kppdf-desktop-setup-v0.5.1.zip',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('download button falls back to configured URL when compat has no downloadUrl (TZD-46)', async () => {
    TestBed.resetTestingModule();
    compatSpy = jest.fn().mockReturnValue(
      of({
        ok: true,
        data: {
          minDesktopVersion: '0.1.0',
          recommendedDesktopVersion: '0.5.1',
          downloadUrl: '',
          serverBuildId: 'test',
        },
      }),
    );
    await setupModule(DEFAULT_DESKTOP_DOWNLOAD_URL);
    fixture = TestBed.createComponent(PairingDialogComponent);
    fixture.detectChanges();
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    fixture.nativeElement.querySelector('[data-test="pairing-download-button"]').click();
    expect(openSpy).toHaveBeenCalledWith(
      DEFAULT_DESKTOP_DOWNLOAD_URL,
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('download button disabled with RU hint when no URL available (TZD-57)', async () => {
    TestBed.resetTestingModule();
    compatSpy = jest.fn().mockReturnValue(
      of({
        ok: true,
        data: {
          minDesktopVersion: '0.1.0',
          recommendedDesktopVersion: '0.5.1',
          downloadUrl: '',
          serverBuildId: 'test',
        },
      }),
    );
    await setupModule('');
    fixture = TestBed.createComponent(PairingDialogComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('[data-test="pairing-download-button"]');
    const btn = host.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    const hint = fixture.nativeElement.querySelector(
      '[data-test="pairing-download-hint"]',
    ) as HTMLElement;
    expect(hint.textContent).toContain('Установщик скоро будет на сервере');
  });

  it('download button opens the versioned URL when deploy injects it via token (TZD-46)', async () => {
    TestBed.resetTestingModule();
    await setupModule('/downloads/kppdf-desktop-setup-v0.5.1.zip');
    fixture = TestBed.createComponent(PairingDialogComponent);
    fixture.detectChanges();
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    fixture.nativeElement.querySelector('[data-test="pairing-download-button"]').click();
    expect(openSpy).toHaveBeenCalledWith(
      '/downloads/kppdf-desktop-setup-v0.5.1.zip',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('shows no "v?" placeholder while compat is still loading (TZD-59)', async () => {
    TestBed.resetTestingModule();
    compatSpy = jest.fn().mockReturnValue(NEVER);
    await setupModule(DEFAULT_DESKTOP_DOWNLOAD_URL);
    fixture = TestBed.createComponent(PairingDialogComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector(
      '[data-test="pairing-download-button"]',
    ) as HTMLElement;
    expect(btn.textContent).toContain('Скачать Desktop');
    expect(btn.textContent).not.toContain('v?');
    expect(btn.textContent).not.toMatch(/v\d/);
    expect(fixture.nativeElement.textContent).not.toContain('v?');
    expect(fixture.nativeElement.querySelector('[data-test="pairing-compat-hint"]')).toBeNull();
  });

  it('shows an explaining hint and no "v?" when compat request fails (TZD-59)', async () => {
    TestBed.resetTestingModule();
    compatSpy = jest
      .fn()
      .mockReturnValue(of({ ok: false, error: { status: 500, message: 'boom' } }));
    await setupModule(DEFAULT_DESKTOP_DOWNLOAD_URL);
    fixture = TestBed.createComponent(PairingDialogComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector(
      '[data-test="pairing-download-button"]',
    ) as HTMLElement;
    expect(btn.textContent).toContain('Скачать Desktop');
    expect(btn.textContent).not.toContain('v?');
    expect(fixture.nativeElement.textContent).not.toContain('v?');
    const hint = fixture.nativeElement.querySelector(
      '[data-test="pairing-compat-hint"]',
    ) as HTMLElement;
    expect(hint.textContent).toContain('Не удалось проверить версию');
  });

  it('shows no "v?" when compat has neither version nor versioned URL (TZD-59)', async () => {
    TestBed.resetTestingModule();
    compatSpy = jest.fn().mockReturnValue(
      of({
        ok: true,
        data: {
          minDesktopVersion: '0.1.0',
          recommendedDesktopVersion: '',
          downloadUrl: '',
          serverBuildId: 'test',
        },
      }),
    );
    await setupModule(DEFAULT_DESKTOP_DOWNLOAD_URL);
    fixture = TestBed.createComponent(PairingDialogComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector(
      '[data-test="pairing-download-button"]',
    ) as HTMLElement;
    expect(btn.textContent?.trim()).toBe('Скачать Desktop');
    expect(fixture.nativeElement.textContent).not.toContain('v?');
  });

  it('close calls dialog ref', () => {
    fixture.nativeElement.querySelector('[data-test="pairing-close-button"]').click();
    expect(refCloseSpy).toHaveBeenCalled();
  });
});
