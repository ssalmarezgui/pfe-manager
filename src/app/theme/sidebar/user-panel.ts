import { Component, ViewEncapsulation, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/authentication';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  template: `
    <div class="user-panel-card">
      <div class="user-main-info" routerLink="/profile/overview">
        <div class="avatar-bubble">
          {{ getInitials(user()?.name) }}
        </div>
        <div class="user-text">
          <h4 class="user-name">{{ user()?.name || 'Administrateur' }}</h4>
          <span class="user-email">{{ user()?.email || 'admin@pfemanager.com' }}</span>
        </div>
      </div>

      <!-- Boutons d'actions rapides intégrés dans la sidebar -->
      <div class="user-quick-actions">
        <a class="action-link" routerLink="/profile/settings" title="Paramètres du compte">
          <mat-icon>settings</mat-icon>
          <span>Profil</span>
        </a>
        <button class="action-link logout-link" (click)="logout()" title="Se déconnecter">
          <mat-icon>logout</mat-icon>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  `,
  styles: `
    .user-panel-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 12px;
      margin: 8px 10px 16px 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

      .user-main-info {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding-bottom: 10px;
        border-bottom: 1px solid #f3f4f6;

        .avatar-bubble {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
          color: white;
          font-weight: 800;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-text {
          overflow: hidden;

          .user-name {
            font-size: 13px;
            font-weight: 700;
            color: #111827;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .user-email {
            font-size: 11px;
            color: #6b7280;
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .user-quick-actions {
        display: flex;
        gap: 6px;
        margin-top: 8px;

        .action-link {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          text-decoration: none;
          background: #f9fafb;
          color: #4b5563;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.15s ease;

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }

          &:hover {
            background: #eef2ff;
            color: #4f46e5;
            border-color: #c7d2fe;
          }

          &.logout-link:hover {
            background: #fef2f2;
            color: #dc2626;
            border-color: #fecaca;
          }
        }
      }
    }
  `,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, MatButtonModule, MatIconModule],
})
export class UserPanel {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  user = toSignal(this.auth.user());

  getInitials(name?: string): string {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  logout() {
    this.auth.logout().subscribe(() => {
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigateByUrl('/auth/login');
    });
  }
}