import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg = err.error?.message ?? err.statusText ?? 'Request failed';
      if (err.status !== 401) {
        toast.error(msg);
      }
      return throwError(() => err);
    }),
  );
};
