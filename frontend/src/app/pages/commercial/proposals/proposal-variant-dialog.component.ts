import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PiDialogComponent } from '../../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  Proposal,
  ProposalFamilyMemberSummary,
  ProposalsService,
} from '../../../shared/services/pi-proposals.service';

export interface ProposalVariantDialogData {
  member: ProposalFamilyMemberSummary;
  organizationName: string;
}

@Component({
  selector: 'app-proposal-variant-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, PiDialogComponent, ButtonComponent],
  template: `
    <app-pi-dialog [title]="'Вариант ' + data.member.number" [width]="'lg'">
      <div body class="space-y-4 overflow-y-auto min-h-0" data-test="variant-readonly">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-form-field text-sm">
          <div>
            <span class="eyebrow block">Организация</span>
            <span>{{ data.organizationName }}</span>
          </div>
          <div>
            <span class="eyebrow block">Версия семьи</span>
            <span>v{{ data.member.familyVersion }}</span>
          </div>
          <div>
            <span class="eyebrow block">Статус</span>
            <span>{{ data.member.status }}</span>
          </div>
          <div>
            <span class="eyebrow block">Сумма</span>
            <span>{{ data.member.total | number: '1.0-2' }} ₽</span>
          </div>
        </div>

        @if (loading()) {
          <p class="text-sm text-muted-foreground">Загрузка позиций…</p>
        } @else if (error()) {
          <p role="alert" class="text-sm text-destructive">{{ error() }}</p>
        } @else {
          <div class="space-y-2" data-test="variant-items">
            <h2 class="text-sm font-medium">Позиции</h2>
            @if ((proposal()?.items?.length ?? 0) === 0) {
              <p class="text-sm text-muted-foreground">В варианте нет позиций.</p>
            }
            @for (item of proposal()?.items ?? []; track $index) {
              <div
                class="grid grid-cols-[1fr_auto_auto] gap-3 items-baseline hairline-b pb-2 text-sm"
              >
                <span>{{ item.productName || 'Изделие' }}</span>
                <span class="text-muted-foreground"
                  >{{ item.quantity }} {{ item.unit || 'шт.' }}</span
                >
                <span>{{ item.unitPrice | number: '1.0-2' }} ₽</span>
              </div>
            }
          </div>
        }
      </div>
      <div footer class="flex justify-end">
        <app-pi-button variant="ghost" (click)="close()">Закрыть</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ProposalVariantDialogComponent {
  readonly data = inject<ProposalVariantDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<void>>(PI_DIALOG_REF);
  private readonly service = inject(ProposalsService);

  protected readonly proposal = signal<Proposal | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.service.findById(this.data.member.id).subscribe((res) => {
      this.loading.set(false);
      if (res.ok) this.proposal.set(res.data);
      else this.error.set(extractErrorMessage(res.error));
    });
  }

  protected close(): void {
    this.ref.close();
  }
}
