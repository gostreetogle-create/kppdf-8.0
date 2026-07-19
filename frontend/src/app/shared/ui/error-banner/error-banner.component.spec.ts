import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorBannerComponent } from './error-banner.component';

describe('ErrorBannerComponent', () => {
  let component: ErrorBannerComponent;
  let fixture: ComponentFixture<ErrorBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorBannerComponent);
    component = fixture.componentInstance;
  });

  it('renders error message', () => {
    fixture.componentRef.setInput('error', { message: 'Load failed' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Load failed');
  });

  it('hides when error is null', () => {
    fixture.componentRef.setInput('error', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows retry button when canRetry is true', () => {
    fixture.componentRef.setInput('error', { message: 'err', canRetry: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Повторить');
  });

  it('hides retry button when canRetry is false', () => {
    fixture.componentRef.setInput('error', { message: 'err', canRetry: false });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('emits retry event on button click', () => {
    const spy = jest.fn();
    component.retry.subscribe(spy);
    fixture.componentRef.setInput('error', { message: 'err', canRetry: true });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalled();
  });
});
