/**
 * TZD-05: pairing-dialog.component.spec.ts
 *
 * Tests the standalone PairingDialogComponent:
 *  - Renders JSON block from PI_DIALOG_DATA.
 *  - Copy button → clipboard.writeText called with correct JSON.
 *  - Fallback copy works when navigator.clipboard is absent.
 *  - Close button calls ref.close().
 *  - Missing/invalid data renders gracefully.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { PairingDialogComponent } from './pairing-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast/pi-toast.service';
import {
  DEFAULT_DESKTOP_DOWNLOAD_URL,
  DESKTOP_DOWNLOAD_URL,
} from '../../core/desktop-download-url';

describe('PairingDialogComponent', () => {
  let fixture: ComponentFixture<PairingDialogComponent>;
  let toastSuccessSpy: jest.Mock;
  let toastErrorSpy: jest.Mock;
  let refCloseSpy: jest.Mock;
  let clipboardWriteTextSpy: jest.Mock;
  let execCommandSpy: jest.Mock;
  let windowOpenSpy: jest.SpyInstance;

  const pairingJson = JSON.stringify(
    {
      apiBaseUrl: 'http://localhost:4200',
      apiKey: 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.fake',
      username: 'admin',
      expiresAt: '2026-12-31T23:59:59.000Z',
    },
    null,
    2,
  );

  function createFixture(
    json: string,
    downloadUrl: string = DEFAULT_DESKTOP_DOWNLOAD_URL,
  ): ComponentFixture<PairingDialogComponent> {
    return TestBed.configureTestingModule({
      imports: [PairingDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: json },
        { provide: DESKTOP_DOWNLOAD_URL, useValue: downloadUrl },
        {
          provide: PI_DIALOG_REF,
          useValue: { close: refCloseSpy, closed: signal(undefined) },
        },
        {
          provide: PiToastService,
          useValue: { success: toastSuccessSpy, error: toastErrorSpy },
        },
      ],
    }).createComponent(PairingDialogComponent);
  }

  beforeEach(() => {
    refCloseSpy = jest.fn();
    toastSuccessSpy = jest.fn();
    toastErrorSpy = jest.fn();
    clipboardWriteTextSpy = jest.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWriteTextSpy },
      writable: true,
      configurable: true,
    });

    execCommandSpy = jest.fn();
    document.execCommand = execCommandSpy;
    windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ─── render ──────────────────────────────────────────────────────

  it('renders the JSON block from PI_DIALOG_DATA', () => {
    fixture = createFixture(pairingJson);
    fixture.detectChanges();
    const pre = fixture.nativeElement.querySelector('[data-test="pairing-json-block"]');
    expect(pre).toBeTruthy();
    expect(pre.textContent).toContain('apiBaseUrl');
    expect(pre.textContent).toContain('admin');
  });

  it('renders empty object when data is null', () => {
    fixture = createFixture(null as unknown as string);
    fixture.detectChanges();
    const pre = fixture.nativeElement.querySelector('[data-test="pairing-json-block"]');
    expect(pre.textContent).toContain('{}');
  });

  // ─── download ────────────────────────────────────────────────────

  it('opens the configured installer URL in a new tab', () => {
    fixture = createFixture(pairingJson, 'https://downloads.example.test/kppdf.exe');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-test="pairing-download-button"]');
    button.click();

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://downloads.example.test/kppdf.exe',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('uses the same-origin default installer URL', () => {
    fixture = createFixture(pairingJson);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-test="pairing-download-button"]');
    expect(button.disabled).toBe(false);
    button.click();

    expect(windowOpenSpy).toHaveBeenCalledWith(
      DEFAULT_DESKTOP_DOWNLOAD_URL,
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('disables installer download and shows a hint for an empty URL', () => {
    fixture = createFixture(pairingJson, '   ');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-test="pairing-download-button"]');
    const hint = fixture.nativeElement.querySelector('[data-test="pairing-download-hint"]');

    expect(button.disabled).toBe(true);
    expect(hint.textContent).toContain('Установщик скоро будет на сервере');
    button.click();
    expect(windowOpenSpy).not.toHaveBeenCalled();
  });

  // ─── copy ────────────────────────────────────────────────────────

  it('copies JSON to clipboard and shows success toast', async () => {
    fixture = createFixture(pairingJson);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-test="pairing-copy-button"]');
    btn.click();
    fixture.detectChanges();

    expect(clipboardWriteTextSpy).toHaveBeenCalledWith(pairingJson);

    // Let the promise settle
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toastSuccessSpy).toHaveBeenCalledWith('Скопировано в буфер обмена');
  });

  it('shows error when clipboard.writeText fails', async () => {
    clipboardWriteTextSpy.mockRejectedValue(new Error('denied'));

    fixture = createFixture(pairingJson);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-test="pairing-copy-button"]');
    btn.click();

    await fixture.whenStable();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('[data-test="pairing-copy-error"]');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Не удалось скопировать');
  });

  it('shows error when data is empty and copy is attempted', () => {
    fixture = createFixture('{}');
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-test="pairing-copy-button"]');
    btn.click();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('[data-test="pairing-copy-error"]');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Нет данных для копирования');
    expect(clipboardWriteTextSpy).not.toHaveBeenCalled();
  });

  // ─── fallback copy (no navigator.clipboard) ──────────────────────

  it('falls back to execCommand when navigator.clipboard is absent', () => {
    // Remove clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    fixture = createFixture(pairingJson);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-test="pairing-copy-button"]');
    btn.click();
    fixture.detectChanges();

    expect(toastSuccessSpy).toHaveBeenCalledWith('Скопировано в буфер обмена');
  });

  // ─── close ───────────────────────────────────────────────────────

  it('closes the dialog when close button is clicked', () => {
    fixture = createFixture(pairingJson);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('[data-test="pairing-close-button"]');
    closeBtn.click();

    expect(refCloseSpy).toHaveBeenCalled();
  });

  it('closes the dialog when user close (X) is triggered', () => {
    fixture = createFixture(pairingJson);
    fixture.detectChanges();

    // The PiDialogComponent emits userClose → calls onClose → ref.close()
    // We call onClose directly since PiDialogComponent is a child.
    fixture.componentInstance['onClose']();
    expect(refCloseSpy).toHaveBeenCalled();
  });
});
