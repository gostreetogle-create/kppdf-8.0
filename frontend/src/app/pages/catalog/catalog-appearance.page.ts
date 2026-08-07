import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { PiAccentHueFieldComponent } from '../../shared/ui/accent-hue/pi-accent-hue-field.component';
import { CATALOG_SECTION_CHIPS } from './catalog-group-chips';
import {
  CATALOG_KIND_DEFAULT_HUES,
  CatalogKindPalette,
  catalogKindOklch,
  catalogKindWash,
} from '../../shared/ui/catalog/catalog-kind-oklch';
import {
  CatalogAppearanceService,
  CatalogAppearanceValue,
} from '../../shared/ui/catalog/catalog-appearance.service';
import { extractErrorMessage } from '../../core/silent-http';
import { PiToastService } from '../../shared/ui/toast';

interface KindRow {
  key: 'productHue' | 'moduleHue' | 'materialHue' | 'materialRawHue';
  kind: 'product' | 'module' | 'material';
  materialKind?: 'raw';
  label: string;
  hint: string;
}

@Component({
  selector: 'app-catalog-appearance-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    PiGroupWorkspaceComponent,
    PiAccentHueFieldComponent,
  ],
  template: `
    <app-pi-group-workspace pathLabel="Каталог" [chips]="chips" activeId="catalog-appearance">
      <div class="space-y-5 max-w-4xl" data-test="catalog-appearance-page">
        <header class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="eyebrow text-muted-foreground mb-1">Оформление каталога</p>
            <h1 class="font-display text-2xl tracking-tight m-0">Цвета типов</h1>
            <p class="text-sm text-muted-foreground mt-1 max-w-2xl">
              Единая легенда для дерева состава, списков и инспектора. Это UI-цвета типов, не RAL и
              не цвет покраски изделия.
            </p>
          </div>
          <a
            routerLink="/dictionaries/color-references"
            class="text-xs text-muted-foreground underline hover:text-ink pi-focus-ring"
          >
            Открыть справочник RAL →
          </a>
        </header>

        @if (loadError()) {
          <p class="text-sm text-muted-foreground" role="status" data-test="load-hint">
            Сохранённых пресетов пока нет — используются стандартные цвета.
          </p>
        }

        <form [formGroup]="form" data-test="catalog-appearance-form">
          <section class="hairline rounded-sm bg-paper">
            <div class="px-4 py-3 hairline-b bg-paper-2/50">
              <h2 class="font-display text-base m-0">Палитра легенды</h2>
              <p class="text-xs text-muted-foreground mt-1 m-0">
                Выберите готовый оттенок. Свободный ввод не нужен: палитра остаётся спокойной и
                читаемой в обеих темах.
              </p>
            </div>
            <div class="divide-y hairline">
              @for (row of rows; track row.key) {
                <div
                  class="grid grid-cols-1 md:grid-cols-[minmax(12rem,1fr)_auto_minmax(12rem,1fr)] items-center gap-4 px-4 py-4"
                >
                  <div>
                    <p class="font-medium text-sm m-0">{{ row.label }}</p>
                    <p class="text-xs text-muted-foreground mt-1 m-0">{{ row.hint }}</p>
                  </div>
                  <app-pi-accent-hue-field
                    [label]="row.label"
                    [value]="form.controls[row.key].value"
                    [presets]="huePresets"
                    [dataTest]="'hue-' + row.key"
                    (valueChange)="form.controls[row.key].setValue($event)"
                  />
                  <div
                    class="h-12 rounded-sm hairline flex items-center gap-2 px-3"
                    [style.background]="wash(row)"
                    [attr.data-test]="'preview-' + row.key"
                  >
                    <span
                      class="w-3 h-3 rounded-full shrink-0"
                      [style.background]="accent(row)"
                      aria-hidden="true"
                    ></span>
                    <span class="text-sm font-medium">{{ row.label }}</span>
                    <span class="text-xs text-muted-foreground ml-auto">пример строки</span>
                  </div>
                </div>
              }
            </div>
          </section>
        </form>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-xs text-muted-foreground m-0">
            Изменения применятся к дереву состава после сохранения и следующей загрузки карточки.
          </p>
          <div class="flex gap-2">
            <app-pi-button
              variant="ghost"
              type="button"
              (click)="reset()"
              [disabled]="saving()"
              data-test="reset-button"
            >
              Сбросить
            </app-pi-button>
            <app-pi-button
              variant="default"
              type="button"
              [disabled]="form.invalid || saving()"
              (click)="onSubmit()"
              data-test="save-button"
            >
              {{ saving() ? 'Сохранение…' : 'Сохранить палитру' }}
            </app-pi-button>
          </div>
        </div>

        @if (error()) {
          <p class="text-sm text-destructive" role="alert">{{ error() }}</p>
        }
      </div>
    </app-pi-group-workspace>
  `,
})
export class CatalogAppearancePage implements OnInit {
  protected readonly chips = [
    ...CATALOG_SECTION_CHIPS,
    { id: 'catalog-appearance', label: 'Оформление', route: '/catalog/appearance' },
  ] as const;
  protected readonly rows: readonly KindRow[] = [
    { key: 'productHue', kind: 'product', label: 'Изделие', hint: 'Товар и комплекс в составе' },
    { key: 'moduleHue', kind: 'module', label: 'Модуль', hint: 'Узел, который можно раскрыть' },
    {
      key: 'materialHue',
      kind: 'material',
      label: 'Материал / деталь',
      hint: 'Деталь, метиз или покупное',
    },
    {
      key: 'materialRawHue',
      kind: 'material',
      materialKind: 'raw',
      label: 'Сырьё',
      hint: 'Материал внутри модуля',
    },
  ];
  protected readonly huePresets = [30, 85, 145, 200, 250, 300, 340] as const;
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly loadError = signal(false);

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly appearance = inject(CatalogAppearanceService);
  private readonly toast = inject(PiToastService);

