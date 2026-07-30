/**
 * TZ-235.C — TemplatePropertiesFormComponent (sub-component of `BuilderInspector`).
 *
 * Renders the form for editing template-level properties when the user clicks
 * empty canvas. Mounted by the parent `BuilderInspectorComponent` switcher
 * when `templateSelected() && template()` is true.
 *
 * Sub-sections (extracted verbatim from the original monolithic inspector):
 *   • Section 01 — Visual Style
 *       - Background opacity slider (0–1 step 0.05)
 *       - Page numbering toggle (pageNumbering)
 *       - Table of contents toggle (tableOfContents)
 *   • Section 03 — Metadata
 *       - Header text input (debounced 300ms via service textInput$)
 *       - Footer text input (debounced 300ms via service textInput$)
 *   • Section 04 — Background Image
 *       - Grid of existing background thumbnails (with star + remove actions)
 *       - Image file uploader (PNG/JPEG/WebP)
 *
 * State source: single `BuilderInspectorStateService` injected from
 * parent DI tree (no inputs/outputs on this sub-component — all data
 * flows through the service).
 *
 * Lifetime: created/destroyed by parent switcher's @if/@else block — no
 * own memoization needed because service holds the source of truth.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideAngularModule, Hash, List, Upload, X, Check, Star } from 'lucide-angular';
import { BuilderInspectorStateService } from './builder-inspector-state.service';

@Component({
  selector: 'app-template-properties-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="inspector__form">
      <!-- Section 01: Visual Style (orientation/format removed — set at creation via dialog) -->
      <section class="props-section">
        <div class="props-section__header">
          <span class="props-section__number">01</span>
          <h3 class="props-section__title">Визуальный стиль</h3>
        </div>

        <!-- Background opacity -->
        <div class="field">
          <div class="field__row-header">
            <span class="field__label">Прозрачность фона</span>
            <span class="field__value">{{ state.opacityPercent() }}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            [value]="state.template()?.backgroundOpacity ?? 0.3"
            (input)="state.onOpacityInput($event)"
            class="field__slider"
          />
        </div>

        <!-- Page numbering -->
        <div class="toggle-row">
          <div class="toggle-row__left">
            <lucide-icon [img]="HashIcon" [size]="18"></lucide-icon>
            <span class="toggle-row__label">Нумерация страниц</span>
          </div>
          <input
            type="checkbox"
            class="toggle-checkbox"
            [checked]="state.template()?.pageNumbering ?? false"
            (change)="state.onTemplateSettingChange('pageNumbering', $any($event.target).checked)"
          />
        </div>

        <!-- Table of contents -->
        <div class="toggle-row">
          <div class="toggle-row__left">
            <lucide-icon [img]="ListIcon" [size]="18"></lucide-icon>
            <span class="toggle-row__label">Оглавление</span>
          </div>
          <input
            type="checkbox"
            class="toggle-checkbox"
            [checked]="state.template()?.tableOfContents ?? false"
            (change)="state.onTemplateSettingChange('tableOfContents', $any($event.target).checked)"
          />
        </div>
      </section>

      <!-- Section 03: Metadata -->
      <section class="props-section">
        <div class="props-section__header">
          <span class="props-section__number">03</span>
          <h3 class="props-section__title">Метаданные</h3>
        </div>

        <!-- Header text -->
        <div class="field">
          <span class="field__label">Шапка Документа</span>
          <input
            class="field__input pi-focus-ring"
            type="text"
            [value]="state.template()?.headerText ?? ''"
            (input)="state.onTemplateTextInput('headerText', $event)"
            placeholder="Введите заголовок..."
          />
        </div>

        <!-- Footer text -->
        <div class="field">
          <span class="field__label">Подвал Документа</span>
          <input
            class="field__input pi-focus-ring"
            type="text"
            [value]="state.template()?.footerText ?? ''"
            (input)="state.onTemplateTextInput('footerText', $event)"
            placeholder="Введите подпись..."
          />
        </div>
      </section>

      <!-- Section 04: Background Image -->
      <section class="props-section props-section--last">
        <div class="props-section__header">
          <span class="props-section__number">04</span>
          <h3 class="props-section__title">Фоновое изображение</h3>
        </div>

        @if (state.template()?.backgroundImage && state.template()!.backgroundImage!.length > 0) {
          <div class="bg-grid">
            @for (url of state.template()!.backgroundImage!; track url; let i = $index) {
              <div
                class="bg-grid__item"
                [class.is-default]="state.template()?.defaultBackgroundIndex === i"
              >
                <div class="bg-grid__thumb" [style.background-image]="'url(' + url + ')'"></div>
                @if (state.template()?.defaultBackgroundIndex === i) {
                  <div class="bg-grid__check">
                    <lucide-icon [img]="CheckIcon" [size]="20"></lucide-icon>
                  </div>
                }
                <div class="bg-grid__actions">
                  <button
                    type="button"
                    class="bg-grid__action-btn"
                    [class.is-active]="state.template()?.defaultBackgroundIndex === i"
                    (click)="state.onSetDefaultBackground(i)"
                    [attr.aria-label]="state.template()?.defaultBackgroundIndex === i ? 'Убрать из дефолтных' : 'Сделать по умолчанию'"
                  >
                    <lucide-icon [img]="state.template()?.defaultBackgroundIndex === i ? StarFilledIcon : StarIcon" [size]="14"></lucide-icon>
                  </button>
                  <button
                    type="button"
                    class="bg-grid__action-btn bg-grid__action-btn--danger"
                    (click)="state.onRemoveBackground(i)"
                    aria-label="Удалить фон"
                  >
                    <lucide-icon [img]="CloseSmallIcon" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        }
        <label class="bg-upload">
          <input
            #bgFileInput
            type="file"
            accept="image/png,image/jpeg,image/webp"
            class="bg-file-input"
            (change)="state.onFileChange($event)"
          />
          <span class="bg-upload__inner">
            <lucide-icon [img]="UploadIcon" [size]="16"></lucide-icon>
            <span class="bg-upload__text">Загрузить фон</span>
          </span>
        </label>
      </section>
    </div>
  `,
  styles: [
    `
      .inspector__form {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .props-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .props-section--last {
        padding-bottom: 24px;
      }

      .props-section__header {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .props-section__number {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 500;
        line-height: 14px;
        letter-spacing: 0.05em;
        color: var(--color-sunrise-warm, #735c00);
      }

      .props-section__title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-ink, #191c1d);
        margin: 0;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .field__row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .field__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted, #7f7663);
      }

      .field__value {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.05em;
        color: var(--color-ink, #191c1d);
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

      .field__input::placeholder {
        color: var(--color-muted, #7f7663);
      }

      /* ── Slider ── */
      .field__slider {
        width: 100%;
        height: 2px;
        -webkit-appearance: none;
        appearance: none;
        background: var(--color-rule, #d0c5af);
        border-radius: 1px;
        outline: none;
        cursor: pointer;
      }

      .field__slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--color-sunrise-warm, #735c00);
        cursor: pointer;
        border: none;
      }

      .field__slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--color-sunrise-warm, #735c00);
        cursor: pointer;
        border: none;
      }

      .field__slider::-moz-range-track {
        height: 2px;
        background: var(--color-rule, #d0c5af);
        border-radius: 1px;
      }

      /* ── Toggle rows (checkboxes) ── */
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(208, 197, 175, 0.3);
      }

      .toggle-row:last-child {
        border-bottom: none;
      }

      .toggle-row__left {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--color-muted, #7f7663);
      }

      .toggle-row__label {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: var(--color-ink, #191c1d);
      }

      .toggle-checkbox {
        width: 18px;
        height: 18px;
        accent-color: var(--color-sunrise-warm, #735c00);
        cursor: pointer;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
      }

      /* ── Background grid ── */
      .bg-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .bg-grid__item {
        position: relative;
        aspect-ratio: 1;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 120ms ease;
      }

      .bg-grid__item:hover {
        border-color: var(--color-ink, #191c1d);
      }

      .bg-grid__item.is-default {
        border-color: var(--color-sunrise-warm, #735c00);
        border-width: 2px;
      }

      .bg-grid__thumb {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-color: var(--color-paper-2, #e1e3e4);
      }

      .bg-grid__check {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(115, 92, 0, 0.1);
        color: var(--color-sunrise-warm, #735c00);
      }

      .bg-grid__actions {
        position: absolute;
        bottom: 4px;
        right: 4px;
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 120ms ease;
      }

      .bg-grid__item:hover .bg-grid__actions {
        opacity: 1;
      }

      .bg-grid__item.is-default .bg-grid__actions {
        opacity: 1;
      }

      .bg-grid__action-btn {
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.8);
        border: none;
        border-radius: 2px;
        cursor: pointer;
        color: var(--color-muted, #7f7663);
        transition: all 100ms ease;
        padding: 0;
      }

      .bg-grid__action-btn:hover {
        background: rgba(255, 255, 255, 1);
        color: var(--color-ink, #191c1d);
      }

      .bg-grid__action-btn.is-active {
        color: var(--color-sunrise-warm, #735c00);
      }

      .bg-grid__action-btn--danger:hover {
        color: var(--color-destructive, #ba1a1a);
      }

      /* ── Upload button ── */
      .bg-upload {
        display: block;
        margin-top: 8px;
        cursor: pointer;
      }

      .bg-file-input {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .bg-upload__inner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px 16px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-sunrise-warm, #735c00);
        background: transparent;
        border: 1px dashed var(--color-rule, #d0c5af);
        border-radius: 2px;
        cursor: pointer;
        transition: all 120ms ease;
      }

      .bg-upload__inner:hover {
        border-color: var(--color-sunrise-warm, #735c00);
        background: rgba(115, 92, 0, 0.05);
      }

      .bg-upload__text {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
    `,
  ],
})
export class TemplatePropertiesFormComponent {
  protected readonly state = inject(BuilderInspectorStateService);

  // Icons
  protected readonly HashIcon = Hash;
  protected readonly ListIcon = List;
  protected readonly UploadIcon = Upload;
  protected readonly CheckIcon = Check;
  protected readonly StarIcon = Star;
  protected readonly StarFilledIcon = Star;
  protected readonly CloseSmallIcon = X;
}
