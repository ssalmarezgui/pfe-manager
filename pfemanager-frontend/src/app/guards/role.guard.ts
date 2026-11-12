import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private tokenService: TokenStorageService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expectedRoles = route.data['expectedRoles'] as Array<string>;
    const user = this.tokenService.getUser();

    if (!user || !user.roles) {
      return this.router.parseUrl('/auth/login');
    }

    const hasRole = user.roles.some((role: string) => expectedRoles.includes(role));

    if (hasRole) {
      return true;
    }

    // Si le rôle ne correspond pas, retour au tableau de bord
    alert('Accès refusé : vous n\'avez pas les droits nécessaires pour cette page !');
    return this.router.parseUrl('/dashboard');
  }
}