import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.scss',
})
export class Utilisateurs implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);

  users: any[] = [];
  displayedColumns: string[] = ['id', 'nom', 'email', 'tel', 'roles', 'actions'];
  isLoading = true;

  // Filtres
  selectedRoleTab: string = 'ALL';
  searchTerm: string = '';

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs(): void {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:8080/api/users', this.getHeaders()).subscribe({
      next: (data) => {
        this.users = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Filtrage combiné (Rôle + Barre de recherche)
  get filteredUsers(): any[] {
    let result = this.users;

    if (this.selectedRoleTab !== 'ALL') {
      result = result.filter(u => {
        const roles = (u.roles || []).map((r: any) => (r.libelle || r).toUpperCase());
        return roles.some((r: string) => r.includes(this.selectedRoleTab));
      });
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(u =>
        (u.nom && u.nom.toLowerCase().includes(term)) ||
        (u.prenom && u.prenom.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.tel && u.tel.toLowerCase().includes(term))
      );
    }

    return result;
  }

  // Compteur par rôle
  countByRole(roleSub: string): number {
    return this.users.filter(u => {
      const roles = (u.roles || []).map((r: any) => (r.libelle || r).toUpperCase());
      return roles.some((r: string) => r.includes(roleSub));
    }).length;
  }

  // Récupère les rôles sous forme de tableau
  getRoles(user: any): string[] {
    if (!user.roles || user.roles.length === 0) return ['Utilisateur'];
    return user.roles.map((r: any) => r.libelle || r);
  }

  // Initiales de l'avatar
  getInitials(prenom: string, nom: string): string {
    const p = prenom ? prenom.charAt(0) : '';
    const n = nom ? nom.charAt(0) : '';
    return (p + n).toUpperCase() || 'U';
  }

  supprimer(id: number): void {
    if (confirm('Voulez-vous réellement supprimer définitivement cet utilisateur ?')) {
      this.http.delete(`http://localhost:8080/api/users/${id}`, this.getHeaders()).subscribe({
        next: () => {
          this.snackBar.open('Utilisateur supprimé avec succès.', 'Fermer', { duration: 3000 });
          this.chargerUtilisateurs();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression de l’utilisateur.', 'Fermer', { duration: 3000 });
        },
      });
    }
  }
}