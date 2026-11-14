import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
  imports: [CommonModule, MatCardModule, MatIconModule],
})
export class ProfileOverview implements OnInit {
  currentUser: any = null;

  ngOnInit(): void {
    const raw = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    this.currentUser = raw ? JSON.parse(raw) : null;
  }

  getInitials(): string {
    const p = this.currentUser?.prenom?.[0] || '';
    const n = this.currentUser?.nom?.[0] || 'U';
    return (p + n).toUpperCase();
  }

  getRoleLabel(): string {
    const roles = this.currentUser?.roles;
    if (!roles || roles.length === 0) return 'Utilisateur';
    return roles.map((r: any) => (r.libelle || r).replace('ROLE_', '')).join(', ');
  }
}