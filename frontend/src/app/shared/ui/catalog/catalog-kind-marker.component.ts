import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CatalogEntityKind, CatalogMaterialKind, catalogKindOklch } from './catalog-kind-oklch';
import { CatalogAppearanceService } from './catalog-appearance.service';

@Component({
  selector: 'app-catalog-kind-marker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 min-w-0"
      [attr.data-kind]="kind()"
      [attr.data-material-kind]="materialKind() || null"
    >
      <span
        class="w-1.5 h-6 rounded-full shrink-0"
        [style.background]="accent()"
        aria-hidden="true"
      ></span>
      <span class="min-w-0"><ng-content /></span>
    </span>
  `,
})
export class CatalogKindMarkerComponent {
  readonly kind = input.required<CatalogEntityKind>();
  readonly materialKind = input<CatalogMaterialKind | null>(null);
  private readonly appearance = inject(CatalogAppearanceService);

  protected accent(): string {
    return catalogKindOklch(
      this.kind(),
      this.materialKind(),
      0.12,
      0.58,
      this.appearance.palette(),
    );
  }
}
