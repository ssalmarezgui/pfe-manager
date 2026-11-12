import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '@core/authentication';
import { EMPTY, catchError, tap, throwError } from 'rxjs';
import { BASE_URL, hasHttpScheme } from './base-url-interceptor';

export function tokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const router = inject(Router);
  const baseUrl = inject(BASE_URL, { optional: true });
  const tokenService = inject(TokenService);

  // 1. Intercepte /auth/logout AVANT l'envoi réseau pour éviter le 404 sur Render
  if (req.url.includes('/auth/logout')) {
    tokenService.clear();
    sessionStorage.clear();
    localStorage.removeItem('ng-matero-token');
    localStorage.removeItem('auth-token');
    router.navigateByUrl('/auth/login');
    return EMPTY;
  }

  const includeBaseUrl = (url: string) => {
    if (!baseUrl) {
      return false;
    }
    return new RegExp(`^${baseUrl.replace(/\/$/, '')}`, 'i').test(url);
  };

  const shouldAppendToken = (url: string) =>
    (!hasHttpScheme(url) || includeBaseUrl(url)) && !url.includes('/api/auth/');

  const handler = () => {
    if (router.url.includes('/auth/login')) {
      router.navigateByUrl('/dashboard');
    }
  };

  // 2. Récupère le token depuis sessionStorage, localStorage ou TokenService
  const rawToken =
    sessionStorage.getItem('auth-token') ||
    localStorage.getItem('auth-token') ||
    tokenService.getBearerToken().replace(/^Bearer\s+/i, '');

  if (rawToken && shouldAppendToken(req.url)) {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${rawToken}`,
        },
      })
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          tokenService.clear();
          sessionStorage.removeItem('auth-token');
        }
        return throwError(() => error);
      }),
      tap(() => handler())
    );
  }

  return next(req).pipe(tap(() => handler()));
}