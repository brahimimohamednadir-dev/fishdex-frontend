import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Verrou global : évite plusieurs refreshes simultanés
let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<boolean>(false);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const authReq = addToken(req, auth.getToken());

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Ne tente pas le refresh sur la route /auth/refresh elle-même
      if (err.status !== 401 || req.url.includes('/auth/refresh')) {
        return throwError(() => err);
      }

      const refreshToken = auth.getRefreshToken();
      if (!refreshToken) {
        // Pas de refresh token → déconnexion directe
        auth.logout();
        router.navigate(['/login']);
        return throwError(() => err);
      }

      if (isRefreshing) {
        // Attendre que le refresh en cours se termine, puis réessayer
        return refreshDone$.pipe(
          filter(done => done),
          take(1),
          switchMap(() => next(addToken(req, auth.getToken())))
        );
      }

      isRefreshing = true;
      refreshDone$.next(false);

      return auth.refreshAccessToken().pipe(
        switchMap(res => {
          isRefreshing = false;
          refreshDone$.next(true);

          if (res.success && res.data?.token) {
            return next(addToken(req, res.data.token));
          }
          // Refresh OK côté HTTP mais token absent → logout
          auth.logout();
          router.navigate(['/login']);
          return throwError(() => err);
        }),
        catchError(refreshErr => {
          isRefreshing = false;
          refreshDone$.next(false);
          auth.logout();
          router.navigate(['/login']);
          return throwError(() => refreshErr);
        })
      );
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
}
