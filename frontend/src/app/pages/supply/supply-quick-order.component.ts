import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA } from '../../shared/ui/dialog/dialog.tokens';
import { PiOverflowSelectComponent } from '../../shared/ui/overflow-select/pi-overflow-select.component';
import { CategoriesService } from '../../shared/services/categories.service';
import { MaterialsService, type Material } from '../../shared/services/materials.service';
import {
  OrganizationsService,
  type Organization,
  type OrganizationContact,
} from '../../shared/services/organizations.service';
import { PersonsService, type Person } from '../../shared/services/pi-persons.service';
import {
  SupplyRequestsService,
  type CreateSupplyRequestDto,
  type SupplyRequest,
} from '../../shared/services/supply-requests.service';
import { PhotosService } from '../../shared/services/photos.service';
import { formatDate } from '../../shared/util/format';
import {
  MOCK_CATEGORIES,
  MOCK_COMPANIES,
  MOCK_MATERIALS,
  MOCK_SUPPLIERS,
  MOCK_SUPPLIER_CONTACTS,
  QUICK_ORDER_CONTACT_POSITION,
  QUICK_ORDER_PRIORITIES,
  QUICK_ORDER_REQUESTED_BY,
  QUICK_ORDER_STATUSES,
  QUICK_ORDER_UNITS,
  contactLabel,
  contactsForSupplier,
  createEmptyQuickOrderRow,
  createQuickOrderSeedRows,
  materialColorOptions,
  materialLabel,
  materialMainPhoto as findMainPhoto,
  materialsForCategory,
  priorityIcon,
  priorityLabel,
  prioritySortWeight,
  statusLabel,
  suppliersForCategory,
  type QuickOrderCategory,
  type QuickOrderMaterial,
  type QuickOrderMaterialPhoto,
  type QuickOrderPriority,
  type QuickOrderStatus,
  type QuickOrderSupplier,
  type QuickOrderSupplierContact,
  type SupplyQuickOrderRow,
} from './supply-quick-order.mock';

interface SupplyQuickOrderDialogData {
  template: TemplateRef<unknown>;
  title: string;
}

/**
 * Dialog shell for the five quick-order create panels. The content remains a
 * parent-owned TemplateRef so existing signals, handlers and scoped styles
 * stay unchanged; PiDialogService owns focus, Escape and backdrop lifecycle.
 */
@Component({
  selector: 'app-supply-quick-order-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, PiDialogComponent],
  template: `
    <app-pi-dialog [title]="data.title" [width]="'lg'" variant="form">
      <ng-container body [ngTemplateOutlet]="data.template" />
    </app-pi-dialog>
  `,
})
class SupplyQuickOrderDialogComponent {
  protected readonly data = inject<SupplyQuickOrderDialogData>(PI_DIALOG_DATA);
}

