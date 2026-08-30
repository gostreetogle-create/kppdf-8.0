import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { SubmitGuard } from '../submit-guard';

export const idempotencyInterceptor: HttpInterceptorFn = (req, next) => {
  const guard = inject(SubmitGuard);
  if (!/^(POST|PATCH|DELETE)$/.test(req.method)) return next(req);
  if (req.headers.has('Idempotency-Key')) return next(req);
  const key = guard.getActiveKey(req.url, req.method) ?? crypto.randomUUID();
  return next(req.clone({ setHeaders: { 'Idempotency-Key': key } }));
};
