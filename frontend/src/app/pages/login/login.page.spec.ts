import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginPage } from './login.page';
import { AuthService } from '../../core/auth.service';

/**
 * Tests for the dev-only autofill helper and the public login notice.
 */
describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;

  const authLogin = jest.fn();
  const routerNavigateByUrl = jest.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: authLogin,
            // TZ-AUTH-304 — LoginPage shows the revoked-device notice
            // via auth.deviceDenied() in the template.
            deviceDenied: () => null,
          },
        },
        { provide: Router, useValue: { navigateByUrl: routerNavigateByUrl } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    authLogin.mockReset();
    routerNavigateByUrl.mockReset();
  });

  describe('personal project notice', () => {
    it('renders the personal-project notice with the canonical heading', () => {
      fixture.detectChanges();

      const notice = fixture.nativeElement.querySelector('[data-test="personal-project-notice"]');

      expect(notice).not.toBeNull();
      expect(notice.textContent).toContain('Личный проект для обучения и тестирования');
      expect(notice.textContent).toContain(
        'KPPDF — индивидуальный проект для обучения, экспериментов и проверки идей.',
      );
    });
  });

  describe('fillDemoCredentials()', () => {
    it('sets username to the seeded admin', () => {
      component.fillDemoCredentials();
      expect(component.username).toBe('admin');
    });

    it('sets password to the seeded admin123', () => {
      component.fillDemoCredentials();
      expect(component.password).toBe('admin123');
    });

    it('overwrites any existing username and password values', () => {
      // Simulate a user typing something wrong, then clicking the
      // dev autofill button to replace it.
      component.username = 'wrong-user';
      component.password = 'wrong-pass';
      component.fillDemoCredentials();
      expect(component.username).toBe('admin');
      expect(component.password).toBe('admin123');
    });
  });
});
