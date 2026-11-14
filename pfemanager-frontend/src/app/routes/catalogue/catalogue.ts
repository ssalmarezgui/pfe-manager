import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './catalogue.html',
  styleUrl: './catalogue.scss', // Ajout de la feuille de style
})
export class Catalogue implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  

  sujets: any[] = [];
  keyword = '';
  technologie = '';
  isLoading = false;

  
  private readonly snackBar = inject(MatSnackBar);
  mesCandidaturesIds: number[] = [];

  isSubmittingId: number | null = null;

  aDejaPostule(sujetId: number): boolean {
    return this.mesCandidaturesIds.includes(Number(sujetId));
  }

  postuler(sujet: any): void {
    if (this.isSubmittingId === sujet.id || this.aDejaPostule(sujet.id)) return;

    const userStr = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const organisme = sujet.entreprise?.nom || (sujet.labo ? `le laboratoire ${sujet.labo.nom}` : "l'organisme");
    this.isSubmittingId = sujet.id;
    this.cdr.detectChanges();

    this.http
      .post<any>('/api/candidatures/postuler', { idSujet: sujet.id, idEtudiant: user.id }, this.getHeaders())
      .subscribe({
        next: (res) => {
          this.isSubmittingId = null;
          // Réaffectation du tableau pour forcer la mise à jour immédiate du template Angular
          this.mesCandidaturesIds = [...this.mesCandidaturesIds, Number(sujet.id)];
          this.cdr.detectChanges();

          this.snackBar.open(
            res.message || `Votre demande a bien été reçue par ${organisme}. Nous allons vous contacter prochainement pour le déroulement du stage et les entretiens.`,
            'Fermer',
            {
              duration: 7000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            }
          );
        },
        error: (err) => {
          this.isSubmittingId = null;
          if (err.status === 400) {
            this.mesCandidaturesIds = [...this.mesCandidaturesIds, Number(sujet.id)];
          }
          this.cdr.detectChanges();

          this.snackBar.open(
            err.error?.message || 'Vous avez déjà postulé à ce sujet.',
            'Fermer',
            { duration: 4000 }
          );
        },
      });
  }

  ngOnInit(): void {
    this.chargerSujets();
    this.chargerMesCandidatures();
  }

  chargerMesCandidatures(): void {
    const userStr = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    if (user?.id && this.isEtudiant()) {
      this.http.get<any[]>(`/api/candidatures/etudiant/${user.id}`, this.getHeaders()).subscribe({
        next: (list) => {
          this.mesCandidaturesIds = (list || []).map((c) => c.sujet?.id);
          this.cdr.detectChanges();
        },
      });
    }
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = sessionStorage.getItem('auth-token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  chargerSujets(): void {
    this.isLoading = true;
    this.http.get<any[]>('/api/sujets/valides', this.getHeaders()).subscribe({
      next: (data) => {
        this.sujets = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  rechercher(): void {
    this.isLoading = true;
    const params: any = {};
    if (this.keyword.trim()) params.keyword = this.keyword.trim();
    if (this.technologie.trim()) params.technologie = this.technologie.trim();

    this.http.get<any[]>('/api/sujets/search', { params, ...this.getHeaders() }).subscribe({
      next: (data) => {
        this.sujets = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  reinitialiser(): void {
    this.keyword = '';
    this.technologie = '';
    this.chargerSujets();
  }

  // Découpe la chaîne de technologies "Spring Boot, Angular" en badges individuels
  getTechList(technologies: string): string[] {
    if (!technologies) return [];
    return technologies.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
  }

  isEtudiant(): boolean {
    const userStr = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    if (!userStr) return false;

    try {
      const user = JSON.parse(userStr);
      const roles: string[] = (user.roles || []).map((r: any) => 
        (typeof r === 'string' ? r : (r.libelle || r.name || '')).toUpperCase()
      );
      
      // Retourne vrai UNIQUEMENT s'il a le rôle Étudiant
      return roles.some(r => r.includes('ETUDIANT') || r.includes('STUDENT'));
    } catch (e) {
      return false;
    }
  }
}