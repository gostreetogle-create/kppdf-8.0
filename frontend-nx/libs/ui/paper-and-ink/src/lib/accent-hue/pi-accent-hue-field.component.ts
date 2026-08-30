import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pi-accent-hue-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap gap-2" role="group" [attr.aria-label]="label()">
      <button
        type="button"
        class="h-8 px-2 text-xs rounded-sm hairline pi-focus-ring"
        [class.ring-2]="value() == null"
        [class.ring-sunrise-warm]="value() == null"
        (click)="valueChange.emit(null)"
        [attr.data-test]="dataTest() + '-auto'"
      >
        Авто
      </button>
      @for (hue of presets(); track hue) {
        <button
          type="button"
          class="w-8 h-8 rounded-sm hairline pi-focus-ring"
          [style.background]="swatch(hue)"
          [class.ring-2]="value() === hue"
          [class.ring-sunrise-warm]="value() === hue"
          [attr.aria-label]="label() + ': оттенок ' + hue"
          [attr.data-test]="dataTest() + '-' + hue"
          (click)="valueChange.emit(hue)"
        ></button>
      }
    </div>
  `,
})
export class PiAccentHueFieldComponent {
  readonly label = input.required<string>();
  readonly value = input<number | null>(null);
  readonly presets = input<readonly number[]>([30, 85, 145, 200, 250, 300, 340]);
  readonly dataTest = input('accent-hue');
  readonly valueChange = output<number | null>();

  protected swatch(hue: number): string {
    return `oklch(0.78 0.12 ${hue})`;
  }
}
