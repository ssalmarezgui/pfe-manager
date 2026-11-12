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

      // 1. Pages d'Administration (Validation des sujets, Gestion utilisateurs)
      // 👉 SEUL l'Admin les voit
      if (route.includes('admin')) {
        return isAdmin;
      }

      // 2. Mon Stage PFE (Dépôt et documents de stage)
      // 👉 SEUL l'Étudiant le voit (STRICTEMENT INTERDIT À L'ADMIN)
      if (route.includes('mon-stage')) {
        return isEtudiant;
      }

      // 3. Mes Sujets (Publication pour les entreprises et labos)
      // 👉 SEULES les entreprises et enseignants le voient
      if (route.includes('mes-sujets')) {
        return isEntreprise;
      }

      // 4. Pages communes (Tableau de bord, Catalogue, Annuaires)
      return true;
    } catch (e) {
      return true;
    }
  }
}