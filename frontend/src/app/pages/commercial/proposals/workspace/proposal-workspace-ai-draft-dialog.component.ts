import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PI_DIALOG_REF } from '../../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../../shared/ui/dialog/pi-dialog.service';
import { PiDialogComponent } from '../../../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

/**
 * TZ-KP-WS-406 hotfix — explains Desktop → MCP → workspace draft path
 * instead of deep-linking to the empty /import-todos page.
 */
@Component({
  selector: 'app-workspace-ai-draft-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent, ButtonComponent],
  template: `
    <app-pi-dialog
      title="Создать черновик шаблона из файла"
      [variant]="'content'"
      [width]="'md'"
      (userClose)="onClose()"
    >
      <div body class="space-y-3">
        <p class="text-sm text-muted-foreground m-0 leading-relaxed">
          Черновик создаёт агент Desktop-приложения (MCP). Контент файла не конвертируется
          автоматически — вы доводите шаблон здесь или в конструкторе.
        </p>
        <ol class="m-0 pl-5 text-sm leading-relaxed space-y-2">
          <li>Desktop → вкладка «Импорт» → загрузите файл</li>
          <li>Агент (MCP) создаст черновик шаблона</li>
          <li>Вернитесь в КП → панель «Шаблон» — черновик появится в списке</li>
        </ol>
      </div>
      <div footer>
        <app-pi-button variant="default" size="sm" (click)="onClose()">Понятно</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ProposalWorkspaceAiDraftDialogComponent {
  private readonly ref = inject<DialogRef<void>>(PI_DIALOG_REF);

  protected onClose(): void {
    this.ref.close();
  }
}
