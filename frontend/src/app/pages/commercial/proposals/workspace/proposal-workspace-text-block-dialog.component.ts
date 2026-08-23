import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../../shared/ui/dialog/pi-dialog.service';
import { TextBlockEditorComponent } from '../../../doc-constructor/texts/text-block-editor.component';
import type { TextBlock } from '../../../../shared/services/pi-text-blocks.service';

/**
 * TZ-KP-WS-405 — inline text-block create/edit inside the workspace terms
 * panel. Hosts the doc-constructor editor in a PiDialog overlay (no route
 * change); closes with the saved TextBlock (or null on cancel).
 */
@Component({
  selector: 'app-workspace-text-block-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextBlockEditorComponent],
  template: `
    <app-text-block-editor [block]="block()" (save)="onSave($event)" (cancel)="onCancel()" />
  `,
})
export class ProposalWorkspaceTextBlockDialogComponent {
  private readonly rawConfig = inject(PI_DIALOG_DATA) as
    { block?: TextBlock | null } | null | undefined;
  private readonly ref = inject<DialogRef<TextBlock | null>>(PI_DIALOG_REF);

  protected readonly block = computed(() => this.rawConfig?.block ?? null);

  protected onSave(block: TextBlock): void {
    this.ref.close(block);
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
