import { Component, ViewEncapsulation, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/authentication';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  template: `
    <div class="user-panel-card">
      <!-- Partie haute : Avatar et Nom -->
      <div class="user-main-info" routerLink="/profile/overview">
        <div class="avatar-bubble">{{ getInitials(getUser()?.prenom, getUser()?.nom) }}</div>
        <div class="user-text">
          <h4 class="user-name">{{ getUser()?.prenom }} {{ getUser()?.nom }}</h4>
          <span class="user-email">{{ getUser()?.email }}</span>
        </div>
      </div>

      <!-- Partie basse : Boutons Profil et Déconnexion (Réintégrés) -->
      <div class="user-actions-row">
        <button mat-button routerLink="/profile/settings" class="btn-action">
          <mat-icon>settings</mat-icon> Profil
        </button>
        <button mat-button (click)="logout()" class="btn-action logout">
          <mat-icon>exit_to_app</mat-icon> Déconnexion
        </button>
      </div>
    </div>
  `,
  styleUrl: './user-panel.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, MatButtonModule, MatIconModule],
})
export class UserPanel {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  getUser(): any {
    const raw = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    return raw ? JSON.parse(raw) : null;
  }

  getInitials(prenom?: string, nom?: string): string {
    return ((prenom?.charAt(0) || '') + (nom?.charAt(0) || 'U')).toUpperCase();
  }

  logout() {
    this.auth.logout().subscribe(() => {
      sessionStorage.removeItem('auth-token');
      sessionStorage.removeItem('auth-user');
      
      this.router.navigateByUrl('/auth/login').then(() => {
        window.location.reload();
      });
    });
  }
}