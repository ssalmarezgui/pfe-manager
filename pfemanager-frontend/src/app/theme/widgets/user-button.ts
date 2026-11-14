import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmLogoutDialog } from '@shared/components/confirm-logout-dialog';

@Component({
  selector: 'app-user',
  standalone: true,
  template: `
    <!-- Bouton Déclencheur : Avatar Initiales Indigo/Bleu -->
    <button mat-icon-button [matMenuTriggerFor]="menu" class="user-trigger-btn">
      <div class="header-avatar">
        {{ getInitials() }}
      </div>
    </button>

    <!-- Menu Déroulant Profil -->
    <mat-menu #menu="matMenu" xPosition="before" class="custom-user-menu">
      
      <!-- En-tête du menu : Identité connectée -->
      <div class="menu-user-header" (click)="$event.stopPropagation()">
        <span class="user-title">{{ getUser()?.prenom }} {{ getUser()?.nom }}</span>
        <span class="user-subtitle">{{ getUser()?.email }}</span>
      </div>

      <mat-divider />

      <!-- Liens utiles -->
      <button routerLink="/profile/overview" mat-menu-item>
        <mat-icon>person_outline</mat-icon>
        <span>Mon Profil</span>
      </button>

      <button routerLink="/profile/settings" mat-menu-item>
        <mat-icon>tune</mat-icon>
        <span>Paramètres du compte</span>
      </button>

      <mat-divider />

      <!-- Déconnexion -->
      <button mat-menu-item (click)="logout()" class="logout-menu-item">
        <mat-icon>logout</mat-icon>
        <span>Se déconnecter</span>
      </button>
    </mat-menu>
  `,
  styles: `
    .user-trigger-btn {
      padding: 0 !important;
      width: 38px !important;
      height: 38px !important;
      min-width: 38px !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 8px;
    }

    .header-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      color: white;
      font-weight: 800;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
      transition: transform 0.15s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    .menu-user-header {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;

      .user-title {
        font-weight: 700;
        font-size: 13.5px;
        color: #111827;
      }

      .user-subtitle {
        font-size: 11px;
        color: #6b7280;
        margin-top: 2px;
      }
    }

    .logout-menu-item {
      color: #ef4444 !important;

      mat-icon {
        color: #ef4444 !important;
      }

      &:hover {
        background-color: #fef2f2 !important;
        color: #dc2626 !important;
      }
    }
  `,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
})
export class UserButton {
  private readonly dialog = inject(MatDialog);

  getUser(): any {
    const raw = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    return raw ? JSON.parse(raw) : null;
  }

  getInitials(): string {
    const u = this.getUser();
    return ((u?.prenom?.charAt(0) || '') + (u?.nom?.charAt(0) || 'U')).toUpperCase();
  }

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