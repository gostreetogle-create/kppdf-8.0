import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';
import { CheckboxComponent } from '@kppdf/ui/checkbox';
import { PiPageChromeComponent } from '@kppdf/ui/page';
import { StudioListFacade } from './studio-list.facade';

export { STUDIO_NO_SAVED_TEMPLATES_MESSAGE } from './studio-list.facade';

@Component({
  selector: 'pi-studio-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StudioListFacade],
  imports: [PiStatusBannerComponent, PiPageChromeComponent, RouterLink, ButtonComponent, CheckboxComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="studio-list">
      <app-pi-page-chrome [crumbs]="[{ label: 'Документы' }]" />
      <div class="flex items-center justify-end gap-2 mb-4">
        <a class="inline-flex items-center justify-center gap-2 font-medium font-mono uppercase tracking-wider rounded-sm transition-all pi-focus-ring bg-transparent text-ink hover:bg-paper-2 h-10 px-4 text-sm" routerLink="/studio/templates" data-test="studio-templates-link">Шаблоны</a>
        <app-pi-button variant="secondary" type="button" data-test="studio-create-from-template" (click)="createFromTemplate()">Из шаблона</app-pi-button>
        <app-pi-button variant="default" type="button" data-test="studio-create" (click)="create()">Создать документ</app-pi-button>
      </div>
      @if (status() === 'loading') { <div class="text-sm text-muted-foreground">Загрузка…</div> }
      @if (status() === 'error') { <app-pi-status-banner tone="destructive" [message]="error()" actionLabel="Повторить" (action)="load()" /> }
      @if (status() === 'success') {
        <div class="flex items-center gap-2 mb-3">
          <input class="pi-input flex-1" type="search" placeholder="Поиск по названию" aria-label="Поиск документов" data-test="studio-list-search" [value]="search()" (input)="search.set($any($event.target).value)" />
          <select class="pi-input" aria-label="Фильтр по статусу" data-test="studio-list-status" [value]="statusFilter()" (change)="statusFilter.set($any($event.target).value)">
            <option value="all">Все статусы</option><option value="draft">Черновики</option><option value="frozen">Замороженные</option><option value="final">В архиве</option>
          </select>
        </div>
        @if (selectedIds().size > 0) {
          <div class="flex items-center gap-3 mb-3 px-4 py-2 hairline rounded-sm bg-paper-2" data-test="studio-bulk-bar">
            <span class="text-sm text-muted-foreground">Выбрано: {{ selectedIds().size }}</span>
            <app-pi-button variant="destructive" type="button" data-test="studio-bulk-delete" (click)="removeSelected()">Удалить выбранное ({{ selectedIds().size }})</app-pi-button>
          </div>
        }
      }
      @if (status() === 'success' && filteredDocuments().length === 0) { <div class="pi-dashed-panel p-8 text-center">Документов не найдено.</div> }
      @if (status() === 'success' && filteredDocuments().length > 0) {
        <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
          <div class="flex items-center gap-4 px-4 py-2 hairline-bottom bg-paper-2">
            <app-pi-checkbox size="sm" ariaLabel="Выбрать все документы" data-test="studio-select-all" [checked]="allVisibleSelected()" [indeterminate]="someVisibleSelected()" (checkedChange)="toggleSelectAllVisible($event)" />
            <span class="text-xs text-muted-foreground uppercase tracking-wider">Выбрать все</span>
          </div>
          @for (document of filteredDocuments(); track document._id) {
            <div class="flex items-center justify-between gap-4 px-4 py-3 hairline-bottom" data-test="studio-row">
              <div class="flex items-center gap-4 min-w-0">
                <app-pi-checkbox size="sm" [ariaLabel]="'Выбрать ' + document.name" data-test="studio-row-select" [checked]="selectedIds().has(document._id)" (checkedChange)="toggleRow(document._id, $event)" />
                <button class="text-left pi-focus-ring" type="button" (click)="open(document)">
                  <div class="font-medium">{{ document.name }}</div>
                  <div class="text-xs text-muted-foreground">{{ documentStatusLabel(document.status) }} · {{ formatUpdatedAt(document.updatedAt) }}</div>
                </button>
              </div>
              <div class="flex items-center gap-2">
                <app-pi-button variant="ghost" type="button" data-test="studio-duplicate" (click)="duplicate(document)">Дублировать</app-pi-button>
                <button class="pi-icon-btn pi-icon-btn-danger pi-focus-ring" type="button" aria-label="Удалить" title="Удалить" data-test="studio-delete" (click)="remove(document)">×</button>
              </div>
            </div>
          }
        </div>
      }
    </main>
  `,
})
export class StudioListPage implements OnInit {
  private readonly facade = inject(StudioListFacade);

  readonly documents = this.facade.documents;
  readonly status = this.facade.status;
  readonly error = this.facade.error;
  readonly search = this.facade.search;
  readonly statusFilter = this.facade.statusFilter;
  readonly filteredDocuments = this.facade.filteredDocuments;
  readonly selectedIds = this.facade.selectedIds;
  readonly allVisibleSelected = this.facade.allVisibleSelected;
  readonly someVisibleSelected = this.facade.someVisibleSelected;

  ngOnInit(): void { this.facade.load(); }
  load(): void { this.facade.load(); }
  toggleRow(id: string, checked: boolean): void { this.facade.toggleRow(id, checked); }
  toggleSelectAllVisible(checked: boolean): void { this.facade.toggleSelectAllVisible(checked); }
  removeSelected(): void { this.facade.removeSelected(); }
  createFromTemplate(): void { this.facade.createFromTemplate(); }
  duplicate(document: Parameters<StudioListFacade['duplicate']>[0]): void { this.facade.duplicate(document); }
  create(): void { this.facade.create(); }
  documentStatusLabel(status: string): string { return this.facade.documentStatusLabel(status); }
  formatUpdatedAt(value?: string): string { return this.facade.formatUpdatedAt(value); }
  open(document: Parameters<StudioListFacade['open']>[0]): void { this.facade.open(document); }
  remove(document: Parameters<StudioListFacade['remove']>[0]): void { this.facade.remove(document); }
}
