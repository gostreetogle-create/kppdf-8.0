import { ChangeDetectionStrategy, Component, computed, inject, Injector, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { PiToastService } from '@kppdf/ui/toast';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiDocTypesService, PiDocumentTemplatesService, PiStudioDocumentsService, type DocType, type DocumentTemplate, type StudioDocument } from '@kppdf/data-access';
import { findKpDocType } from './studio-kp-doc-type';
import { pickResumeStudioDocument, rememberStudioDocument } from './studio-session';
import { StudioTemplatePickerDialogComponent, type StudioTemplatePickerDialogData } from './studio-template-picker-dialog.component';
import { StudioCreateDoctypeDialogComponent, type StudioCreateDoctypeDialogData, type StudioCreateDoctypeResult } from './studio-create-doctype-dialog.component';

@Component({
  selector: 'pi-studio-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="studio-list">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div><div class="eyebrow">Документы</div><h1 class="font-display text-2xl m-0">Студия документов</h1></div>
        <div class="flex items-center gap-2">
          <button class="pi-button pi-button-secondary" type="button" data-test="studio-create-from-template" (click)="createFromTemplate()">Из шаблона</button>
          <button class="pi-button pi-button-secondary" type="button" data-test="studio-create-kp" (click)="createKp()">Новое КП</button>
          <button class="pi-button pi-button-primary" type="button" data-test="studio-create" (click)="create()">Создать документ</button>
        </div>
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
      }
      @if (status() === 'success' && filteredDocuments().length === 0) { <div class="pi-dashed-panel p-8 text-center">Документов не найдено.</div> }
      @if (status() === 'success' && filteredDocuments().length > 0) {
        <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
          @for (document of filteredDocuments(); track document._id) {
            <div class="flex items-center justify-between gap-4 px-4 py-3 hairline-bottom" data-test="studio-row">
              <button class="text-left pi-focus-ring" type="button" (click)="open(document)">
                <div class="font-medium">{{ document.name }}</div>
                <div class="text-xs text-muted-foreground">{{ document.status }} · {{ formatUpdatedAt(document.updatedAt) }}</div>
              </button>
              <div class="flex items-center gap-2">
                <button class="pi-button pi-button-ghost" type="button" data-test="studio-duplicate" (click)="duplicate(document)">Дублировать</button>
                <button class="pi-icon-button pi-focus-ring" type="button" aria-label="Удалить" title="Удалить" data-test="studio-delete" (click)="remove(document)">×</button>
              </div>
            </div>
          }
        </div>
      }
    </main>
  `,
})
export class StudioListPage implements OnInit {
  private readonly service = inject(PiStudioDocumentsService);
  private readonly documentTemplates = inject(PiDocumentTemplatesService);
  private readonly docTypesApi = inject(PiDocTypesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  readonly documents = signal<readonly StudioDocument[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить документы.');
  readonly search = signal('');
  readonly statusFilter = signal<'all' | 'draft' | 'frozen' | 'final'>('all');
  readonly filteredDocuments = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    const filter = this.statusFilter();
    return this.documents().filter((document) =>
      (!query || document.name.toLocaleLowerCase().includes(query)) &&
      (filter === 'all' || document.status === filter),
    );
  });

  ngOnInit(): void { this.load(); }
  load(): void {
    this.status.set('loading');
    void firstValueFrom(this.service.list()).then((result) => {
      if (!result.ok) { this.error.set(String(result.error)); this.status.set('error'); return; }
      const rows = result.data;
      this.documents.set(rows);

      const forceList = this.route.snapshot.queryParamMap.get('list') === '1';
      const resume = !forceList ? pickResumeStudioDocument(rows) : null;
      if (resume) {
        rememberStudioDocument(resume._id);
        void this.router.navigate(['/studio', resume._id]);
        return;
      }

      this.status.set('success');
    });
  }
  createFromTemplate(): void {
    void this.loadActiveTemplates().then((templates) => {
      if (templates === null) return;
      if (templates.length === 0) {
        this.toast.error('Нет активных шаблонов документов');
        return;
      }
      this.openTemplatePicker(templates);
    });
  }

  private loadActiveTemplates(): Promise<readonly DocumentTemplate[] | null> {
    return firstValueFrom(this.documentTemplates.list()).then((result) => {
      if (!result.ok) {
        this.toast.error(String(result.error));
        return null;
      }
      if (result.data.length === 0) {
        this.toast.error('Нет доступных шаблонов документов');
        return null;
      }
      return result.data.filter((item) => item.isActive !== false);
    });
  }

  private openTemplatePicker(templates: readonly DocumentTemplate[]): void {
    const ref = this.dialog.open<DocumentTemplate | undefined, StudioTemplatePickerDialogData>(
      StudioTemplatePickerDialogComponent,
      {
        data: {
          templates,
          onDeleted: () => {
            void this.loadActiveTemplates();
          },
        },
      },
    );

    onDialogCloseOnce(ref, this.injector, (template) => {
      if (!template) return;
      void firstValueFrom(this.service.createFromTemplate(template._id)).then((created) => {
        if (!created.ok) { this.toast.error(String(created.error)); return; }
        rememberStudioDocument(created.data._id);
        void this.router.navigate(['/studio', created.data._id]);
      });
    });
  }


  duplicate(document: StudioDocument): void {
    void firstValueFrom(this.service.duplicate(document._id)).then((result) => {
      if (result.ok) {
        rememberStudioDocument(result.data._id);
        void this.router.navigate(['/studio', result.data._id]);
      } else this.toast.error(String(result.error));
    });
  }

  /** «Создать документ» — требует явный выбор типа, чтобы Save-as-template и токены/КП-lifecycle не ломались по смыслу. */
  create(): void {
    void firstValueFrom(this.docTypesApi.list()).then((result) => {
      if (!result.ok) {
        this.toast.error(String(result.error));
        return;
      }
      if (result.data.length === 0) {
        this.toast.error('Нет доступных типов документов');
        return;
      }
      this.openCreateDoctypeDialog(result.data);
    });
  }

  private openCreateDoctypeDialog(docTypes: readonly DocType[]): void {
    const ref = this.dialog.open<StudioCreateDoctypeResult | undefined, StudioCreateDoctypeDialogData>(
      StudioCreateDoctypeDialogComponent,
      { data: { docTypes, defaultName: this.buildDefaultName('Документ') } },
    );
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      this.createDocument(result.name, result.docTypeId);
    });
  }

  /** «Новое КП» — pre-selects the КП doc type so Шаблон/Данные and the quotation link are ready without an extra step. */
  createKp(): void {
    void firstValueFrom(this.docTypesApi.list()).then((result) => {
      const kpDocType = result.ok ? findKpDocType(result.data) : undefined;
      if (!kpDocType) {
        this.toast.error('Тип документа «КП» не найден');
        return;
      }
      this.createDocument(this.buildDefaultName('КП'), kpDocType._id);
    });
  }

  private buildDefaultName(prefix: string): string {
    const date = new Date().toLocaleDateString('ru-RU');
    const sameDay = this.documents().filter((d) => d.name.startsWith(`${prefix} ${date}`)).length;
    return sameDay === 0 ? `${prefix} ${date}` : `${prefix} ${date} (${sameDay + 1})`;
  }

  private createDocument(name: string, docTypeId: string): void {
    void firstValueFrom(this.service.create({ name, orientation: 'portrait', pageSize: 'A4', docTypeId })).then((result) => {
      if (result.ok) {
        rememberStudioDocument(result.data._id);
        void this.router.navigate(['/studio', result.data._id]);
      } else this.toast.error(String(result.error));
    });
  }
  protected formatUpdatedAt(value?: string): string {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  open(document: StudioDocument): void {
    rememberStudioDocument(document._id);
    void this.router.navigate(['/studio', document._id]);
  }
  remove(document: StudioDocument): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, { data: { title: `Удалить «${document.name}»?`, confirmLabel: 'Удалить', cancelLabel: 'Отмена', variant: 'destructive' }, width: 'sm' });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (ok !== true) return;
      void firstValueFrom(this.service.remove(document._id)).then((result) => { if (result.ok) this.load(); else this.toast.error(String(result.error)); });
    });
  }
}
