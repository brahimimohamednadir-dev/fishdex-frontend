import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, Subject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

// ── Verrou global : évite plusieurs refreshes simultanés ──────────────────────
// Utilise un Subject (et non BehaviorSubject) pour ne notifier que les abonnés
// en attente, sans rejouer la dernière valeur aux nouveaux abonnés.
let isRefreshing = false;
const refreshResult$ = new Subject<boolean>(); // true = succès, false = échec

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const authReq = addToken(req, auth.getToken());

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Ne tente pas le refresh sur /auth/refresh lui-même
      if (err.status !== 401 || req.url.includes('/auth/refresh')) {
        return throwError(() => err);
      }

      const refreshToken = auth.getRefreshToken();
      if (!refreshToken) {
        auth.logout();
        router.navigate(['/login']);
        return throwError(() => err);
      }

      if (isRefreshing) {
        // Attendre la fin du refresh en cours, puis relancer ou abandonner
        return refreshResult$.pipe(
          filter(success => success !== undefined),
          take(1),
          switchMap(success => {
            if (success) {
              // Refresh réussi → relancer la requête avec le nouveau token
              return next(addToken(req, auth.getToken()));
            }
            // Refresh échoué → on abandonne (logout déjà fait par le premier thread)
            return throwError(() => err);
          })
        );
      }

      // Ce thread lance le refresh
      isRefreshing = true;

      return auth.refreshAccessToken().pipe(
        switchMap(res => {
          isRefreshing = false;

          if (res.success && res.data?.token) {
            // Notifie les requêtes en attente : succès
            refreshResult$.next(true);
            return next(addToken(req, res.data.token));
          }

          // Refresh HTTP 200 mais token absent — cas anormal
          refreshResult$.next(false);
          auth.logout();
          router.navigate(['/login']);
          return throwError(() => err);
        }),
        catchError(refreshErr => {
          isRefreshing = false;
          // Notifie les requêtes en attente : échec (débloque le deadlock)
          refreshResult$.next(false);
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
