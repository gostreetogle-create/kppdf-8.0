import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import type { Organization } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import {
  ProposalAttachOrgsDialogComponent,
  type AttachOrgsDialogData,
  type AttachOrgsResult,
} from './proposal-attach-orgs.dialog';

const ORGS: readonly Organization[] = [
  { _id: 'org-alpha', name: 'ООО Альфа', shortName: 'Альфа', inn: '111', type: [] },
  { _id: 'org-beta', name: 'ООО Бета', shortName: 'Бета', inn: '222', type: [] },
  { _id: 'org-gamma', name: 'ООО Гамма', inn: '333', type: [] },
];

describe('ProposalAttachOrgsDialogComponent (TZ-NX-KP-FAMILY-S44-ATTACH-ORGS)', () => {
  let fixture: ComponentFixture<ProposalAttachOrgsDialogComponent>;
  let close: jest.Mock<(value?: AttachOrgsResult) => void>;

  async function setup(data: AttachOrgsDialogData): Promise<void> {
    close = jest.fn();
    const ref = {
      closed: signal<AttachOrgsResult | undefined>(undefined),
      close,
    } as unknown as DialogRef<AttachOrgsResult | undefined>;
    await TestBed.configureTestingModule({
      imports: [ProposalAttachOrgsDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProposalAttachOrgsDialogComponent);
    fixture.detectChanges();
  }

  function orgCheckbox(id: string): HTMLInputElement {
    const el = fixture.nativeElement.querySelector(
      `[data-test="attach-org-${id}"]`,
    ) as HTMLInputElement | null;
    if (!el) throw new Error(`checkbox for ${id} not found`);
    return el;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('offers only organizations not yet attached as variants', async () => {
    await setup({
      quotation: { _id: 'q-master', number: 'KP-1', status: 'draft', familyRole: 'master' },
      organizations: ORGS,
      existingVariantOrgIds: new Set(['org-beta']),
    });

    const rows = fixture.nativeElement.querySelectorAll('[data-test="attach-orgs-row"]');
    expect(rows.length).toBe(2);
    expect(orgCheckbox('org-alpha')).toBeTruthy();
    expect(orgCheckbox('org-gamma')).toBeTruthy();
    expect(() => orgCheckbox('org-beta')).toThrow();
  });

  it('keeps confirm disabled until at least one org is selected (no POST on empty)', async () => {
    await setup({
      quotation: { _id: 'q-solo', number: 'KP-2', status: 'draft' },
      organizations: ORGS,
    });

    const confirm = fixture.nativeElement.querySelector(
      '[data-test="attach-orgs-confirm"]',
    ) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);

    orgCheckbox('org-alpha').click();
    fixture.detectChanges();
    expect(confirm.disabled).toBe(false);
  });

  it('closes with items including optional markup when the user selects orgs', async () => {
    await setup({
      quotation: { _id: 'q-master', number: 'KP-1', status: 'draft', familyRole: 'master' },
      organizations: ORGS,
    });

    orgCheckbox('org-alpha').click();
    orgCheckbox('org-beta').click();
    fixture.detectChanges();

    const markupInput = fixture.nativeElement.querySelector(
      '[data-test="attach-markup-org-alpha"] [data-test="attach-org-markup-input"]',
    ) as HTMLInputElement;
    expect(markupInput).toBeTruthy();
    markupInput.value = '8';
    markupInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-test="attach-orgs-confirm"]') as HTMLButtonElement).click();
    expect(close).toHaveBeenCalledWith({
      items: [
        { organizationId: 'org-alpha', orgMarkupPercent: 8 },
        { organizationId: 'org-beta' },
      ],
    });
  });

  it('renders the empty state when every organization is already a variant', async () => {
    await setup({
      quotation: { _id: 'q-master', number: 'KP-1', status: 'draft', familyRole: 'master' },
      organizations: ORGS,
      existingVariantOrgIds: new Set(ORGS.map((o) => o._id)),
    });

    expect(fixture.nativeElement.querySelector('[data-test="attach-orgs-empty"]')).toBeTruthy();
    const confirm = fixture.nativeElement.querySelector(
      '[data-test="attach-orgs-confirm"]',
    ) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
  });
});
