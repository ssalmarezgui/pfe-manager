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

  aDejaPostule(sujetId: number): boolean {
    return this.mesCandidaturesIds.includes(sujetId);
  }

  postuler(sujet: any): void {
    const userStr = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const organisme = sujet.entreprise?.nom || (sujet.labo ? `le laboratoire ${sujet.labo.nom}` : "l'organisme");

    this.http
      .post<any>('/api/candidatures/postuler', { idSujet: sujet.id, idEtudiant: user.id }, this.getHeaders())
      .subscribe({
        next: (res) => {
          this.mesCandidaturesIds.push(sujet.id);
          this.snackBar.open(
            res.message || `Votre demande a bien été reçue par ${organisme}. On va vous contacter prochainement pour le déroulement du stage et les entretiens.`,
            'Fermer',
            {
              duration: 7000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            }
          );
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Vous avez déjà postulé à ce sujet.',
            'Fermer',
            { duration: 4000, panelClass: ['error-snackbar'] }
          );
        },
      });
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