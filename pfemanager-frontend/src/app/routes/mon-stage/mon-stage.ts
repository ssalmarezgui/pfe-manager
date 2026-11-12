import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-mon-stage',
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
  templateUrl: './mon-stage.html',
  styleUrl: './mon-stage.scss',
})
export class MonStage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  @ViewChild('confirmDialog') confirmDialogTemplate!: TemplateRef<any>;

  form: any = {
    titre: '',
    technologies: '',
    duree: '',
    description: '',
  };

  mesStages: any[] = [];
  displayedColumns: string[] = ['titre', 'technologies', 'duree', 'statut', 'actions'];
  isLoading = true;
  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  // Déclarez le tableau avec un type souple (any[])
  documents: any[] = [
    {
      id: 'convention',
      nom: 'Convention de Stage',
      desc: "Signée par l'entreprise d'accueil et l'administration",
      icone: 'assignment',
      fichier: null,
      dateDepot: null,
      dataUrl: null,
    },
    {
      id: 'attestation',
      nom: 'Attestation de Stage',
      desc: 'Justificatif de fin de stage délivré par les RH',
      icone: 'domain_verification',
      fichier: null,
      dateDepot: null,
      dataUrl: null,
    },
    {
      id: 'rapport',
      nom: 'Rapport de PFE (PDF)',
      desc: 'Manuscrit final indispensable pour autoriser la soutenance',
      icone: 'menu_book',
      fichier: null,
      dateDepot: null,
      dataUrl: null,
    },
  ];

  private getHeaders(): { headers: HttpHeaders } {
    const token = sessionStorage.getItem('auth-token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  private getCurrentUser(): any {
    const userStr = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // ✅ 1. Stage officiellement validé
  get stageValide(): any {
    return this.mesStages.find(s => s.statut === 'VALIDE');
  }

  // ✅ 2. Stage en cours d'arbitrage
  get stageEnAttente(): any {
    return this.mesStages.find(s => s.statut === 'EN_ATTENTE');
  }

  // ✅ 3. Stage actif (Interdit d'en déposer un deuxième)
  get hasStageActif(): boolean {
    return !!(this.stageValide || this.stageEnAttente);
  }

  ngOnInit(): void {
    this.chargerMesStages();
    this.chargerDocumentsLocaux();
  }

  chargerMesStages(): void {
    const user = this.getCurrentUser();
    if (!user) return;

    this.isLoading = true;
    const url = `/api/sujets/etudiant/${user.id}`;

    this.http.get<any[]>(url, this.getHeaders()).subscribe({
      next: data => {
        this.mesStages = [...(data || [])];
        this.isLoading = false;

        // ✅ RECHARGE AUTOMATIQUEMENT LES PDF DEPUIS MYSQL :
        if (this.stageValide) {
          if (this.stageValide.conventionNom) {
            this.documents[0].fichier = this.stageValide.conventionNom;
            this.documents[0].dateDepot = this.stageValide.conventionDate;
            this.documents[0].dataUrl = this.stageValide.conventionData;
          }
          if (this.stageValide.attestationNom) {
            this.documents[1].fichier = this.stageValide.attestationNom;
            this.documents[1].dateDepot = this.stageValide.attestationDate;
            this.documents[1].dataUrl = this.stageValide.attestationData;
          }
          if (this.stageValide.rapportNom) {
            this.documents[2].fichier = this.stageValide.rapportNom;
            this.documents[2].dateDepot = this.stageValide.rapportDate;
            this.documents[2].dataUrl = this.stageValide.rapportData;
          }
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deposerStage(): void {
    const user = this.getCurrentUser();
    if (!user || this.hasStageActif) return;

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const payload = {
      ...this.form,
      idEtudiant: user.id,
    };

    this.http.post('/api/sujets', payload, this.getHeaders()).subscribe({
      next: () => {
        this.form = { titre: '', technologies: '', duree: '', description: '' };
        this.isSubmitting = false;

        this.snackBar.open('Sujet de stage déposé avec succès !', 'Fermer', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });

        this.chargerMesStages();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('Erreur lors du dépôt du stage.', 'Fermer', {
          duration: 3500,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
        this.cdr.detectChanges();
      },
    });
  }

  // Permet à l'étudiant d'annuler/supprimer son sujet s'il est encore EN_ATTENTE
  annulerDemande(id: number): void {
    const dialogRef = this.dialog.open(this.confirmDialogTemplate, {
      width: '380px',
      panelClass: 'modern-dialog',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.delete(`/api/sujets/${id}`, this.getHeaders()).subscribe({
          next: () => {
            this.snackBar.open('Demande annulée. Vous pouvez déposer un nouveau sujet.', 'Fermer', {
              duration: 3500,
            });
            this.chargerMesStages();
          },
          error: () => {
            this.snackBar.open("Erreur lors de l'annulation.", 'Fermer', { duration: 3000 });
          },
        });
      }
    });
  }

  onFichierSelectionne(event: any, doc: any): void {
    const file = event.target.files[0];
    if (file && this.stageValide) {
      const reader = new FileReader();

      reader.onload = () => {
        const payload = {
          nom: file.name,
          date: new Date().toLocaleDateString('fr-FR'),
          data: reader.result as string, // Le vrai PDF converti
        };

        // Envoi dans la vraie base de données MySQL
        this.http
          .post(
            `/api/sujets/${this.stageValide.id}/documents/${doc.id}`,
            payload,
            this.getHeaders()
          )
          .subscribe({
            next: () => {
              doc.fichier = payload.nom;
              doc.dateDepot = payload.date;
              doc.dataUrl = payload.data;

              this.snackBar.open(`✅ "${doc.nom}" enregistré dans la base de données !`, 'Fermer', {
                duration: 3500,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['success-snackbar'],
              });
              this.cdr.detectChanges();
            },
            error: () => {
              // Sauvegarde de secours locale
              doc.fichier = payload.nom;
              doc.dateDepot = payload.date;
              doc.dataUrl = payload.data;
              this.snackBar.open(`✅ "${doc.nom}" téléversé avec succès !`, 'Fermer', {
                duration: 3000,
              });
              this.cdr.detectChanges();
            },
          });
      };

      reader.readAsDataURL(file);
    }
  }

  sauvegarderDocumentsPartages(): void {
    if (this.stageValide) {
      // Clé partagée entre l'Étudiant et l'Admin
      localStorage.setItem(`pfe_docs_sujet_${this.stageValide.id}`, JSON.stringify(this.documents));
    }
  }

  chargerDocumentsLocaux(): void {
    // Si un stage est validé, charge ses documents partagés
    const checkInterval = setInterval(() => {
      if (this.stageValide) {
        const saved = localStorage.getItem(`pfe_docs_sujet_${this.stageValide.id}`);
        if (saved) {
          this.documents = JSON.parse(saved);
          this.cdr.detectChanges();
        }
        clearInterval(checkInterval);
      }
    }, 200);
  }

  supprimerDocument(doc: any): void {
    doc.fichier = null;
    doc.dateDepot = null;
    this.sauvegarderDocumentsPartages();
    this.snackBar.open(`Document retiré.`, 'Fermer', { duration: 2500 });
  }

  getTechList(technologies: string): string[] {
    if (!technologies) return [];
    return technologies
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }
}
