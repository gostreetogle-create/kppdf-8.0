import { Injectable, computed, inject, Injector, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from './ui/on-dialog-close-once';
import { PiToastService } from '@kppdf/ui/toast';
import {
  PiDocTypesService,
  PiDocumentTemplatesService,
  PiStudioDocumentsService,
  type DocType,
  type DocumentTemplate,
  type StudioDocument,
} from '@kppdf/data-access';
import { rememberStudioDocument } from './util';
import {
  StudioTemplatePickerDialogComponent,
  type StudioTemplatePickerDialogData,
} from './ui/studio-template-picker-dialog.component';
import {
  StudioCreateDoctypeDialogComponent,
  type StudioCreateDoctypeDialogData,
  type StudioCreateDoctypeResult,
} from './ui/studio-create-doctype-dialog.component';

/** Row-caption labels for the values used by the list status filter. */
export const STUDIO_DOCUMENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  frozen: 'Заморожен',
  final: 'В архиве',
};

export const STUDIO_NO_SAVED_TEMPLATES_MESSAGE =
  'Нет сохранённых шаблонов — сохраните из студии (Шаблон → Сохранить как шаблон)';

function pluralizeDocuments(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${n} документов`;
  if (mod10 === 1) return `${n} документ`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} документа`;
  return `${n} документов`;
}

@Injectable()
export class StudioListFacade {
  private readonly service = inject(PiStudioDocumentsService);
  private readonly documentTemplates = inject(PiDocumentTemplatesService);
  private readonly docTypesApi = inject(PiDocTypesService);
  private readonly router = inject(Router);
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

  readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  readonly allVisibleSelected = computed(() => {
    const docs = this.filteredDocuments();
    return docs.length > 0 && docs.every((d) => this.selectedIds().has(d._id));
  });
  readonly someVisibleSelected = computed(() => {
    if (this.allVisibleSelected()) return false;
    const ids = this.selectedIds();
    return this.filteredDocuments().some((d) => ids.has(d._id));
  });

  load(): void {
    this.status.set('loading');
    this.selectedIds.set(new Set());
    void firstValueFrom(this.service.list()).then((result) => {
      if (!result.ok) {
        this.error.set(String(result.error));
        this.status.set('error');
        return;
      }
      this.documents.set(result.data);
      this.status.set('success');
    });
  }

  toggleRow(id: string, checked: boolean): void {
    const next = new Set(this.selectedIds());
    if (checked) next.add(id); else next.delete(id);
    this.selectedIds.set(next);
  }

  toggleSelectAllVisible(checked: boolean): void {
    const next = new Set(this.selectedIds());
    for (const document of this.filteredDocuments()) {
      if (checked) next.add(document._id); else next.delete(document._id);
    }
    this.selectedIds.set(next);
  }

  removeSelected(): void {
    const ids = [...this.selectedIds()];
    if (ids.length === 0) return;
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: { title: `Удалить ${pluralizeDocuments(ids.length)}?`, confirmLabel: 'Удалить', cancelLabel: 'Отмена', variant: 'destructive' },
      width: 'sm',
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (ok !== true) return;
      void Promise.all(ids.map((id) => firstValueFrom(this.service.remove(id)))).then((results) => {
        const failed = results.filter((result) => !result.ok).length;
        if (failed > 0) this.toast.error(`Не удалось удалить ${pluralizeDocuments(failed)} из ${ids.length}`);
        this.load();
      });
    });
  }

  createFromTemplate(): void {
    void this.loadActiveTemplates().then((templates) => {
      if (templates === null) return;
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
        this.toast.error(STUDIO_NO_SAVED_TEMPLATES_MESSAGE);
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
          onDeleted: () => { void this.loadActiveTemplates(); },
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

  create(): void {
    void firstValueFrom(this.docTypesApi.list()).then((result) => {
      if (!result.ok) { this.toast.error(String(result.error)); return; }
      if (result.data.length === 0) { this.toast.error('Нет доступных типов документов'); return; }
      this.openCreateDoctypeDialog(result.data);
    });
  }

  private openCreateDoctypeDialog(docTypes: readonly DocType[]): void {
    const ref = this.dialog.open<StudioCreateDoctypeResult | undefined, StudioCreateDoctypeDialogData>(
      StudioCreateDoctypeDialogComponent,
      { data: { docTypes, defaultName: this.buildDefaultName('Документ') } },
    );
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (result) this.createDocument(result.name, result.docTypeId);
    });
  }

  private buildDefaultName(prefix: string): string {
    const date = new Date().toLocaleDateString('ru-RU');
    const sameDay = this.documents().filter((document) => document.name.startsWith(`${prefix} ${date}`)).length;
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

  documentStatusLabel(status: string): string {
    return STUDIO_DOCUMENT_STATUS_LABELS[status] ?? status;
  }

  formatUpdatedAt(value?: string): string {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  open(document: StudioDocument): void {
    rememberStudioDocument(document._id);
    void this.router.navigate(['/studio', document._id]);
  }

  remove(document: StudioDocument): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: { title: `Удалить «${document.name}»?`, confirmLabel: 'Удалить', cancelLabel: 'Отмена', variant: 'destructive' },
      width: 'sm',
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (ok !== true) return;
      void firstValueFrom(this.service.remove(document._id)).then((result) => {
        if (result.ok) this.load(); else this.toast.error(String(result.error));
      });
    });
  }
}
