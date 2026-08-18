import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyPage } from './privacy.page';

describe('PrivacyPage', () => {
  let component: PrivacyPage;
  let fixture: ComponentFixture<PrivacyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPage],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the internal IS notice', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Внутренняя информационная система');
    expect(el.textContent).toContain('Доступ только уполномоченным лицам');
  });
});