@Component({
  selector: 'app-supply-quick-order',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, PiOverflowSelectComponent],
  template: `
    <ng-template #toolbarTemplate>
      <div
        class="flex items-center gap-form-field flex-wrap w-full"
        data-test="supply-quick-toolbar"
      >
        <input
          class="pi-input w-44 min-w-[10rem]"
          type="search"
          placeholder="Поиск…"
          [ngModel]="searchQuery()"
          (ngModelChange)="searchQuery.set($event)"
          aria-label="Поиск заявок"
          data-test="supply-quick-search"
        />
        <select
          class="pi-input w-40"
          [ngModel]="statusFilter()"
          (ngModelChange)="onStatusFilter($event)"
          aria-label="Фильтр по статусу"
          data-test="supply-quick-status-filter"
        >
          <option value="">Все статусы</option>
          @for (s of statuses; track s.value) {
            <option [value]="s.value">{{ s.label }}</option>
          }
        </select>
        <select
          class="pi-input w-36"
          [ngModel]="priorityFilter()"
          (ngModelChange)="onPriorityFilter($event)"
          aria-label="Фильтр по приоритету"
          data-test="supply-quick-priority-filter"
        >
          <option value="">Все приоритеты</option>
          @for (p of priorities; track p.value) {
            <option [value]="p.value">{{ p.label }}</option>
          }
        </select>
        <span class="text-sm text-muted-foreground" data-test="supply-quick-count">
          {{ visibleRows().length }} заявок
        </span>
        <span class="flex-1"></span>
        <app-pi-button
          variant="default"
          size="sm"
          (click)="onCreate()"
          data-test="supply-quick-create"
        >
          + Создать
        </app-pi-button>
      </div>
    </ng-template>

    <div
      class="supply-quick-order flex flex-col gap-3 w-full min-w-0"
      data-test="supply-quick-order"
    >
      @if (visibleRows().length === 0) {
        <p class="text-sm text-muted-foreground m-0" data-test="supply-quick-empty">
          Нет заявок. Нажмите «+ Создать» — первая строка откроется сразу.
        </p>
      } @else {
        <div
          class="supply-quick-order__table-head"
          aria-hidden="true"
          data-test="supply-quick-table-head"
        >
          <span
            class="supply-quick-order__table-head-cell supply-quick-order__table-head-cell--exp"
          >
            Вид
          </span>
          <span class="supply-quick-order__table-head-cell">Дата</span>
          <span
            class="supply-quick-order__table-head-cell supply-quick-order__table-head-cell--material"
          >
            Материал
          </span>
          <span
            class="supply-quick-order__table-head-cell supply-quick-order__table-head-cell--center"
          >
            Статус
          </span>
          <span
            class="supply-quick-order__table-head-cell supply-quick-order__table-head-cell--center"
          >
            Приоритет
          </span>
          <span
            class="supply-quick-order__table-head-cell supply-quick-order__table-head-cell--center"
          >
            Действия
          </span>
        </div>
      }

      @for (row of visibleRows(); track row.id) {
        <div class="supply-quick-order__item" [attr.data-test]="'supply-quick-tile-' + row.id">
          <div
            class="supply-quick-order__head"
            [class.supply-quick-order__head--expanded]="expandedId() === row.id"
          >
            <button
              type="button"
              class="supply-quick-order__summary"
              [attr.aria-expanded]="expandedId() === row.id"
              [attr.data-test]="'supply-quick-tile-toggle-' + row.id"
              (click)="toggleExpand(row.id)"
            >
              <span class="supply-quick-order__disclosure" aria-hidden="true">
                {{ expandedId() === row.id ? '▾' : '▸' }}
              </span>
              <span class="supply-quick-order__summary-text">
                <span
                  class="supply-quick-order__summary-cell supply-quick-order__summary-cell--date"
                >
                  {{ fmtDay(row.createdAt) }}
                </span>
                <span
                  class="supply-quick-order__summary-cell supply-quick-order__summary-cell--material"
                >
                  @if (materialMainPhoto(row.materialId); as photo) {
                    <span
                      class="supply-quick-order__thumb supply-quick-order__thumb--summary"
                      [attr.title]="'Главное фото: ' + photo.label"
                      aria-hidden="true"
                    >
                      @if (photo.storageUrl) {
                        <img
                          class="supply-quick-order__thumb-image"
                          [src]="photo.thumbnailUrl || photo.storageUrl"
                          [alt]="photo.label"
                        />
                      } @else {
                        <span class="supply-quick-order__thumb-swatch"></span>
                      }
                    </span>
                  }
                  <span class="supply-quick-order__material-name">
                    {{ materialName(row.materialId) }}
                  </span>
                </span>
                <span
                  class="supply-quick-order__summary-cell supply-quick-order__summary-cell--status"
                >
                  <span
                    class="supply-quick-order__status-badge"
                    [attr.data-status]="row.status"
                    data-test="supply-quick-status-badge"
                  >
                    {{ statusLabel(row.status) }}
                  </span>
                </span>
                <span
                  class="supply-quick-order__summary-cell supply-quick-order__summary-cell--priority"
                >
                  <span
                    class="supply-quick-order__priority"
                    [class.supply-quick-order__priority--urgent]="row.priority === 'urgent'"
                    [class.supply-quick-order__priority--low]="row.priority === 'low'"
                  >
                    {{ priorityIcon(row.priority) }} {{ priorityLabel(row.priority) }}
                  </span>
                </span>
              </span>
            </button>
            @if (expandedId() === row.id) {
              <button
                type="button"
                class="supply-quick-order__delete"
                (click)="onDelete(row.id)"
                data-test="supply-quick-delete"
              >
                Удалить
              </button>
            } @else {
              <span class="supply-quick-order__delete-slot" aria-hidden="true"></span>
            }
          </div>

          @if (expandedId() === row.id) {
            <div class="supply-quick-order__expanded" data-test="supply-quick-tile-expanded">
              <div class="supply-quick-order__strips">
                <div class="supply-quick-order__strip supply-quick-order__strip--what">
                  <span class="supply-quick-order__strip-label">Позиция</span>
                  <div class="supply-quick-order__fields">
                    <div
                      class="supply-quick-order__subgroup supply-quick-order__subgroup--category"
                    >
                      <span class="supply-quick-order__subgroup-label">Категория</span>
                      <div class="supply-quick-order__subgroup-fields">
                        <label
                          class="supply-quick-order__field supply-quick-order__field--category"
                        >
                          <app-pi-overflow-select
                            [items]="categoryOptions()"
                            [value]="row.categoryId"
                            (valueChange)="onCategoryChange(row.id, $event)"
                            searchable="auto"
                            placeholder="—"
                            ariaLabel="Категория"
                            dataTest="supply-quick-category-select"
                          />
                        </label>
                        <button
                          type="button"
                          class="supply-quick-order__add-btn"
                          (click)="openNewCategory(row.id)"
                          title="Новая категория"
                          aria-label="Новая категория"
                          data-test="supply-quick-category-add"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div
                      class="supply-quick-order__subgroup supply-quick-order__subgroup--material"
                    >
                      <span class="supply-quick-order__subgroup-label">Материал</span>
                      <div class="supply-quick-order__subgroup-fields">
                        <label class="supply-quick-order__field supply-quick-order__field--grow">
                          <app-pi-overflow-select
                            [items]="materialOptions(row.categoryId)"
                            [value]="row.materialId ?? ''"
                            (valueChange)="onMaterialChange(row.id, $event)"
                            [disabled]="!row.categoryId"
                            searchable="auto"
                            [placeholder]="
                              row.categoryId ? '— выберите материал —' : '— сначала категория —'
                            "
                            ariaLabel="Материал"
                            dataTest="supply-quick-material-select"
                          />
                        </label>
                        <button
                          type="button"
                          class="supply-quick-order__add-btn"
                          (click)="openNewMaterial(row.id, row.categoryId)"
                          [disabled]="!row.categoryId"
                          [title]="row.categoryId ? 'Новый материал' : '— сначала категория —'"
                          aria-label="Новый материал"
                          data-test="supply-quick-material-add"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          class="supply-quick-order__mini-btn"
                          (click)="openEditMaterial(row.id, row.materialId)"
                          [disabled]="!row.materialId"
                          title="Редактировать материал"
                          aria-label="Редактировать материал"
                          data-test="supply-quick-material-edit"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          class="supply-quick-order__mini-btn"
                          (click)="openCopyMaterial(row.id, row.materialId)"
                          [disabled]="!row.materialId"
                          title="Копировать материал"
                          aria-label="Копировать материал"
                          data-test="supply-quick-material-copy"
                        >
                          ⧉
                        </button>
                        <label
                          class="supply-quick-order__field supply-quick-order__field--grow supply-quick-order__field--link"
                        >
                          <span class="supply-quick-order__field-label">Ссылка на товар</span>
                          <input
                            class="pi-input"
                            [ngModel]="row.productUrl"
                            (ngModelChange)="patchRow(row.id, { productUrl: $event })"
                            placeholder="https://…"
                            data-test="supply-quick-product-url"
                          />
                        </label>
                        <div class="supply-quick-order__field supply-quick-order__field--article">
                          <span class="supply-quick-order__field-label">Артикул</span>
                          <span
                            class="supply-quick-order__readonly supply-quick-order__readonly--truncate"
                            [attr.title]="materialArticle(row.materialId) || null"
                            data-test="supply-quick-material-article"
                          >
                            {{ materialArticle(row.materialId) || '—' }}
                          </span>
                        </div>
                        <div class="supply-quick-order__field supply-quick-order__field--color">
                          <span class="supply-quick-order__field-label">Цвет</span>
                          <div class="supply-quick-order__combo">
                            <select
                              class="pi-input"
                              [ngModel]="row.color ?? ''"
                              (ngModelChange)="onColorChange(row.id, $event)"
                              [disabled]="!row.materialId"
                              aria-label="Цвет"
                              data-test="supply-quick-material-color"
                            >
                              <option value="">—</option>
                              @for (c of materialColors(row.materialId); track c) {
                                <option [value]="c">{{ c }}</option>
                              }
                            </select>
                            <button
                              type="button"
                              class="supply-quick-order__add-btn"
                              (click)="openNewColor(row.id, row.materialId)"
                              [disabled]="!row.materialId"
                              title="Новый цвет"
                              aria-label="Новый цвет"
                              data-test="supply-quick-color-add"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      class="supply-quick-order__subgroup supply-quick-order__subgroup--quantity"
                    >
                      <span class="supply-quick-order__subgroup-label">Количество</span>
                      <div class="supply-quick-order__subgroup-fields">
                        <label class="supply-quick-order__field supply-quick-order__field--qty">
                          <span class="supply-quick-order__field-label">Кол-во *</span>
                          <input
                            class="pi-input"
                            type="number"
                            min="0"
                            step="any"
                            [ngModel]="row.qty"
                            (ngModelChange)="patchRow(row.id, { qty: +$event })"
                          />
                        </label>
                        <label class="supply-quick-order__field supply-quick-order__field--unit">
                          <span class="supply-quick-order__field-label">Ед. изм. *</span>
                          <select
                            class="pi-input"
                            [ngModel]="row.unit"
                            (ngModelChange)="patchRow(row.id, { unit: $event })"
                          >
                            @for (u of units; track u) {
                              <option [value]="u">{{ u }}</option>
                            }
                          </select>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  class="supply-quick-order__more-toggle"
                  [attr.aria-expanded]="whereExpanded()"
                  (click)="whereExpanded.set(!whereExpanded())"
                  data-test="supply-quick-where-toggle"
                >
                  {{ whereExpanded() ? '▾' : '▸' }} Поставщик
                </button>

                @if (whereExpanded()) {
                  <div class="supply-quick-order__strip supply-quick-order__strip--where">
                    <span class="supply-quick-order__strip-label">Поставщик</span>
                    <div class="supply-quick-order__fields">
                      <div
                        class="supply-quick-order__subgroup supply-quick-order__subgroup--supplier"
                      >
                        <span class="supply-quick-order__subgroup-label">Организация</span>
                        <div class="supply-quick-order__subgroup-fields">
                          <label class="supply-quick-order__field supply-quick-order__field--grow">
                            <app-pi-overflow-select
                              [items]="supplierOptions(row.categoryId)"
                              [value]="row.supplierId ?? ''"
                              (valueChange)="onSupplierChange(row.id, $event)"
                              [disabled]="!row.categoryId"
                              searchable="auto"
                              [placeholder]="row.categoryId ? '—' : '— сначала категория —'"
                              ariaLabel="Поставщик"
                              dataTest="supply-quick-supplier-select"
                            />
                          </label>
                          <button
                            type="button"
                            class="supply-quick-order__add-btn"
                            (click)="openNewSupplier(row.id)"
                            [disabled]="!row.categoryId"
                            [title]="row.categoryId ? 'Новый поставщик' : '— сначала категория —'"
                            aria-label="Новый поставщик"
                            data-test="supply-quick-supplier-add"
                          >
                            +
                          </button>
                          <label class="supply-quick-order__field supply-quick-order__field--site">
                            <span class="supply-quick-order__field-label">Сайт</span>
                            <input
                              class="pi-input"
                              [ngModel]="supplierWebsite(row.supplierId)"
                              (ngModelChange)="patchSupplier(row.supplierId, { website: $event })"
                              [disabled]="!row.supplierId"
                              placeholder="https://…"
                              data-test="supply-quick-supplier-website"
                            />
                          </label>
                          <label class="supply-quick-order__field supply-quick-order__field--email">
                            <span class="supply-quick-order__field-label">Почта поставщика</span>
                            <input
                              class="pi-input"
                              [ngModel]="supplierEmail(row.supplierId)"
                              (ngModelChange)="patchSupplier(row.supplierId, { email: $event })"
                              [disabled]="!row.supplierId"
                              placeholder="zakaz@…"
                              data-test="supply-quick-supplier-email"
                            />
                          </label>
                        </div>
                      </div>
                      <div
                        class="supply-quick-order__subgroup supply-quick-order__subgroup--manager"
                      >
                        <span class="supply-quick-order__subgroup-label">Контакт</span>
                        <div class="supply-quick-order__subgroup-fields">
                          <label
                            class="supply-quick-order__field supply-quick-order__field--manager"
                          >
                            <select
                              class="pi-input"
                              [ngModel]="row.supplierContactId ?? ''"
                              (ngModelChange)="
                                patchRow(row.id, { supplierContactId: $event || null })
                              "
                              [disabled]="!row.supplierId"
                              data-test="supply-quick-manager-select"
                            >
                              <option value="">
                                {{ row.supplierId ? '—' : '— сначала поставщик —' }}
                              </option>
                              @for (c of contactsFor(row.supplierId); track c.id) {
                                <option [value]="c.id">{{ contactLabel(c) }}</option>
                              }
                            </select>
                          </label>
                          <button
                            type="button"
                            class="supply-quick-order__add-btn"
                            (click)="openNewManager(row.id)"
                            [disabled]="!row.supplierId"
                            [title]="row.supplierId ? 'Новый менеджер' : '— сначала поставщик —'"
                            aria-label="Новый менеджер"
                            data-test="supply-quick-manager-add"
                          >
                            +
                          </button>
                          <label class="supply-quick-order__field supply-quick-order__field--phone">
                            <span class="supply-quick-order__field-label">Телефон менеджера</span>
                            <input
                              class="pi-input"
                              [ngModel]="contactPhone(row.supplierContactId)"
                              (ngModelChange)="
                                patchContact(row.supplierContactId, { phone: $event })
                              "
                              [disabled]="!row.supplierContactId"
                              placeholder="+7 …"
                              data-test="supply-quick-manager-phone"
                            />
                          </label>
                          <label class="supply-quick-order__field supply-quick-order__field--email">
                            <span class="supply-quick-order__field-label">Почта менеджера</span>
                            <input
                              class="pi-input"
                              [ngModel]="contactEmail(row.supplierContactId)"
                              (ngModelChange)="
                                patchContact(row.supplierContactId, { email: $event })
                              "
                              [disabled]="!row.supplierContactId"
                              placeholder="manager@…"
                              data-test="supply-quick-manager-email"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <button
                  type="button"
                  class="supply-quick-order__more-toggle"
                  [attr.aria-expanded]="detailsExpanded()"
                  (click)="detailsExpanded.set(!detailsExpanded())"
                  data-test="supply-quick-details-toggle"
                >
                  {{ detailsExpanded() ? '▾' : '▸' }} Детали и статус
                </button>

                @if (detailsExpanded()) {
                  <div class="supply-quick-order__strip supply-quick-order__strip--details">
                    <span class="supply-quick-order__strip-label">Детали и статус</span>
                    <div class="supply-quick-order__fields supply-quick-order__fields--details">
                      <div
                        class="supply-quick-order__subgroup supply-quick-order__subgroup--context"
                      >
                        <span class="supply-quick-order__subgroup-label">Контекст</span>
                        <div class="supply-quick-order__subgroup-fields">
                          <label
                            class="supply-quick-order__field supply-quick-order__field--company"
                          >
                            <span class="supply-quick-order__field-label">Наша компания</span>
                            <select
                              class="pi-input"
                              [ngModel]="row.companyId"
                              (ngModelChange)="patchRow(row.id, { companyId: $event })"
                            >
                              @for (c of companies; track c.id) {
                                <option [value]="c.id">{{ c.name }}</option>
                              }
                            </select>
                          </label>
                          <label class="supply-quick-order__field supply-quick-order__field--who">
                            <span class="supply-quick-order__field-label">Кто просил</span>
                            <select
                              class="pi-input"
                              [ngModel]="row.requestedBy"
                              (ngModelChange)="patchRow(row.id, { requestedBy: $event })"
                            >
                              @for (r of requestedBy; track r) {
                                <option [value]="r">{{ r }}</option>
                              }
                            </select>
                          </label>
                          <label class="supply-quick-order__field supply-quick-order__field--grow">
                            <span class="supply-quick-order__field-label">Связь с заказом</span>
                            <input
                              class="pi-input"
                              [ngModel]="row.orderId ?? ''"
                              (ngModelChange)="patchRow(row.id, { orderId: $event || null })"
                              placeholder="Необязательно"
                            />
                          </label>
                          <label class="supply-quick-order__field supply-quick-order__field--date">
                            <span class="supply-quick-order__field-label">Нужно к</span>
                            <input
                              class="pi-input"
                              type="date"
                              [ngModel]="row.neededBy"
                              (ngModelChange)="patchRow(row.id, { neededBy: $event })"
                            />
                          </label>
                        </div>
                      </div>
                      <div
                        class="supply-quick-order__subgroup supply-quick-order__subgroup--status"
                      >
                        <span class="supply-quick-order__subgroup-label">Статус</span>
                        <div class="supply-quick-order__subgroup-fields">
                          <label
                            class="supply-quick-order__field supply-quick-order__field--status"
                          >
                            <span class="supply-quick-order__field-label">Состояние</span>
                            <select
                              class="pi-input"
                              [ngModel]="row.status"
                              (ngModelChange)="onStatusChange(row.id, $event)"
                              data-test="supply-quick-status-select"
                            >
                              @for (s of statuses; track s.value) {
                                <option [value]="s.value">{{ s.label }}</option>
                              }
                            </select>
                          </label>
                          <label
                            class="supply-quick-order__field supply-quick-order__field--priority"
                          >
                            <span class="supply-quick-order__field-label">Приоритет</span>
                            <select
                              class="pi-input"
                              [ngModel]="row.priority"
                              (ngModelChange)="patchRow(row.id, { priority: $event })"
                              data-test="supply-quick-priority-select"
                            >
                              @for (p of priorities; track p.value) {
                                <option [value]="p.value">{{ p.label }}</option>
                              }
                            </select>
                          </label>
                        </div>
                      </div>
                      <label class="supply-quick-order__field supply-quick-order__field--grow">
                        <span class="supply-quick-order__field-label">Примечание</span>
                        <input
                          class="pi-input"
                          [ngModel]="row.notes"
                          (ngModelChange)="patchRow(row.id, { notes: $event })"
                          [attr.title]="row.notes || null"
                          placeholder="Одной строкой"
                        />
                      </label>
                    </div>
                  </div>
                }

                <button
                  type="button"
                  class="supply-quick-order__more-toggle"
                  [attr.aria-expanded]="moreExpanded()"
                  (click)="moreExpanded.set(!moreExpanded())"
                  data-test="supply-quick-more-toggle"
                >
                  {{ moreExpanded() ? '▾' : '▸' }} Ещё
                </button>

                @if (moreExpanded()) {
                  <div
                    class="supply-quick-order__strip supply-quick-order__strip--more"
                    data-test="supply-quick-more-panel"
                  >
                    <span class="supply-quick-order__strip-label">Ещё</span>
                    <div class="supply-quick-order__fields">
                      <label class="supply-quick-order__field supply-quick-order__field--money">
                        <span class="supply-quick-order__field-label">Ориентир. цена</span>
                        <input
                          class="pi-input"
                          type="number"
                          min="0"
                          step="any"
                          [ngModel]="row.priceHint"
                          (ngModelChange)="
                            patchRow(row.id, { priceHint: $event === '' ? null : +$event })
                          "
                        />
                      </label>
                      <label class="supply-quick-order__field supply-quick-order__field--money">
                        <span class="supply-quick-order__field-label">Сумма строки</span>
                        <input
                          class="pi-input"
                          type="number"
                          min="0"
                          step="any"
                          [ngModel]="row.lineTotal"
                          (ngModelChange)="
                            patchRow(row.id, { lineTotal: $event === '' ? null : +$event })
                          "
                        />
                      </label>
                      <label class="supply-quick-order__field supply-quick-order__field--date">
                        <span class="supply-quick-order__field-label">Заказ у поставщика</span>
                        <input
                          class="pi-input"
                          type="date"
                          [ngModel]="row.supplierOrderDate"
                          (ngModelChange)="patchRow(row.id, { supplierOrderDate: $event })"
                        />
                      </label>
                      <div class="supply-quick-order__field supply-quick-order__field--grow">
                        <span class="supply-quick-order__field-label">Ответственный</span>
                        <span class="supply-quick-order__readonly">{{ row.responsible }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <ng-template #supplyQuickOrderModal>
        <div data-test="supply-quick-modal">
          @if (showNewColor()) {
            <div class="supply-quick-order__panel" data-test="supply-quick-color-panel">
              <label class="supply-quick-order__field supply-quick-order__field--grow">
                <span class="supply-quick-order__field-label">Новый цвет</span>
                <input
                  class="pi-input"
                  [ngModel]="newColorName()"
                  (ngModelChange)="newColorName.set($event)"
                  data-test="supply-quick-color-name"
                />
              </label>
              <div class="supply-quick-order__modal-actions">
                <app-pi-button
                  variant="default"
                  size="sm"
                  (click)="saveNewColor(activeRowId()!)"
                  data-test="supply-quick-color-save"
                >
                  Сохранить
                </app-pi-button>
                <app-pi-button variant="outline" size="sm" (click)="cancelNewColor()">
                  Отмена
                </app-pi-button>
              </div>
            </div>
          }

          @if (showNewCategory()) {
            <div class="supply-quick-order__panel" data-test="supply-quick-category-panel">
              <label class="supply-quick-order__field supply-quick-order__field--grow">
                <span class="supply-quick-order__field-label">Название *</span>
                <input
                  class="pi-input"
                  [ngModel]="newCategoryName()"
                  (ngModelChange)="newCategoryName.set($event)"
                  maxlength="256"
                  data-test="supply-quick-category-name"
                />
              </label>
              <div class="supply-quick-order__modal-actions">
                <app-pi-button
                  variant="default"
                  size="sm"
                  (click)="saveNewCategory(activeRowId()!)"
                  data-test="supply-quick-category-save"
                >
                  Сохранить
                </app-pi-button>
                <app-pi-button variant="outline" size="sm" (click)="cancelNewCategory()">
                  Отмена
                </app-pi-button>
              </div>
            </div>
          }

          @if (showNewMaterial()) {
            <div class="supply-quick-order__panel" data-test="supply-quick-material-panel">
              <label class="supply-quick-order__field supply-quick-order__field--grow">
                <span class="supply-quick-order__field-label">Название *</span>
                <input
                  class="pi-input"
                  [ngModel]="newMaterialName()"
                  (ngModelChange)="newMaterialName.set($event)"
                  maxlength="256"
                  data-test="supply-quick-material-name"
                />
              </label>
              <label class="supply-quick-order__field supply-quick-order__field--article">
                <span class="supply-quick-order__field-label">Артикул</span>
                <input
                  class="pi-input"
                  [ngModel]="newMaterialArticle()"
                  (ngModelChange)="newMaterialArticle.set($event)"
                />
              </label>
              <label class="supply-quick-order__field supply-quick-order__field--color">
                <span class="supply-quick-order__field-label">Цвет</span>
                <input
                  class="pi-input"
                  [ngModel]="newMaterialColor()"
                  (ngModelChange)="newMaterialColor.set($event)"
                />
              </label>
              <label class="supply-quick-order__field supply-quick-order__field--unit">
                <span class="supply-quick-order__field-label">Ед. изм.</span>
                <select
                  class="pi-input"
                  [ngModel]="newMaterialUnit()"
                  (ngModelChange)="newMaterialUnit.set($event)"
                >
                  @for (u of units; track u) {
                    <option [value]="u">{{ u }}</option>
                  }
                </select>
              </label>
              <div class="supply-quick-order__field supply-quick-order__field--photo">
                <span class="supply-quick-order__field-label">Фото</span>
                <div class="supply-quick-order__photo" data-test="supply-quick-photo-stub">
                  <input
                    #materialPhotoInput
                    class="supply-quick-order__file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    (change)="onMaterialPhotoFiles($event)"
                    data-test="supply-quick-material-photo-input"
                  />
                  @for (p of editingPhotos(); track p.id) {
                    <button
                      type="button"
                      class="supply-quick-order__photo-thumb"
                      [class.supply-quick-order__photo-thumb--main]="editingMainPhotoId() === p.id"
                      [attr.title]="
                        editingMainPhotoId() === p.id ? 'Главное фото' : 'Сделать главным'
                      "
                      [attr.aria-label]="
                        editingMainPhotoId() === p.id
                          ? 'Главное фото: ' + p.label
                          : 'Сделать главным: ' + p.label
                      "
                      (click)="setEditingMainPhoto(p.id)"
                    >
                      @if (p.storageUrl) {
                        <img
                          class="supply-quick-order__photo-image"
                          [src]="p.thumbnailUrl || p.storageUrl"
                          [alt]="p.originalFilename || p.label"
                        />
                      } @else {
                        <span class="supply-quick-order__photo-swatch" aria-hidden="true"></span>
                      }
                      @if (editingMainPhotoId() === p.id) {
                        <span class="supply-quick-order__photo-star" aria-hidden="true">★</span>
                      }
                    </button>
                  }
                  <button
                    type="button"
                    class="supply-quick-order__photo-add"
                    (click)="materialPhotoInput.click()"
                    [disabled]="photoUploading()"
                    [title]="photoUploading() ? 'Фото загружаются…' : 'Добавить фото'"
                    aria-label="Добавить фото"
                    data-test="supply-quick-material-photo-add"
                  >
                    {{ photoUploading() ? '…' : '+' }}
                  </button>
                </div>
                @if (photoUploading()) {
                  <span class="supply-quick-order__photo-status" role="status">
                    Загрузка фото…
                  </span>
                }
                @if (photoUploadError()) {
                  <span class="supply-quick-order__photo-error" role="alert">
                    {{ photoUploadError() }}
                  </span>
                }
              </div>
              <div class="supply-quick-order__modal-actions">
                <app-pi-button
                  variant="default"
                  size="sm"
                  [disabled]="photoUploading()"
                  (click)="saveNewMaterial(activeRowId()!)"
                  data-test="supply-quick-material-save"
                >
                  Сохранить
                </app-pi-button>
                <app-pi-button variant="outline" size="sm" (click)="cancelNewMaterial()">
                  Отмена
                </app-pi-button>
              </div>
            </div>
          }

          @if (showNewSupplier()) {
            <div class="supply-quick-order__panel" data-test="supply-quick-supplier-panel">
              <label class="supply-quick-order__field supply-quick-order__field--grow">
                <span class="supply-quick-order__field-label">Название орг. *</span>
                <input
                  class="pi-input"
                  [ngModel]="newSupplierName()"
                  (ngModelChange)="newSupplierName.set($event)"
                  maxlength="256"
                  data-test="supply-quick-supplier-name"
                />
              </label>
              <label class="supply-quick-order__field supply-quick-order__field--article">
                <span class="supply-quick-order__field-label">ИНН *</span>
                <input
                  class="pi-input"
                  [ngModel]="newSupplierInn()"
                  (ngModelChange)="newSupplierInn.set($event)"
                  inputmode="numeric"
                  maxlength="12"
                  data-test="supply-quick-supplier-inn"
                />
              </label>
              <div class="supply-quick-order__field supply-quick-order__field--category">
                <span class="supply-quick-order__field-label">Категория</span>
                <span
                  class="supply-quick-order__readonly"
                  data-test="supply-quick-supplier-panel-category"
                >
                  {{ categoryLabel(activeRow()?.categoryId ?? '') }}
                </span>
              </div>
              <label class="supply-quick-order__field supply-quick-order__field--site">
                <span class="supply-quick-order__field-label">Сайт</span>
                <input
                  class="pi-input"
                  [ngModel]="newSupplierWebsite()"
                  (ngModelChange)="newSupplierWebsite.set($event)"
                  placeholder="https://…"
                />
              </label>
              <label class="supply-quick-order__field supply-quick-order__field--email">
                <span class="supply-quick-order__field-label">Почта орг.</span>
                <input
                  class="pi-input"
                  [ngModel]="newSupplierEmail()"
                  (ngModelChange)="newSupplierEmail.set($event)"
                  placeholder="zakaz@…"
                />
              </label>
              <div class="supply-quick-order__modal-actions">
                <app-pi-button
                  variant="default"
                  size="sm"
                  (click)="saveNewSupplier(activeRowId()!)"
                  data-test="supply-quick-supplier-save"
                >
                  Сохранить
                </app-pi-button>
                <app-pi-button variant="outline" size="sm" (click)="cancelNewSupplier()">
                  Отмена
                </app-pi-button>
              </div>
            </div>
          }

          @if (showNewManager()) {
            <div class="supply-quick-order__panel" data-test="supply-quick-manager-panel">
              <label class="supply-quick-order__field supply-quick-order__field--person">
                <span class="supply-quick-order__field-label">Фамилия *</span>
                <input
                  class="pi-input"
                  [ngModel]="newContactLastName()"
                  (ngModelChange)="newContactLastName.set($event)"
                  data-test="supply-quick-manager-last-name"
                />
              </label>
              <label class="supply-quick-order__field supply-quick-order__field--person">
                <span class="supply-quick-order__field-label">Имя</span>
                <input
                  class="pi-input"
                  [ngModel]="newContactFirstName()"
                  (ngModelChange)="newContactFirstName.set($event)"
                />
              </label>
              <label class="supply-quick-order__field supply-quick-order__field--person">
                <span class="supply-quick-order__field-label">Отчество</span>
                <input
                  class="pi-input"
                  [ngModel]="newContactPatronymic()"
                  (ngModelChange)="newContactPatronymic.set($event)"
                />
              </label>
              <label class="supply-quick-order__field supply-quick-order__field--phone">
                <span class="supply-quick-order__field-label">Телефон</span>
                <input
                  class="pi-input"
                  [ngModel]="newContactPhone()"
                  (ngModelChange)="newContactPhone.set($event)"
                  placeholder="+7 …"
                />
              </label>
              <label class="supply-quick-order__field supply-quick-order__field--email">
                <span class="supply-quick-order__field-label">Почта</span>
                <input
                  class="pi-input"
                  [ngModel]="newContactEmail()"
                  (ngModelChange)="newContactEmail.set($event)"
                />
              </label>
              <label class="supply-quick-order__field supply-quick-order__field--position">
                <span class="supply-quick-order__field-label">Должность</span>
                <input
                  class="pi-input"
                  [ngModel]="newContactPosition()"
                  (ngModelChange)="newContactPosition.set($event)"
                />
              </label>
              <div class="supply-quick-order__modal-actions">
                <app-pi-button
                  variant="default"
                  size="sm"
                  (click)="saveNewManager(activeRowId()!)"
                  data-test="supply-quick-manager-save"
                >
                  Сохранить
                </app-pi-button>
                <app-pi-button variant="outline" size="sm" (click)="cancelNewManager()">
                  Отмена
                </app-pi-button>
              </div>
            </div>
          }
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .supply-quick-order__item {
        min-width: 0;
      }
      .supply-quick-order__head {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper);
        transition:
          border-color 120ms ease,
          background-color 120ms ease;
      }
      .supply-quick-order__head:hover,
      .supply-quick-order__head--expanded {
        border-color: var(--color-sunrise-warm, #c79542);
        background: var(--color-sunrise-soft, #fff6df);
      }
      .supply-quick-order__head--expanded {
        border-bottom-color: transparent;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
      .supply-quick-order__table-head {
        display: grid;
        grid-template-columns: 2.2rem 6.8rem minmax(16rem, 1fr) 12rem 10rem 5rem;
        min-width: 0;
        overflow: hidden;
        border: 1px solid var(--color-rule);
        border-bottom: none;
        background: var(--color-paper-2);
        color: var(--color-muted-foreground);
        font-size: var(--text-micro);
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .supply-quick-order__table-head-cell {
        min-width: 0;
        padding: 0.28rem 0.7rem;
        overflow: hidden;
        border-left: 1px solid color-mix(in oklch, var(--color-rule) 55%, transparent);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .supply-quick-order__table-head-cell--exp {
        border-left: none;
        text-align: center;
      }
      .supply-quick-order__table-head-cell--material {
        color: var(--color-ink);
      }
      .supply-quick-order__table-head-cell--center {
        text-align: center;
      }
      .supply-quick-order__summary {
        display: flex;
        flex: 1;
        align-items: center;
        gap: 0;
        min-width: 0;
        min-height: 3rem;
        padding: 0.55rem 0.75rem;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
        text-align: left;
      }
      .supply-quick-order__summary:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring-shadow);
      }
      .supply-quick-order__delete-slot {
        display: block;
        width: 5rem;
        flex-shrink: 0;
      }
      .supply-quick-order__delete {
        width: 5rem;
        flex-shrink: 0;
        margin-right: 0.5rem;
        padding: 0.2rem 0.5rem;
        border: 1px solid transparent;
        border-radius: 2px;
        background: transparent;
        color: var(--color-destructive);
        font: inherit;
        font-size: var(--text-micro);
        cursor: pointer;
      }
      .supply-quick-order__delete:hover {
        border-color: var(--color-destructive);
        background: var(--color-destructive-soft);
      }
      .supply-quick-order__delete:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring-shadow);
      }
      .supply-quick-order__disclosure {
        display: inline-flex;
        width: 2.2rem;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        color: var(--color-sunrise-warm, #9b6b1e);
        font-size: 0.9rem; /* disclosure chevron glyph; deliberate compact-control exception (TZ-SUPPLY-315) */
      }
      .supply-quick-order__summary-text {
        display: grid;
        grid-template-columns: 6.8rem minmax(16rem, 1fr) 12rem 10rem;
        flex: 1;
        align-items: center;
        min-width: 0;
        overflow: hidden;
        font-size: var(--text-label);
        white-space: nowrap;
      }
      .supply-quick-order__summary-cell {
        min-width: 0;
        height: 1.75rem;
        display: flex;
        align-items: center;
        padding: 0 0.7rem;
        overflow: hidden;
        border-left: 1px solid color-mix(in oklch, var(--color-rule) 55%, transparent);
        text-overflow: ellipsis;
      }
      .supply-quick-order__summary-cell--date,
      .supply-quick-order__summary-cell--category,
      .supply-quick-order__summary-cell--material,
      .supply-quick-order__summary-cell--supplier,
      .supply-quick-order__summary-cell--manager {
        justify-content: flex-start;
        text-align: left;
      }
      .supply-quick-order__summary-cell--date {
        border-left: none;
        font-variant-numeric: tabular-nums;
      }
      .supply-quick-order__summary-cell--material {
        font-weight: 650;
      }
      .supply-quick-order__summary-cell--qty,
      .supply-quick-order__summary-cell--status,
      .supply-quick-order__summary-cell--priority {
        justify-content: center;
        text-align: center;
      }
      .supply-quick-order__summary-cell--qty {
        font-variant-numeric: tabular-nums;
      }
      .supply-quick-order__summary-cell--supplier,
      .supply-quick-order__summary-cell--manager {
        text-overflow: ellipsis;
      }
      .supply-quick-order__dot {
        color: var(--color-muted-foreground);
      }

      .supply-quick-order__status-badge {
        display: inline-flex;
        flex-shrink: 0;
        padding: 0.1rem 0.4rem;
        border-radius: 2px;
        border: 1px solid var(--color-rule);
        background: var(--color-paper-2);
        font-size: var(--text-micro);
      }
      .supply-quick-order__priority {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        white-space: nowrap;
      }
      .supply-quick-order__priority--urgent {
        padding: 0.05rem 0.5rem;
        border: 1px solid var(--color-destructive);
        border-radius: 999px;
        background: var(--color-destructive-soft, #fdeaea);
        color: var(--color-destructive);
      }
      .supply-quick-order__priority--low {
        color: var(--color-success, #2d6a4f);
      }
      .supply-quick-order__expanded {
        padding: 0 0.5rem 0.5rem;
        border: 1px solid var(--color-sunrise-warm, #c79542);
        border-top: none;
        border-radius: 0 0 2px 2px;
        background: var(--color-paper);
      }

      /* ---- three white cards (TZ-SUPPLY-306): label above controls, 8px grid ---- */
      .supply-quick-order__strips {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        align-items: stretch;
      }
      .supply-quick-order__strip {
        display: flex;
        flex-direction: column;
        min-width: 0;
        border: 1px solid var(--color-rule);
        border-radius: 4px;
        background: var(--color-paper);
        overflow: hidden;
      }
      .supply-quick-order__strip--what {
        grid-column: 1;
        background: color-mix(in oklch, var(--color-sunrise-warm) 9%, var(--color-paper));
      }
      .supply-quick-order__strip--where {
        grid-column: 2;
        background: color-mix(in oklch, var(--color-info) 8%, var(--color-paper));
      }
      .supply-quick-order__strip--details {
        grid-column: 3;
        background: color-mix(in oklch, var(--color-success) 8%, var(--color-paper));
      }
      .supply-quick-order__strip--more {
        grid-column: 1 / -1;
        background: var(--color-paper-2);
      }
      .supply-quick-order__more-toggle {
        grid-column: 1 / -1;
      }
      .supply-quick-order__strip-label {
        display: block;
        padding: 0.55rem 0.75rem;
        border-bottom: 1px solid var(--color-rule);
        background: var(--color-paper-2);
        color: var(--color-ink);
        font-size: var(--text-micro);
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .supply-quick-order__fields {
        display: flex;
        flex: 1;
        flex-wrap: wrap;
        align-items: stretch;
        gap: 1rem;
        min-width: 0;
        padding: 1rem;
      }
      .supply-quick-order__subgroup {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        min-width: 0;
      }
      .supply-quick-order__subgroup-label {
        padding-bottom: 0.3rem;
        border-bottom: 1px solid var(--color-rule);
        color: var(--color-muted-foreground);
        font-size: var(--text-micro);
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .supply-quick-order__subgroup-fields {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 1rem;
        min-width: 0;
      }
      .supply-quick-order__strip--what .supply-quick-order__fields,
      .supply-quick-order__strip--where .supply-quick-order__fields,
      .supply-quick-order__strip--details .supply-quick-order__fields {
        flex-direction: column;
        align-items: stretch;
      }
      .supply-quick-order__strip--what .supply-quick-order__subgroup,
      .supply-quick-order__strip--where .supply-quick-order__subgroup,
      .supply-quick-order__strip--details .supply-quick-order__subgroup {
        flex: 0 0 auto;
        width: 100%;
        min-width: 0;
      }
      /* full-width rows inside the material / supplier / manager / notes groups */
      .supply-quick-order__subgroup--material .supply-quick-order__field--link,
      .supply-quick-order__subgroup--supplier .supply-quick-order__field--site,
      .supply-quick-order__subgroup--supplier .supply-quick-order__field--email,
      .supply-quick-order__subgroup--manager .supply-quick-order__field--email,
      .supply-quick-order__strip--more .supply-quick-order__field--grow {
        flex-basis: 100%;
      }
      .supply-quick-order__field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-width: 0;
      }
      .supply-quick-order__field-label {
        color: var(--color-muted-foreground);
        font-size: var(--text-micro);
        line-height: 1.4;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .supply-quick-order__strip .pi-input {
        width: 100%;
        height: 2.25rem;
        min-width: 0;
        padding-inline: 0.6rem;
        border-radius: 4px;
        font-size: var(--text-label);
      }
      .supply-quick-order__field--grow,
      .supply-quick-order__field--link,
      .supply-quick-order__field--category,
      .supply-quick-order__field--manager {
        flex: 1 1 auto;
        min-width: 0;
      }
      .supply-quick-order__field--article,
      .supply-quick-order__field--color,
      .supply-quick-order__field--qty,
      .supply-quick-order__field--unit,
      .supply-quick-order__field--company,
      .supply-quick-order__field--who,
      .supply-quick-order__field--date,
      .supply-quick-order__field--status,
      .supply-quick-order__field--priority,
      .supply-quick-order__field--money,
      .supply-quick-order__field--site,
      .supply-quick-order__field--email,
      .supply-quick-order__field--person,
      .supply-quick-order__field--phone,
      .supply-quick-order__field--position {
        flex: 1 1 8rem;
        min-width: 0;
      }
      .supply-quick-order__field--qty .pi-input,
      .supply-quick-order__field--money .pi-input {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .supply-quick-order__field--qty .pi-input {
        appearance: textfield;
      }
      .supply-quick-order__field--qty .pi-input::-webkit-outer-spin-button,
      .supply-quick-order__field--qty .pi-input::-webkit-inner-spin-button {
        margin: 0;
        appearance: none;
      }
      .supply-quick-order__readonly {
        display: flex;
        align-items: center;
        height: 2.25rem;
        font-size: var(--text-label);
      }
      .supply-quick-order__readonly--truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .supply-quick-order__subgroup .supply-quick-order__readonly {
        padding-inline: 0.15rem;
      }
      .supply-quick-order__add-btn {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 2.4rem;
        height: 2.25rem;
        border: 1px solid color-mix(in oklch, var(--color-sunrise-warm) 55%, var(--color-rule));
        border-radius: 4px;
        background: var(--color-sunrise-soft);
        color: var(--color-success);
        font: inherit;
        font-size: var(--text-title); /* plus control glyph; deliberate compact-control exception */
        font-weight: 700;
        line-height: 1;
        cursor: pointer;
        transition:
          background-color 120ms ease,
          border-color 120ms ease,
          color 120ms ease;
      }
      .supply-quick-order__add-btn:hover {
        border-color: color-mix(in oklch, var(--color-sunrise-warm) 80%, var(--color-gold-deep));
        background: color-mix(in oklch, var(--color-sunrise-soft) 55%, var(--color-sunrise-warm));
        color: color-mix(in oklch, var(--color-success) 82%, #000000);
      }
      .supply-quick-order__add-btn:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring-shadow);
      }
      .supply-quick-order__add-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .supply-quick-order__add-btn:disabled:hover {
        border-color: color-mix(in oklch, var(--color-sunrise-warm) 55%, var(--color-rule));
        background: var(--color-sunrise-soft);
      }
      .supply-quick-order__mini-btn {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border: 1px solid var(--color-rule-strong);
        border-radius: 4px;
        background: var(--color-paper-raised);
        color: var(--color-muted-foreground);
        font: inherit;
        font-size: 0.9375rem; /* icon glyph in a square control; deliberate compact-control exception (TZ-SUPPLY-315) */
        line-height: 1;
        cursor: pointer;
        transition:
          background-color 120ms ease,
          border-color 120ms ease,
          color 120ms ease;
      }
      .supply-quick-order__mini-btn:hover {
        border-color: var(--color-gold-deep);
        background: var(--color-sunrise-soft);
        color: var(--color-ink);
      }
      .supply-quick-order__mini-btn:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring-shadow);
      }
      .supply-quick-order__mini-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .supply-quick-order__combo {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        min-width: 0;
      }
      .supply-quick-order__thumb {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper-2);
      }
      .supply-quick-order__thumb--summary {
        width: 1.4rem;
        height: 1.4rem;
        margin-right: 0.4rem;
      }
      .supply-quick-order__thumb-swatch {
        display: block;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          135deg,
          color-mix(in oklch, var(--color-sunrise-warm) 35%, var(--color-paper)) 0 50%,
          color-mix(in oklch, var(--color-ink) 12%, var(--color-paper)) 50% 100%
        );
      }
      .supply-quick-order__thumb-image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .supply-quick-order__material-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .supply-quick-order__photo {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.25rem;
        min-height: 2.25rem;
      }
      .supply-quick-order__photo-thumb {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 0.2rem;
        height: 2.25rem;
        padding: 0.15rem 0.4rem;
        border: 1px solid var(--color-rule);
        border-radius: 4px;
        background: var(--color-paper-raised);
        color: var(--color-ink);
        font: inherit;
        font-size: var(--text-micro);
        cursor: pointer;
      }
      .supply-quick-order__photo-thumb--main {
        border-color: var(--color-gold-deep);
      }
      .supply-quick-order__photo-swatch {
        display: inline-block;
        width: 1.4rem;
        height: 1.4rem;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: color-mix(in oklch, var(--color-sunrise-warm) 30%, var(--color-paper));
      }
      .supply-quick-order__photo-image {
        display: block;
        width: 1.8rem;
        height: 1.8rem;
        object-fit: cover;
        border-radius: 2px;
      }
      .supply-quick-order__file-input {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
      .supply-quick-order__photo-status,
      .supply-quick-order__photo-error {
        display: block;
        margin-top: 0.35rem;
        font-size: var(--text-micro);
      }
      .supply-quick-order__photo-status {
        color: var(--color-muted-foreground);
      }
      .supply-quick-order__photo-error {
        color: var(--color-destructive);
      }
      .supply-quick-order__photo-star {
        color: var(--color-gold-deep);
        font-size: var(--text-micro);
        line-height: 1;
      }
      .supply-quick-order__photo-add {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border: 1px solid var(--color-rule-strong);
        border-radius: 4px;
        background: var(--color-paper-raised);
        color: var(--color-muted-foreground);
        font: inherit;
        font-size: 0.9375rem; /* icon glyph in a square control; deliberate compact-control exception (TZ-SUPPLY-315) */
        line-height: 1;
        cursor: pointer;
      }
      .supply-quick-order__photo-add:hover {
        border-color: var(--color-gold-deep);
        color: var(--color-ink);
      }
      .supply-quick-order__photo-add:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring-shadow);
      }
      .supply-quick-order__panel {
        display: flex;
        flex-basis: 100%;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 0.4rem 0.5rem;
        padding: 0.35rem 0.4rem;
        border: 1px dashed var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper-raised);
      }
      /* Full-basis label splits a panel into org / manager groups without a nested box. */
      .supply-quick-order__panel-label {
        flex-basis: 100%;
        color: var(--color-muted-foreground);
        font-size: var(--text-micro);
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .supply-quick-order__modal-actions {
        display: flex;
        flex-basis: 100%;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 0.25rem;
      }
      .supply-quick-order__more-toggle {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        width: 100%;
        padding: 0.2rem 0.6rem;
        border: none;
        border-top: 1px solid var(--color-rule);
        background: var(--color-paper-raised);
        color: var(--color-muted-foreground);
        font: inherit;
        font-size: var(--text-micro);
        text-align: left;
        cursor: pointer;
      }
      .supply-quick-order__more-toggle:hover {
        color: var(--color-ink);
      }

      @media (max-width: 1100px) {
        .supply-quick-order__strips {
          display: flex;
          flex-direction: column;
        }
        .supply-quick-order__strip--what,
        .supply-quick-order__strip--where,
        .supply-quick-order__strip--details,
        .supply-quick-order__strip--more,
        .supply-quick-order__more-toggle {
          grid-column: auto;
          grid-row: auto;
        }
        .supply-quick-order__more-toggle {
          margin-top: -0.5rem;
        }
      }

      @media (max-width: 900px) {
        .supply-quick-order__table-head {
          display: none;
        }
        .supply-quick-order__summary-text {
          grid-template-columns: 6.5rem minmax(10rem, 1fr) 9rem 8rem;
        }
      }
    `,
  ],
})
export class SupplyQuickOrderComponent {
  readonly prefillOrderId = input<string | null>(null);

