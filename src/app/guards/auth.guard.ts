import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private tokenService: TokenStorageService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.tokenService.isLoggedIn()) {
      return true;
    }
    // Redirige vers la page login si pas connecté
    return this.router.parseUrl('/auth/login');
  }
}