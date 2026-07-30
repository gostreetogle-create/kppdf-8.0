/**
 * TZ-235.C — MultiSelectInspectorComponent (sub-component of `BuilderInspector`).
 *
 * Renders the controls for multi-select mode (when 2+ blocks are selected).
 * Mounted by the parent `BuilderInspectorComponent` switcher when
 * `selectedCount() > 0` and no single block / template is selected.
 *
 * Content (extracted verbatim from the original monolithic inspector):
 *   • Counter line showing how many blocks are selected
 *   • Margin controls: left px / right px / reset button
 *   • Delete-all button (destructive, separated at bottom)
 *
 * State source: single `BuilderInspectorStateService` injected from
 * parent DI tree (no inputs/outputs on this sub-component — all data
 * flows through the service).
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideAngularModule, RotateCcw } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BuilderInspectorStateService } from './builder-inspector-state.service';

@Component({
  selector: 'app-multi-select-inspector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ButtonComponent],
  template: `
    <div class="inspector__multi">
      <p class="inspector__multi-count">Выбрано: {{ state.selectedCount() }}</p>

      <!-- Margin controls -->
      <div class="inspector__section">
        <span class="inspector__section-title">Отступы</span>
        <div class="margin-controls">
          <label class="margin-controls__item">
            <span class="margin-controls__label">Слева</span>
            <div class="margin-controls__input-row">
              <input
                class="field__input field__input--small pi-focus-ring"
                type="number"
                min="0"
                [value]="state.multiMarginLeftPx() ?? ''"
                (input)="state.onMultiMarginLeftInput($event)"
                placeholder="—"
              />
              <span class="margin-controls__unit">px</span>
            </div>
          </label>
          <label class="margin-controls__item">
            <span class="margin-controls__label">Справа</span>
            <div class="margin-controls__input-row">
              <input
                class="field__input field__input--small pi-focus-ring"
                type="number"
                min="0"
                [value]="state.multiMarginRightPx() ?? ''"
                (input)="state.onMultiMarginRightInput($event)"
                placeholder="—"
              />
              <span class="margin-controls__unit">px</span>
            </div>
          </label>
        </div>
        <button
          type="button"
          class="field__reset-btn pi-focus-ring"
          (click)="state.onMultiResetMargins()"
        >
          <lucide-icon [img]="ResetIcon" [size]="12"></lucide-icon>
          Сбросить отступы
        </button>
      </div>

      <!-- Delete (separated by divider, at the bottom) -->
      <div class="inspector__section inspector__section--danger">
        <app-pi-button
          variant="destructive"
          size="sm"
          (click)="state.triggerDeleteSelected()"
          ariaLabel="Удалить выбранные блоки"
        >
          Удалить ({{ state.selectedCount() }})
        </app-pi-button>
      </div>
    </div>
  `,
  styles: [
    `
      .inspector__multi {
        padding: 16px;
        text-align: center;
      }

      .inspector__multi-count {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-sunrise-warm, #735c00);
        margin: 0 0 16px;
      }

      /* ── Sections ── */
      .inspector__section {
        padding: 12px 0;
        border-top: 1px solid var(--color-rule, #d0c5af);
        text-align: left;
      }

      .inspector__section:first-of-type {
        border-top: none;
        padding-top: 0;
      }

      .inspector__section-title {
        display: block;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-muted, #7f7663);
        margin-bottom: 10px;
      }

      .inspector__section--danger {
        margin-top: auto;
        padding-top: 16px;
      }

      /* ── Margin controls ── */
      .margin-controls {
        display: flex;
        gap: 12px;
      }

      .margin-controls__item {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .margin-controls__label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-muted, #7f7663);
        text-align: center;
      }

      .margin-controls__input-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .margin-controls__unit {
        font-size: 10px;
        color: var(--color-muted, #7f7663);
        flex-shrink: 0;
      }

      .field__input {
        width: 100%;
        padding: 10px 12px;
        background: var(--color-paper, #f8f9fa);
        color: var(--color-ink, #191c1d);
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        box-sizing: border-box;
        transition: border-color 120ms ease;
      }

      .field__input:focus {
        outline: none;
        border-color: var(--color-sunrise-warm, #735c00);
      }

      .field__input--small {
        width: 64px;
        flex-shrink: 0;
        text-align: center;
      }

      .field__reset-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 6px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 500;
        color: var(--color-muted, #7f7663);
        background: transparent;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        cursor: pointer;
        transition: all 100ms ease;
      }

      .field__reset-btn:hover:not(:disabled) {
        color: var(--color-ink, #191c1d);
        border-color: var(--color-ink, #191c1d);
        background: var(--color-paper-2, #e1e3e4);
      }

      .field__reset-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    `,
  ],
})
export class MultiSelectInspectorComponent {
  protected readonly state = inject(BuilderInspectorStateService);

  // Icons
  protected readonly ResetIcon = RotateCcw;
}
