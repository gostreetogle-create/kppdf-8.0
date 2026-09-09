import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { CapabilitiesService } from '@kppdf/data-access/capabilities';
import { AuthService } from '@kppdf/data-access/auth';
import { AdminDevice, PiDeviceEnrollmentService } from '@kppdf/data-access/admin';
import { PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { DevicesAdminPage } from './admin-devices.page';

describe('DevicesAdminPage (TZ-NX-UX-16-admin-devices-FIX)', () => {
  let fixture: ComponentFixture<DevicesAdminPage>;
  let devicesApi: { listDevices: jest.Mock; revokeDevice: jest.Mock };
  let dialog: { open: jest.Mock };
  let toast: { success: jest.Mock; error: jest.Mock };

  const rows: AdminDevice[] = [
    {
      id: 'd-1',
      deviceName: 'Каб. 12 — ПК1',
      status: 'active',
      inviteKind: 'regular',
      role: 'manager',
      expiresAt: null,
      lastUsedAt: null,
      activatedAt: null,
      revokedAt: null,
      userId: 'u-1',
    },
    {
      id: 'd-2',
      deviceName: 'Домашний ноутбук владельца',
      status: 'active',
      inviteKind: 'owner-device',
      role: 'owner',
      expiresAt: null,
      lastUsedAt: null,
      activatedAt: null,
      revokedAt: null,
      userId: 'u-owner',
    },
  ];

  async function setup(list: SilentResult<AdminDevice[]> = { ok: true, data: rows }): Promise<void> {
    devicesApi = {
      listDevices: jest.fn().mockReturnValue(of(list)),
      revokeDevice: jest.fn(),
    };
    dialog = { open: jest.fn() };
    toast = { success: jest.fn(), error: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [DevicesAdminPage],
      providers: [
        provideRouter([]),
        { provide: PiDeviceEnrollmentService, useValue: devicesApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: toast },
        { provide: CapabilitiesService, useValue: { hasAny: () => true } },
        { provide: AuthService, useValue: { user: () => null, isOwner: () => false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DevicesAdminPage);
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows the invite kind (regular vs owner) for every device', async () => {
    await setup();
    const table: HTMLElement = fixture.nativeElement;
    expect(table.textContent).toContain('Обычное');
    expect(table.textContent).toContain('Владельца');
  });

  it('opens a destructive confirm before revoking and reloads on success', async () => {
    await setup();
    const closedSignal = signal<boolean | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v?: boolean) => closedSignal.set(v) } as unknown as DialogRef<boolean>;
    dialog.open.mockReturnValue(ref);
    devicesApi.revokeDevice.mockReturnValue(of({ ok: true, data: undefined } satisfies SilentResult<void>));

    const revokeButtons = fixture.nativeElement.querySelectorAll('[data-test="devices-revoke"]');
    (revokeButtons[0] as HTMLButtonElement).click();
    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: expect.objectContaining({ variant: 'destructive' }) }),
    );

    closedSignal.set(true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(devicesApi.revokeDevice).toHaveBeenCalledWith('d-1');
    expect(toast.success).toHaveBeenCalled();
  });

  it('does not revoke when the confirm is cancelled', async () => {
    await setup();
    const closedSignal = signal<boolean | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v?: boolean) => closedSignal.set(v) } as unknown as DialogRef<boolean>;
    dialog.open.mockReturnValue(ref);

    const revokeButtons = fixture.nativeElement.querySelectorAll('[data-test="devices-revoke"]');
    (revokeButtons[0] as HTMLButtonElement).click();
    closedSignal.set(false);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(devicesApi.revokeDevice).not.toHaveBeenCalled();
  });
});
