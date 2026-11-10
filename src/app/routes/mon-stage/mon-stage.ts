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
  ],
  templateUrl: './mon-stage.html',
  styleUrl: './mon-stage.scss',
})
export class MonStage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  form: any = {
    titre: '',
    technologies: '',
    duree: '',
    description: '',
  };

  mesStages: any[] = [];
  displayedColumns: string[] = ['titre', 'technologies', 'duree', 'statut'];
  isLoading = true;
  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      }),
    };
  }

  private getCurrentUser(): any {
    const userStr = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    return userStr ? JSON.parse(userStr) : null;
  }

  ngOnInit(): void {
    this.chargerMesStages();
  }

  chargerMesStages(): void {
    const user = this.getCurrentUser();
    if (!user) return;

    this.isLoading = true;
    const url = user.roles?.includes('ROLE_ADMIN')
      ? 'http://localhost:8080/api/sujets'
      : `http://localhost:8080/api/sujets/etudiant/${user.id}`;

    this.http.get<any[]>(url, this.getHeaders()).subscribe({
      next: (data) => {
        this.mesStages = data || [];
        this.isLoading = false;
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
    if (!user) return;

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      ...this.form,
      idEtudiant: user.id,
    };

    this.http.post('http://localhost:8080/api/sujets', payload, this.getHeaders()).subscribe({
      next: () => {
        this.successMessage = 'Votre sujet de stage a été déposé avec succès ! Il est en cours d’examen.';
        this.form = { titre: '', technologies: '', duree: '', description: '' };
        this.isSubmitting = false;
        this.chargerMesStages();
        setTimeout(() => (this.successMessage = ''), 6000);
      },
      error: () => {
        this.errorMessage = 'Une erreur est survenue lors du dépôt. Veuillez vérifier vos informations.';
        this.isSubmitting = false;
      },
    });
  }

  getTechList(technologies: string): string[] {
    if (!technologies) return [];
    return technologies.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
  }
}