import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginPage } from './login.page';
import { AuthService } from '../../core/auth.service';

/**
 * Tests for the dev-only autofill helper on `LoginPage`.
 *
 * The `isDevMode()`-gated button in the template is not tested here
 * (Jest's test env has `isDevMode() === false`; the @if branch is a
 * template concern verified manually in the browser). We only cover
 * the `fillDemoCredentials()` method contract.
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
        { provide: AuthService, useValue: { login: authLogin } },
        { provide: Router, useValue: { navigateByUrl: routerNavigateByUrl } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    authLogin.mockReset();
    routerNavigateByUrl.mockReset();
  });

  describe('fillDemoCredentials()', () => {
    it('sets username to the seeded admin', () => {
      component.fillDemoCredentials();
      expect(component.username).toBe('admin');
    });

    it('sets password to the seeded AdminPass123', () => {
      component.fillDemoCredentials();
      expect(component.password).toBe('AdminPass123');
    });

    it('overwrites any existing username and password values', () => {
      // Simulate a user typing something wrong, then clicking the
      // dev autofill button to replace it.
      component.username = 'wrong-user';
      component.password = 'wrong-pass';
      component.fillDemoCredentials();
      expect(component.username).toBe('admin');
      expect(component.password).toBe('AdminPass123');
    });
  });
});
