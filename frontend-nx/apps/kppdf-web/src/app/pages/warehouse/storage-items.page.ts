import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pi-storage-items-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="px-panel-inset py-8" data-test="storage-items-placeholder">
      <div class="eyebrow">Склад</div>
      <h1 class="font-display text-2xl m-0">Остатки</h1>
      <p class="text-sm text-muted-foreground mt-2 mb-0">Раздел готовится. Данные появятся в следующем обновлении.</p>
    </main>
  `,
})
export class StorageItemsPage {}
