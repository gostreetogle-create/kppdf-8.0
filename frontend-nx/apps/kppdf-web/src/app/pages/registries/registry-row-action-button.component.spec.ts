import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistryRowActionButtonComponent } from './registry-row-action-button.component';
import type { RegistryRowAction } from './model/registry.types';

describe('RegistryRowActionButtonComponent', () => {
  let fixture: ComponentFixture<RegistryRowActionButtonComponent>;

  const action: RegistryRowAction<RegistryRow> = {
    id: 'edit-material',
    label: 'Редактировать',
    icon: 'pencil',
    tone: 'edit',
    run: () => undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistryRowActionButtonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(RegistryRowActionButtonComponent);
    fixture.componentRef.setInput('action', action);
    fixture.detectChanges();
  });

  it('renders icon-only button with Russian aria-label and data-test', () => {
    const btn = fixture.nativeElement.querySelector(
      '[data-test="registry-row-action-edit-material"]',
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.getAttribute('aria-label')).toBe('Редактировать');
    expect(btn.getAttribute('title')).toBe('Редактировать');
    expect(btn.querySelector('lucide-angular')).toBeTruthy();
    expect(btn.textContent?.trim()).toBe('');
  });

  it('emits actionClick and respects disabled + tooltip reason', () => {
    const clickSpy = jest.fn();
    fixture.componentInstance.actionClick.subscribe(clickSpy);
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('disabledReason', 'Уже активна');
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute('title')).toBe('Уже активна');
    btn.click();
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('applies semantic tone class on button', () => {
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.className).toContain('pi-icon-btn-edit');
  });
});
