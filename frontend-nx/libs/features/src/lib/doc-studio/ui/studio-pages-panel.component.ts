import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'pi-studio-pages-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pages-panel" data-test="studio-pages-panel">
      <h3>Страницы</h3>
      <div class="page-list" role="list" aria-label="Страницы документа">
        @for (page of pageNumbers(); track page) {
          <button type="button" role="listitem" [class.active]="page === currentPage()" (click)="pageChange.emit(page)">Страница {{ page }}</button>
        }
      </div>
      <div class="page-actions">
        <button type="button" data-test="studio-add-page" (click)="addPage.emit()">+ Страница</button>
        <button type="button" [disabled]="currentPage() <= 1" (click)="previousPage.emit()">‹</button>
        <button type="button" [disabled]="currentPage() >= pageCount()" (click)="nextPage.emit()">›</button>
      </div>
      <label><input type="checkbox" [checked]="pageNumbering()" (change)="pageNumberingChange.emit($any($event.target).checked)" /> Нумерация</label>
      <h3>Оформление листа</h3>
      <label>Фон
        <select [value]="backgroundIndex()" data-test="studio-background-select" (change)="backgroundChange.emit(+$any($event.target).value)">
          <option value="-1">Нет</option>
          @for (url of backgroundImages(); track $index) { <option [value]="$index">Фон {{ $index + 1 }}</option> }
        </select>
      </label>
      <label>Прозрачность
        <input type="range" min="0" max="1" step="0.05" [value]="backgroundOpacity()" (input)="backgroundOpacityChange.emit(+$any($event.target).value)" />
      </label>
      <div class="orientation" role="group" aria-label="Ориентация листа">
        <button type="button" [class.active]="orientation() === 'portrait'" (click)="orientationChange.emit('portrait')">Книжная</button>
        <button type="button" [class.active]="orientation() === 'landscape'" (click)="orientationChange.emit('landscape')">Альбомная</button>
      </div>
    </section>
  `,
  styles: [`:host{display:block}.pages-panel{display:flex;flex-direction:column;gap:10px;padding:4px}.pages-panel h3{margin:8px 0 0;font-size:12px}.page-list{display:flex;flex-direction:column;gap:4px}.page-list button,.page-actions button,.orientation button{padding:6px;border:1px solid var(--color-rule);background:var(--color-paper-2);color:var(--color-ink);cursor:pointer}.page-list button.active,.orientation button.active{border-color:var(--color-gold-deep);background:var(--color-paper-raised)}.page-actions{display:flex;gap:4px}.pages-panel label{display:flex;align-items:center;gap:6px;font-size:12px}.pages-panel select{margin-left:auto;max-width:100px}.pages-panel input[type=range]{flex:1}.orientation{display:flex;gap:4px}.orientation button{flex:1}.pages-panel button:disabled{opacity:.4;cursor:default}`],
})
export class StudioPagesPanelComponent {
  readonly pageCount = input(1);
  readonly currentPage = input(1);
  readonly pageNumbering = input(false);
  readonly backgroundImages = input<readonly string[]>([]);
  readonly backgroundIndex = input(-1);
  readonly backgroundOpacity = input(0.3);
  readonly orientation = input<'portrait' | 'landscape'>('portrait');
  readonly pageChange = output<number>();
  readonly addPage = output<void>();
  readonly previousPage = output<void>();
  readonly nextPage = output<void>();
  readonly pageNumberingChange = output<boolean>();
  readonly backgroundChange = output<number>();
  readonly backgroundOpacityChange = output<number>();
  readonly orientationChange = output<'portrait' | 'landscape'>();
  pageNumbers(): number[] { return Array.from({ length: Math.max(1, this.pageCount()) }, (_, index) => index + 1); }
}
