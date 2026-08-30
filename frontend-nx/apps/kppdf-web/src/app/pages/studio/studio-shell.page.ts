import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, NgZone, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiStudioDocumentsService, type StudioDocument } from '@kppdf/data-access';
import { PiToastService } from '@kppdf/ui/toast';
import { studioSheetRect } from './studio-geometry';

@Component({
  selector: 'pi-studio-shell-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (document(); as doc) {
      <main class="studio-shell" data-test="studio-shell">
        <header class="studio-ribbon"><strong>Студия документов</strong><span>{{ doc.name }}</span><span class="studio-switch">Редактор</span><span>Просмотр</span><button disabled title="S8">PDF</button><button disabled title="S8">Архив</button></header>
        <section class="studio-stage" #stageEl data-test="studio-stage">
          <aside class="studio-rail studio-rail-left">@for (item of leftItems; track item) { <button type="button" title="В срезе S3">{{ item }}</button> }</aside>
          <div class="studio-sheet-wrap"><div class="studio-sheet" role="button" tabindex="0" [style.width.px]="sheet().width" [style.height.px]="sheet().height" (click)="panelOpen.set(false)" (keydown.enter)="panelOpen.set(false)" (keydown.space)="panelOpen.set(false)" data-test="studio-sheet"></div></div>
          @if (panelOpen()) {
            <aside class="studio-panel studio-panel-left" data-test="studio-pages-panel">
              <div class="studio-panel-content">
                <h2>Страницы</h2>
                <p class="studio-panel-hint">Оболочка S2. Блоки появятся в S3.</p>
                <div class="studio-segmented" data-test="studio-orientation-control" [class.disabled]="fromTemplate()">
                  @for (orientation of orientations; track orientation.value) {
                    <button
                      type="button"
                      class="studio-segment"
                      [class.active]="doc.orientation === orientation.value"
                      [disabled]="fromTemplate()"
                      (click)="setOrientation(orientation.value)"
                      [attr.data-test]="'studio-orientation-' + orientation.value"
                    >{{ orientation.label }}</button>
                  }
                </div>
                @if (fromTemplate()) { <span class="studio-badge">Ориентация задана шаблоном</span> }
              </div>
            </aside>
          }
          <aside class="studio-rail studio-rail-right">@for (item of rightItems; track item) { <button type="button" title="В срезе S3">{{ item }}</button> }</aside>
          <button class="studio-panel-toggle" type="button" (click)="togglePanel()">{{ panelOpen() ? 'Свернуть' : 'Панель' }}</button>
        </section>
      </main>
    } @else { <div class="p-8">Загрузка документа…</div> }
  `,
  styles: [`
    :host { display:block; height:100%; }
    .studio-shell { height:100%; display:flex; flex-direction:column; background:#eee; }
    .studio-ribbon { height:48px; display:flex; align-items:center; gap:16px; padding:0 20px; background:#fff; border-bottom:1px solid #ddd; }
    .studio-ribbon button { margin-left:auto; } .studio-ribbon button + button { margin-left:0; }
    .studio-stage { position:relative; flex:1; display:flex; align-items:center; justify-content:flex-end; padding:0 8px 0 64px; overflow:hidden; }
    .studio-sheet-wrap { display:flex; align-items:center; justify-content:flex-end; width:100%; height:100%; }
    .studio-sheet { background:#fff; border:1px solid #d8d8d8; cursor:pointer; }
    .studio-panel { position:absolute; left:64px; top:16px; bottom:16px; width:480px; z-index:3; background:#fff; border:1px solid #ddd; }
    .studio-panel-content { max-width:272px; padding:24px; } .studio-panel-hint { color:#666; font-size:13px; }
    .studio-rail { position:absolute; z-index:4; display:flex; flex-direction:column; gap:8px; }
    .studio-rail-left { left:12px; top:24px; } .studio-rail-right { right:12px; top:24px; }
    .studio-rail button { width:36px; height:36px; } .studio-panel-toggle { position:absolute; left:72px; top:24px; z-index:5; }
    .studio-switch { font-weight:700; border-bottom:2px solid currentColor; padding-bottom:4px; } .studio-badge { display:inline-block; padding:4px 8px; border:1px solid #ccc; color:#666; }
    .studio-segmented { display:inline-flex; border:1px solid #ccc; border-radius:4px; margin-top:12px; }
    .studio-segment { padding:6px 12px; border:0; background:#fafafa; cursor:pointer; }
    .studio-segment.active { background:#1c7c54; color:#fff; }
    .studio-segmented.disabled .studio-segment { opacity:.5; cursor:not-allowed; }
  `],
})
export class StudioShellPage {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(PiStudioDocumentsService);
  private readonly toast = inject(PiToastService);
  readonly document = signal<StudioDocument | null>(null);
  readonly panelOpen = signal(true);
  readonly leftItems = ['Элементы', 'Слои', 'Страницы', 'Данные'];
  readonly rightItems = ['Свойства', 'Таблица', 'Текст'];
  readonly orientations = [
    { value: 'portrait' as const, label: 'Книжная' },
    { value: 'landscape' as const, label: 'Альбомная' },
  ];
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroy = inject(DestroyRef);
  private stageObserver?: ResizeObserver;
  readonly stageSize = signal({ width: 0, height: 0 });
  readonly fromTemplate = computed(() => Boolean(this.document()?.templateId));
  readonly sheet = computed(() => studioSheetRect(this.stageSize().width, this.stageSize().height, this.document()?.orientation ?? 'portrait'));

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) void firstValueFrom(this.service.getById(id)).then((result) => { if (result.ok) this.document.set(result.data); });

    // Measure the real stage after the async document render makes it exist in the DOM.
    // The `@if (document())` branch mounts after this effect's flush, so defer the
    // stage lookup a tick and retry until it is present.
    effect(() => {
      if (!this.document()) return;
      this.findStage();
    });
  }

  private findStage(): void {
    if (!this.document()) return;
    const el = this.host.nativeElement.querySelector<HTMLElement>('.studio-stage');
    if (el) this.observeStage(el);
    else window.setTimeout(() => this.findStage(), 16);
  }

  private observeStage(el: HTMLElement): void {
    if (this.stageObserver) return; // already observing
    this.stageObserver = new ResizeObserver(() => this.measureStage(el));
    this.measureStage(el);
    this.stageObserver.observe(el);
    this.destroy.onDestroy(() => this.stageObserver?.disconnect());
  }

  private measureStage(el: HTMLElement): void {
    // clientWidth includes horizontal padding (left 64, right 8); content box is what the sheet may fill.
    const width = Math.max(0, el.clientWidth - 72);
    const height = Math.max(0, el.clientHeight);
    this.zone.run(() => this.stageSize.set({ width, height }));
  }

  togglePanel(): void { this.panelOpen.update((open) => !open); }

  setOrientation(orientation: 'portrait' | 'landscape'): void {
    const current = this.document();
    if (!current || current.orientation === orientation) return;
    if (this.fromTemplate()) return;
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    // Backend UpdateStudioDocumentDto requires the optimistic-concurrency revision gate.
    void firstValueFrom(
      this.service.update(id, { expectedRevision: current.revision ?? 1, orientation }),
    ).then((result) => {
      if (result.ok) this.document.set(result.data);
      else this.toast.error(String(result.error));
    });
  }
}