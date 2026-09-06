import { ChangeDetectionStrategy, Component, inject, Injector, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiDocumentTemplatesService,
  PiStudioDocumentsService,
  type DocumentTemplate,
} from '@kppdf/data-access';
import { PiPageChromeComponent } from '@kppdf/ui/page';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { rememberStudioDocument } from './studio-session';

/**
 * TZ-NX-DOCSTUDIO-C2-THREE-SECTIONS — «Шаблоны» journal at `/studio/templates`.
 * Documents-template registry only: create a studio document from a template
 * or remove a template. No template editor here (out of scope; categories
 * page stays untouched).
 */
@Component({
  selector: 'pi-studio-templates-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageChromeComponent, PiStatusBannerComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="studio-templates-list">
      <app-pi-page-chrome [crumbs]="[{ label: 'Документы', link: '/studio' }, { label: 'Шаблоны' }]" />
      @if (status() === 'loading') { <div class="text-sm text-muted-foreground">Загрузка…</div> }
      @if (status() === 'error') { <app-pi-status-banner tone="destructive" [message]="error()" actionLabel="Повторить" (action)="load()" /> }
      @if (status() === 'success' && templates().length === 0) {
        <div class="pi-dashed-panel p-8 text-center">Шаблонов не найдено.</div>
      }
      @if (status() === 'success' && templates().length > 0) {
        <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
          @for (template of templates(); track template._id) {
            <div class="flex items-center justify-between gap-4 px-4 py-3 hairline-bottom" data-test="studio-template-row">
              <div class="text-left pi-focus-ring">
                <div class="font-medium">{{ template.name }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ template.orientation === 'landscape' ? 'Альбомная' : 'Книжная' }} · {{ template.pageSize ?? 'A4' }}@if (template.isActive === false) { · неактивен }
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button class="pi-button pi-button-secondary" type="button" [attr.data-test]="'studio-template-create-' + template._id" (click)="createFromTemplate(template)">Создать документ</button>
                <button class="pi-icon-button pi-focus-ring" type="button" aria-label="Удалить шаблон" title="Удалить" [attr.data-test]="'studio-template-delete-' + template._id" (click)="remove(template)">×</button>
              </div>
            </div>
          }
        </div>
      }
    </main>
  `,
})
export class StudioTemplatesListPage implements OnInit {
  private readonly templatesApi = inject(PiDocumentTemplatesService);
  private readonly documentsApi = inject(PiStudioDocumentsService);
  private readonly router = inject(Router);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);

  readonly templates = signal<readonly DocumentTemplate[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить шаблоны.');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    void firstValueFrom(this.templatesApi.list()).then((result) => {
      if (!result.ok) {
        this.error.set(String(result.error));
        this.status.set('error');
        return;
      }
      this.templates.set(result.data);
      this.status.set('success');
    });
  }

  /** Create a studio document from this template and open it in the editor. */
  createFromTemplate(template: DocumentTemplate): void {
    void firstValueFrom(this.documentsApi.createFromTemplate(template._id)).then((created) => {
      if (!created.ok) {
        this.toast.error(String(created.error));
        return;
      }
      rememberStudioDocument(created.data._id);
      void this.router.navigate(['/studio', created.data._id]);
    });
  }

  /** Same destructive-confirm pattern as the template picker dialog. */
  remove(template: DocumentTemplate): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: `Удалить шаблон «${template.name}»?`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
        variant: 'destructive',
      },
      width: 'sm',
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (ok !== true) return;
      void firstValueFrom(this.templatesApi.remove(template._id)).then((result) => {
        if (!result.ok) {
          this.toast.error(String(result.error));
          return;
        }
        this.load();
      });
    });
  }
}
