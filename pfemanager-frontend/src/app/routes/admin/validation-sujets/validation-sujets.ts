import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-validation-sujets',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatTableModule, 
    MatButtonModule, 
    MatDialogModule,
    MatIconModule
    
  ],
  templateUrl: './validation-sujets.html',
  styleUrl: './validation-sujets.scss',
})
export class ValidationSujets implements OnInit {
  readonly JSON = JSON; 
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);

  sujets: any[] = [];
  isLoading = true;

  displayedColumns: string[] = ['titre', 'proposePar', 'technologies', 'duree', 'statut', 'documents', 'actions'];

  // Vérifie si le sujet MySQL contient le PDF
  hasDoc(sujet: any, docId: string): boolean {
    if (!sujet) return false;
    if (docId === 'convention') return !!sujet.conventionNom;
    if (docId === 'attestation') return !!sujet.attestationNom;
    if (docId === 'rapport') return !!sujet.rapportNom;
    return false;
  }

  // Ouvre le vrai PDF stocké dans MySQL
  ouvrirDocument(sujet: any, docId: string): void {
    let dataUrl = '';
    let nom = '';

    if (docId === 'convention') { dataUrl = sujet.conventionData; nom = sujet.conventionNom; }
    if (docId === 'attestation') { dataUrl = sujet.attestationData; nom = sujet.attestationNom; }
    if (docId === 'rapport') { dataUrl = sujet.rapportData; nom = sujet.rapportNom; }

    if (dataUrl) {
      const win = window.open();
      win?.document.write(
        `<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    } else {
      alert(`Document : ${nom}`);
    }
  }

  getDocName(sujetId: number, docId: string): string {
    const raw = localStorage.getItem(`pfe_docs_sujet_${sujetId}`);
    if (!raw) return 'Non déposé';
    const docs = JSON.parse(raw);
    const doc = docs.find((d: any) => d.id === docId);
    return doc?.fichier ? `${doc.nom} : ${doc.fichier} (${doc.dateDepot})` : `${doc.nom} non déposée`;
  }

  // Filtres
  selectedTab: 'ALL' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' = 'ALL';
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
    this.chargerTousLesSujets();
  }

  chargerTousLesSujets(): void {
    this.isLoading = true;
    this.http.get<any[]>('/api/sujets', this.getHeaders()).subscribe({
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
    this.http.patch(` /api/sujets/${id}/valider`, {}, this.getHeaders()).subscribe({
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
    this.http.patch(` /api/sujets/${id}/refuser`, {}, this.getHeaders()).subscribe({
      next: () => {
        this.snackBar.open('Sujet refusé.', 'Fermer', { duration: 3000 });
        this.chargerTousLesSujets();
      },
      error: () => {
        this.snackBar.open('Erreur lors du refus du sujet.', 'Fermer', { duration: 3000 });
      },
    });
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
        this.http.delete(` /api/sujets/${id}`, this.getHeaders()).subscribe({
          next: () => {
            this.snackBar.open('Élément supprimé avec succès.', 'Fermer', { 
              duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['success-snackbar'] 
            });
            // N'oubliez pas d'appeler ici la fonction pour rafraîchir la liste !
            // Ex: this.chargerUtilisateurs(); OU this.chargerMesSujets();
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

  getTechList(technologies: string): string[] {
    if (!technologies) return [];
    return technologies.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
  }
}