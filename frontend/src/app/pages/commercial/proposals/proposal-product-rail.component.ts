import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { Product, ProductsService } from '../../../shared/services/products.service';
import { extractErrorMessage } from '../../../core/silent-http';

export interface ProposalDraftLine {
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
}

/**
 * Thin left catalog rail for Create KP (TZ-SALES-314).
 * Emits products to add; parent owns in-memory draft.
 */
@Component({
  selector: 'app-proposal-product-rail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent],
  template: `
    <div class="rail" data-test="kp-product-rail">
      <label class="rail__search">
        <span class="eyebrow">Поиск изделий</span>
        <input
          type="search"
          class="pi-input w-full"
          placeholder="Название или артикул…"
          [ngModel]="query()"
          (ngModelChange)="onQuery($event)"
          data-test="kp-rail-search"
          aria-label="Поиск изделий"
        />
      </label>

      @if (loading()) {
        <p class="text-sm text-muted-foreground m-0" data-test="kp-rail-loading">Загрузка…</p>
      } @else if (error()) {
        <p class="text-sm text-destructive m-0" role="alert">{{ error() }}</p>
      } @else if (products().length === 0) {
        <p class="text-sm text-muted-foreground m-0" data-test="kp-rail-empty">
          {{ emptyHint() }}
        </p>
      } @else {
        <ul class="rail__list" data-test="kp-rail-list">
          @for (product of products(); track product._id) {
            <li class="rail__item">
              <div class="rail__meta">
                <span class="rail__name">{{ product.name }}</span>
                @if (product.sku) {
                  <span class="rail__sku">{{ product.sku }}</span>
                }
              </div>
              <app-pi-button
                type="button"
                variant="outline"
                size="sm"
                [attr.data-test]="'kp-rail-add-' + product._id"
                [attr.aria-label]="'Добавить ' + product.name"
                (click)="addProduct(product)"
              >
                Добавить
              </app-pi-button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    .rail {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 0;
      height: 100%;
    }
    .rail__search {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .rail__list {
      list-style: none;
      margin: 0;
      padding: 0;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
      min-height: 0;
    }
    .rail__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.5rem;
      border: 1px solid var(--color-rule);
    }
    .rail__meta {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }
    .rail__name {
      font-size: 0.875rem;
      color: var(--color-ink);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .rail__sku {
      font-size: 0.6875rem;
      font-family: ui-monospace, monospace;
      color: var(--color-muted-foreground, #6b7280);
    }
  `,
})
export class ProposalProductRailComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly destroyRef = inject(DestroyRef);

  /** Optional parent-driven reload token. */
  readonly reloadToken = input(0);
  readonly productAdd = output<ProposalDraftLine>();

  protected readonly query = signal('');
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.load('');
  }

  protected emptyHint(): string {
    return this.query().trim() ? 'Ничего не найдено' : 'Выберите изделие — оно попадёт в КП';
  }

  protected onQuery(value: string): void {
    this.query.set(value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.load(value), 250);
  }

  protected addProduct(product: Product): void {
    this.productAdd.emit({
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      quantity: 1,
      unit: product.unit,
      unitPrice: product.listPrice ?? 0,
    });
  }

  private load(search: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.productsService
      .list({ limit: 30, search: search.trim() || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.loading.set(false);
        if (!res.ok) {
          this.products.set([]);
          this.error.set(extractErrorMessage(res.error));
          return;
        }
        this.products.set(res.data.items ?? []);
      });
  }
}