  private readonly categoriesSvc = inject(CategoriesService);
  private readonly materialsSvc = inject(MaterialsService);
  private readonly orgsSvc = inject(OrganizationsService);
  private readonly personsSvc = inject(PersonsService);
  private readonly supplySvc = inject(SupplyRequestsService);
  private readonly photosSvc = inject(PhotosService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private modalRef: DialogRef<unknown> | null = null;

  @ViewChild('toolbarTemplate', { static: true })
  readonly toolbarTemplate!: TemplateRef<void>;

  protected readonly statuses = QUICK_ORDER_STATUSES;
  protected readonly priorities = QUICK_ORDER_PRIORITIES;
  protected readonly units = QUICK_ORDER_UNITS;
  protected readonly companies = MOCK_COMPANIES;
  protected readonly requestedBy = QUICK_ORDER_REQUESTED_BY;

  @ViewChild('supplyQuickOrderModal', { static: true })
  readonly modalTemplate!: TemplateRef<unknown>;

  protected readonly rows = signal<SupplyQuickOrderRow[]>(createQuickOrderSeedRows());
  protected readonly categories = signal<QuickOrderCategory[]>([...MOCK_CATEGORIES]);
  protected readonly categoryOptions = computed(() =>
    this.categories().map((category) => ({ id: category.id, label: category.label })),
  );
  protected readonly materials = signal<QuickOrderMaterial[]>([...MOCK_MATERIALS]);
  protected readonly suppliers = signal<QuickOrderSupplier[]>([...MOCK_SUPPLIERS]);
  protected readonly contacts = signal<QuickOrderSupplierContact[]>([...MOCK_SUPPLIER_CONTACTS]);
  protected readonly persons = signal<Person[]>([]);
  /** Keep the offline seed internally consistent until the request list is live. */
  private readonly usingMockRows = signal(true);
  private readonly pendingLiveMaterials = signal<QuickOrderMaterial[] | null>(null);
  private readonly pendingLiveSuppliers = signal<QuickOrderSupplier[] | null>(null);

  protected readonly expandedId = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<QuickOrderStatus | ''>('');
  protected readonly priorityFilter = signal<QuickOrderPriority | ''>('');
  protected readonly moreExpanded = signal(false);

  /** TZ-SUPPLY-314 — guided-flow block visibility (per-expanded-row). */
  protected readonly whereExpanded = signal(false);
  protected readonly detailsExpanded = signal(false);

  protected readonly showNewSupplier = signal(false);
  protected readonly newSupplierName = signal('');
  protected readonly newSupplierInn = signal('');
  protected readonly newSupplierWebsite = signal('');
  protected readonly newSupplierEmail = signal('');

  protected readonly showNewManager = signal(false);
  /** Shared by both panels — only one of them can be open at a time. */
  protected readonly newContactLastName = signal('');
  protected readonly newContactFirstName = signal('');
  protected readonly newContactPatronymic = signal('');
  protected readonly newContactPhone = signal('');
  protected readonly newContactEmail = signal('');
  protected readonly newContactPosition = signal(QUICK_ORDER_CONTACT_POSITION);

  protected readonly showNewCategory = signal(false);
  protected readonly newCategoryName = signal('');

  protected readonly showNewMaterial = signal(false);
  protected readonly newMaterialName = signal('');
  protected readonly newMaterialArticle = signal('');
  protected readonly newMaterialColor = signal('');
  protected readonly newMaterialUnit = signal<string>(QUICK_ORDER_UNITS[0]);
  private newMaterialCategoryId = '';

  /** TZ-SUPPLY-309 — null = creating; set = editing an existing material (incl. a fresh copy). */
  protected readonly editingMaterialId = signal<string | null>(null);
  protected readonly editingPhotos = signal<QuickOrderMaterialPhoto[]>([]);
  protected readonly editingMainPhotoId = signal<string | null>(null);
  protected readonly photoUploading = signal(false);
  protected readonly photoUploadError = signal<string | null>(null);
  /** Photos uploaded in the open modal but not yet attached to a Material. */
  private readonly pendingUploadedPhotoIds = signal<string[]>([]);

  protected readonly showNewColor = signal(false);
  protected readonly newColorName = signal('');
  protected readonly newColorMaterialId = signal<string | null>(null);

  /** Row the currently open creation/edit modal belongs to (null = no modal). */
  protected readonly activeRowId = signal<string | null>(null);

  private idSeq = 0;

  protected readonly visibleRows = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const orderId = this.prefillOrderId();

    let list = this.rows().filter((row) => {
      if (orderId && row.orderId !== orderId) return false;
      if (status && row.status !== status) return false;
      if (priority && row.priority !== priority) return false;
      if (!q) return true;
      const cat = this.categoryLabel(row.categoryId).toLowerCase();
      const sup = row.supplierId
        ? (this.suppliers().find((s) => s.id === row.supplierId)?.name ?? '').toLowerCase()
        : '';
      const material = row.materialId
        ? this.materials().find((m) => m.id === row.materialId)
        : undefined;
      return (
        (material?.name ?? '').toLowerCase().includes(q) ||
        (material?.article ?? '').toLowerCase().includes(q) ||
        cat.includes(q) ||
        sup.includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      const pw = prioritySortWeight(b.priority) - prioritySortWeight(a.priority);
      if (pw !== 0) return pw;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return list;
  });

  protected statusLabel = statusLabel;
  protected priorityLabel = priorityLabel;
  protected priorityIcon = priorityIcon;
  protected contactLabel = contactLabel;

  constructor() {
    this.categoriesSvc
      .list('material')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok) return;
        const live = (res.data ?? []).map((c) => ({ id: c._id, label: c.name }));
        if (live.length > 0) this.applyLiveCategories(live);
      });

