import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PiDialogComponent } from '../../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import type {
  DataSourceDescriptor,
  FieldDescriptor,
} from '../../../shared/services/pi-registry.service';

export interface DataFieldSelection {
  source: string;
  sourceLabel: string;
  field: FieldDescriptor;
}

export interface DataFieldPickerDialogData {
  sources: DataSourceDescriptor[];
  columnIndex: number;
}

const GROUP_LABELS: Record<DataSourceDescriptor['group'], string> = {
  contacts: 'Контрагенты и организации',
  catalog: 'Каталог',
  work: 'Работы и материалы',
};

/**
 * Диалог двухшагового выбора постановочного поля (Stitch / Paper & Ink).
 */
@Component({
  selector: 'app-data-field-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent, ButtonComponent],
  template: `
    <app-pi-dialog
      title="Постановочные данные"
      variant="content"
      [width]="'xl'"
      [maxWidth]="'896px'"
      [showClose]="true"
    >
      <div body class="dfpd-body">
        <div class="dfpd-hint">
          <span class="dfpd-hint-icon" aria-hidden="true">ⓘ</span>
          <p class="dfpd-hint-text">
            Колонка <strong>#{{ data.columnIndex + 1 }}</strong> — выберите источник, затем поле.
            Будет вставлен токен вида
            <code class="dfpd-hint-token">{{ previewToken() }}</code>
          </p>
        </div>

        <div class="dfpd-grid">
          <!-- Step 1: sources -->
          <div class="dfpd-sources">
            <span class="dfpd-step-label">Шаг 1: Выберите источник</span>

            @for (group of groupedSources(); track group.key) {
              <section class="dfpd-group">
                <div class="dfpd-group-head">{{ group.label }}</div>
                <div class="dfpd-source-list">
                  @for (src of group.sources; track src.key) {
                    <button
                      type="button"
                      class="dfpd-source-row"
                      [class.is-selected]="selectedSource()?.key === src.key"
                      (click)="pickSource(src)"
                    >
                      <span class="dfpd-source-name">{{ src.label }}</span>
                      <span class="dfpd-source-meta">
                        <span class="dfpd-source-count"
                          >{{ src.fields.length }} {{ fieldWord(src.fields.length) }}</span
                        >
                        <span class="dfpd-arrow" aria-hidden="true">→</span>
                      </span>
                    </button>
                  }
                </div>
              </section>
            }
          </div>

          <!-- Step 2: fields -->
          <div class="dfpd-fields-panel">
            @if (selectedSource(); as src) {
              <div class="dfpd-fields-head">
                <button type="button" class="dfpd-back" (click)="backToSources()">
                  ← Все источники
                </button>
                <span class="dfpd-crumb-sep">/</span>
                <span class="dfpd-crumb-current">{{ src.label }}</span>
              </div>

              <div class="dfpd-field-list">
                @for (field of src.fields; track field.key) {
                  <button
                    type="button"
                    class="dfpd-field-card"
                    [class.is-pending]="pendingField()?.key === field.key"
                    (click)="selectField(field)"
                  >
                    <div class="dfpd-field-top">
                      <span class="dfpd-field-label">{{ field.label }}</span>
                      <span class="dfpd-add-icon" aria-hidden="true">⊕</span>
                    </div>
                    <code class="dfpd-field-token">{{ token(src.key, field.key) }}</code>
                  </button>
                }
              </div>
            } @else {
              <div class="dfpd-empty">
                <span class="dfpd-empty-icon" aria-hidden="true">▦</span>
                <p>Выберите источник слева, чтобы просмотреть доступные поля</p>
              </div>
            }
          </div>
        </div>
      </div>

      <div footer class="dfpd-footer">
        <app-pi-button variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button variant="default" [disabled]="!canInsert()" (click)="confirmInsert()">
          Вставить токен
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
  styles: [
    `
      :host ::ng-deep app-pi-dialog > div[role='dialog'] {
        border-radius: 0;
      }

      .dfpd-body {
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-height: min(640px, 65vh);
        overflow-y: auto;
      }

      .dfpd-hint {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 16px;
        background: var(--color-paper-2);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
      }
      .dfpd-hint-icon {
        flex-shrink: 0;
        margin-top: 2px;
        color: var(--color-sunrise-warm);
        font-size: 16px;
        line-height: 1;
      }
      .dfpd-hint-text {
        margin: 0;
        font-size: 14px;
        line-height: 1.45;
        color: var(--color-muted-foreground-strong);
      }
      .dfpd-hint-token {
        display: inline-block;
        margin-left: 2px;
        padding: 1px 6px;
        font-family: ui-monospace, monospace;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: lowercase;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
      }

      .dfpd-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
      }
      @media (min-width: 768px) {
        .dfpd-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      .dfpd-step-label {
        display: block;
        margin-bottom: 12px;
        font-family: ui-monospace, monospace;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--color-muted-foreground-strong);
      }

      .dfpd-group {
        margin-bottom: 12px;
      }
      .dfpd-group-head {
        padding: 4px 8px;
        background: var(--color-paper-2);
        border: 1px solid var(--color-rule);
        border-bottom: none;
        font-family: ui-monospace, monospace;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-muted-foreground-strong);
      }
      .dfpd-source-list {
        border: 1px solid var(--color-rule);
      }
      .dfpd-source-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        width: 100%;
        padding: 8px 16px;
        background: var(--color-paper);
        border: none;
        border-bottom: 1px solid var(--color-rule);
        cursor: pointer;
        text-align: left;
        font-family: inherit;
        transition: background 100ms ease;
      }
      .dfpd-source-row:last-child {
        border-bottom: none;
      }
      .dfpd-source-row:hover {
        background: color-mix(in oklch, var(--color-sunrise-warm) 8%, var(--color-paper));
      }
      .dfpd-source-row.is-selected {
        background: color-mix(in oklch, var(--color-sunrise-warm) 10%, transparent);
        border-left: 3px solid var(--color-sunrise-warm);
      }
      .dfpd-source-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-ink);
      }
      .dfpd-source-meta {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .dfpd-source-count {
        font-size: 12px;
        font-weight: 500;
        color: var(--color-muted-foreground-strong);
      }
      .dfpd-arrow {
        font-size: 14px;
        color: var(--color-muted-foreground-strong);
        transition: transform 100ms ease;
      }
      .dfpd-source-row:hover .dfpd-arrow {
        transform: translateX(2px);
      }

      .dfpd-fields-panel {
        min-height: 240px;
      }
      @media (min-width: 768px) {
        .dfpd-fields-panel {
          border-left: 1px solid var(--color-rule);
          padding-left: 24px;
        }
      }

      .dfpd-fields-head {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }
      .dfpd-back {
        padding: 0;
        border: none;
        background: transparent;
        font-family: ui-monospace, monospace;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-muted-foreground-strong);
        cursor: pointer;
      }
      .dfpd-back:hover {
        color: var(--color-sunrise-warm);
      }
      .dfpd-crumb-sep {
        color: var(--color-rule);
      }
      .dfpd-crumb-current {
        font-family: ui-monospace, monospace;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-ink);
      }

      .dfpd-field-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .dfpd-field-card {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
        padding: 8px 12px;
        text-align: left;
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        cursor: pointer;
        font-family: inherit;
        transition: border-color 100ms ease;
      }
      .dfpd-field-card:hover,
      .dfpd-field-card.is-pending {
        border-color: var(--color-sunrise-warm);
      }
      .dfpd-field-card.is-pending {
        outline: 1px solid color-mix(in oklch, var(--color-sunrise-warm) 35%, transparent);
        outline-offset: 0;
      }
      .dfpd-field-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .dfpd-field-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-ink);
      }
      .dfpd-add-icon {
        font-size: 16px;
        line-height: 1;
        color: var(--color-sunrise-warm);
      }
      .dfpd-field-token {
        font-family: ui-monospace, monospace;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: lowercase;
        color: var(--color-muted-foreground-strong);
      }

      .dfpd-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 240px;
        padding: 24px;
        text-align: center;
        border: 1px dashed var(--color-rule);
        border-radius: 2px;
      }
      .dfpd-empty-icon {
        font-size: 32px;
        color: var(--color-rule);
      }
      .dfpd-empty p {
        margin: 0;
        max-width: 200px;
        font-size: 14px;
        color: var(--color-muted-foreground-strong);
      }

      .dfpd-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        width: 100%;
      }
    `,
  ],
})
export class DataFieldPickerDialogComponent {
  protected readonly data = inject<DataFieldPickerDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<DataFieldSelection | null>>(PI_DIALOG_REF);

  protected readonly selectedSource = signal<DataSourceDescriptor | null>(null);
  protected readonly pendingField = signal<FieldDescriptor | null>(null);

  protected readonly groupedSources = computed(() => {
    const map = new Map<DataSourceDescriptor['group'], DataSourceDescriptor[]>();
    for (const src of this.data.sources) {
      const list = map.get(src.group) ?? [];
      list.push(src);
      map.set(src.group, list);
    }
    return (['contacts', 'catalog', 'work'] as const)
      .filter((g) => map.has(g))
      .map((g) => ({
        key: g,
        label: GROUP_LABELS[g],
        sources: map.get(g)!,
      }));
  });

  protected readonly previewToken = computed(() => {
    const src = this.selectedSource();
    const field = this.pendingField();
    if (src && field) return this.token(src.key, field.key);
    return '{{organization.name}}';
  });

  protected readonly canInsert = computed(
    () => this.selectedSource() !== null && this.pendingField() !== null,
  );

  protected backToSources(): void {
    this.selectedSource.set(null);
    this.pendingField.set(null);
  }

  protected pickSource(src: DataSourceDescriptor): void {
    this.selectedSource.set(src);
    this.pendingField.set(null);
  }

  protected selectField(field: FieldDescriptor): void {
    this.pendingField.set(field);
    // Single click inserts immediately (Stitch UX — no extra confirm step).
    queueMicrotask(() => this.confirmInsert());
  }

  protected confirmInsert(): void {
    const src = this.selectedSource();
    const field = this.pendingField();
    if (!src || !field) return;
    this.ref.close({
      source: src.key,
      sourceLabel: src.label,
      field,
    });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }

  protected token(source: string, key: string): string {
    return `{{${source}.${key}}}`;
  }

  protected fieldWord(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 14) return 'полей';
    if (mod10 === 1) return 'поле';
    if (mod10 >= 2 && mod10 <= 4) return 'поля';
    return 'полей';
  }
}
