import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { PiDialogComponent } from '../../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { DocumentTemplateCategoriesService } from '../../../shared/services/pi-document-template-categories.service';
import { DocumentTemplateCategory } from '../../../shared/services/pi-document-template-categories.service';

export type PageSize = 'A3' | 'A4' | 'A5';
export type Orientation = 'portrait' | 'landscape';

/** Create requires categoryId; duplicate omits it (source category kept server-side). */
export interface TemplateSetupResult {
  pageSize: PageSize;
  orientation: Orientation;
  categoryId?: string;
}

export interface TemplateSetupData {
  mode: 'create' | 'duplicate';
}

/**
 * Dialog for choosing page size and orientation when creating or duplicating
 * a document template. Opened via PiDialogService.open().
 * TZ-DOC-336 — FormField + chips aria-pressed / pi-focus-ring.
 * TZ-DOC-337 — pageSize A3|A4|A5.
 * TZ-DOC-338 — system categories only (assignable to any org).
 * TZ-DOC-339 — duplicate hides category.
 */
@Component({
  selector: 'app-template-setup-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent, FormFieldComponent],
  template: `
    <app-pi-dialog
      title="Настройка шаблона"
      [width]="'sm'"
      variant="form"
      [showClose]="true"
      [animate]="false"
    >
      <div body>
        <div class="setup-form">
          @if (isCreate()) {
            <app-pi-form-field
              label="Категория шаблона"
              htmlFor="template-category"
              [required]="true"
              [error]="confirmAttempted() && !categoryId() ? 'Выберите категорию' : null"
            >
              @if (categoriesLoading()) {
                <span class="text-xs text-muted-foreground">Загрузка категорий…</span>
              } @else if (categoriesError()) {
                <span class="text-xs text-destructive">{{ categoriesError() }}</span>
              } @else if (categories().length === 0) {
                <div class="text-xs text-muted-foreground flex flex-col gap-2">
                  <span>Нет активных системных категорий.</span>
                  <button
                    type="button"
                    class="text-left text-xs underline text-ink pi-focus-ring"
                    (click)="goCategoriesDictionary()"
                  >
                    Открыть справочник категорий шаблонов
                  </button>
                </div>
              } @else {
                <select
                  id="template-category"
                  class="pi-input w-full"
                  [value]="categoryId()"
                  (change)="onCategoryChange($event)"
                  [class.border-destructive]="confirmAttempted() && !categoryId()"
                  aria-label="Категория шаблона"
                >
                  <option value="" disabled>— выберите категорию —</option>
                  @for (cat of categories(); track cat._id) {
                    <option [value]="cat._id">{{ cat.name }}</option>
                  }
                </select>
              }
            </app-pi-form-field>
          } @else {
            <p class="text-xs text-muted-foreground">
              Категория копируется с исходного шаблона. Можно сменить формат и ориентацию.
            </p>
          }

          <div class="field">
            <span class="field__label" id="page-size-label">Формат страницы</span>
            <div class="field__chips" role="group" aria-labelledby="page-size-label">
              @for (size of pageSizes; track size) {
                <button
                  type="button"
                  class="chip pi-focus-ring"
                  [class.chip--active]="pageSize() === size"
                  [attr.aria-pressed]="pageSize() === size"
                  (click)="pageSize.set(size)"
                >
                  {{ size }}
                </button>
              }
            </div>
          </div>

          <div class="field">
            <span class="field__label" id="orientation-label">Ориентация</span>
            <div class="field__chips" role="group" aria-labelledby="orientation-label">
              @for (orient of orientations; track orient.value) {
                <button
                  type="button"
                  class="chip pi-focus-ring"
                  [class.chip--active]="orientation() === orient.value"
                  [attr.aria-pressed]="orientation() === orient.value"
                  (click)="orientation.set(orient.value)"
                >
                  {{ orient.label }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
      <div footer>
        <app-pi-button variant="ghost" size="sm" (click)="onCancel()"> Отмена </app-pi-button>
        <app-pi-button variant="default" size="sm" (click)="onConfirm()" [disabled]="!canConfirm()">
          {{ data.mode === 'duplicate' ? 'Дублировать' : 'Создать' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
  styles: [
    `
      .setup-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 4px 0;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .field__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted, #7f7663);
      }

      .field__chips {
        display: flex;
        gap: 8px;
      }

      .chip {
        flex: 1;
        padding: 10px 16px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        background: var(--color-paper, #f8f9fa);
        color: var(--color-muted, #7f7663);
        cursor: pointer;
        transition: all 120ms ease;
      }

      .chip:hover {
        border-color: var(--color-ink, #191c1d);
        color: var(--color-ink, #191c1d);
      }

      .chip--active {
        background: var(--color-sunrise-warm, #735c00);
        border-color: var(--color-sunrise-warm, #735c00);
        /* paper (not white): dark theme gold is light — white text would dissolve */
        color: var(--color-paper, #191c1d);
      }
    `,
  ],
})
export class TemplateSetupDialogComponent {
  readonly data = inject<TemplateSetupData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<TemplateSetupResult>>(PI_DIALOG_REF);
  private readonly categoriesSvc = inject(DocumentTemplateCategoriesService);
  private readonly router = inject(Router);

  protected readonly pageSizes: PageSize[] = ['A3', 'A4', 'A5'];
  protected readonly orientations = [
    { value: 'portrait' as Orientation, label: 'Книжная' },
    { value: 'landscape' as Orientation, label: 'Альбомная' },
  ];

  protected readonly pageSize = signal<PageSize>('A4');
  protected readonly orientation = signal<Orientation>('portrait');
  protected readonly categoryId = signal<string>('');
  protected readonly categories = signal<DocumentTemplateCategory[]>([]);
  protected readonly categoriesLoading = signal(true);
  protected readonly categoriesError = signal<string | null>(null);
  protected readonly confirmAttempted = signal(false);
  protected readonly submitted = signal(false);

  protected isCreate(): boolean {
    return this.data.mode !== 'duplicate';
  }

  constructor() {
    if (this.isCreate()) {
      this.loadCategories();
    } else {
      this.categoriesLoading.set(false);
    }
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoriesError.set(null);
    this.categoriesSvc.list({ activeOnly: true }).subscribe((res) => {
      this.categoriesLoading.set(false);
      if (res.ok) {
        // TZ-DOC-338 — system-only (no organizationId): assignable to any org after ensureOrg.
        const systemOnly = (res.data ?? []).filter((c) => !c.organizationId);
        this.categories.set(systemOnly);
        const defaultCat = systemOnly.find((c) => c.isDefault) ?? systemOnly[0];
        if (defaultCat) {
          this.categoryId.set(defaultCat._id);
        }
      } else {
        this.categoriesError.set('Не удалось загрузить категории');
      }
    });
  }

  protected goCategoriesDictionary(): void {
    this.ref.close();
    void this.router.navigate(['/doc-template-categories']);
  }

  protected canConfirm(): boolean {
    if (this.submitted()) return false;
    if (!this.isCreate()) return true;
    if (this.categoriesLoading()) return false;
    if (this.categoriesError()) return false;
    if (this.categories().length === 0) return false;
    return true;
  }

  protected onCategoryChange(e: Event): void {
    this.categoryId.set((e.target as HTMLSelectElement).value);
    this.confirmAttempted.set(false);
  }

  protected onConfirm(): void {
    if (this.submitted()) return;
    if (this.isCreate()) {
      if (!this.categoryId()) {
        this.confirmAttempted.set(true);
        return;
      }
      this.submitted.set(true);
      this.ref.close({
        pageSize: this.pageSize(),
        orientation: this.orientation(),
        categoryId: this.categoryId(),
      });
      return;
    }
    this.submitted.set(true);
    this.ref.close({
      pageSize: this.pageSize(),
      orientation: this.orientation(),
    });
  }

  protected onCancel(): void {
    if (this.submitted()) return;
    this.submitted.set(true);
    this.ref.close();
  }
}
