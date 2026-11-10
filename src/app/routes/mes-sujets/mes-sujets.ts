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

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
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

  ngOnInit(): void {
    this.chargerMesSujets();
  }

  chargerMesSujets(): void {
    const user = this.getCurrentUser();
    this.isLoading = true;

    let url = 'http://localhost:8080/api/sujets';
    if (user?.idEntreprise) {
      url = `http://localhost:8080/api/sujets/entreprise/${user.idEntreprise}`;
    } else if (user?.idLabo) {
      url = `http://localhost:8080/api/sujets/labo/${user.idLabo}`;
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
      this.http.put(`http://localhost:8080/api/sujets/${this.form.id}`, payload, this.getHeaders()).subscribe({
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
      this.http.post('http://localhost:8080/api/sujets', payload, this.getHeaders()).subscribe({
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

  supprimer(id: number): void {
    if (confirm('Voulez-vous réellement supprimer ce sujet ?')) {
      this.http.delete(`http://localhost:8080/api/sujets/${id}`, this.getHeaders()).subscribe({
        next: () => {
          this.snackBar.open('Sujet supprimé avec succès.', 'Fermer', { duration: 3000 });
          this.chargerMesSujets();
        },
      });
    }
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