import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-mes-sujets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './mes-sujets.html',
  styleUrl: './mes-sujets.scss',
})
export class MesSujets implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);

  form: any = {
    id: null,
    titre: '',
    technologies: '',
    duree: '',
    description: '',
  };

  isEditing = false;
  mesSujets: any[] = [];
  displayedColumns: string[] = ['titre', 'technologies', 'duree', 'statut', 'actions'];
  isLoading = true;
  isSubmitting = false;

  candidatures: any[] = [];


  ngOnInit(): void {
    this.chargerMesSujets();
    this.chargerCandidaturesRecues();
  }

  actionLoadingId: number | null = null;

  accepterCandidature(id: number): void {
    if (this.actionLoadingId === id) return;
    this.actionLoadingId = id;

    // Mise à jour visuelle immédiate (Optimistic UI)
    this.candidatures = this.candidatures.map(c =>
      c.id === id ? { ...c, statut: 'ACCEPTEE' } : c
    );
    this.cdr.detectChanges();

    this.http.patch<any>(`/api/candidatures/${id}/accepter`, {}, this.getHeaders()).subscribe({
      next: (res) => {
        this.actionLoadingId = null;
        this.snackBar.open(`${res.message}`, 'Fermer', { duration: 4500 });
        this.chargerCandidaturesRecues();
        this.chargerMesSujets();
        this.cdr.detectChanges();
      },
      error: () => {
        this.actionLoadingId = null;
        this.chargerCandidaturesRecues();
        this.cdr.detectChanges();
      },
    });
  }

  refuserCandidature(id: number): void {
    if (this.actionLoadingId === id) return;
    this.actionLoadingId = id;

    // Mise à jour visuelle immédiate (Optimistic UI)
    this.candidatures = this.candidatures.map(c =>
      c.id === id ? { ...c, statut: 'REFUSEE' } : c
    );
    this.cdr.detectChanges();

    this.http.patch<any>(`/api/candidatures/${id}/refuser`, {}, this.getHeaders()).subscribe({
      next: (res) => {
        this.actionLoadingId = null;
        this.snackBar.open(res.message, 'Fermer', { duration: 4000 });
        this.chargerCandidaturesRecues();
        this.cdr.detectChanges();
      },
      error: () => {
        this.actionLoadingId = null;
        this.chargerCandidaturesRecues();
        this.cdr.detectChanges();
      },
    });
  }

  chargerCandidaturesRecues(): void {
    const user = this.getCurrentUser();
    const url = user?.idEntreprise
      ? `/api/candidatures/entreprise/${user.idEntreprise}`
      : (user?.idLabo ? `/api/candidatures/labo/${user.idLabo}` : null);

    if (!url) return;
    this.http.get<any[]>(url, this.getHeaders()).subscribe({
      next: (data) => {
        this.candidatures = data || [];
        this.cdr.detectChanges();
      },
    });
  }

  get candidaturesEnAttenteCount(): number {
    return this.candidatures.filter((c) => c.statut === 'EN_ATTENTE').length;
  }
  
  private getHeaders(): { headers: HttpHeaders } {
    const token = sessionStorage.getItem('auth-token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  private getCurrentUser(): any {
    const userStr = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    return userStr ? JSON.parse(userStr) : null;
  }

  chargerMesSujets(): void {
    const user = this.getCurrentUser();
    this.isLoading = true;

    let url = '/api/sujets';
    if (user?.idEntreprise) {
      url = `/api/sujets/entreprise/${user.idEntreprise}`;
    } else if (user?.idLabo) {
      url = `/api/sujets/labo/${user.idLabo}`;
    }

    this.http.get<any[]>(url, this.getHeaders()).subscribe({
      next: (data) => {
        this.mesSujets = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  enregistrerSujet(): void {
    const user = this.getCurrentUser();
    this.isSubmitting = true;

    const payload: any = {
      titre: this.form.titre,
      technologies: this.form.technologies,
      duree: this.form.duree,
      description: this.form.description,
      idEntreprise: user?.idEntreprise || null,
      idLabo: user?.idLabo || null,
    };

    if (this.isEditing && this.form.id) {
      this.http.put(`/api/sujets/${this.form.id}`, payload, this.getHeaders()).subscribe({
        next: () => {
          this.snackBar.open('Sujet modifié avec succès ! Statut repassé en attente de validation.', 'Fermer', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
          this.reinitialiserFormulaire();
          this.chargerMesSujets();
        },
        error: () => {
          alert('Erreur lors de la modification du sujet.');
          this.isSubmitting = false;
        },
      });
    } else {
      this.http.post('/api/sujets', payload, this.getHeaders()).subscribe({
        next: () => {
          this.snackBar.open('Nouveau sujet publié avec succès ! En attente de validation.', 'Fermer', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
          this.reinitialiserFormulaire();
          this.chargerMesSujets();
        },
        error: () => {
          alert('Erreur lors de la publication du sujet.');
          this.isSubmitting = false;
        },
      });
    }
  }

  editer(sujet: any): void {
    this.isEditing = true;
    this.form = {
      id: sujet.id,
      titre: sujet.titre,
      technologies: sujet.technologies,
      duree: sujet.duree,
      description: sujet.description,
    };
    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 1. Déclarer le dialogue et récupérer le HTML
  private readonly dialog = inject(MatDialog);
  @ViewChild('confirmDialog') confirmDialogTemplate!: TemplateRef<any>;

  // 2. La nouvelle fonction moderne
  supprimer(id: number): void {
    // Ouvre la belle popup
    const dialogRef = this.dialog.open(this.confirmDialogTemplate, {
      width: '380px',
      panelClass: 'modern-dialog',
      autoFocus: false
    });

    // Écoute la réponse du clic
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Si on a cliqué sur "Oui, Supprimer" (result = true)
        this.http.delete(`/api/sujets/${id}`, this.getHeaders()).subscribe({
          next: () => {
            this.snackBar.open('Élément supprimé avec succès.', 'Fermer', { 
              duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['success-snackbar'] 
            });
            this.chargerMesSujets();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression.', 'Fermer', { 
              duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['error-snackbar'] 
            });
          },
        });
      }
    });
  }

  reinitialiserFormulaire(): void {
    this.isEditing = false;
    this.isSubmitting = false;
    this.form = { id: null, titre: '', technologies: '', duree: '', description: '' };
    this.cdr.detectChanges();
  }

  getTechList(technologies: string): string[] {
    if (!technologies) return [];
    return technologies.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
  }
}