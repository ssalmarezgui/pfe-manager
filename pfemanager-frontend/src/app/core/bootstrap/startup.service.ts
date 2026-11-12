import { Injectable, inject } from '@angular/core';
import { AuthService, User } from '@core/authentication';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { tap } from 'rxjs';
import { Menu, MenuService } from './menu.service';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  private readonly authService = inject(AuthService);
  private readonly menuService = inject(MenuService);
  private readonly permissionsService = inject(NgxPermissionsService);
  private readonly rolesService = inject(NgxRolesService);

  private readonly pfeMenu: Menu[] = [
    { route: 'dashboard', name: 'Tableau de Bord', type: 'link', icon: 'dashboard' },
    { route: 'catalogue', name: 'Catalogue des Sujets', type: 'link', icon: 'library_books' },
    { route: 'annuaire/entreprises', name: 'Entreprises', type: 'link', icon: 'business' },
    { route: 'annuaire/laboratoires', name: 'Laboratoires', type: 'link', icon: 'domain' },
    { route: 'mon-stage', name: 'Mon Stage PFE', type: 'link', icon: 'school'},
    { route: 'admin/validation-sujets', name: 'Validation des Sujets', type: 'link', icon: 'check_circle' },
    { route: 'admin/utilisateurs', name: 'Gestion Utilisateurs', type: 'link', icon: 'people' },
  ];

  load() {
    return new Promise<void>((resolve) => {
      this.authService.change().pipe(
        tap(user => this.setPermissions(user)),
        tap(() => this.menuService.set(this.pfeMenu))
      ).subscribe({
        next: () => resolve(),
        error: () => resolve(),
      });
    });
  }

  private setPermissions(user: User) {
    if (!user || !user.roles) {
      this.rolesService.addRoles({ GUEST: [] });
      return;
    }

    // 1. Nettoyer les rôles existants
    this.rolesService.flushRoles();

    // 2. Extraire les rôles du backend (Spring Boot renvoie souvent une liste d'objets {libelle: 'ROLE_...'})
    const userRoles = user.roles.map((r: any) => (typeof r === 'string' ? r : r.libelle).replace('ROLE_', ''));
    
    // 3. Charger les rôles dynamiquement dans NgxRolesService
    const rolesConfig: any = {};
    userRoles.forEach(role => {
      rolesConfig[role] = ['canAdd', 'canDelete', 'canEdit', 'canRead'];
    });

    this.rolesService.addRoles(rolesConfig);
    console.log("Rôles appliqués :", rolesConfig);
  }
}