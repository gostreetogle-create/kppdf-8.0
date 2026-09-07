import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  PiMaterialsService,
  PiSupplyRequestsService,
  type Material,
  type Order,
  type Organization,
  type SupplyRequest,
} from '@kppdf/data-access';
import { PiDialogService, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import {
  SupplyRequestFormDialogComponent,
  type SupplyRequestFormDialogData,
} from './supply-request-form-dialog.component';
import { MaterialFormDialogComponent } from '../registries/dialogs/material-form-dialog.component';

describe('SupplyRequestFormDialogComponent (TZ-NX-SUPPLY-S3-REQUEST-JOURNAL)', () => {
  let fixture: ComponentFixture<SupplyRequestFormDialogComponent>;
  let ref: { close: jest.Mock };
  let api: { create: jest.Mock; update: jest.Mock };
  let materialsApi: { list: jest.Mock };
  let dialog: { open: jest.Mock };

  const orders: Order[] = [{ _id: 'o1', number: 'ORD-1' } as Order];
  const suppliers: Organization[] = [{ _id: 's1', name: 'ООО Металл', inn: '123', type: ['supplier'] }];

  async function setup(data: Partial<SupplyRequestFormDialogData> = {}): Promise<void> {
    ref = { close: jest.fn() };
    api = {
      create: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'r1' } as SupplyRequest })),
      update: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'r1' } as SupplyRequest })),
    };
    materialsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0, page: 1, limit: 10 } })),
    };
    dialog = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [SupplyRequestFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { orders, suppliers, ...data } satisfies SupplyRequestFormDialogData },
        { provide: PI_DIALOG_REF, useValue: ref as unknown as DialogRef<unknown> },
        { provide: PiSupplyRequestsService, useValue: api },
        { provide: PiMaterialsService, useValue: materialsApi },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SupplyRequestFormDialogComponent);
    fixture.detectChanges();
  }

  it('creates with a manual title when no material is picked', async () => {
    await setup();
    fixture.componentInstance.form.patchValue({ title: 'Болт М6' });

    await fixture.componentInstance.submit();

    expect(api.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Болт М6', qty: 1, paid: false, status: 'in_progress' }),
    );
    expect(ref.close).toHaveBeenCalledWith({ _id: 'r1' });
  });

  it('rejects submit with neither a material nor a manual title', async () => {
    await setup();
    await fixture.componentInstance.submit();

    expect(api.create).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error()).toContain('материал');
  });

  it('picking a material hides manual title/article and sends materialId instead', async () => {
    await setup();
    const material = { _id: 'm1', name: 'Подшипник', article: '6205', unit: 'шт' };

    fixture.componentInstance.pickMaterial(material);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="supply-request-material-chip"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="supply-request-title"]')).toBeNull();
    expect(fixture.componentInstance.form.controls.title.value).toBe('Подшипник');
    expect(fixture.componentInstance.form.controls.unit.value).toBe('шт');

    await fixture.componentInstance.submit();

    expect(api.create).toHaveBeenCalledWith(expect.objectContaining({ materialId: 'm1' }));
    const payload = api.create.mock.calls[0][0];
    expect(payload.title).toBeUndefined();
  });

  it('clearing a picked material restores the manual title/article inputs', async () => {
    await setup();
    fixture.componentInstance.pickMaterial({ _id: 'm1', name: 'Подшипник', article: '6205', unit: 'шт' });
    fixture.detectChanges();

    fixture.componentInstance.clearMaterial();
    fixture.detectChanges();

    expect(fixture.componentInstance.materialId()).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="supply-request-title"]')).not.toBeNull();
  });

  it('debounced material search calls the API only after the min query length and delay', async () => {
    jest.useFakeTimers();
    await setup();

    fixture.componentInstance.onMaterialQuery('п');
    expect(materialsApi.list).not.toHaveBeenCalled();

    fixture.componentInstance.onMaterialQuery('подш');
    jest.advanceTimersByTime(299);
    expect(materialsApi.list).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(materialsApi.list).toHaveBeenCalledWith({ search: 'подш', limit: 10 });
    jest.useRealTimers();
  });

  it('XOR: choosing an order clears the manual order-label field from the payload', async () => {
    await setup();
    fixture.componentInstance.form.patchValue({ title: 'Труба', orderId: 'o1' });

    await fixture.componentInstance.submit();

    const payload = api.create.mock.calls[0][0];
    expect(payload.orderId).toBe('o1');
    expect(payload.orderLabel).toBeUndefined();
  });

  it('XOR: manual order sentinel reveals orderLabel and sends it instead of orderId', async () => {
    await setup();
    fixture.componentInstance.form.patchValue({
      title: 'Труба',
      orderId: '__manual__',
      orderLabel: 'Цех 2',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="supply-request-order-label"]')).not.toBeNull();

    await fixture.componentInstance.submit();

    const payload = api.create.mock.calls[0][0];
    expect(payload.orderLabel).toBe('Цех 2');
    expect(payload.orderId).toBeUndefined();
  });

  it('«+ Новый материал» opens a blank create dialog', async () => {
    await setup();
    const dialogRef = { closed: () => undefined } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(dialogRef);

    (fixture.nativeElement.querySelector('[data-test="supply-request-material-create"]') as HTMLButtonElement).click();

    expect(dialog.open).toHaveBeenCalledWith(
      MaterialFormDialogComponent,
      expect.objectContaining({ data: { mode: 'create', allowKindSelect: true } }),
    );
  });

  it('«Копировать и изменить» opens create prefilled from the source material', async () => {
    await setup();
    const source: Material = { _id: 'm1', name: 'Подшипник', article: '6205', unit: 'шт' } as Material;
    const dialogRef = { closed: () => undefined } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(dialogRef);

    fixture.componentInstance.openCopyMaterial(source);

    expect(dialog.open).toHaveBeenCalledWith(
      MaterialFormDialogComponent,
      expect.objectContaining({ data: { mode: 'create', material: source, allowKindSelect: true } }),
    );
  });

  it('prefills from an existing request and calls update on submit', async () => {
    const request: SupplyRequest = {
      _id: 'r9',
      title: 'Фреза',
      qty: 3,
      unit: 'шт',
      status: 'requested',
      priority: 'normal',
      paid: true,
      orderLabel: 'Цех 2',
    };
    await setup({ request });

    expect(fixture.componentInstance.form.controls.title.value).toBe('Фреза');
    expect(fixture.componentInstance.form.controls.paid.value).toBe(true);
    expect(fixture.componentInstance.form.controls.orderId.value).toBe('__manual__');
    expect(fixture.componentInstance.form.controls.orderLabel.value).toBe('Цех 2');

    await fixture.componentInstance.submit();

    expect(api.update).toHaveBeenCalledWith('r9', expect.objectContaining({ title: 'Фреза', paid: true }));
  });
});
