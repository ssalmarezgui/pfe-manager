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

  // Notre menu PFE Manager défini directement en dur (zéro erreur 404 possible)
  private readonly pfeMenu: Menu[] = [
    {
      route: 'dashboard',
      name: 'menu.dashboard',
      type: 'link',
      icon: 'dashboard',
    },
    {
      route: 'catalogue',
      name: 'menu.catalogue',
      type: 'link',
      icon: 'library_books',
    },
    {
      route: 'annuaire/entreprises',
      name: 'menu.entreprises',
      type: 'link',
      icon: 'business',
    },
    {
      route: 'annuaire/laboratoires',
      name: 'menu.laboratoires',
      type: 'link',
      icon: 'science',
    },
    {
      route: 'admin/validation-sujets',
      name: 'menu.validation_sujets',
      type: 'link',
      icon: 'check_circle',
    },
    {
      route: 'admin/utilisateurs',
      name: 'menu.utilisateurs',
      type: 'link',
      icon: 'people',
    },
  ];

  load() {
    return new Promise<void>((resolve, reject) => {
      this.authService
        .change()
        .pipe(
          tap(user => this.setPermissions(user)),
          tap(() => this.setMenu(this.pfeMenu))
        )
        .subscribe({
          next: () => resolve(),
          error: () => resolve(),
        });
    });
  }

  private setMenu(menu: Menu[]) {
    this.menuService.set(menu);
  }

  private setPermissions(user: User) {
    const permissions = ['canAdd', 'canDelete', 'canEdit', 'canRead'];
    this.permissionsService.loadPermissions(permissions);
    this.rolesService.flushRoles();
    this.rolesService.addRoles({ ADMIN: permissions });
  }
}