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
  selector: 'app-validation-sujets',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './validation-sujets.html',
  styleUrl: './validation-sujets.scss',
})
export class ValidationSujets implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);

  sujets: any[] = [];
  displayedColumns: string[] = ['titre', 'proposePar', 'technologies', 'duree', 'statut', 'actions'];
  isLoading = true;

  // Filtres
  selectedTab: 'ALL' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' = 'ALL';
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
    this.chargerTousLesSujets();
  }

  chargerTousLesSujets(): void {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:8080/api/sujets', this.getHeaders()).subscribe({
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

  // Filtrage combiné : Onglet Statut + Recherche texte
  get filteredSujets(): any[] {
    let result = this.sujets;

    if (this.selectedTab !== 'ALL') {
      result = result.filter(s => s.statut === this.selectedTab);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(s =>
        (s.titre && s.titre.toLowerCase().includes(term)) ||
        (s.technologies && s.technologies.toLowerCase().includes(term)) ||
        (s.entreprise?.nom && s.entreprise.nom.toLowerCase().includes(term)) ||
        (s.labo?.nom && s.labo.nom.toLowerCase().includes(term)) ||
        (s.etudiant && `${s.etudiant.prenom} ${s.etudiant.nom}`.toLowerCase().includes(term))
      );
    }

    return result;
  }

  // Compteurs pour les onglets
  countByStatus(status: string): number {
    return this.sujets.filter(s => s.statut === status).length;
  }

  valider(id: number): void {
    this.http.patch(`http://localhost:8080/api/sujets/${id}/valider`, {}, this.getHeaders()).subscribe({
      next: () => {
        this.snackBar.open('Sujet validé et publié au catalogue !', 'Fermer', { duration: 3000 });
        this.chargerTousLesSujets();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la validation du sujet.', 'Fermer', { duration: 3000 });
      },
    });
  }

  refuser(id: number): void {
    this.http.patch(`http://localhost:8080/api/sujets/${id}/refuser`, {}, this.getHeaders()).subscribe({
      next: () => {
        this.snackBar.open('Sujet refusé.', 'Fermer', { duration: 3000 });
        this.chargerTousLesSujets();
      },
      error: () => {
        this.snackBar.open('Erreur lors du refus du sujet.', 'Fermer', { duration: 3000 });
      },
    });
  }

  supprimer(id: number): void {
    if (confirm('Voulez-vous réellement supprimer définitivement ce sujet ?')) {
      this.http.delete(`http://localhost:8080/api/sujets/${id}`, this.getHeaders()).subscribe({
        next: () => {
          this.snackBar.open('Sujet supprimé du système.', 'Fermer', { duration: 3000 });
          this.chargerTousLesSujets();
        },
      });
    }
  }

  getTechList(technologies: string): string[] {
    if (!technologies) return [];
    return technologies.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
  }
}