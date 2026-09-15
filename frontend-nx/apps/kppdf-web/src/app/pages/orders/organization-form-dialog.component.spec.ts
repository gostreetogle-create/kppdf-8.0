import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import type { CreateOrganizationPayload } from '@kppdf/data-access';
import { PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { OrganizationFormDialogComponent } from './organization-form-dialog.component';

describe('OrganizationFormDialogComponent (TZ-NX-ORDER-WS-META-INLINE)', () => {
  let fixture: ComponentFixture<OrganizationFormDialogComponent>;
  let close: jest.Mock<(value?: CreateOrganizationPayload) => void>;

  async function setup(): Promise<void> {
    close = jest.fn();
    const ref = {
      closed: signal<CreateOrganizationPayload | undefined>(undefined),
      close,
    } as unknown as DialogRef<CreateOrganizationPayload | undefined>;
    await TestBed.configureTestingModule({
      imports: [OrganizationFormDialogComponent],
      providers: [{ provide: PI_DIALOG_REF, useValue: ref }],
    }).compileComponents();
    fixture = TestBed.createComponent(OrganizationFormDialogComponent);
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

  it('starts empty with a disabled submit until name+ИНН are set', async () => {
    await setup();
    const submitBtn = fixture.nativeElement.querySelector('[data-test="organization-form-submit"] button') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);

    setInput('organization-form-name', 'ООО Ромашка');
    expect(submitBtn.disabled).toBe(true);
    setInput('organization-form-inn', '7707083893');
    expect(submitBtn.disabled).toBe(false);
  });

  it('confirms with isOurCompany: true — this dialog only ever creates the order-fulfilling org', async () => {
    await setup();
    setInput('organization-form-name', 'ООО Ромашка');
    setInput('organization-form-inn', '7707083893');
    (fixture.nativeElement.querySelector('[data-test="organization-form-submit"]') as HTMLButtonElement).click();

    expect(close).toHaveBeenCalledWith({ name: 'ООО Ромашка', inn: '7707083893', isOurCompany: true });
  });

  it('cancel closes without a payload', async () => {
    await setup();
    (fixture.nativeElement.querySelector('[data-test="organization-form-cancel"]') as HTMLButtonElement).click();
    expect(close).toHaveBeenCalledWith();
  });
});
