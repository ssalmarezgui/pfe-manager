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
    AsyncPipe,
    SlicePipe,
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatRippleModule,
    TranslatePipe,
    NavAccordion,
    NavAccordionItem,
    NavAccordionToggle,
  ],
})
export class Sidemenu {
  readonly menu = inject(MenuService);

  // FILTRAGE INTELLIGENT SELON LE VRAI RÔLE CONNECTÉ
  canShowMenuItem(menuItem: any): boolean {
    const userStr = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    if (!userStr) return true;

    const user = JSON.parse(userStr);
    const roles: string[] = (user.roles || []).map((r: any) => (r.libelle || r).toUpperCase());

    const isAdmin = roles.some(r => r.includes('ADMIN'));
    const isEtudiant = roles.some(r => r.includes('ETUDIANT'));
    const isEntreprise = roles.some(r => r.includes('ENTREPRISE') || r.includes('ENSEIGNANT'));

    const route = menuItem.route;

    // 🛡️ POUR L'ADMINISTRATEUR (Mehrez) :
    // On masque "Mon Stage PFE" et "Mes Sujets"
    if (isAdmin) {
      if (route === 'mon-stage' || route === 'mes-sujets') {
        return false;
      }
      return true;
    }

    // 🎓 POUR L'ÉTUDIANT :
    // On masque les outils entreprise et admin
    if (isEtudiant) {
      if (route === 'mes-sujets' || route === 'validation-sujets' || route === 'utilisateurs') {
        return false;
      }
      return true;
    }

    // 🏢 POUR L'ENTREPRISE / ENSEIGNANT :
    // On masque "Mon Stage" et les outils admin
    if (isEntreprise) {
      if (route === 'mon-stage' || route === 'validation-sujets' || route === 'utilisateurs') {
        return false;
      }
      return true;
    }

    return true;
  }
}