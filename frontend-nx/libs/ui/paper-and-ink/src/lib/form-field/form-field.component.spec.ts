import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent', () => {
  async function createFixture(
    inputs: Partial<{
      label: string;
      hint: string;
      hintTone: 'default' | 'ai' | 'success' | 'warn';
      error: string;
      required: boolean;
    }> = {},
  ): Promise<ComponentFixture<FormFieldComponent>> {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(FormFieldComponent);
    if (inputs.label !== undefined) fixture.componentRef.setInput('label', inputs.label);
    if (inputs.hint !== undefined) fixture.componentRef.setInput('hint', inputs.hint);
    if (inputs.hintTone !== undefined) fixture.componentRef.setInput('hintTone', inputs.hintTone);
    if (inputs.error !== undefined) fixture.componentRef.setInput('error', inputs.error);
    if (inputs.required !== undefined) fixture.componentRef.setInput('required', inputs.required);
    fixture.detectChanges();
    return fixture;
  }

  function hintSpan(fixture: ComponentFixture<FormFieldComponent>): HTMLSpanElement | null {
    return fixture.nativeElement.querySelector('span:not([role="alert"])');
  }

  function errorSpan(fixture: ComponentFixture<FormFieldComponent>): HTMLSpanElement | null {
    return fixture.nativeElement.querySelector('span[role="alert"]');
  }

  function footer(fixture: ComponentFixture<FormFieldComponent>): HTMLDivElement {
    return fixture.nativeElement.querySelector('[data-test="form-field-footer"]') as HTMLDivElement;
  }

  it('should create', async () => {
    const fixture = await createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders default hint with muted foreground class', async () => {
    const fixture = await createFixture({ hint: 'Helper text' });
    const span = hintSpan(fixture);
    expect(span?.textContent?.trim()).toBe('Helper text');
    expect(span?.className).toContain('text-muted-foreground');
    expect(span?.className).toContain('text-xs');
  });

  it('renders ai hint with text-hint-ai token class', async () => {
    const fixture = await createFixture({ hint: 'AI suggestion', hintTone: 'ai' });
    const span = hintSpan(fixture);
    expect(span?.className).toContain('text-hint-ai');
    expect(span?.className).not.toContain('text-muted-foreground');
  });

  it('renders warn hint with text-hint-warn token class', async () => {
    const fixture = await createFixture({ hint: 'Caution', hintTone: 'warn' });
    const span = hintSpan(fixture);
    expect(span?.className).toContain('text-hint-warn');
  });

  it('renders success hint with text-hint-success token class', async () => {
    const fixture = await createFixture({ hint: 'Saved', hintTone: 'success' });
    const span = hintSpan(fixture);
    expect(span?.className).toContain('text-hint-success');
  });

  it('keeps a reserved footer slot while error is set, cleared, and set again', async () => {
    const fixture = await createFixture();
    const reservedFooter = footer(fixture);

    expect(reservedFooter).toBeTruthy();
    expect(reservedFooter.classList.contains('min-h-4')).toBe(true);
    expect(reservedFooter.classList.contains('leading-4')).toBe(true);
    const reservedHeight = reservedFooter.clientHeight;

    fixture.componentRef.setInput('error', 'Required field');
    fixture.detectChanges();
    expect(footer(fixture)).toBe(reservedFooter);
    expect(footer(fixture).clientHeight).toBe(reservedHeight);
    expect(footer(fixture).className).toContain('min-h-4');

    fixture.componentRef.setInput('error', null);
    fixture.detectChanges();
    expect(footer(fixture)).toBe(reservedFooter);
    expect(footer(fixture).clientHeight).toBe(reservedHeight);
    expect(footer(fixture).className).toContain('min-h-4');

    fixture.componentRef.setInput('error', 'Still required');
    fixture.detectChanges();
    expect(footer(fixture)).toBe(reservedFooter);
    expect(footer(fixture).clientHeight).toBe(reservedHeight);
    expect(footer(fixture).className).toContain('min-h-4');
  });

  it('error shadows hint and uses role=alert', async () => {
    const fixture = await createFixture({
      hint: 'Helper',
      hintTone: 'ai',
      error: 'Required field',
    });
    expect(errorSpan(fixture)?.textContent?.trim()).toBe('Required field');
    expect(errorSpan(fixture)?.className).toContain('text-destructive');
    expect(hintSpan(fixture)).toBeNull();
  });
});
