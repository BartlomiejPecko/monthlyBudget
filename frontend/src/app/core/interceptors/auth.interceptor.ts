import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, retry, timer } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    retry({
      count: 2,
      delay: (error, retryCount) => {
        // Don't retry 401/403/422/400 — those are real errors
        if ([400, 401, 403, 422].includes(error.status)) {
          throw error;
        }
        // Retry 0 (no connection), 500, 502, 503, 504
        return timer(retryCount * 1000);
      },
    }),
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );

};