import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';
import { DICTIONARY_TOC_CHIPS } from './dictionary-group-chips';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import {
  DictionaryLabel,
  DictionaryLabelScope,
  PiDictionaryLabelsService,
} from '../../shared/services/pi-dictionary-labels.service';

@Component({
  selector: 'app-kind-labels-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PiGroupWorkspaceComponent, ButtonComponent, SwitchComponent],
  template: `
    <app-pi-group-workspace
      [toc]="toc"
      tocActiveId="classification"
      [chips]="chips"
      activeId="kind-labels"
    >
      <div class="space-y-4" data-test="kind-labels-page">
        <header>
          <p class="eyebrow text-muted-foreground mb-1">Классификация</p>
          <h1 class="font-display text-2xl tracking-tight m-0">Виды изделий и материалов</h1>
          <p class="text-sm text-muted-foreground mt-1 max-w-2xl m-0">
            Подписи можно менять без изменения ключей, которые хранятся в каталоге.
          </p>
        </header>

        <div class="flex gap-1" role="tablist" aria-label="Область подписей">
          @for (tab of tabs; track tab.scope) {
            <button
              type="button"
              role="tab"
              class="pi-input px-3 py-2 text-sm cursor-pointer"
              [class.bg-paper-2]="scope() === tab.scope"
              [attr.aria-selected]="scope() === tab.scope"
              [attr.data-test]="'tab-' + tab.scope"
              (click)="onScopeChange(tab.scope)"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        @if (error()) {
          <div
            role="alert"
            class="border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
          >
            {{ error() }}
            <app-pi-button class="mt-3" variant="outline" size="sm" (click)="reload()"
              >Повторить</app-pi-button
            >
          </div>
        }

        @if (loading()) {
          <p class="text-sm text-muted-foreground" role="status">Загрузка…</p>
        } @else {
          <section class="hairline rounded-sm bg-paper" data-test="kind-labels-table">
            <div
              class="grid grid-cols-[minmax(7rem,12rem)_minmax(12rem,1fr)_7rem_8rem] gap-3 px-4 py-2 hairline-b bg-paper-2/50 text-xs text-muted-foreground"
            >
              <span>Ключ</span><span>Подпись</span><span>Активен</span><span></span>
            </div>
            @for (row of rows(); track row._id) {
              <div
                class="grid grid-cols-[minmax(7rem,12rem)_minmax(12rem,1fr)_7rem_8rem] gap-3 items-center px-4 py-2.5 hairline-b last:border-0"
                [attr.data-test]="'label-row-' + row.key"
              >
                <code class="font-mono text-xs">{{ row.key }}</code>
                <input
                  class="pi-input w-full"
                  [ngModel]="row.draftLabel"
                  (ngModelChange)="onDraftLabel(row._id, $event)"
                  [attr.aria-label]="'Подпись ' + row.key"
                  [attr.data-test]="'label-input-' + row.key"
                />
                <app-pi-switch
                  [checked]="row.isActive"
                  [ariaLabel]="(row.isActive ? 'Деактивировать ' : 'Активировать ') + row.key"
                  (checkedChange)="onActiveChange(row, $event)"
                  [attr.data-test]="'active-' + row.key"
                />
                <app-pi-button
                  variant="outline"
                  size="sm"
                  [disabled]="row.saving || !row.draftLabel.trim()"
                  (click)="save(row)"
                  [attr.data-test]="'save-' + row.key"
                >
                  {{ row.saving ? 'Сохранение…' : 'Сохранить' }}
                </app-pi-button>
              </div>
            } @empty {
              <p class="px-4 py-6 text-sm text-muted-foreground m-0">Нет подписей.</p>
            }
          </section>
        }
      </div>
    </app-pi-group-workspace>
  `,
})
export class KindLabelsPage {
  protected readonly toc: readonly GroupChip[] = DICTIONARY_TOC_CHIPS;
  protected readonly chips: readonly GroupChip[] = [
    { id: 'kind-labels', label: 'Виды изделий и материалов', route: '/dictionaries/kind-labels' },
  ];
  protected readonly tabs = [
    { scope: 'productKind' as const, label: 'Виды изделий' },
    { scope: 'materialKind' as const, label: 'Виды материалов' },
  ];
  protected readonly scope = signal<DictionaryLabelScope>('productKind');
  protected readonly rows = signal<EditableLabel[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly service = inject(PiDictionaryLabelsService);
  private readonly toast = inject(PiToastService);

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list(this.scope()).subscribe((result) => {
      this.loading.set(false);
      if (result.ok) {
        this.rows.set(result.data.map((row) => ({ ...row, draftLabel: row.label, saving: false })));
      } else {
        this.rows.set([]);
        this.error.set(extractErrorMessage(result.error));
      }
    });
  }

  protected onScopeChange(scope: DictionaryLabelScope): void {
    if (this.scope() === scope) return;
    this.scope.set(scope);
    this.reload();
  }

  protected onDraftLabel(id: string, draftLabel: string): void {
    this.rows.update((rows) => rows.map((row) => (row._id === id ? { ...row, draftLabel } : row)));
  }

  protected onActiveChange(row: EditableLabel, isActive: boolean): void {
    this.rows.update((rows) =>
      rows.map((item) => (item._id === row._id ? { ...item, isActive } : item)),
    );
    const current = this.rows().find((item) => item._id === row._id);
    if (current) this.save(current);
  }

  protected save(row: EditableLabel): void {
    if (row.saving || !row.draftLabel.trim()) return;
    this.setSaving(row._id, true);
    this.service
      .update(row._id, { label: row.draftLabel.trim(), isActive: row.isActive })
      .subscribe((result) => {
        this.setSaving(row._id, false);
        if (result.ok) {
          this.rows.update((rows) =>
            rows.map((item) =>
              item._id === row._id
                ? { ...item, ...result.data, draftLabel: result.data.label }
                : item,
            ),
          );
          this.toast.success(`Подпись «${result.data.key}» сохранена`);
        } else {
          this.toast.error(extractErrorMessage(result.error));
          this.reload();
        }
      });
  }

  private setSaving(id: string, saving: boolean): void {
    this.rows.update((rows) => rows.map((row) => (row._id === id ? { ...row, saving } : row)));
  }
}

type EditableLabel = DictionaryLabel & { draftLabel: string; saving: boolean };
