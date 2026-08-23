import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Pencil, Copy, ImagePlus } from 'lucide-angular';

import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { PiToastService } from '../../../../shared/ui/toast';
import {
  DocumentTemplatesService,
  type DocumentTemplate,
} from '../../../../shared/services/pi-document-templates.service';
import { extractErrorMessage } from '../../../../core/silent-http';

/**
 * TZ-KP-WS-405 — template mini-actions inside the workspace template panel:
 * rename (inline, no overlay), duplicate shell, background upload. Full
 * canvas stays in the builder route via returnUrl (picker).
 */
@Component({
  selector: 'app-workspace-template-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, LucideAngularModule],
  template: `
    <p class="text-xs text-muted-foreground m-0 px-4 pt-3" data-test="kp-hint-template">
      Эталон бланка. Переименование, фон и дубликат сохраняются для будущих КП.
    </p>
    <div class="kp-ws-tpl-actions" data-test="kp-ws-template-actions">
      <app-pi-button
        variant="outline"
        size="sm"
        [disabled]="!template() || readOnly()"
        (click)="startRename()"
        data-test="kp-ws-template-rename"
      >
        <lucide-angular [img]="pencilIcon" [size]="14" aria-hidden="true" /> Переименовать
      </app-pi-button>
      <app-pi-button
        variant="outline"
        size="sm"
        [disabled]="!template() || readOnly()"
        (click)="duplicate()"
        data-test="kp-ws-template-duplicate"
      >
        <lucide-angular [img]="copyIcon" [size]="14" aria-hidden="true" /> Дублировать
      </app-pi-button>
      <label
        class="kp-ws-tpl-actions__bg"
        [class.kp-ws-tpl-actions__bg--disabled]="bgDisabled()"
        (click)="onBgLabelClick($event)"
        data-test="kp-ws-template-bg-label"
      >
        <lucide-angular [img]="imageIcon" [size]="14" aria-hidden="true" /> Фон
        <input
          type="file"
          accept="image/*"
          [disabled]="bgDisabled()"
          (change)="onBackgroundFile($event)"
          data-test="kp-ws-template-bg"
          hidden
        />
      </label>
    </div>

    @if (renameOpen()) {
      <div class="kp-ws-tpl-rename" data-test="kp-ws-template-rename-form">
        <input
          class="pi-input"
          [value]="renameValue()"
          (input)="renameValue.set($any($event.target).value)"
          placeholder="Название шаблона"
          aria-label="Название шаблона"
        />
        <app-pi-button
          variant="secondary"
          size="sm"
          [disabled]="!renameValue().trim()"
          (click)="applyRename()"
          >Сохранить</app-pi-button
        >
        <app-pi-button variant="ghost" size="sm" (click)="renameOpen.set(false)"
          >Отмена</app-pi-button
        >
      </div>
    }
  `,
  styles: `
    .kp-ws-tpl-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--color-rule);
    }
    .kp-ws-tpl-actions__bg {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      padding: 0.35rem 0.6rem;
      border: 1px solid var(--color-rule);
      border-radius: 0.375rem;
      font-size: 0.8rem;
      color: var(--color-ink);
    }
    .kp-ws-tpl-actions__bg--disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .kp-ws-tpl-rename {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--color-rule);
    }
    .kp-ws-tpl-rename .pi-input {
      flex: 1;
      min-width: 0;
    }
  `,
})
export class ProposalWorkspaceTemplateActionsComponent {
  readonly template = input<DocumentTemplate | null>(null);
  readonly readOnly = input(false);

  protected readonly renameOpen = signal(false);
  protected readonly renameValue = signal('');
  protected readonly pencilIcon = Pencil;
  protected readonly copyIcon = Copy;
  protected readonly imageIcon = ImagePlus;

  protected readonly bgDisabled = computed(() => !this.template() || this.readOnly());

  private readonly templatesSvc = inject(DocumentTemplatesService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected onBgLabelClick(event: MouseEvent): void {
    if (!this.bgDisabled()) return;
    event.preventDefault();
    event.stopPropagation();
    this.toast.show('Сначала выберите шаблон в списке ниже');
  }

  protected startRename(): void {
    const tpl = this.template();
    if (!tpl || this.readOnly()) return;
    this.renameValue.set(tpl.name);
    this.renameOpen.set(true);
  }

  protected applyRename(): void {
    const tpl = this.template();
    const name = this.renameValue().trim();
    if (!tpl || !name || this.readOnly()) return;
    this.templatesSvc.update(tpl._id, { name }).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error) || 'Не удалось переименовать шаблон');
        return;
      }
      this.renameOpen.set(false);
      this.toast.success('Шаблон переименован');
    });
  }

  protected duplicate(): void {
    const tpl = this.template();
    if (!tpl || this.readOnly()) return;
    this.templatesSvc.duplicate(tpl._id).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error) || 'Не удалось дублировать шаблон');
        return;
      }
      this.toast.success('Копия шаблона создана');
    });
  }

  protected onBackgroundFile(event: Event): void {
    const tpl = this.template();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!tpl || !file || this.readOnly()) return;
    this.templatesSvc
      .uploadBackground(tpl._id, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        input.value = '';
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error) || 'Не удалось загрузить фон шаблона');
          return;
        }
        this.toast.success('Фон загружен');
      });
  }
}
