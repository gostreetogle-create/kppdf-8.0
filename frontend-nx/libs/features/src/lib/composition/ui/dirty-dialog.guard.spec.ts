import { DestroyRef, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PiDialogService } from '@kppdf/ui/dialog';
import { confirmDirtyClose } from './dirty-dialog.guard';

describe('confirmDirtyClose (Phase 2)', () => {
  const open = jest.fn();
  const close = jest.fn();

  beforeEach(() => {
    open.mockReset();
    close.mockReset();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PiDialogService,
          useValue: { open },
        },
      ],
    });
  });

  it('closes immediately when form is pristine', () => {
    const dialog = TestBed.inject(PiDialogService);
    const destroyRef = { onDestroy: jest.fn() } as unknown as DestroyRef;
    confirmDirtyClose(dialog, destroyRef, TestBed.inject(Injector), () => false, close);
    expect(open).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  it('opens confirm when form is dirty', () => {
    const dialog = TestBed.inject(PiDialogService);
    const destroyRef = { onDestroy: jest.fn() } as unknown as DestroyRef;
    confirmDirtyClose(dialog, destroyRef, TestBed.inject(Injector), () => true, close);
    expect(open).toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });
});
