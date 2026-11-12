import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
    MatDialogModule,
  ],
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.scss',
  encapsulation: ViewEncapsulation.None, // FORCE LE STYLE DES TOASTS !
})
export class Utilisateurs implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  @ViewChild('confirmDialog') confirmDialogTemplate!: TemplateRef<any>;

  users: any[] = [];
  displayedColumns: string[] = ['id', 'nom', 'email', 'tel', 'roles', 'actions'];
  isLoading = true;

  selectedRoleTab: string = 'ALL';
  searchTerm: string = '';

  private getHeaders(): { headers: HttpHeaders } {
    const token = sessionStorage.getItem('auth-token');
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
    this.http.get<any[]>('/api/users', this.getHeaders()).subscribe({
      next: (data) => {
        // 👈 Le spread operator [...] force Angular à rafraîchir le tableau visuellement
        this.users = [...(data || [])]; 
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getFullName(user: any): string {
    if (user.prenom && user.nom) return `${user.prenom} ${user.nom}`;
    if (user.name) return user.name;
    if (user.username) return user.username;
    return user.email ? user.email.split('@')[0] : 'Utilisateur';
  }

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
      result = result.filter(u => {
        const fullName = this.getFullName(u).toLowerCase();
        return (
          fullName.includes(term) ||
          (u.email && u.email.toLowerCase().includes(term)) ||
          (u.tel && u.tel.toLowerCase().includes(term))
        );
      });
    }

    return result;
  }

  countByRole(roleSub: string): number {
    return this.users.filter(u => {
      const roles = (u.roles || []).map((r: any) => (r.libelle || r).toUpperCase());
      return roles.some((r: string) => r.includes(roleSub));
    }).length;
  }

  getRoles(user: any): string[] {
    if (!user.roles || user.roles.length === 0) return ['UTILISATEUR'];
    return user.roles.map((r: any) => r.libelle || r);
  }

  getInitials(user: any): string {
    const name = this.getFullName(user);
    return name
      .trim()
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  supprimer(id: number): void {
    const dialogRef = this.dialog.open(this.confirmDialogTemplate, {
      width: '380px',
      panelClass: 'modern-dialog',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.http.delete(`/api/users/${id}`, this.getHeaders()).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur supprimé avec succès.', 'Fermer', { 
              duration: 3000, 
              horizontalPosition: 'end', 
              verticalPosition: 'top', 
              panelClass: ['success-snackbar'] 
            });
            // Recharge immédiatement les données après suppression
            this.chargerUtilisateurs();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression.', 'Fermer', { 
              duration: 3000, 
              horizontalPosition: 'end', 
              verticalPosition: 'top', 
              panelClass: ['error-snackbar'] 
            });
          },
        });
      }
    });
  }
}