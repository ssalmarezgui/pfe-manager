import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

export const authGuard = (route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('auth-token');
  const userStr = sessionStorage.getItem('auth-user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.roles && user.roles.length > 0) {
        return true;
      }
    } catch {}
  }

  sessionStorage.clear();
  localStorage.removeItem('auth-token');
  localStorage.removeItem('auth-user');
  return router.parseUrl('/auth/login');
};