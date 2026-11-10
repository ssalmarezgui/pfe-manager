import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '@core';

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
export class ProfileLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  user = toSignal(this.auth.user());

  // Génère les initiales dynamiquement (ex: "Principal Admin" -> "PA")
  getInitials(name?: string): string {
    if (!name) return 'U';
    return name
      .trim()
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      // Nettoyage complet de la session
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigateByUrl('/auth/login');
    });
  }
}