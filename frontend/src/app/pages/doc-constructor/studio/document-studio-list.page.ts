import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { extractErrorMessage } from '../../../core/silent-http';
import { PiGroupWorkspaceComponent } from '../../../shared/page/pi-group-workspace.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import {
  PiStudioDocumentsService,
  type StudioDocument,
} from '../../../shared/services/pi-studio-documents.service';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import { StudioTemplatePickDialogComponent } from './studio-template-pick-dialog.component';
import { STUDIO_SECTION_CHIPS, STUDIO_TOC_CHIPS } from './studio-group-chips';

@Component({
  selector: 'app-document-studio-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, RouterLink, ButtonComponent, PiRowActionsComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="studio" [chips]="chips" activeId="list">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <app-pi-button variant="outline" [disabled]="creating()" (click)="openFromTemplate()">
          Из шаблона
        </app-pi-button>
        <app-pi-button variant="default" [disabled]="creating()" (click)="createDocument()">
          + Новый документ
        </app-pi-button>
      </div>

      <div class="flex flex-col gap-3 min-w-0">
        @if (loading()) {
          <p class="text-sm text-muted-foreground px-1">Загрузка…</p>
        } @else if (error()) {
          <div class="pi-dashed-panel p-6 max-w-md text-center">
            <p class="text-sm text-destructive">{{ error() }}</p>
          </div>
        } @else if (documents().length === 0) {
          <div
            class="pi-dashed-panel p-8 max-w-md mx-auto text-center flex flex-col items-center gap-3"
          >
            <p class="text-sm font-medium text-ink">Пока нет документов</p>
            <p class="text-sm text-muted-foreground">
              Создайте первый — откроется редактор с пустым листом A4.
            </p>
            <div class="flex flex-wrap items-center justify-center gap-2">
              <app-pi-button variant="outline" (click)="openFromTemplate()">
                Из шаблона
              </app-pi-button>
              <app-pi-button variant="default" (click)="createDocument()">
                + Новый документ
              </app-pi-button>
            </div>
          </div>
        } @else {
          <div class="pi-table-wrap overflow-x-auto">
            <table class="pi-table w-full text-sm">
              <thead>
                <tr>
                  <th class="text-left">Название</th>
                  <th class="text-left w-28">Статус</th>
                  <th class="text-left w-24">Формат</th>
                  <th class="text-right w-36">Обновлён</th>
                  <th class="text-right w-24"></th>
                </tr>
              </thead>
              <tbody>
                @for (doc of documents(); track doc._id) {
                  <tr
                    class="cursor-pointer hover:bg-paper-2"
                    [routerLink]="['/doc-constructor/studio', doc._id]"
                  >
                    <td class="font-medium">{{ doc.name }}</td>
                    <td>{{ statusLabel(doc.status) }}</td>
                    <td>{{ doc.pageSize }} · {{ orientationLabel(doc.orientation) }}</td>
                    <td class="text-right text-muted-foreground tabular-nums">
                      {{ formatUpdated(doc.updatedAt) }}
                    </td>
                    <td class="text-right" (click)="$event.stopPropagation()">
                      <app-pi-row-actions
                        [row]="doc"
                        copyLabel="Дублировать"
                        deleteLabel="Удалить"
                        [showEdit]="false"
                        [showDelete]="false"
                        [loading]="duplicatingId() === doc._id"
                        (copy)="duplicateDocument($event)"
                      />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </app-pi-group-workspace>
  `,
})
export class DocumentStudioListPage {
  private readonly api = inject(PiStudioDocumentsService);
  private readonly router = inject(Router);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly toc = STUDIO_TOC_CHIPS;
  protected readonly chips = STUDIO_SECTION_CHIPS;
  protected readonly documents = signal<readonly StudioDocument[]>([]);
  protected readonly loading = signal(true);
  protected readonly creating = signal(false);
  protected readonly duplicatingId = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.reload();
  }

  protected createDocument(): void {
    if (this.creating()) return;
    this.creating.set(true);
    this.api
      .create({ name: `Документ ${new Date().toLocaleDateString('ru-RU')}` })
      .pipe(
        finalize(() => this.creating.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (doc) => {
          void this.router.navigate(['/doc-constructor/studio', doc._id]);
        },
        error: (err) => {
          this.toast.error(extractErrorMessage(err));
        },
      });
  }

  protected openFromTemplate(): void {
    if (this.creating()) return;
    const ref = this.dialog.open<DocumentTemplate>(StudioTemplatePickDialogComponent, {
      width: 'md',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (template) => {
      this.creating.set(true);
      this.api
        .createFromTemplate(template._id, template.name)
        .pipe(
          finalize(() => this.creating.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (doc) => {
            void this.router.navigate(['/doc-constructor/studio', doc._id], {
              queryParams: { fromTemplate: template._id },
            });
          },
          error: (err) => {
            this.toast.error(extractErrorMessage(err));
          },
        });
    });
  }

  protected duplicateDocument(doc: StudioDocument): void {
    if (this.duplicatingId()) return;
    this.duplicatingId.set(doc._id);
    this.api
      .duplicate(doc._id)
      .pipe(
        finalize(() => this.duplicatingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (copy) => {
          this.toast.success('Копия создана');
          this.reload();
          void this.router.navigate(['/doc-constructor/studio', copy._id]);
        },
        error: (err) => {
          this.toast.error(extractErrorMessage(err));
        },
      });
  }

  protected statusLabel(status: StudioDocument['status']): string {
    switch (status) {
      case 'draft':
        return 'Черновик';
      case 'frozen':
        return 'Заморожен';
      case 'final':
        return 'Финал';
      default:
        return status;
    }
  }

  protected orientationLabel(o: StudioDocument['orientation']): string {
    return o === 'landscape' ? 'Альб.' : 'Книж.';
  }

  protected formatUpdated(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .list()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rows) => this.documents.set(rows),
        error: (err) => {
          this.error.set(extractErrorMessage(err));
        },
      });
  }
}
