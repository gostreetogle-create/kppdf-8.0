import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '@kppdf/data-access';
import { HomePage } from './home.page';

describe('HomePage (TZ-NX-HOME-ROUTE-SHELL)', () => {
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user: () => null } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
  });

  it('renders the Home heading and honest queue placeholder', () => {
    expect(fixture.nativeElement.querySelector('[data-test="home-page"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('h1')?.textContent.trim()).toBe('Главная');
    expect(fixture.nativeElement.querySelector('[data-test="home-queue-placeholder"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Очередь подключится следующим шагом');
  });

  it('links to the full orders registry rather than duplicating its create flow', () => {
    const link = fixture.nativeElement.querySelector('[data-test="home-orders-link"]') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/orders');
    expect(fixture.nativeElement.querySelector('[data-test="home-orders-create"]')).toBeNull();
  });
});
