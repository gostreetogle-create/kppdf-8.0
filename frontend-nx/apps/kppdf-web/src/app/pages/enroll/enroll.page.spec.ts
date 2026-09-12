import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding, RouterOutlet } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { AuthService } from '@kppdf/data-access/auth';
import { EnrollResponse, PiDeviceEnrollmentService } from '@kppdf/data-access/admin';
import { EnrollPage } from './enroll.page';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class EnrollHostComponent {}

describe('EnrollPage (TZ-AUTH-304 · :token route binding regression)', () => {
  const SECRET = 'eyJhIjoxMiwiYiI6MzR9';

  let fixture: ComponentFixture<EnrollHostComponent>;
  let enroll: jest.Mock;
  let auth: { applyDeviceAccess: jest.Mock; ensureUser: jest.Mock };

  const resolved: EnrollResponse = {
    access: 'jwt-access',
    deviceName: 'Каб. 12 — ПК1',
    role: 'admin',
    expiresAt: '2026-09-13T00:00:00.000Z',
    isOwner: true,
  };

  async function setup(): Promise<void> {
    enroll = jest.fn().mockReturnValue(of({ ok: true, data: resolved }));
    auth = {
      applyDeviceAccess: jest.fn(),
      ensureUser: jest.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [EnrollHostComponent],
      providers: [
        // Regression guard: prod `app.config.ts` must enable
        // `withComponentInputBinding()` — otherwise `enroll/:token` never
        // reaches `token = input.required()` and onboarding dies with the
        // generic «Не удалось подключить…» (no request is ever sent).
        provideRouter(
          [{ path: 'enroll/:token', component: EnrollPage }],
          withComponentInputBinding(),
        ),
        { provide: PiDeviceEnrollmentService, useValue: { enroll } },
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    await router.navigate(['/enroll', SECRET]);
    fixture = TestBed.createComponent(EnrollHostComponent);
    fixture.detectChanges();
  }

  it('binds :token from the URL and enrolls the device', async () => {
    await setup();

    const host = fixture.debugElement.query(By.directive(EnrollPage));
    expect(host).not.toBeNull();

    const page = host.componentInstance as EnrollPage;
    page.deviceName = 'Каб. 12 — ПК1';
    await page.onSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(enroll).toHaveBeenCalledWith(SECRET, 'Каб. 12 — ПК1');
    expect(auth.applyDeviceAccess).toHaveBeenCalledWith(resolved.access);
    expect(auth.ensureUser).toHaveBeenCalled();
  });
});