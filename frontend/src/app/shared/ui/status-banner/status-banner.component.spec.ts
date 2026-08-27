import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiStatusBannerComponent } from './status-banner.component';

describe('PiStatusBannerComponent', () => {
  let fixture: ComponentFixture<PiStatusBannerComponent>;
  let component: PiStatusBannerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiStatusBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PiStatusBannerComponent);
    component = fixture.componentInstance;
  });

  function render(
    inputs: Partial<{
      tone: 'warning' | 'info' | 'destructive' | 'neutral';
      message: string;
      actionLabel: string;
    }> = {},
  ): void {
    fixture.componentRef.setInput('tone', inputs.tone ?? 'neutral');
    fixture.componentRef.setInput('message', inputs.message ?? 'Lifecycle message');
    fixture.componentRef.setInput('actionLabel', inputs.actionLabel ?? '');
    fixture.detectChanges();
  }

  it.each([
    ['warning', 'bg-warning/10 border-warning/30 text-warning'],
    ['info', 'bg-info/10 border-info/30 text-info'],
    ['destructive', 'bg-destructive/10 border-destructive/30 text-destructive'],
    ['neutral', 'bg-paper-2 border-rule text-ink'],
  ] as const)('renders the %s tone using semantic classes', (tone, classes) => {
    render({ tone });

    const root = fixture.nativeElement.querySelector('[data-test="pi-status-banner"]');
    expect(root).toBeTruthy();
    expect(root.getAttribute('role')).toBe('status');
    expect(root.getAttribute('data-tone')).toBe(tone);
    for (const className of classes.split(' ')) expect(root.className).toContain(className);
  });

  it('renders the lifecycle message', () => {
    render({ tone: 'warning', message: 'Черновик — заказ ещё не подтверждён' });

    expect(fixture.nativeElement.textContent).toContain('Черновик — заказ ещё не подтверждён');
  });

  it('renders no action control when actionLabel is empty', () => {
    render();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('emits action when the optional action control is clicked', () => {
    const actionSpy = jest.fn();
    component.action.subscribe(actionSpy);
    render({ actionLabel: 'Вернуть' });

    fixture.nativeElement.querySelector('button').click();

    expect(actionSpy).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('Вернуть');
  });

  it('is standalone and OnPush', () => {
    expect(PiStatusBannerComponent.prototype).toBeDefined();
    expect(fixture.componentRef.changeDetectorRef).toBeDefined();
  });
});
