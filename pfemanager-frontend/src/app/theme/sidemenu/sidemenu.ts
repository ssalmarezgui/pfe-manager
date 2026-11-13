import { AsyncPipe, NgTemplateOutlet, SlicePipe } from '@angular/common';
import { Component, ViewEncapsulation, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuService } from '@core';
import { NavAccordion } from './nav-accordion';
import { NavAccordionItem } from './nav-accordion-item';
import { NavAccordionToggle } from './nav-accordion-toggle';

@Component({
  selector: 'app-sidemenu',
  standalone: true,
  templateUrl: './sidemenu.html',
  styleUrl: './sidemenu.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    AsyncPipe, SlicePipe, NgTemplateOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatRippleModule, TranslatePipe, NavAccordion, NavAccordionItem, NavAccordionToggle,
  ],
})
export class Sidemenu {
  readonly menu = inject(MenuService);

  canShowMenuItem(menuItem: any): boolean {
    const raw = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    if (!raw) return true;

    try {
      const user = JSON.parse(raw);
      const roles: string[] = (user.roles || []).map((r: any) =>
        (typeof r === 'string' ? r : (r.libelle || r.name || '')).toUpperCase()
      );

      const isAdmin = roles.some(r => r.includes('ADMIN'));
      const isEtudiant = roles.some(r => r.includes('ETUDIANT'));
      const isEntreprise = roles.some(r => r.includes('ENTREPRISE') || r.includes('ENSEIGNANT'));
      const route = menuItem.route || '';

      // 1. Pages d'Administration -> SEUL l'Admin
      if (route.includes('admin')) {
        return isAdmin;
      }

      // 2. Mon Stage PFE -> SEUL l'Étudiant
      if (route.includes('mon-stage')) {
        return isEtudiant;
      }

      // 3. Mes Sujets PFE -> SEULES les Entreprises et Enseignants
      if (route.includes('mes-sujets')) {
        return isEntreprise;
      }

      // 4. Catalogue & Annuaires (Entreprises / Laboratoires) -> SEULS l'Admin et l'Étudiant
      if (route.includes('catalogue') || route.includes('annuaire')) {
        return isAdmin || isEtudiant;
      }

      // 5. Tableau de Bord -> Tout le monde
      return true;
    } catch (e) {
      return true;
    }
  }
}