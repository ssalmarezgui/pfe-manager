import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-logout-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div style="padding: 32px 24px; text-align: center; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 58px; height: 58px; background: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 18px;">
        <mat-icon style="font-size: 28px; width: 28px; height: 28px; color: #ef4444;">logout</mat-icon>
      </div>

      <h2 style="margin: 0 0 8px 0; font-size: 19px; font-weight: 800; color: #111827;">
        Déconnexion
      </h2>

      <p style="margin: 0 0 26px 0; font-size: 13.5px; color: #6b7280; line-height: 1.5; max-width: 280px;">
        Êtes-vous sûr(e) de vouloir vous déconnecter de votre session PFE Manager ?
      </p>

      <div style="display: flex; gap: 12px; width: 100%;">
        <button
          mat-button
          [mat-dialog-close]="false"
          style="flex: 1; height: 42px; border-radius: 8px; font-weight: 600; color: #4b5563; background: #f3f4f6;"
        >
          Annuler
        </button>
        <button
          mat-flat-button
          [mat-dialog-close]="true"
          style="flex: 1; height: 42px; border-radius: 8px; font-weight: 600; color: white; background: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);"
        >
          Oui, Déconnecter
        </button>
      </div>
    </div>
  `,
})
export class ConfirmLogoutDialog {}