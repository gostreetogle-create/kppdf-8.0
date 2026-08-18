import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { Order } from './orders.service';
import { OrderFormDialogComponent } from './order-form-dialog.component';

type DialogHarness = {
  onSaved(order: Order): void;
  onCancelled(): void;
};

describe('OrderFormDialogComponent thin shell (TZ-DESK-402)', () => {
  let close: jest.Mock;

  beforeEach(async () => {
    close = jest.fn();
    await TestBed.configureTestingModule({
      imports: [OrderFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: null },
        { provide: PI_DIALOG_REF, useValue: { close } },
      ],
    })
      .overrideComponent(OrderFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('closes with the saved order result', () => {
    const fixture = TestBed.createComponent(OrderFormDialogComponent);
    const component = fixture.componentInstance as unknown as DialogHarness;
    const order: Order = { _id: 'o1', number: 'ORD-1', status: 'draft' };
    component.onSaved(order);
    expect(close).toHaveBeenCalledWith(order);
  });

  it('closes with null on cancel', () => {
    const fixture = TestBed.createComponent(OrderFormDialogComponent);
    const component = fixture.componentInstance as unknown as DialogHarness;
    component.onCancelled();
    expect(close).toHaveBeenCalledWith(null);
  });
});
