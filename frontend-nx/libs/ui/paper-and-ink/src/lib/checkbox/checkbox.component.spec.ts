import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { Check, LucideAngularModule, Minus } from 'lucide-angular';
import { CheckboxComponent } from './checkbox.component';

/**
 * TZ-NX-LUCIDE-ICONS-REGISTER — regression for the `app.config.ts` cutover
 * gap (TZ-CRASH-401 was legacy-only): `<i-lucide name="check">` /
 * `name="minus"` throw `"... icon has not been provided by any available
 * icon providers."` unless `LUCIDE_ICONS` is registered via
 * `LucideAngularModule.pick({...})`, exactly as done in `app.config.ts`.
 */
describe('CheckboxComponent — Lucide icon provider wiring', () => {
  async function createFixture(
    withPick: boolean,
  ): Promise<ComponentFixture<CheckboxComponent>> {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent],
      providers: withPick
        ? [importProvidersFrom(LucideAngularModule.pick({ Check, Minus }))]
        : [],
    }).compileComponents();

    const fixture = TestBed.createComponent(CheckboxComponent);
    return fixture;
  }

  it('checked=true renders without throwing when icons are registered (app.config.ts pick)', async () => {
    const fixture = await createFixture(true);
    fixture.componentRef.setInput('checked', true);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('i-lucide')).toBeTruthy();
  });

  it('indeterminate=true renders without throwing when icons are registered (app.config.ts pick)', async () => {
    const fixture = await createFixture(true);
    fixture.componentRef.setInput('indeterminate', true);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('i-lucide')).toBeTruthy();
  });

  it('checked=true THROWS the Lucide provider error when the pick is missing (proves the test catches the app.config.ts gap)', async () => {
    const fixture = await createFixture(false);
    fixture.componentRef.setInput('checked', true);
    expect(() => fixture.detectChanges()).toThrow(
      /icon has not been provided by any available icon providers/,
    );
  });
});
