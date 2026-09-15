import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import type { CreateSitePayload } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { SiteFormDialogComponent, type SiteFormDialogData } from './site-form-dialog.component';

describe('SiteFormDialogComponent (TZ-NX-ORDER-WS-META-INLINE)', () => {
  let fixture: ComponentFixture<SiteFormDialogComponent>;
  let close: jest.Mock<(value?: CreateSitePayload) => void>;

  async function setup(data: SiteFormDialogData): Promise<void> {
    close = jest.fn();
    const ref = {
      closed: signal<CreateSitePayload | undefined>(undefined),
      close,
    } as unknown as DialogRef<CreateSitePayload | undefined>;
    await TestBed.configureTestingModule({
      imports: [SiteFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SiteFormDialogComponent);
    fixture.detectChanges();
  }

  function setInput(testId: string, value: string): void {
    const input = fixture.nativeElement.querySelector(`[data-test="${testId}"]`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('starts empty with a disabled submit until name+адрес are set', async () => {
    await setup({ counterpartyId: 'cp-1' });
    const submitBtn = fixture.nativeElement.querySelector('[data-test="site-form-submit"] button') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);

    setInput('site-form-name', 'Склад №2');
    expect(submitBtn.disabled).toBe(true);
    setInput('site-form-address', 'ул. Заводская, 5');
    expect(submitBtn.disabled).toBe(false);
  });

  it('confirms with the counterpartyId from dialog data — not user-selectable', async () => {
    await setup({ counterpartyId: 'cp-1' });
    setInput('site-form-name', 'Склад №2');
    setInput('site-form-address', 'ул. Заводская, 5');
    (fixture.nativeElement.querySelector('[data-test="site-form-submit"]') as HTMLButtonElement).click();

    expect(close).toHaveBeenCalledWith({ counterpartyId: 'cp-1', name: 'Склад №2', address: 'ул. Заводская, 5' });
  });

  it('cancel closes without a payload', async () => {
    await setup({ counterpartyId: 'cp-1' });
    (fixture.nativeElement.querySelector('[data-test="site-form-cancel"]') as HTMLButtonElement).click();
    expect(close).toHaveBeenCalledWith();
  });
});
