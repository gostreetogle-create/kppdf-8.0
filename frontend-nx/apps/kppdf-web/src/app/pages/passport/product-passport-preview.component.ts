import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  PiCompositionService,
  PiUnitsService,
  type ProductDetail,
} from '@kppdf/data-access';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { buildProductPassportPreview } from './build-product-passport-preview';
import type { ProductPassportPreview } from './passport-preview.types';

@Component({
  selector: 'pi-product-passport-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiFormSectionComponent],
  template: `
    <app-pi-form-section
      title="Паспорт изделия (предпросмотр)"
      headingId="product-passport-preview"
      tone="neutral"
    >
      <p class="text-xs text-muted-foreground mb-3" data-test="passport-preview-notice">
        {{ preview().snapshotNotice }}
      </p>

      <dl class="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-sm" data-test="passport-preview-fields">
        @for (field of preview().fields; track field.key) {
          <div class="contents">
            <dt class="text-muted-foreground">{{ field.label }}</dt>
            <dd [attr.data-test]="'passport-field-' + field.key">
              {{ field.value }}
              @if (field.snapshotOnly) {
                <span class="ml-1 text-xs text-muted-foreground" data-test="passport-snapshot-only">(снимок)</span>
              }
            </dd>
          </div>
        }
      </dl>

      @if (preview().compositionSummary.length) {
        <div class="mt-4 overflow-x-auto" data-test="passport-composition-summary">
          <p class="text-sm font-medium mb-2">Состав (верхний уровень)</p>
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="text-left text-muted-foreground border-b hairline">
                <th class="py-1 pr-2">Поз.</th>
                <th class="py-1 pr-2">Обозначение</th>
                <th class="py-1 pr-2">Наименование</th>
                <th class="py-1 pr-2">Материал</th>
                <th class="py-1">Кол-во</th>
              </tr>
            </thead>
            <tbody>
              @for (row of preview().compositionSummary; track row.position) {
                <tr class="border-b hairline" [attr.data-test]="'passport-composition-row-' + row.position">
                  <td class="py-1 pr-2">{{ row.position }}</td>
                  <td class="py-1 pr-2">{{ row.designation }}</td>
                  <td class="py-1 pr-2">{{ row.name }}</td>
                  <td class="py-1 pr-2">{{ row.material }}</td>
                  <td class="py-1">{{ row.quantity }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <p class="mt-3 text-sm text-muted-foreground" data-test="passport-composition-empty">
          Состав не указан.
        </p>
      }
    </app-pi-form-section>
  `,
})
export class ProductPassportPreviewComponent implements OnInit {
  readonly product = input.required<ProductDetail>();
  readonly productId = input.required<string>();

  private readonly compositionService = inject(PiCompositionService);
  private readonly unitsService = inject(PiUnitsService);

  private readonly unitLabel = signal<string | null>(null);
  private readonly tree = signal<Awaited<ReturnType<typeof this.loadTree>>>(null);

  protected readonly preview = computed((): ProductPassportPreview =>
    buildProductPassportPreview({
      product: this.product(),
      tree: this.tree(),
      unitLabel: this.unitLabel(),
    }),
  );

  ngOnInit(): void {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    const [tree, unitLabel] = await Promise.all([this.loadTree(), this.loadUnitLabel(this.product().unit)]);
    this.tree.set(tree);
    this.unitLabel.set(unitLabel);
  }

  private async loadTree() {
    const res = await firstValueFrom(this.compositionService.getProductTree(this.productId()));
    return res.ok ? res.data : null;
  }

  private async loadUnitLabel(unitKey: string | undefined): Promise<string | null> {
    const key = unitKey?.trim();
    if (!key) return null;
    const res = await firstValueFrom(this.unitsService.list({ limit: 100, isActive: true }));
    if (!res.ok) return null;
    const match = res.data.items.find((u) => u.key === key);
    return match?.label ?? null;
  }
}
