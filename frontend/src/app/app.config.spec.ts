import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { GlobalErrorHandler } from './app.config';
import { PiToastService } from './shared/ui/toast';

describe('GlobalErrorHandler (NG0203 regression)', () => {
  it('resolves PiToastService at construction and calls toast.error from handleError without NG0203', () => {
    const toastError = jest.fn();
    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler, { provide: PiToastService, useValue: { error: toastError } }],
    });

    const handler = TestBed.inject(GlobalErrorHandler);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => handler.handleError(new Error('builder boom'))).not.toThrow();
    expect(toastError).toHaveBeenCalledWith('builder boom', { duration: 5000 });

    // Late callback (outside the original call stack) must also work —
    // this is the NG0203 failure mode of inject()-inside-handleError.
    toastError.mockClear();
    expect(() => {
      handler.handleError('raw string fault');
    }).not.toThrow();
    expect(toastError).toHaveBeenCalledWith('Произошла непредвиденная ошибка', {
      duration: 5000,
    });

    consoleSpy.mockRestore();
  });

  it('is registered as the app ErrorHandler', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        { provide: PiToastService, useValue: { error: jest.fn() } },
      ],
    });
    expect(TestBed.inject(ErrorHandler)).toBeInstanceOf(GlobalErrorHandler);
  });
});
