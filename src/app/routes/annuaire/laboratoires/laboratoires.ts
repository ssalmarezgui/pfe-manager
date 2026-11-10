import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-laboratoires',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './laboratoires.html',
  styleUrl: './laboratoires.scss',
})
export class Laboratoires implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  laboratoires: any[] = [];
  displayedColumns: string[] = ['nom', 'domaine', 'etablissement', 'email', 'tel'];
  isLoading = true;
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
    this.http.get<any[]>('http://localhost:8080/api/labos', this.getHeaders()).subscribe({
      next: (data) => {
        this.laboratoires = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Filtrage dynamique côté client (Nom, Domaine, Établissement)
  get filteredLaboratoires(): any[] {
    if (!this.searchTerm.trim()) {
      return this.laboratoires;
    }
    const term = this.searchTerm.toLowerCase();
    return this.laboratoires.filter(lab => 
      (lab.nom && lab.nom.toLowerCase().includes(term)) ||
      (lab.domaine && lab.domaine.toLowerCase().includes(term)) ||
      (lab.etablissement && lab.etablissement.toLowerCase().includes(term))
    );
  }

  // Initiales pour l'avatar (ex: "Laboratoire RIADI" -> "LR")
  getInitials(name: string): string {
    if (!name) return 'L';
    return name
      .replace(/^(Laboratoire|Labo|Unité de Recherche)\s+/i, '')
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'LR';
  }
}