import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../button/index';

export interface PiPhotoFrame {
  fit: 'contain' | 'cover';
  posX: number;
  posY: number;
}

/** Канон P3 (TZ-NX-PHOTO-P3): default contain+center; optional cover+pan. */
export const DEFAULT_PHOTO_FRAME: PiPhotoFrame = { fit: 'contain', posX: 50, posY: 50 };

/**
 * CSS style for showing a catalog photo inside a rectangular frame.
 * Single mechanism: object-fit + object-position (TZ-PHOTO-304, не circle,
 * не server crop). Fallback = contain/center — same as missing frame.
 */
export function photoFrameStyle(frame?: Partial<PiPhotoFrame> | null): Record<string, string> {
  const normalized = normalizePhotoFrame(frame);
  return {
    'object-fit': normalized.fit,
    'object-position': `${normalized.posX}% ${normalized.posY}%`,
  };
}

function clampPercent(value: unknown, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/**
 * Modal frame editor: cover viewport with drag-to-pan. Persist is parent-owned
 * (B-PHOTO): the editor only reports the merged partial frame on save/cancel.
 */
@Component({
  selector: 'pi-photo-frame-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="space-y-3" data-test="photo-frame-editor">
      <div
        class="relative w-full h-56 overflow-hidden rounded-sm hairline bg-paper-2 select-none touch-none cursor-grab"
        [class.cursor-grabbing]="dragging()"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp()"
        (pointercancel)="onPointerUp()"
        data-test="photo-frame-viewport"
      >
        <img
          #imgEl
          [src]="photoUrl()"
          [alt]="photoName() || 'Кадр фото'"
          draggable="false"
          class="absolute inset-0 w-full h-full max-w-none"
          [style]="imgStyle()"
          data-test="photo-frame-img"
        />
        @if (current().fit !== 'cover') {
          <span
            class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-sm bg-paper-raised hairline text-muted-foreground"
          >
            Весь кадр — переключите на «Заполнить» для сдвига
          </span>
        }
      </div>

      <div class="flex items-center justify-between gap-2">
        <label class="inline-flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            [checked]="current().fit === 'cover'"
            (change)="toggleFit()"
            data-test="photo-frame-fit-toggle"
          />
          Заполнить рамку
        </label>
        <div class="flex gap-2">
          <app-pi-button
            type="button"
            variant="outline"
            size="sm"
            (click)="cancel.emit()"
            data-test="photo-frame-cancel"
          >
            Отмена
          </app-pi-button>
          <app-pi-button
            type="button"
            variant="default"
            size="sm"
            (click)="onSave()"
            data-test="photo-frame-save"
          >
            Сохранить
          </app-pi-button>
        </div>
      </div>
    </div>
  `,
})
export class PiPhotoFrameEditorComponent {
  readonly photoUrl = input.required<string>();
  readonly photoName = input<string | null>(null);
  /** Current persisted frame; null/undefined = canonical default (contain/center). */
  readonly frame = input<Partial<PiPhotoFrame> | null>(null);
  readonly save = output<Partial<PiPhotoFrame>>();
  readonly cancel = output<void>();

  protected readonly dragging = signal(false);
  /** Local edits; null = mirror the `frame` input (no interaction yet). */
  protected readonly draft = signal<PiPhotoFrame | null>(null);
  protected readonly current = computed(() => this.draft() ?? normalizePhotoFrame(this.frame()));

  protected readonly imgStyle = computed(() => photoFrameStyle(this.current()));
  private dragStart: {
    pointerId: number;
    clientX: number;
    clientY: number;
    posX: number;
    posY: number;
  } | null = null;
  private dragTarget: HTMLElement | null = null;

  protected onPointerDown(event: PointerEvent): void {
    const current = this.current();
    if (current.fit !== 'cover') return;
    event.preventDefault();
    this.dragStart = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      posX: current.posX,
      posY: current.posY,
    };
    this.dragTarget = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    this.dragging.set(true);
    this.dragTarget?.setPointerCapture?.(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    const start = this.dragStart;
    if (!this.dragging() || !start || event.pointerId !== start.pointerId) return;
    const target = event.currentTarget;
    const rect = target instanceof HTMLElement ? target.getBoundingClientRect() : null;
    const posX = rect && rect.width > 0
      ? start.posX - ((event.clientX - start.clientX) / rect.width) * 100
      : start.posX;
    const posY = rect && rect.height > 0
      ? start.posY - ((event.clientY - start.clientY) / rect.height) * 100
      : start.posY;
    this.draft.set({
      ...this.current(),
      fit: 'cover',
      posX: clampPercent(posX, start.posX),
      posY: clampPercent(posY, start.posY),
    });
  }

  protected onPointerUp(): void {
    const start = this.dragStart;
    this.dragStart = null;
    this.dragging.set(false);
    // Release is best effort; browsers may already release on pointerup/cancel.
    if (start) this.dragTarget?.releasePointerCapture?.(start.pointerId);
    this.dragTarget = null;
  }

  protected toggleFit(): void {
    const cur = this.current();
    this.draft.set(cur.fit === 'cover' ? { ...DEFAULT_PHOTO_FRAME } : { ...cur, fit: 'cover' });
  }

  protected onSave(): void {
    const next = normalizePhotoFrame(this.current());
    const current = normalizePhotoFrame(this.frame());
    // Merged partial: only changed keys (B-PHOTO merge contract on BE).
    const partial: Partial<PiPhotoFrame> = {};
    if (next.fit !== current.fit) partial.fit = next.fit;
    if (next.posX !== current.posX) partial.posX = next.posX;
    if (next.posY !== current.posY) partial.posY = next.posY;
    this.save.emit(partial);
  }
}

export function normalizePhotoFrame(frame?: Partial<PiPhotoFrame> | null): PiPhotoFrame {
  return {
    fit: frame?.fit === 'cover' ? 'cover' : 'contain',
    posX: clampPercent(frame?.posX, 50),
    posY: clampPercent(frame?.posY, 50),
  };
}
