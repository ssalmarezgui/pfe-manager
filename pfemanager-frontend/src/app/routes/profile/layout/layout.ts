import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '@core';
import { ConfirmLogoutDialog } from '@shared/components/confirm-logout-dialog';

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
  ],
})
export class ProfileLayout implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  currentUser: { name: string; email: string; roleLabel: string } = {
    name: 'Utilisateur',
    email: '',
    roleLabel: 'PFE Manager — Actif',
  };

  ngOnInit(): void {
    this.chargerProfilUtilisateur();
  }

  chargerProfilUtilisateur(): void {
    const raw = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    if (!raw) return;

    try {
      const user = JSON.parse(raw);
      const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim() || user.name || 'Utilisateur';
      const roles: string[] = (user.roles || []).map((r: any) =>
        (typeof r === 'string' ? r : (r.libelle || r.name || '')).toUpperCase()
      );

      let roleLabel = 'Étudiant PFE';
      if (roles.some(r => r.includes('ADMIN'))) {
        roleLabel = 'Administrateur Principal';
      } else if (roles.some(r => r.includes('ENTREPRISE'))) {
        roleLabel = user.nomEntreprise ? `Entreprise — ${user.nomEntreprise}` : 'Représentant Entreprise';
      } else if (roles.some(r => r.includes('ENSEIGNANT'))) {
        roleLabel = user.nomLabo ? `Laboratoire — ${user.nomLabo}` : 'Enseignant / Chercheur';
      }

      this.currentUser = {
        name: fullName,
        email: user.email || '',
        roleLabel,
      };
    } catch (e) {
      console.error('Erreur lecture auth-user', e);
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  private readonly dialog = inject(MatDialog);

  logout(): void {
    const dialogRef = this.dialog.open(ConfirmLogoutDialog, {
      width: '380px',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
        sessionStorage.removeItem('auth-token');
        sessionStorage.removeItem('auth-user');

        window.location.href = '/auth/login';
      }
    });
  }
}