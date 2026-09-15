import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Order } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';

/**
 * TZ-NX-SUPPLY-PAGES-RESIDUAL-THIN — extracted from `SupplyPage`'s inline
 * create-form (explode-from-order + manual create). Pure presentational:
 * `SupplyFacade`'s `explodeOrderId`/`createOrderId`/`createTitle`/`createQty`
 * are plain mutable fields (not signals), so the page still owns the actual
 * read/write — this component only renders + emits change events, same
 * value flow as the original inline `[(ngModel)]` bindings.
 */
@Component({
  selector: 'pi-supply-create-form',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      class="pi-dashed-panel p-4 flex flex-col gap-3 mb-4"
      data-test="supply-create-form"
      (submit)="create.emit($event)"
    >
      <p class="text-sm text-muted-foreground m-0">
        Выберите заказ, чтобы создать задачи снабжения из его состава.
      </p>
      <div class="flex flex-wrap gap-3 items-end">
        <label class="flex flex-col gap-1 text-xs min-w-[12rem] flex-1">
          <span class="text-muted-foreground">Разнести состав заказа</span>
          <select
            class="pi-input"
            name="explodeOrderId"
            data-test="supply-explode-order"
            [value]="explodeOrderId()"
            (change)="explodeOrderIdChange.emit(selectValue($event))"
          >
            <option value="">Выберите заказ…</option>
            @for (o of orders(); track o._id) {
              <option [value]="o._id">{{ o.number }}</option>
            }
          </select>
        </label>
        <app-pi-button
          type="button"
          variant="secondary"
          (click)="explode.emit()"
          [disabled]="exploding() || !explodeOrderId()"
          data-test="supply-explode-submit"
        >
          Создать из заказа
        </app-pi-button>
      </div>
      <div class="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
        <span class="h-px bg-border flex-1"></span>
        <span>или вручную</span>
        <span class="h-px bg-border flex-1"></span>
      </div>
      <div class="flex flex-wrap gap-3 items-end">
        <label class="flex flex-col gap-1 text-xs min-w-[12rem] flex-1">
          <span class="text-muted-foreground">Заказ</span>
          <select
            class="pi-input"
            name="orderId"
            data-test="supply-create-order"
            [value]="createOrderId()"
            (change)="createOrderIdChange.emit(selectValue($event))"
          >
            <option value="">Выберите заказ…</option>
            @for (o of orders(); track o._id) {
              <option [value]="o._id">{{ o.number }}</option>
            }
          </select>
        </label>
        <label class="flex flex-col gap-1 text-xs min-w-[10rem] flex-1">
          <span class="text-muted-foreground">Что закупить</span>
          <input
            class="pi-input"
            name="title"
            maxlength="256"
            placeholder="Материал / модуль"
            data-test="supply-create-title"
            [value]="createTitle()"
            (input)="createTitleChange.emit(inputValue($event))"
          />
        </label>
        <label class="flex flex-col gap-1 text-xs w-24">
          <span class="text-muted-foreground">Кол-во</span>
          <input
            class="pi-input"
            type="number"
            min="0"
            step="any"
            name="qty"
            data-test="supply-create-qty"
            [value]="createQty()"
            (input)="onQtyInput($event)"
          />
        </label>
        <app-pi-button
          type="submit"
          variant="default"
          [disabled]="creating()"
          data-test="supply-create-submit"
        >
          Создать
        </app-pi-button>
      </div>
    </form>
  `,
})
export class SupplyCreateFormComponent {
  readonly orders = input<readonly Order[]>([]);
  readonly exploding = input(false);
  readonly creating = input(false);
  readonly explodeOrderId = input('');
  readonly createOrderId = input('');
  readonly createTitle = input('');
  readonly createQty = input(1);

  readonly explodeOrderIdChange = output<string>();
  readonly createOrderIdChange = output<string>();
  readonly createTitleChange = output<string>();
  readonly createQtyChange = output<number>();
  readonly explode = output<void>();
  readonly create = output<Event>();

  protected selectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  protected inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected onQtyInput(event: Event): void {
    this.createQtyChange.emit(Number((event.target as HTMLInputElement).value));
  }
}
