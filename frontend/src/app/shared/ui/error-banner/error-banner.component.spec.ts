import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorBannerComponent, toBannerError } from './error-banner.component';

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

  // ── Existing contract (object input, null, retry) ──

  it('renders error message from object input', () => {
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

  // ── New contract: string input ──

  it('renders error message from string input', () => {
    fixture.componentRef.setInput('error', 'Something broke');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Something broke');
  });

  it('string input has no retry button', () => {
    fixture.componentRef.setInput('error', 'Plain string error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('null input hides banner', () => {
    fixture.componentRef.setInput('error', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});

describe('toBannerError', () => {
  it('returns null for null/undefined', () => {
    expect(toBannerError(null)).toBeNull();
    expect(toBannerError(undefined)).toBeNull();
  });

  it('wraps string into { message }', () => {
    expect(toBannerError('fail')).toEqual({ message: 'fail' });
  });

  it('passes through well-formed object', () => {
    expect(toBannerError({ message: 'oops', canRetry: true })).toEqual({
      message: 'oops',
      canRetry: true,
    });
  });

  it('extracts message from Error instance', () => {
    expect(toBannerError(new Error('boom'))).toEqual({ message: 'boom' });
  });

  it('extracts from HttpErrorResponse-like { error: { message } }', () => {
    expect(toBannerError({ status: 500, error: { message: 'Server down' } })).toEqual({
      message: 'Server down',
    });
  });

  it('extracts from HttpErrorResponse-like { error: string }', () => {
    expect(toBannerError({ status: 500, error: 'Internal Error' })).toEqual({
      message: 'Internal Error',
    });
  });

  it('falls back to String() for unrecognized shapes', () => {
    expect(toBannerError(42)).toEqual({ message: '42' });
    expect(toBannerError(true)).toEqual({ message: 'true' });
  });
});
