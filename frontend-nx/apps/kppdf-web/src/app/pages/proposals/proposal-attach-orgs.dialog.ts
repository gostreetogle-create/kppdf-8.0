import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import type { Organization, Quotation } from '@kppdf/data-access';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';

export interface AttachOrgsDialogData {
  readonly quotation: Quotation;
  readonly organizations: readonly Organization[];
  /** Organization ids already present as variants — not offered again (BE is idempotent anyway). */
  readonly existingVariantOrgIds?: ReadonlySet<string>;
}

export interface AttachOrgsItemPayload {
  readonly organizationId: string;
  readonly orgMarkupPercent?: number;
}

/** Payload a confirmed attach dialog hands back to the page → `attachOrganizations`. */
export interface AttachOrgsResult {
  readonly items: readonly AttachOrgsItemPayload[];
}

@Component({
  selector: 'pi-proposal-attach-orgs-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent],
  template: `
    <app-pi-dialog
      title="Несколько фирм"
      variant="content"
      width="md"
      [showClose]="true"
      (userClose)="ref.close()"
    >
      <div body class="space-y-2">
        <p class="text-sm text-muted-foreground">
          Выберите наши организации — по каждой будет создан вариант КП. Наценку к
          варианту можно указать после выбора.
        </p>

        @if (available().length === 0) {
          <div class="text-sm text-muted-foreground py-6 text-center" data-test="attach-orgs-empty">
            Нет доступных организаций — все фирмы уже добавлены в семью.
          </div>
        } @else {
          <div class="max-h-72 overflow-y-auto space-y-1" data-test="attach-orgs-list">
            @for (org of available(); track org._id) {
              <label
                class="flex items-center gap-3 rounded-sm px-2 py-1.5 hover:bg-paper-2 cursor-pointer"
                data-test="attach-orgs-row"
              >
                <input
                  type="checkbox"
                  class="size-4 accent-sunrise-warm"
                  [checked]="checked().has(org._id)"
                  (change)="onToggle(org._id, $event)"
                  [attr.data-test]="'attach-org-' + org._id"
                  [attr.aria-label]="'Добавить фирму ' + orgLabel(org)"
                />
                <span class="text-sm font-medium">{{ orgLabel(org) }}</span>
              </label>

              @if (checked().has(org._id)) {
                <div class="pl-9 pb-2 flex items-center gap-2" [attr.data-test]="'attach-markup-' + org._id">
                  <label class="text-xs text-muted-foreground shrink-0" [for]="'markup-' + org._id">
                    Наценка, %
                  </label>
                  <input
                    [id]="'markup-' + org._id"
                    type="number"
                    min="0"
                    max="1000"
                    step="0.5"
                    class="pi-input w-24 h-8 px-2 text-sm"
                    [value]="markup()[org._id] ?? ''"
                    (input)="onMarkup(org._id, $event)"
                    data-test="attach-org-markup-input"
                  />
                </div>
              }
            }
          </div>
        }
      </div>
      <div footer class="flex justify-end gap-3">
        <button type="button" class="pi-button pi-button-outline" (click)="ref.close()">Отмена</button>
        <button
          type="button"
          class="pi-button pi-button-primary"
          [disabled]="checked().size === 0"
          (click)="confirm()"
          data-test="attach-orgs-confirm"
        >
          Добавить варианты
        </button>
      </div>
    </app-pi-dialog>
  `,
})
export class ProposalAttachOrgsDialogComponent {
  readonly data = inject<AttachOrgsDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<AttachOrgsResult | undefined>>(PI_DIALOG_REF);
  readonly toast = inject(PiToastService);

  readonly orgs = signal<readonly Organization[]>([...this.data.organizations]);
  readonly existing = new Set<string>(this.data.existingVariantOrgIds ?? []);

  readonly checked = signal<Set<string>>(new Set());
  readonly markup = signal<Record<string, number | undefined>>({});

  /** Firms not yet attached as variants of this quotation. */
  readonly available = computed(() =>
    this.orgs().filter((org) => !this.existing.has(org._id)),
  );

  orgLabel(org: Organization): string {
    return org.shortName?.trim() ? `${org.shortName} · ${org.name}` : org.name;
  }

  onToggle(orgId: string, event: Event): void {
    const next = new Set(this.checked());
    if ((event.target as HTMLInputElement).checked) next.add(orgId);
    else next.delete(orgId);
    this.checked.set(next);
  }

  onMarkup(orgId: string, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.markup.update((all) => ({ ...all, [orgId]: raw === '' ? undefined : Number(raw) }));
  }

  confirm(): void {
    const items = this.available()
      .filter((org) => this.checked().has(org._id))
      .map((org) => {
        const percent = this.markup()[org._id];
        return percent === undefined
          ? { organizationId: org._id }
          : { organizationId: org._id, orgMarkupPercent: percent };
      });
    if (items.length === 0) {
      this.toast.error('Выберите хотя бы одну организацию.');
      return;
    }
    this.ref.close({ items });
  }
}