  protected readonly form = this.fb.group({
    productHue: this.fb.control<number | null>(CATALOG_KIND_DEFAULT_HUES.product, [
      Validators.min(0),
      Validators.max(359),
    ]),
    moduleHue: this.fb.control<number | null>(CATALOG_KIND_DEFAULT_HUES.module, [
      Validators.min(0),
      Validators.max(359),
    ]),
    materialHue: this.fb.control<number | null>(CATALOG_KIND_DEFAULT_HUES.material, [
      Validators.min(0),
      Validators.max(359),
    ]),
    materialRawHue: this.fb.control<number | null>(CATALOG_KIND_DEFAULT_HUES.materialRaw, [
      Validators.min(0),
      Validators.max(359),
    ]),
  });

  ngOnInit(): void {
    const request = this.appearance.load();
    request?.subscribe((result) => {
      if (result.ok && result.data.value) {
        const value = result.data.value;
        this.form.patchValue({
          productHue: value.productHue ?? CATALOG_KIND_DEFAULT_HUES.product,
          moduleHue: value.moduleHue ?? CATALOG_KIND_DEFAULT_HUES.module,
          materialHue: value.materialHue ?? CATALOG_KIND_DEFAULT_HUES.material,
          materialRawHue: value.materialRawHue ?? CATALOG_KIND_DEFAULT_HUES.materialRaw,
        });
      } else if (!result.ok) {
        this.loadError.set(true);
      }
    });
  }

  protected accent(row: KindRow): string {
    return catalogKindOklch(row.kind, row.materialKind, 0.12, 0.62, this.previewPalette());
  }

  protected wash(row: KindRow): string {
    return catalogKindWash(row.kind, row.materialKind, this.previewPalette());
  }

  private previewPalette(): CatalogKindPalette {
    const value = this.form.getRawValue();
    return {
      product: value.productHue ?? CATALOG_KIND_DEFAULT_HUES.product,
      module: value.moduleHue ?? CATALOG_KIND_DEFAULT_HUES.module,
      material: value.materialHue ?? CATALOG_KIND_DEFAULT_HUES.material,
      materialRaw: value.materialRawHue ?? CATALOG_KIND_DEFAULT_HUES.materialRaw,
    };
  }

  protected reset(): void {
    this.form.reset({
      productHue: CATALOG_KIND_DEFAULT_HUES.product,
      moduleHue: CATALOG_KIND_DEFAULT_HUES.module,
      materialHue: CATALOG_KIND_DEFAULT_HUES.material,
      materialRawHue: CATALOG_KIND_DEFAULT_HUES.materialRaw,
    });
    this.appearance.resetToDefaults();
  }

  protected onSubmit(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const value = this.form.getRawValue() as CatalogAppearanceValue;
    this.appearance.save(value).subscribe((result) => {
      this.saving.set(false);
      if (result.ok) {
        this.toast.success('Оформление каталога сохранено');
      } else {
        const message = extractErrorMessage(result.error);
        this.error.set(message);
        this.toast.error(message);
      }
    });
  }
}
