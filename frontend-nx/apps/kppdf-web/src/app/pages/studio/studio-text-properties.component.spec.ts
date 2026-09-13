import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import {
  PiRegistryDataSourcesService,
  PiTextBlockCategoriesService,
  PiTextBlocksService,
  type StudioBlock,
} from '@kppdf/data-access';
import { PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { StudioTextPropertiesComponent } from './studio-text-properties.component';
import {
  StudioDataFieldPickerDialogComponent,
  type StudioDataFieldSelection,
} from './studio-data-field-picker-dialog.component';

/**
 * TZ-NX-DOCSTUDIO-S37B — locks the «Поле ERP» → Просмотр path. S37 operator
 * smoke found the picker did not produce a confirmed insert; backend
 * substitution ({{counterparty.*}} from doc.context) was already covered by
 * studio-output.service.spec.ts, but nothing exercised the button → dialog →
 * richText().insertContent() wiring that has to run first.
 */
describe('StudioTextPropertiesComponent — Поле ERP insert (TZ-NX-DOCSTUDIO-S37B)', () => {
  let fixture: ComponentFixture<StudioTextPropertiesComponent>;
  let dialog: { open: jest.Mock };
  let toast: { success: jest.Mock; error: jest.Mock };
  let registrySources: { list: jest.Mock };

  const BLOCK: StudioBlock = {
    _id: 'b1',
    type: 'text',
    order: 0,
    content: '',
    isActive: true,
  };

  beforeEach(async () => {
    registrySources = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            {
              key: 'counterparty',
              label: 'Клиент',
              group: 'contacts',
              fields: [{ key: 'name', label: 'Наименование', type: 'text' }],
            },
          ],
        }),
      ),
    };
    dialog = { open: jest.fn() };
    toast = { success: jest.fn(), error: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudioTextPropertiesComponent],
      providers: [
        { provide: PiTextBlockCategoriesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiTextBlocksService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiRegistryDataSourcesService, useValue: registrySources },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudioTextPropertiesComponent);
    fixture.componentRef.setInput('block', BLOCK);
    fixture.detectChanges();
  });

  it('opens the field picker and inserts {{counterparty.name}} into the editor on selection', async () => {
    const closedSignal = signal<StudioDataFieldSelection | null | undefined>(undefined);
    const ref = {
      closed: closedSignal,
      close: (v?: StudioDataFieldSelection | null) => closedSignal.set(v),
    } as unknown as DialogRef<StudioDataFieldSelection | null>;
    dialog.open.mockReturnValue(ref);

    (fixture.nativeElement.querySelector('[data-test="studio-insert-data-field"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(registrySources.list).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalledWith(
      StudioDataFieldPickerDialogComponent,
      expect.objectContaining({ data: expect.objectContaining({ columnIndex: 0 }) }),
    );

    ref.close({
      source: 'counterparty',
      sourceLabel: 'Клиент',
      field: { key: 'name', label: 'Наименование', type: 'text' },
    });
    TestBed.flushEffects();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    fixture.detectChanges();

    const editorHtml = fixture.nativeElement.querySelector('app-pi-rich-text .pi-rte-editor')?.innerHTML ?? '';
    expect(editorHtml).toContain('data-token="{{counterparty.name}}"');
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('{{counterparty.name}}'));
  });

  it('toasts an error instead of opening the dialog when the ERP field list is empty', async () => {
    registrySources.list.mockReturnValue(of({ ok: true, data: [] }));

    (fixture.nativeElement.querySelector('[data-test="studio-insert-data-field"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});

/**
 * TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP — «Токены»/«Значения» segment, always
 * visible at the top of the panel while a text block is selected. Session-
 * level: this component just displays the parent's current mode and emits
 * on click, it holds no state of its own.
 */
describe('StudioTextPropertiesComponent — Токены/Значения segment (TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP)', () => {
  let fixture: ComponentFixture<StudioTextPropertiesComponent>;

  const BLOCK: StudioBlock = { _id: 'b1', type: 'text', order: 0, content: '', isActive: true };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioTextPropertiesComponent],
      providers: [
        { provide: PiTextBlockCategoriesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiTextBlocksService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiRegistryDataSourcesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StudioTextPropertiesComponent);
    fixture.componentRef.setInput('block', BLOCK);
    fixture.detectChanges();
  });

  it('is always visible for a selected text block, defaulting to «Токены» pressed', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-token-display-mode"]')).not.toBeNull();
    const tokensBtn = host.querySelector('[data-test="studio-token-display-mode-tokens"]') as HTMLButtonElement;
    const valuesBtn = host.querySelector('[data-test="studio-token-display-mode-values"]') as HTMLButtonElement;
    expect(tokensBtn.getAttribute('aria-pressed')).toBe('true');
    expect(valuesBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('reflects the tokenDisplayMode input when set to «values»', () => {
    fixture.componentRef.setInput('tokenDisplayMode', 'values');
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-token-display-mode-tokens"]')?.getAttribute('aria-pressed')).toBe('false');
    expect(host.querySelector('[data-test="studio-token-display-mode-values"]')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('emits tokenDisplayModeChange on click, and does not toggle its own displayed state (parent-owned)', () => {
    const emitted: ('tokens' | 'values')[] = [];
    fixture.componentInstance.tokenDisplayModeChange.subscribe((v) => emitted.push(v));
    const host: HTMLElement = fixture.nativeElement;

    (host.querySelector('[data-test="studio-token-display-mode-values"]') as HTMLButtonElement).click();
    expect(emitted).toEqual(['values']);
    // Parent hasn't fed the new value back via the input yet — display stays as-is (no local state).
    expect(host.querySelector('[data-test="studio-token-display-mode-tokens"]')?.getAttribute('aria-pressed')).toBe('true');
  });
});
