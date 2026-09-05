import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import type { Counterparty, CreateCounterpartyPayload } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { CounterpartyFormDialogComponent, type CounterpartyFormDialogData } from './counterparty-form-dialog.component';

const EXISTING: Counterparty = {
  _id: 'cp-1',
  name: 'ООО Альфа',
  shortName: 'Альфа',
  inn: '7707083893',
  roles: ['customer'],
  isActive: true,
  phone: '+7 999 000-00-00',
  email: 'alpha@example.com',
};

describe('CounterpartyFormDialogComponent (TZ-NX-DEALS-D3-COUNTERPARTIES)', () => {
  let fixture: ComponentFixture<CounterpartyFormDialogComponent>;
  let close: jest.Mock<(value?: CreateCounterpartyPayload) => void>;

  async function setup(data: CounterpartyFormDialogData): Promise<void> {
    close = jest.fn();
    const ref = {
      closed: signal<CreateCounterpartyPayload | undefined>(undefined),
      close,
    } as unknown as DialogRef<CreateCounterpartyPayload | undefined>;
    await TestBed.configureTestingModule({
      imports: [CounterpartyFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CounterpartyFormDialogComponent);
    fixture.detectChanges();
  }

  function setInput(testId: string, value: string): void {
    const input = fixture.nativeElement.querySelector(`[data-test="${testId}"]`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function submit(): void {
    (fixture.nativeElement.querySelector('[data-test="counterparty-form-submit"]') as HTMLButtonElement).click();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('create mode starts with empty fields and a disabled submit until name+ИНН are set', async () => {
    await setup({});
    const submitBtn = fixture.nativeElement.querySelector('[data-test="counterparty-form-submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);

    setInput('counterparty-form-name', 'ООО Новый');
    expect(submitBtn.disabled).toBe(true);
    setInput('counterparty-form-inn', '7707083893');
    expect(submitBtn.disabled).toBe(false);
  });

  it('confirms create with roles defaulted to customer and trims blank optional fields', async () => {
    await setup({});
    setInput('counterparty-form-name', 'ООО Новый');
    setInput('counterparty-form-inn', '7707083893');
    submit();

    expect(close).toHaveBeenCalledWith({
      name: 'ООО Новый',
      inn: '7707083893',
      roles: ['customer'],
      phone: undefined,
      email: undefined,
    });
  });

  it('edit mode prefills fields from the existing counterparty and keeps its roles on save', async () => {
    await setup({ counterparty: EXISTING });
    const nameInput = fixture.nativeElement.querySelector('[data-test="counterparty-form-name"]') as HTMLInputElement;
    const innInput = fixture.nativeElement.querySelector('[data-test="counterparty-form-inn"]') as HTMLInputElement;
    expect(nameInput.value).toBe('ООО Альфа');
    expect(innInput.value).toBe('7707083893');

    setInput('counterparty-form-phone', '+7 111 222-33-44');
    submit();

    expect(close).toHaveBeenCalledWith({
      name: 'ООО Альфа',
      inn: '7707083893',
      roles: ['customer'],
      phone: '+7 111 222-33-44',
      email: 'alpha@example.com',
    });
  });

  it('cancel closes without a payload', async () => {
    await setup({});
    (fixture.nativeElement.querySelector('.pi-button-outline') as HTMLButtonElement).click();
    expect(close).toHaveBeenCalledWith();
  });
});
