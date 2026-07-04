import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'hlm-aspect-ratio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative w-full overflow-hidden"
      [style.padding-top]="paddingTop()"
    >
      <div class="absolute inset-0">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class AspectRatioComponent {
  readonly ratio = input<number>(16 / 9);

  protected readonly paddingTop = computed(() => `${(1 / this.ratio()) * 100}%`);
}
