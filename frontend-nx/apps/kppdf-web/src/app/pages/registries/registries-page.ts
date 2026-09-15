import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PiPageChromeComponent } from '@kppdf/ui/page';
import { BadgeComponent } from '@kppdf/ui/badge';
import { TableComponent } from '@kppdf/ui/table';
import { REGISTRIES_CATALOG, provideRegistriesCatalog } from './data/registries.catalog';
import { RegistriesPageFacade, restoreRegistryScrollPosition } from '@kppdf/features/registries-platform';

export { restoreRegistryScrollPosition } from '@kppdf/features/registries-platform';
import { RegistryDetailPanelComponent } from '@kppdf/features/registry-forms';
import {
  type RegistryMasterRow,
} from '@kppdf/features/registries-platform';

/**
 * TZ-NX-REGISTRIES-MASTER-TABLE-UX — `/registries` master table +
 * router-driven inline detail panel. Replaces the former split
 * `RegistriesListPage` (card grid) / `RegistryDetailPage` (routed detail)
 * pair (TZ-NX-REGISTRIES-PLATFORM). Both `/registries` and
 * `/registries/:registryKey` render THIS component (see
 * `registries.routes.ts`) — the route param only decides which master row
 * (if any) is expanded; the query/filter/loading/error/row-action engine
 * itself lives entirely in `RegistryDetailPanelComponent`, mounted inline
 * via `@kppdf/ui/table`'s own `expandedRow` slot so there is exactly one
 * open row by construction (a single `registryKey` drives the single
 * `expandedRowWhen` predicate).
 */
@Component({
  selector: 'pi-registries-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideRegistriesCatalog(),
    {
      provide: RegistriesPageFacade,
      useFactory: () => {
        const facade = new RegistriesPageFacade();
        facade.initialize(inject(REGISTRIES_CATALOG));
        return facade;
      },
    },
  ],
  imports: [RouterLink, PiPageChromeComponent, BadgeComponent, TableComponent, RegistryDetailPanelComponent],
  template: `
    <div class="px-panel-inset" data-test="registries-page-content">
      <app-pi-page-chrome [crumbs]="[{ label: 'Реестры' }]" />

      @if (facade.isUnknown()) {
      <div
        class="mb-4 hairline rounded-sm px-4 py-3 text-sm flex items-center justify-between gap-3 flex-wrap"
        role="alert"
        data-test="registry-unknown"
      >
        <span>Реестр «{{ facade.registryKey() }}» не найден.</span>
        <a
          routerLink="/registries"
          class="pi-focus-ring underline decoration-dotted"
          data-test="registry-unknown-back"
        >
          ← К реестрам
        </a>
      </div>
    }

    <ng-template #titleTpl let-row>
      <div class="font-medium text-ink">{{ row.title }}</div>
      @if (row.description) {
        <div class="text-xs text-muted-foreground mt-0.5">{{ row.description }}</div>
      }
    </ng-template>
    <ng-template #sourceTpl let-row>
      @if (row.source === 'api') {
        <app-pi-badge variant="secondary">API</app-pi-badge>
      } @else {
        <app-pi-badge variant="outline">Демо</app-pi-badge>
      }
    </ng-template>
    <ng-template #panelTpl let-row>
      @if (definitionFor(row.key); as def) {
        <pi-registry-detail-panel [definition]="def" />
      }
    </ng-template>

    @if (facade.groupedRows().length > 0) {
      <div class="flex flex-col gap-8">
        @for (group of facade.groupedRows(); track group.category) {
          <div data-test="registries-category-group">
            <h2 class="eyebrow mb-2 px-1" data-test="registries-category-label">{{ group.category }}</h2>
            <app-pi-table
              [data]="group.rows"
              [columns]="facade.masterColumns"
              [cellTemplates]="masterCellTemplates"
              [localSort]="false"
              [expandedRow]="panelTplBinding"
              [expandedRowWhen]="facade.expandedRowWhenFn()"
              [expandedRowLabel]="facade.expandedRowLabelFn()"
              (rowClick)="facade.onMasterRowClick($event)"
              [ariaLabel]="'Реестры: ' + group.category"
              data-test="registries-master-table"
            />
          </div>
        }
      </div>
    } @else {
      <div
        class="max-w-sm p-6 pi-dashed-panel flex flex-col items-center gap-1 text-center"
        data-test="registries-empty"
      >
        <span class="eyebrow text-sunrise-warm">00</span>
        <span class="text-sm">Реестры не найдены.</span>
      </div>
    }
    </div>
  `,
  styles: [`
    /* TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE: master tables here never bind
       total/page/pageSize/caption/footer — app-pi-table's own footer bar
       (hairline + py-3 padding, unconditional) renders empty under every
       category group, most visible as dead white space under the last one. */
    :host ::ng-deep app-pi-table .pi-table-footer {
      display: none;
    }
  `],
})
export class RegistriesPage implements OnInit {
  protected readonly facade = inject(RegistriesPageFacade);

  @ViewChild('titleTpl', { static: true })
  private readonly titleTplRef!: TemplateRef<{ $implicit: RegistryMasterRow }>;
  @ViewChild('sourceTpl', { static: true })
  private readonly sourceTplRef!: TemplateRef<{ $implicit: RegistryMasterRow }>;
  @ViewChild('panelTpl', { static: true })
  private readonly panelTplRef!: TemplateRef<{ $implicit: RegistryMasterRow }>;

  protected masterCellTemplates: Record<string, TemplateRef<{ $implicit: RegistryMasterRow }>> = {};
  protected panelTplBinding: TemplateRef<{ $implicit: RegistryMasterRow }> | null = null;

  ngOnInit(): void {
    this.masterCellTemplates = { title: this.titleTplRef, source: this.sourceTplRef };
    this.panelTplBinding = this.panelTplRef;
    this.facade.init();
  }

  protected definitionFor(key: string): ReturnType<RegistriesPageFacade['definitionFor']> {
    return this.facade.definitionFor(key);
  }
}