    this.materialsSvc
      .list({ limit: 500 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok) return;
        const live = (res.data?.items ?? []).map(mapMaterial);
        if (live.length > 0) {
          if (this.usingMockRows()) this.pendingLiveMaterials.set(live);
          else this.materials.set(live);
        }
      });

    this.orgsSvc
      .list({ type: 'supplier', limit: 500 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok) return;
        const live = (res.data?.items ?? []).map(mapSupplier);
        if (live.length > 0) {
          if (this.usingMockRows()) this.pendingLiveSuppliers.set(live);
          else this.suppliers.set(live);
        }
      });

    this.personsSvc
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) this.persons.set(res.data?.items ?? []);
      });

    this.supplySvc
      .list({ orderId: this.prefillOrderId() ?? undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok) return;
        this.usingMockRows.set(false);
        this.rows.set((res.data ?? []).map(mapRequestToRow));
        const liveMaterials = this.pendingLiveMaterials();
        if (liveMaterials) this.materials.set(liveMaterials);
        const liveSuppliers = this.pendingLiveSuppliers();
        if (liveSuppliers) this.suppliers.set(liveSuppliers);
      });
  }

  protected fmtDay(d: Date): string {
    return formatDate(d.toISOString());
  }

  protected categoryLabel(categoryId: string): string {
    return this.categories().find((c) => c.id === categoryId)?.label ?? '—';
  }

  /** Row the open modal is editing — undefined when no modal is open. */
  protected activeRow(): SupplyQuickOrderRow | undefined {
    const id = this.activeRowId();
    return id ? this.rows().find((r) => r.id === id) : undefined;
  }

  protected materialName(materialId: string | null): string {
    return materialLabel(this.materials(), materialId);
  }

  protected materialArticle(materialId: string | null): string {
    if (!materialId) return '';
    return this.materials().find((m) => m.id === materialId)?.article ?? '';
  }

  protected materialById(materialId: string | null): QuickOrderMaterial | undefined {
    if (!materialId) return undefined;
    return this.materials().find((m) => m.id === materialId);
  }

  protected materialColors(materialId: string | null): string[] {
    return materialColorOptions(this.materialById(materialId));
  }

  protected materialMainPhoto(materialId: string | null): QuickOrderMaterialPhoto | null {
    return findMainPhoto(this.materialById(materialId));
  }

  protected materialsFor(categoryId: string): QuickOrderMaterial[] {
    return materialsForCategory(this.materials(), categoryId);
  }

  protected materialOptions(categoryId: string): { id: string; label: string }[] {
    return this.materialsFor(categoryId).map((material) => ({
      id: material.id,
      label: material.name,
    }));
  }

  /**
   * Catalog reference book is the SoT for categories, but 307 materials are
   * still local mocks keyed by MOCK_CATEGORIES ids. Re-key them (and the rows)
   * by category name so the picker keeps working against a live `/categories`.
   * Drops out entirely in 305, when materials come from the backend.
   */
  private applyLiveCategories(live: QuickOrderCategory[]): void {
    const norm = (s: string) => s.trim().toLowerCase();
    const liveIdByLabel = new Map(live.map((c) => [norm(c.label), c.id]));
    const remap = new Map<string, string>();
    for (const mock of MOCK_CATEGORIES) {
      const liveId = liveIdByLabel.get(norm(mock.label));
      if (liveId) remap.set(mock.id, liveId);
    }

    const unmatched = MOCK_CATEGORIES.filter((c) => !remap.has(c.id));
    this.categories.set([...live, ...unmatched]);
    this.materials.update((list) =>
      list.map((m) => ({ ...m, categoryId: remap.get(m.categoryId) ?? m.categoryId })),
    );
    this.suppliers.update((list) =>
      list.map((s) => ({
        ...s,
        categoryIds: s.categoryIds.map((id) => remap.get(id) ?? id),
      })),
    );
    this.rows.update((rows) =>
      rows.map((r) => ({ ...r, categoryId: remap.get(r.categoryId) ?? r.categoryId })),
    );
  }

  protected suppliersFor(categoryId: string): QuickOrderSupplier[] {
    return suppliersForCategory(this.suppliers(), categoryId);
  }

  protected supplierOptions(categoryId: string): { id: string; label: string }[] {
    return this.suppliersFor(categoryId).map((supplier) => ({
      id: supplier.id,
      label: supplier.name,
    }));
  }

  protected contactsFor(supplierId: string | null): QuickOrderSupplierContact[] {
    return contactsForSupplier(this.contacts(), supplierId);
  }

  protected supplierName(supplierId: string | null): string {
    if (!supplierId) return '—';
    return this.suppliers().find((s) => s.id === supplierId)?.name ?? '—';
  }

  protected supplierWebsite(supplierId: string | null): string {
    if (!supplierId) return '';
    return this.suppliers().find((s) => s.id === supplierId)?.website ?? '';
  }

  protected supplierEmail(supplierId: string | null): string {
    if (!supplierId) return '';
    return this.suppliers().find((s) => s.id === supplierId)?.email ?? '';
  }

  protected contactEmail(contactId: string | null): string {
    if (!contactId) return '';
    return this.contacts().find((c) => c.id === contactId)?.email ?? '';
  }

  protected contactPhone(contactId: string | null): string {
    if (!contactId) return '';
    return this.contacts().find((c) => c.id === contactId)?.phone ?? '';
  }

  protected patchContact(
    contactId: string | null,
    patch: Partial<Omit<QuickOrderSupplierContact, 'id' | 'supplierId' | 'personId'>>,
  ): void {
    if (!contactId) return;
    const contact = this.contacts().find((candidate) => candidate.id === contactId);
    this.contacts.update((list) => list.map((c) => (c.id === contactId ? { ...c, ...patch } : c)));

    // Mock contacts have no Person id. Live OrganizationContact rows do, so
    // phone/email edits must update the shared Person record as well.
    if (contact?.personId && OBJECT_ID_RE.test(contact.personId)) {
      this.personsSvc
        .update(contact.personId, patch)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  /** Site / org mail live on the org, so the strip edits the supplier itself. */
  protected patchSupplier(
    supplierId: string | null,
    patch: Partial<Omit<QuickOrderSupplier, 'id'>>,
  ): void {
    if (!supplierId) return;
    this.suppliers.update((list) =>
      list.map((s) => (s.id === supplierId ? { ...s, ...patch } : s)),
    );

    // Почта и сайт — поля Organization, а не только состояние строки.
    if (OBJECT_ID_RE.test(supplierId)) {
      const payload: Partial<Organization> = {};
      if (patch.website !== undefined) payload.website = patch.website;
      if (patch.email !== undefined) payload.email = patch.email;
      if (Object.keys(payload).length > 0) {
        this.orgsSvc
          .update(supplierId, payload)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      }
    }
  }

  protected onStatusFilter(v: string): void {
    this.statusFilter.set((v || '') as QuickOrderStatus | '');
  }

  protected onPriorityFilter(v: string): void {
    this.priorityFilter.set((v || '') as QuickOrderPriority | '');
  }

  protected toggleExpand(id: string): void {
    const next = this.expandedId() === id ? null : id;
    this.expandedId.set(next);
    this.closePanels();
    if (next) {
      this.moreExpanded.set(false);
      this.whereExpanded.set(false);
      this.detailsExpanded.set(false);
    }
  }

  private openPanelDialog(title: string): void {
    this.modalRef?.close();
    this.modalRef = this.dialog.open(SupplyQuickOrderDialogComponent, {
      data: { template: this.modalTemplate, title },
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
  }

  private closePanelDialog(): void {
    this.modalRef?.close();
    this.modalRef = null;
  }

  protected onCreate(): void {
    const row = createEmptyQuickOrderRow(this.prefillOrderId());
    row.categoryId = this.categories()[0]?.id ?? row.categoryId;
    this.rows.update((rows) => [row, ...rows]);
    this.expandedId.set(row.id);
    this.moreExpanded.set(false);
    this.whereExpanded.set(false);
    this.detailsExpanded.set(false);

    // TZ-SUPPLY-311: оптимистично создаём локально, затем заменяем id на серверный.
    this.supplySvc
      .create(rowToDto(row))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok || !res.data) return;
        this.rows.update((rows) =>
          rows.map((r) => (r.id === row.id ? mapRequestToRow(res.data!) : r)),
        );
      });

    queueMicrotask(() => {
      const el = document.querySelector<HTMLButtonElement>(
        '[data-test="supply-quick-category-select"] button[data-test="pi-overflow-select-trigger"]',
      );
      el?.focus();
    });
  }

  protected patchRow(id: string, patch: Partial<SupplyQuickOrderRow>): void {
    this.rows.update((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    // TZ-SUPPLY-311: fire-and-forget автосохранение правок строки.
    const next = this.rows().find((r) => r.id === id);
    if (!next || !OBJECT_ID_RE.test(next.id)) return;
    this.supplySvc.update(id, rowToDto(next)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  protected onDelete(id: string): void {
    if (!globalThis.confirm?.('Удалить заявку?')) return;
    this.rows.update((rows) => rows.filter((r) => r.id !== id));
    if (this.expandedId() === id) this.expandedId.set(null);
    if (OBJECT_ID_RE.test(id)) {
      this.supplySvc.remove(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  protected onStatusChange(rowId: string, status: QuickOrderStatus): void {
    // Keep one authoritative write per transition. The previous implementation
    // sent a full PATCH and then a status action, creating a race and making
    // «ordered» capable of spawning the registry task twice.
    this.rows.update((rows) => rows.map((r) => (r.id === rowId ? { ...r, status } : r)));
    if (!OBJECT_ID_RE.test(rowId)) return;
    if (status === 'ordered') {
      this.supplySvc.markOrdered(rowId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    } else if (status === 'received') {
      this.supplySvc.markReceived(rowId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    } else if (status === 'cancelled') {
      this.supplySvc.cancel(rowId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    } else {
      this.supplySvc
        .update(rowId, { status })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  protected onSupplierChange(rowId: string, supplierId: string): void {
    const id = supplierId || null;
    const contacts = contactsForSupplier(this.contacts(), id);
    this.patchRow(rowId, {
      supplierId: id,
      supplierContactId: contacts.length === 1 ? contacts[0]!.id : null,
    });
    this.cancelNewManager();

    if (id && OBJECT_ID_RE.test(id)) this.loadSupplierContacts(id);
  }

  /** TZ-SUPPLY-311 — контакты живого поставщика (OrganizationContact + Person join). */
  private loadSupplierContacts(supplierId: string): void {
    this.orgsSvc
      .listContacts(supplierId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok || !res.data) return;
        const mapped = res.data.map((c) => this.mapOrgContact(c));
        this.contacts.update((list) => [
          ...list.filter((c) => c.supplierId !== supplierId),
          ...mapped,
        ]);
      });
  }

  private mapOrgContact(c: OrganizationContact): QuickOrderSupplierContact {
    const populatedPerson = typeof c.personId === 'object' ? c.personId : undefined;
    const personId = typeof c.personId === 'string' ? c.personId : c.personId._id;
    const person = populatedPerson ?? this.persons().find((p) => p._id === personId);
    return {
      id: c._id,
      personId,
      supplierId: c.organizationId,
      lastName: person?.lastName ?? '—',
      ...(person?.firstName ? { firstName: person.firstName } : {}),
      ...(person?.patronymic ? { patronymic: person.patronymic } : {}),
      ...(person?.phone ? { phone: person.phone } : {}),
      ...(person?.email ? { email: person.email } : {}),
      ...(person?.position ? { position: person.position } : {}),
    };
  }

  protected openNewSupplier(rowId: string): void {
    this.closePanels();
    this.activeRowId.set(rowId);
    this.showNewSupplier.set(true);
    this.openPanelDialog('Новый поставщик');
  }

  /** TZ-SUPPLY-311 — оптимистично локально, затем `POST /organizations` (type=supplier). */
  protected saveNewSupplier(rowId: string): void {
    const name = this.newSupplierName().trim();
    const inn = this.newSupplierInn().trim();
    // Organization. inn is required by the canonical backend contract.
    if (!name || !inn) return;
    const website = this.newSupplierWebsite().trim();
    const email = this.newSupplierEmail().trim();
    const localId = this.nextId('sup');
    const supplier: QuickOrderSupplier = {
      id: localId,
      name,
      categoryIds: [],
      ...(website ? { website } : {}),
      ...(email ? { email } : {}),
    };
    this.suppliers.update((list) => [...list, supplier]);
    this.patchRow(rowId, { supplierId: supplier.id, supplierContactId: null });
    this.cancelNewSupplier();

    this.orgsSvc
      .create({
        name,
        inn,
        type: ['supplier'],
        ...(website ? { website } : {}),
        ...(email ? { email } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok || !res.data) return;
        const live = mapSupplier(res.data);
        this.suppliers.update((list) => list.map((s) => (s.id === localId ? live : s)));
        this.rows.update((rows) =>
          rows.map((r) => (r.supplierId === localId ? { ...r, supplierId: live.id } : r)),
        );
      });
  }

  protected cancelNewSupplier(): void {
    this.closePanelDialog();
    this.showNewSupplier.set(false);
    this.newSupplierName.set('');
    this.newSupplierInn.set('');
    this.newSupplierWebsite.set('');
    this.newSupplierEmail.set('');
    this.resetNewContact();
  }

  protected openNewManager(rowId: string): void {
    this.closePanels();
    this.activeRowId.set(rowId);
    this.showNewManager.set(true);
    const supplierId = this.rows().find((row) => row.id === rowId)?.supplierId ?? null;
    this.openPanelDialog('Новый менеджер · ' + this.supplierName(supplierId));
  }

  protected saveNewManager(rowId: string): void {
    const supplierId = this.rows().find((r) => r.id === rowId)?.supplierId ?? null;
    if (!supplierId) return;

    const payload = {
      lastName: this.newContactLastName().trim(),
      firstName: this.newContactFirstName().trim() || undefined,
      patronymic: this.newContactPatronymic().trim() || undefined,
      phone: this.newContactPhone().trim() || undefined,
      email: this.newContactEmail().trim() || undefined,
      position: this.newContactPosition().trim() || QUICK_ORDER_CONTACT_POSITION,
    };
    if (!payload.lastName) return;

    const localId = this.addContact(supplierId);
    if (!localId) return;
    this.patchRow(rowId, { supplierContactId: localId });
    this.cancelNewManager();

    // TZ-SUPPLY-311: реальный менеджер = Person + OrganizationContact.
    if (!OBJECT_ID_RE.test(supplierId)) return;
    this.personsSvc
      .create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok || !res.data) return;
        const person = res.data;
        this.persons.update((list) => [...list, person]);
        this.orgsSvc
          .addContact(supplierId, person._id, payload.position)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((cres) => {
            if (!cres.ok || !cres.data) return;
            const live: QuickOrderSupplierContact = {
              id: cres.data._id,
              personId: person._id,
              supplierId,
              lastName: person.lastName,
              ...(person.firstName ? { firstName: person.firstName } : {}),
              ...(person.patronymic ? { patronymic: person.patronymic } : {}),
              ...(person.phone ? { phone: person.phone } : {}),
              ...(person.email ? { email: person.email } : {}),
              position: person.position,
            };
            this.contacts.update((list) => list.map((c) => (c.id === localId ? live : c)));
            this.rows.update((rows) =>
              rows.map((r) =>
                r.supplierContactId === localId ? { ...r, supplierContactId: live.id } : r,
              ),
            );
          });
      });
  }

  protected cancelNewManager(): void {
    this.closePanelDialog();
    this.showNewManager.set(false);
    this.resetNewContact();
  }

  /** Returns the new contact id, or null when the required last name is empty. */
  private addContact(supplierId: string): string | null {
    const lastName = this.newContactLastName().trim();
    if (!lastName) return null;
    const firstName = this.newContactFirstName().trim();
    const patronymic = this.newContactPatronymic().trim();
    const phone = this.newContactPhone().trim();
    const email = this.newContactEmail().trim();
    const position = this.newContactPosition().trim() || QUICK_ORDER_CONTACT_POSITION;
    const contact: QuickOrderSupplierContact = {
      id: this.nextId('sc'),
      supplierId,
      lastName,
      position,
      ...(firstName ? { firstName } : {}),
      ...(patronymic ? { patronymic } : {}),
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
    };
    this.contacts.update((list) => [...list, contact]);
    return contact.id;
  }

  private resetNewContact(): void {
    this.newContactLastName.set('');
    this.newContactFirstName.set('');
    this.newContactPatronymic.set('');
    this.newContactPhone.set('');
    this.newContactEmail.set('');
    this.newContactPosition.set(QUICK_ORDER_CONTACT_POSITION);
  }

  protected closePanels(): void {
    this.closePanelDialog();
    this.cancelNewCategory();
    this.cancelNewMaterial();
    this.cancelNewSupplier();
    this.cancelNewManager();
    this.cancelNewColor();
    this.activeRowId.set(null);
  }

  private nextId(prefix: string): string {
    return `${prefix}-${Date.now()}-${++this.idSeq}`;
  }

  protected onCategoryChange(rowId: string, categoryId: string): void {
    const supplierId = this.rows().find((r) => r.id === rowId)?.supplierId ?? null;
    const keepsSupplier =
      !!supplierId &&
      suppliersForCategory(this.suppliers(), categoryId).some((s) => s.id === supplierId);
    this.patchRow(rowId, {
      categoryId,
      materialId: null,
      color: '',
      ...(keepsSupplier ? {} : { supplierId: null, supplierContactId: null }),
    });
    this.closePanels();
  }

  private maybeAutoExpandWhere(rowId: string): void {
    if (this.expandedId() !== rowId) return;
    const row = this.rows().find((r) => r.id === rowId);
    if (row?.categoryId && row.materialId) {
      this.whereExpanded.set(true);
    }
  }

  protected onMaterialChange(rowId: string, materialId: string): void {
    if (!materialId) {
      this.patchRow(rowId, { materialId: null, color: '' });
      return;
    }
    const material = this.materials().find((m) => m.id === materialId);
    this.patchRow(rowId, {
      materialId,
      color: '',
      ...(material ? { unit: material.unit } : {}),
    });
    this.maybeAutoExpandWhere(rowId);
  }

  protected onColorChange(rowId: string, color: string): void {
    const row = this.rows().find((candidate) => candidate.id === rowId);
    const selected = color.trim();
    const options = this.materialColors(row?.materialId ?? null);
    // A stale DOM value must not persist a color that is no longer allowed by
    // the selected material. New variants are added through the + modal.
    this.patchRow(rowId, {
      color: selected && options.includes(selected) ? selected : '',
    });
  }

  protected openNewColor(rowId: string, materialId: string | null): void {
    if (!materialId) return;
    this.closePanels();
    this.activeRowId.set(rowId);
    this.showNewColor.set(true);
    this.newColorMaterialId.set(materialId);
    this.newColorName.set('');
    this.openPanelDialog('Новый цвет');
  }

  protected saveNewColor(rowId: string): void {
    const materialId = this.newColorMaterialId();
    const name = this.newColorName().trim();
    if (!materialId || !name) return;
    this.materials.update((list) =>
      list.map((m) => {
        if (m.id !== materialId) return m;
        const colors = [...(m.colors ?? [])];
        if (
          !colors.some((color) => color.trim().toLocaleLowerCase() === name.toLocaleLowerCase())
        ) {
          colors.push(name);
        }
        return { ...m, colors };
      }),
    );
    this.patchRow(rowId, { color: name });
    this.cancelNewColor();

    if (OBJECT_ID_RE.test(materialId)) {
      const colors = this.materials().find((m) => m.id === materialId)?.colors;
      if (colors?.length) {
        this.materialsSvc
          .update(materialId, { colors })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      }
    }
  }

  protected cancelNewColor(): void {
    this.closePanelDialog();
    this.showNewColor.set(false);
    this.newColorName.set('');
    this.newColorMaterialId.set(null);
  }

  protected openNewCategory(rowId: string): void {
    this.closePanels();
    this.activeRowId.set(rowId);
    this.showNewCategory.set(true);
    this.openPanelDialog('Новая категория');
  }

  protected saveNewCategory(rowId: string): void {
    const name = this.newCategoryName().trim();
    if (!name) return;
    const localId = `cat-${Date.now()}`;
    const category: QuickOrderCategory = { id: localId, label: name };
    this.categories.update((list) => [...list, category]);
    this.patchRow(rowId, {
      categoryId: localId,
      materialId: null,
      color: '',
      supplierId: null,
      supplierContactId: null,
    });
    this.cancelNewCategory();

    const stamp = Date.now().toString(36);
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `cat-${stamp}`;
    const skuPrefix =
      name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '')
        .slice(0, 8) || 'CAT';
    this.categoriesSvc
      .create({ name, slug: slug.slice(0, 64), skuPrefix, type: 'material', isActive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok || !res.data) return;
        const live = { id: res.data._id, label: res.data.name };
        this.categories.update((list) => list.map((c) => (c.id === localId ? live : c)));
        this.rows.update((rows) =>
          rows.map((r) => (r.categoryId === localId ? { ...r, categoryId: live.id } : r)),
        );
      });
  }

  protected cancelNewCategory(): void {
    this.closePanelDialog();
    this.showNewCategory.set(false);
    this.newCategoryName.set('');
  }

  protected openNewMaterial(rowId: string, categoryId: string): void {
    this.closePanels();
    this.activeRowId.set(rowId);
    this.newMaterialCategoryId = categoryId;
    this.editingMaterialId.set(null);
    this.resetNewMaterialForm();
    this.editingPhotos.set([]);
    this.editingMainPhotoId.set(null);
    this.pendingUploadedPhotoIds.set([]);
    this.photoUploadError.set(null);
    this.showNewMaterial.set(true);
    this.openPanelDialog('Новый материал');
  }

  protected openEditMaterial(rowId: string, materialId: string | null): void {
    const material = this.materialById(materialId);
    if (!material) return;
    this.closePanels();
    this.activeRowId.set(rowId);
    this.editingMaterialId.set(material.id);
    this.newMaterialCategoryId = material.categoryId;
    this.newMaterialName.set(material.name);
    this.newMaterialArticle.set(material.article ?? '');
    this.newMaterialColor.set(materialColorOptions(material)[0] ?? '');
    this.newMaterialUnit.set(material.unit);
    this.editingPhotos.set((material.photos ?? []).map((p) => ({ ...p })));
    this.editingMainPhotoId.set(material.mainPhotoId ?? null);
    this.pendingUploadedPhotoIds.set([]);
    this.photoUploadError.set(null);
    this.showNewMaterial.set(true);
    this.openPanelDialog('Редактирование материала');
  }

  /** TZ-SUPPLY-309/311 — clone; live материалы дублируются на сервере (`duplicate`). */
  protected openCopyMaterial(rowId: string, materialId: string | null): void {
    const source = this.materialById(materialId);
    if (!source) return;

    if (OBJECT_ID_RE.test(source.id)) {
      this.materialsSvc
        .duplicate(source.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (!res.ok || !res.data) return;
          const live = { ...mapMaterial(res.data), name: `копия ${source.name}` };
          this.materials.update((list) => [...list, live]);
          this.patchRow(rowId, { materialId: live.id, color: '', unit: live.unit });
          this.openEditMaterial(rowId, live.id);
        });
      return;
    }

    const copyId = `mat-${Date.now()}`;
    const photos = (source.photos ?? []).map((p, i) => ({
      ...p,
      id: `ph-${copyId}-${i + 1}`,
    }));
    const sourceMainIndex = (source.photos ?? []).findIndex((p) => p.id === source.mainPhotoId);
    const mainPhotoId =
      sourceMainIndex >= 0 ? photos[sourceMainIndex]!.id : (photos[0]?.id ?? null);
    const copy: QuickOrderMaterial = {
      ...source,
      id: copyId,
      name: `копия ${source.name}`,
      photos,
      mainPhotoId,
    };
    this.materials.update((list) => [...list, copy]);
    this.patchRow(rowId, { materialId: copy.id, color: '', unit: copy.unit });
    this.openEditMaterial(rowId, copy.id);
  }

  protected saveNewMaterial(rowId: string): void {
    const name = this.newMaterialName().trim();
    if (!name) return;
    const article = this.newMaterialArticle().trim();
    const color = this.newMaterialColor().trim();
    const photos = this.editingPhotos();
    const mainPhotoId = this.editingMainPhotoId() ?? photos[0]?.id ?? null;
    const unit = this.newMaterialUnit();

    const editingId = this.editingMaterialId();
    if (editingId) {
      let colors: string[] | undefined;
      this.materials.update((list) =>
        list.map((m) => {
          if (m.id !== editingId) return m;
          const next = [...(m.colors ?? [])];
          if (color && !next.includes(color)) next.unshift(color);
          colors = next;
          return {
            ...m,
            name,
            article: article || undefined,
            colors: next,
            unit,
            ...(photos.length ? { photos: photos.map((photo) => ({ ...photo })) } : {}),
            ...(mainPhotoId ? { mainPhotoId } : {}),
          };
        }),
      );
      this.patchRow(rowId, { materialId: editingId, unit });
      // The material update below now owns these uploaded photo ids.
      this.pendingUploadedPhotoIds.set([]);
      this.cancelNewMaterial();

      if (OBJECT_ID_RE.test(editingId)) {
        this.materialsSvc
          .update(editingId, {
            name,
            ...(article ? { article } : {}),
            unit,
            ...(colors ? { colors } : {}),
            ...materialPhotoPayload(photos, mainPhotoId),
          })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      }
      return;
    }

    const categoryId =
      this.newMaterialCategoryId ||
      this.rows().find((r) => r.id === rowId)?.categoryId ||
      MOCK_CATEGORIES[0]!.id;
    const localId = `mat-${Date.now()}`;
    const material: QuickOrderMaterial = {
      id: localId,
      categoryId,
      name,
      unit,
      ...(article ? { article } : {}),
      ...(color ? { colors: [color] } : {}),
      ...(photos.length ? { photos } : {}),
      ...(mainPhotoId ? { mainPhotoId } : {}),
    };
    this.materials.update((list) => [...list, material]);
    this.patchRow(rowId, {
      categoryId,
      materialId: localId,
      unit,
      color: color || '',
    });
    // The create request below now owns these uploaded photo ids.
    this.pendingUploadedPhotoIds.set([]);
    this.cancelNewMaterial();

    const realCategoryId = toId(categoryId);
    this.materialsSvc
      .create({
        name,
        article: article || name.slice(0, 64),
        unit,
        ...(realCategoryId ? { categoryId: realCategoryId } : {}),
        ...(color ? { colors: [color] } : {}),
        ...materialPhotoPayload(photos, mainPhotoId),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok || !res.data) return;
        const live = mapMaterial(res.data);
        this.materials.update((list) => list.map((m) => (m.id === localId ? live : m)));
        this.rows.update((rows) =>
          rows.map((r) =>
            r.materialId === localId ? { ...r, materialId: live.id, unit: live.unit } : r,
          ),
        );
      });
  }

  protected cancelNewMaterial(): void {
    this.closePanelDialog();
    this.cleanupPendingPhotos();
    this.showNewMaterial.set(false);
    this.editingMaterialId.set(null);
    this.resetNewMaterialForm();
    this.editingPhotos.set([]);
    this.editingMainPhotoId.set(null);
    this.photoUploadError.set(null);
  }

  /** Remove originals uploaded in a modal that was cancelled before save. */
  private cleanupPendingPhotos(): void {
    const ids = this.pendingUploadedPhotoIds();
    this.pendingUploadedPhotoIds.set([]);
    for (const id of ids) {
      this.photosSvc.remove(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  /** Upload originals immediately; material.save later persists their IDs. */
  protected onMaterialPhotoFiles(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const files = Array.from(input?.files ?? []).filter((file) => file.type.startsWith('image/'));
    if (input) input.value = '';
    if (files.length === 0) return;

    this.photoUploading.set(true);
    this.photoUploadError.set(null);
    let remaining = files.length;
    let failed = 0;
    for (const file of files) {
      this.photosSvc
        .upload(file)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (res.ok && res.data) {
            const photo = res.data;
            const thumb = photo.variants?.thumb;
            const next: QuickOrderMaterialPhoto = {
              id: photo._id,
              label: photo.originalFilename ?? file.name,
              storageUrl: photo.storageUrl,
              ...(thumb?.storageUrl ? { thumbnailUrl: thumb.storageUrl } : {}),
              ...(photo.originalFilename ? { originalFilename: photo.originalFilename } : {}),
            };
            if (!this.showNewMaterial()) {
              // The modal may have been closed while the upload was in flight.
              this.photosSvc.remove(next.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
            } else {
              this.pendingUploadedPhotoIds.update((ids) => [...ids, next.id]);
              this.editingPhotos.update((list) => [...list, next]);
              if (!this.editingMainPhotoId()) this.editingMainPhotoId.set(next.id);
            }
          } else {
            failed += 1;
          }
          remaining -= 1;
          if (remaining === 0) {
            this.photoUploading.set(false);
            if (failed > 0) {
              this.photoUploadError.set(
                failed === files.length
                  ? 'Не удалось загрузить фото.'
                  : `Не удалось загрузить фото: ${failed}.`,
              );
            }
          }
        });
    }
  }

  protected setEditingMainPhoto(photoId: string): void {
    this.editingMainPhotoId.set(photoId);
  }

  private resetNewMaterialForm(): void {
    this.newMaterialName.set('');
    this.newMaterialArticle.set('');
    this.newMaterialColor.set('');
    this.newMaterialUnit.set(QUICK_ORDER_UNITS[0]);
    this.newMaterialCategoryId = '';
    this.photoUploadError.set(null);
  }
}

/** TZ-SUPPLY-311 — Material (API) → QuickOrderMaterial (UI). */
function mapMaterial(m: Material): QuickOrderMaterial {
  const mainPhotoId = typeof m.mainPhotoId === 'string' ? m.mainPhotoId : m.mainPhotoId?._id;
  const populatedCategory = m.categoryId as unknown as { _id?: string } | undefined;
  const categoryId =
    typeof m.categoryId === 'string' ? m.categoryId : (populatedCategory?._id ?? '');
  const photos = (m.photoIds ?? []).map((entry, index) => {
    if (typeof entry === 'string') {
      return { id: entry, label: `Фото ${index + 1}` };
    }
    const thumb = entry.variants?.thumb;
    return {
      id: entry._id,
      label: entry.originalFilename ?? `Фото ${index + 1}`,
      storageUrl: entry.storageUrl,
      ...(thumb?.storageUrl ? { thumbnailUrl: thumb.storageUrl } : {}),
      ...(entry.originalFilename ? { originalFilename: entry.originalFilename } : {}),
    };
  });
  return {
    id: m._id,
    categoryId,
    name: m.name,
    article: m.article,
    colors: m.colors ? [...m.colors] : undefined,
    unit: m.unit,
    photos,
    mainPhotoId: mainPhotoId ?? null,
  };
}

/** TZ-SUPPLY-311 — Organization (supplier) → QuickOrderSupplier (UI). */
function mapSupplier(o: Organization): QuickOrderSupplier {
  return {
    id: o._id,
    name: o.name,
    website: o.website,
    email: o.email,
    categoryIds: [],
  };
}

/** TZ-SUPPLY-311 — SupplyRequest (API) → SupplyQuickOrderRow (UI). */
function mapRequestToRow(r: SupplyRequest): SupplyQuickOrderRow {
  return {
    id: r._id,
    createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
    categoryId: r.categoryId ?? '',
    materialId: r.materialId ?? null,
    color: r.color,
    qty: r.qty ?? 1,
    unit: r.unit ?? 'шт',
    supplierId: r.supplierId ?? null,
    supplierContactId: r.supplierContactId ?? null,
    productUrl: r.productUrl ?? '',
    companyId: r.companyId ?? '',
    requestedBy: r.requestedBy ?? '',
    orderId: r.orderId ?? null,
    neededBy: r.neededBy ? r.neededBy.slice(0, 10) : '',
    status: r.status,
    linkedSupplyTaskId: r.linkedSupplyTaskId ?? null,
    priority: r.priority,
    notes: r.notes ?? '',
    priceHint: r.priceHint ?? null,
    lineTotal: r.lineTotal ?? null,
    supplierOrderDate: r.supplierOrderDate ? r.supplierOrderDate.slice(0, 10) : '',
    responsible: r.responsible ?? 'Менеджер',
  };
}

function toIsoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

/**
 * Отправляем FK только как валидный 24-hex ObjectId. Мок-id («qo-1»,
 * «cat-metizy») не являются валидными ObjectId и не должны уходить в API —
 * иначе backend отклонит payload по `@IsObjectId`. При live-справочниках
 * (после загрузки из API) id уже настоящие.
 */
function toId(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return OBJECT_ID_RE.test(value) ? value : undefined;
}

/** TZ-SUPPLY-311 — SupplyQuickOrderRow (UI) → API payload. */
/** Material payload fields accepted by the backend after real photo upload. */
function materialPhotoPayload(
  photos: QuickOrderMaterialPhoto[],
  mainPhotoId: string | null,
): { photoIds?: string[]; mainPhotoId?: string } {
  const photoIds = photos.map((photo) => toId(photo.id)).filter((id): id is string => !!id);
  const main = mainPhotoId && toId(mainPhotoId);
  return {
    ...(photoIds.length ? { photoIds } : {}),
    ...(main && photoIds.includes(main) ? { mainPhotoId: main } : {}),
  };
}

function rowToDto(row: SupplyQuickOrderRow): CreateSupplyRequestDto {
  return {
    categoryId: toId(row.categoryId),
    materialId: toId(row.materialId),
    color: row.color || undefined,
    productUrl: row.productUrl || undefined,
    supplierId: toId(row.supplierId),
    supplierContactId: toId(row.supplierContactId),
    companyId: toId(row.companyId),
    requestedBy: row.requestedBy || undefined,
    orderId: toId(row.orderId),
    qty: row.qty,
    unit: row.unit || undefined,
    neededBy: toIsoDate(row.neededBy),
    status: row.status,
    priority: row.priority,
    notes: row.notes || undefined,
    priceHint: row.priceHint ?? undefined,
    lineTotal: row.lineTotal ?? undefined,
    supplierOrderDate: toIsoDate(row.supplierOrderDate),
    responsible: row.responsible || undefined,
  };
}
