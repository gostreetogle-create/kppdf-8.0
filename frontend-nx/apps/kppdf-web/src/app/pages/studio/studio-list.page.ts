import { ChangeDetectionStrategy, Component, inject, Injector, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { PiToastService } from '@kppdf/ui/toast';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiDocumentTemplatesService, PiStudioDocumentsService, type DocumentTemplate, type StudioDocument } from '@kppdf/data-access';
import { pickResumeStudioDocument, rememberStudioDocument } from './studio-session';
import { StudioTemplatePickerDialogComponent } from './studio-template-picker-dialog.component';

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
          <button class="pi-button pi-button-primary" type="button" data-test="studio-create" (click)="create()">Создать документ</button>
        </div>
      </div>
      @if (status() === 'loading') { <div class="text-sm text-muted-foreground">Загрузка…</div> }
      @if (status() === 'error') { <app-pi-status-banner tone="destructive" [message]="error()" actionLabel="Повторить" (action)="load()" /> }
      @if (status() === 'success' && documents().length === 0) { <div class="pi-dashed-panel p-8 text-center">Документов пока нет.</div> }
      @if (status() === 'success' && documents().length > 0) {
        <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
          @for (document of documents(); track document._id) {
            <div class="flex items-center justify-between gap-4 px-4 py-3 hairline-bottom" data-test="studio-row">
              <button class="text-left pi-focus-ring" type="button" (click)="open(document)">
                <div class="font-medium">{{ document.name }}</div>
                <div class="text-xs text-muted-foreground">{{ document.status }} · {{ formatUpdatedAt(document.updatedAt) }}</div>
              </button>
              <div class="flex items-center gap-2">
                <button class="pi-button pi-button-ghost" type="button" data-test="studio-duplicate" (click)="duplicate(document)">Дублировать</button>
                <button class="pi-icon-button pi-focus-ring" type="button" aria-label="Удалить" title="Удалить" (click)="remove(document)">×</button>
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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  readonly documents = signal<readonly StudioDocument[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить документы.');

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
    void firstValueFrom(this.documentTemplates.list()).then((result) => {
      if (!result.ok || result.data.length === 0) {
        this.toast.error('Нет доступных шаблонов документов');
        return;
      }
      const templates = result.data.filter((item) => item.isActive !== false);
      if (templates.length === 0) {
        this.toast.error('Нет активных шаблонов документов');
        return;
      }
      const ref = this.dialog.open<DocumentTemplate | undefined>(StudioTemplatePickerDialogComponent, {
        data: { templates },
      });
      onDialogCloseOnce(ref, this.injector, (template) => {
        if (!template) return;
        void firstValueFrom(this.service.createFromTemplate(template._id)).then((created) => {
          if (!created.ok) { this.toast.error(String(created.error)); return; }
          rememberStudioDocument(created.data._id);
          void this.router.navigate(['/studio', created.data._id]);
        });
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
    const date = new Date().toLocaleDateString('ru-RU');
    const sameDay = this.documents().filter((d) => d.name.startsWith(`Документ ${date}`)).length;
    const name = sameDay === 0 ? `Документ ${date}` : `Документ ${date} (${sameDay + 1})`;
    void firstValueFrom(this.service.create({ name, orientation: 'portrait', pageSize: 'A4' })).then((result) => {
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
