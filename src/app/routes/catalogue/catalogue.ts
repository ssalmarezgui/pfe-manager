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

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  ngOnInit(): void {
    this.chargerSujets();
  }

  chargerSujets(): void {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:8080/api/sujets/valides', this.getHeaders()).subscribe({
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

    this.http.get<any[]>('http://localhost:8080/api/sujets/search', { params, ...this.getHeaders() }).subscribe({
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

  postuler(sujet: any): void {
    const contactEmail = sujet.entreprise?.email || sujet.labo?.email || 'contact@ecole.tn';
    const sujetEmail = encodeURIComponent(`Candidature PFE : ${sujet.titre}`);
    const corpsEmail = encodeURIComponent(
      `Bonjour,\n\nJe souhaite vous soumettre ma candidature pour le sujet de PFE intitulé : "${sujet.titre}".\n\nCordialement,`
    );

    window.location.href = `mailto:${contactEmail}?subject=${sujetEmail}&body=${corpsEmail}`;
  }
}