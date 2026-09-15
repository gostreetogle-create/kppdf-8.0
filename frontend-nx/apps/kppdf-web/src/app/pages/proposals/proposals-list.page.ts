import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { Quotation, QuotationFamilyMemberSummary } from '@kppdf/data-access';
import { BadgeComponent } from '@kppdf/ui/badge';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiGroupWorkspaceComponent } from '@kppdf/features';
import { DEALS_TOC_CHIPS } from '../deals-group-chips';
import { ProposalsListFacade } from '@kppdf/features/proposals';

/**
 * TZ-NX-PROPOSALS-LIST-FACADE — list/family-expand/cache signals and every
 * load/attach/sync/studio-bridge/convert-to-order method moved to
 * `ProposalsListFacade`; this page stays a thin host.
 */
@Component({
  selector: 'pi-proposals-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProposalsListFacade],
  imports: [PiStatusBannerComponent, BadgeComponent, PiGroupWorkspaceComponent, ButtonComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="proposals" [chips]="[]" activeId="">
    <main class="py-6" data-test="proposals-list">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Сделки</div>
          <h1 class="font-display text-2xl m-0">Коммерческие предложения</h1>
        </div>
        <app-pi-button variant="default" type="button" data-test="proposals-create" (click)="createInStudio()">
          Создать в студии
        </app-pi-button>
      </div>
      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground">Загрузка…</div>
      }
      @if (status() === 'error') {
        <app-pi-status-banner tone="destructive" [message]="error()" actionLabel="Повторить" (action)="load()" />
      }
      @if (status() === 'success' && filtered().length === 0) {
        <div class="pi-dashed-panel p-8 text-center">КП не найдены.</div>
      }
      @if (status() === 'success' && filtered().length > 0) {
        <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
          @for (row of filtered(); track row._id) {
            <div class="flex items-center justify-between gap-4 px-4 py-3 hairline-bottom" data-test="proposal-row">
              <div>
                <div class="flex items-center gap-2">
                  <div class="font-medium">{{ row.number }}</div>
                  @if ((row.familyRole ?? 'solo') === 'master') {
                    <app-pi-badge variant="outline" data-test="proposal-family-badge">Семья</app-pi-badge>
                  }
                </div>
                <div class="text-xs text-muted-foreground">{{ statusLabel(row.status) }}</div>
                @if (counterpartyName(row); as name) {
                  <div class="text-xs text-muted-foreground" data-test="proposal-counterparty">
                    Заказчик: {{ name }}
                  </div>
                }
              </div>
              <div class="flex flex-col items-end gap-1">
                <div class="flex items-center gap-2">
                  @if (row.status === 'accepted' && (row.familyRole ?? 'solo') !== 'variant') {
                    <app-pi-button
                      variant="default"
                      type="button"
                      data-test="proposal-convert-order"
                      (click)="convertToOrder(row)"
                      [disabled]="convertingId() === row._id"
                    >
                      {{ convertingId() === row._id ? 'Преобразование…' : 'В заказ' }}
                    </app-pi-button>
                  }
                  <app-pi-button variant="secondary" type="button" data-test="proposal-open-studio" (click)="openInStudio(row)">
                    В студии
                  </app-pi-button>
                  <app-pi-button
                    variant="secondary"
                    type="button"
                    data-test="proposal-attach-orgs"
                    (click)="openAttachOrgs(row)"
                  >
                    Несколько фирм
                  </app-pi-button>
                </div>
                <button
                  type="button"
                  class="pi-outline-btn"
                  data-test="proposal-family-expand"
                  (click)="toggleFamily(row)"
                >
                  {{ expandedFamilyId() === row._id ? 'Скрыть семью' : 'Семья' }}
                </button>
                @if (expandedFamilyId() === row._id) {
                  <div class="flex flex-col items-end gap-1 max-w-[18rem] text-xs" data-test="proposal-family-list">
                    @if (familyLoadingId() === row._id) {
                      <span class="text-muted-foreground">Загрузка…</span>
                    } @else if (familyError()) {
                      <app-pi-status-banner tone="destructive" [message]="familyError()" actionLabel="Повторить" (action)="reloadFamily(row)" />
                    } @else if (familyByRow()[row._id]; as family) {
                      @for (member of family.variants; track member.id) {
                        <div class="flex items-center justify-end gap-2" data-test="proposal-family-member">
                          <span class="font-medium">{{ orgNameOf(member.organizationId) }}</span>
                          <span class="text-muted-foreground">
                            {{ member.number }} · {{ member.orgMarkupPercent ?? 0 }}% · {{ statusLabel(member.status) }}
                          </span>
                          <button
                            type="button"
                            class="pi-outline-btn"
                            data-test="proposal-member-open-studio"
                            (click)="openVariantInStudio(member)"
                          >
                            В студии
                          </button>
                        </div>
                      } @empty {
                        <span class="text-muted-foreground">Нет вариантов фирм</span>
                      }
                      @if (family.variants.length > 0 && family.master.familyRole === 'master') {
                        <button
                          type="button"
                          class="pi-outline-btn"
                          data-test="proposal-family-sync"
                          (click)="confirmSyncFromMaster(row)"
                        >
                          Синхронизировать состав с мастером
                        </button>
                      }
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </main>
    </app-pi-group-workspace>
  `,
})
export class ProposalsListPage {
  protected readonly toc = DEALS_TOC_CHIPS;
  protected readonly facade = inject(ProposalsListFacade);

  protected readonly rows = this.facade.rows;
  protected readonly status = this.facade.status;
  protected readonly error = this.facade.error;
  protected readonly convertingId = this.facade.convertingId;
  protected readonly expandedFamilyId = this.facade.expandedFamilyId;
  protected readonly familyByRow = this.facade.familyByRow;
  protected readonly familyLoadingId = this.facade.familyLoadingId;
  protected readonly familyError = this.facade.familyError;
  protected readonly filtered = this.facade.filtered;

  load(): void {
    this.facade.load();
  }

  statusLabel(status?: string): string {
    return this.facade.statusLabel(status);
  }

  counterpartyName(row: Quotation): string | null {
    return this.facade.counterpartyName(row);
  }

  orgNameOf(organizationId: string): string {
    return this.facade.orgNameOf(organizationId);
  }

  async toggleFamily(row: Quotation): Promise<void> {
    await this.facade.toggleFamily(row);
  }

  reloadFamily(row: Quotation): void {
    this.facade.reloadFamily(row);
  }

  openAttachOrgs(row: Quotation): void {
    this.facade.openAttachOrgs(row);
  }

  confirmSyncFromMaster(row: Quotation): void {
    this.facade.confirmSyncFromMaster(row);
  }

  createInStudio(): void {
    this.facade.createInStudio();
  }

  openInStudio(quotation: Quotation): void {
    this.facade.openInStudio(quotation);
  }

  openVariantInStudio(member: QuotationFamilyMemberSummary): void {
    this.facade.openVariantInStudio(member);
  }

  async convertToOrder(quotation: Quotation): Promise<void> {
    await this.facade.convertToOrder(quotation);
  }
}
