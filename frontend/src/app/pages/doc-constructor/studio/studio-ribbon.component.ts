import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Download, LucideAngularModule } from 'lucide-angular';
import { TabComponent } from '../../../shared/ui/pi-tab.component';
import { TabsComponent } from '../../../shared/ui/pi-tabs.component';

export type StudioViewMode = 'editor' | 'preview';

@Component({
  selector: 'app-studio-ribbon-mode',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TabsComponent, TabComponent],
  host: {
    class: 'studio-ribbon-extra flex items-center gap-3 min-w-0',
    '[attr.kpWsRibbonExtra]': '""',
  },
  template: `
    <app-pi-tabs
      [value]="viewMode()"
      ariaLabel="Режим документа"
      (valueChange)="onValueChange($event)"
    >
      <app-pi-tab
        value="editor"
        label="Редактор"
        [isActive]="viewMode() === 'editor'"
        (selected)="viewModeChange.emit('editor')"
      />
      <app-pi-tab
        value="preview"
        label="Просмотр"
        [isActive]="viewMode() === 'preview'"
        (selected)="viewModeChange.emit('preview')"
      />
    </app-pi-tabs>
  `,
})
export class StudioRibbonModeComponent {
  readonly viewMode = input<StudioViewMode>('editor');
  readonly viewModeChange = output<StudioViewMode>();

  protected onValueChange(value: string): void {
    this.viewModeChange.emit(value as StudioViewMode);
  }
}

@Component({
  selector: 'app-studio-ribbon-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  styleUrl: './document-studio-workspace.styles.css',
  host: {
    class: 'flex items-center shrink-0',
    '[attr.kpWsRibbonActions]': '""',
  },
  template: `
    <button
      type="button"
      class="kp-ws-ribbon-btn kp-ws-ribbon-btn--gold pi-focus-ring"
      title="Скачать PDF"
      data-test="studio-ribbon-pdf"
      [disabled]="pdfLoading()"
      (click)="downloadPdf.emit()"
    >
      <lucide-angular [img]="downloadIcon" [size]="14" aria-hidden="true" />
      PDF
    </button>
    <button
      type="button"
      class="kp-ws-ribbon-btn pi-focus-ring"
      [attr.title]="archiveTitle()"
      data-test="studio-ribbon-archive"
      [disabled]="archiveDisabled()"
      (click)="finalize.emit()"
    >
      В архив
    </button>
  `,
})
export class StudioRibbonActionsComponent {
  readonly pdfLoading = input(false);
  readonly archiveDisabled = input(false);
  readonly archiveTitle = input('В архив');

  readonly downloadPdf = output<void>();
  readonly finalize = output<void>();

  protected readonly downloadIcon = Download;
}
