import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PiTextBlockCategoriesService,
  PiTextBlocksService,
  type TextBlock,
  type TextBlockCategory,
} from '@kppdf/data-access';
import { PiDialogComponent, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ButtonComponent } from '@kppdf/ui/button';

export type StudioTextLibraryPickResult =
  | { readonly kind: 'empty' }
  | { readonly kind: 'library'; readonly textBlock: TextBlock };

/**
 * TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD — the discoverable entry point
 * the audit found missing: «+ Текст» in Элементы only ever created an empty
 * layer. The category → subcategory → list filter contract mirrors
 * `studio-text-properties.component.ts`'s own «Из библиотеки» picker
 * (TZ-NX-TEXT-PICKER-FORM) exactly — same services, same three-level
 * narrowing — so a text that resolves there resolves the same way here.
 * «Пустой текст» is a first-class option, not just what happens if you
 * close the dialog (closing with no pick does nothing, same as any other
 * cancel in this app).
 */
@Component({
  selector: 'pi-studio-text-library-picker-dialog',
  standalone: true,
  imports: [FormsModule, PiDialogComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-pi-dialog title="Вставить текст" variant="content" [showClose]="true">
    <div body class="space-y-3" data-test="studio-text-library-picker">
      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full"
        data-test="studio-text-library-empty"
        (click)="pickEmpty()"
      >
        Пустой текст
      </app-pi-button>

      <div class="filters">
        <label class="field">
          <span class="label">Категория</span>
          <select
            class="pi-input w-full"
            [ngModel]="filterRootId()"
            (ngModelChange)="onRootFilterChange($event)"
            data-test="studio-text-library-root"
          >
            <option value="">Все категории</option>
            @for (root of roots(); track root._id) {
              <option [value]="root._id">{{ root.name }}</option>
            }
          </select>
        </label>
        <label class="field">
          <span class="label">Подкатегория</span>
          <select
            class="pi-input w-full"
            [ngModel]="filterSubId()"
            (ngModelChange)="onSubFilterChange($event)"
            [disabled]="!filterRootId() || loadingSubs()"
            data-test="studio-text-library-sub"
          >
            <option value="">{{ filterRootId() ? 'Все подкатегории' : 'сначала выберите категорию' }}</option>
            @for (sub of subs(); track sub._id) {
              <option [value]="sub._id">{{ sub.name }}</option>
            }
          </select>
        </label>
      </div>

      <div class="list" data-test="studio-text-library-list">
        @for (tb of textBlocks(); track tb._id) {
          <button
            type="button"
            class="option pi-focus-ring"
            [attr.data-test]="'studio-text-library-option-' + tb._id"
            (click)="pickLibrary(tb)"
          >
            {{ tb.name }}
          </button>
        } @empty {
          <p class="hint" data-test="studio-text-library-empty-hint">
            {{ libraryHint() ?? 'Сохранённых текстов пока нет — сохраните текст из Свойств или в реестре «Тексты».' }}
          </p>
        }
      </div>
    </div>
    <div footer class="flex justify-end">
      <app-pi-button variant="outline" (click)="ref.close(undefined)">Отмена</app-pi-button>
    </div>
  </app-pi-dialog>`,
  styles: [`
    .filters { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .field { display: flex; flex-direction: column; gap: 4px; margin: 0; }
    .label { font-size: 11px; font-weight: 600; color: var(--color-muted-foreground); }
    .list { display: flex; flex-direction: column; gap: 4px; max-height: 260px; overflow: auto; }
    .option {
      text-align: left; padding: 8px 10px; border: 1px solid var(--color-rule-strong);
      border-radius: var(--radius-sm); background: var(--color-paper-2); color: var(--color-ink);
      font-size: 13px; cursor: pointer;
    }
    .option:hover { background: var(--color-paper-3); }
    .hint { margin: 0; font-size: 11px; line-height: 1.4; color: var(--color-muted-foreground); }
  `],
})
export class StudioTextLibraryPickerDialogComponent {
  private readonly textBlocksService = inject(PiTextBlocksService);
  private readonly categoriesService = inject(PiTextBlockCategoriesService);
  protected readonly ref = inject<DialogRef<StudioTextLibraryPickResult | undefined>>(PI_DIALOG_REF);

  protected readonly filterRootId = signal('');
  protected readonly filterSubId = signal('');
  protected readonly roots = signal<readonly TextBlockCategory[]>([]);
  protected readonly subs = signal<readonly TextBlockCategory[]>([]);
  protected readonly loadingSubs = signal(false);
  protected readonly textBlocks = signal<readonly TextBlock[]>([]);
  protected readonly libraryHint = signal<string | null>(null);

  constructor() {
    void this.loadRoots();
    void this.loadTextBlocks();
  }

  protected pickEmpty(): void {
    this.ref.close({ kind: 'empty' });
  }

  protected pickLibrary(textBlock: TextBlock): void {
    this.ref.close({ kind: 'library', textBlock });
  }

  protected onRootFilterChange(rootId: string): void {
    this.filterRootId.set(rootId);
    this.filterSubId.set('');
    this.subs.set([]);
    if (rootId) void this.loadSubs(rootId);
    void this.loadTextBlocks();
  }

  protected onSubFilterChange(subId: string): void {
    this.filterSubId.set(subId);
    void this.loadTextBlocks();
  }

  private async loadRoots(): Promise<void> {
    const result = await firstValueFrom(this.categoriesService.list({ rootsOnly: true }));
    if (result.ok) this.roots.set(result.data);
  }

  private async loadSubs(rootId: string): Promise<void> {
    this.loadingSubs.set(true);
    const result = await firstValueFrom(this.categoriesService.list({ parentId: rootId }));
    this.loadingSubs.set(false);
    if (result.ok) this.subs.set(result.data);
  }

  private async loadTextBlocks(): Promise<void> {
    const categoryId = this.filterSubId().trim();
    const result = await firstValueFrom(
      this.textBlocksService.list({
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      }),
    );
    if (!result.ok) {
      this.textBlocks.set([]);
      return;
    }
    const sorted = [...result.data].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, 'ru'),
    );
    this.textBlocks.set(sorted);
  }
}
