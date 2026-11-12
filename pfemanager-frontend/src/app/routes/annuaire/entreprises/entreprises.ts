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
  selector: 'app-entreprises',
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
  templateUrl: './entreprises.html',
  styleUrl: './entreprises.scss',
})
export class Entreprises implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  entreprises: any[] = [];
  displayedColumns: string[] = ['nom', 'secteur', 'email', 'tel', 'adresse'];
  isLoading = true;
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
    this.http.get<any[]>('/api/entreprises', this.getHeaders()).subscribe({
      next: (data) => {
        this.entreprises = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Filtrage dynamique côté client
  get filteredEntreprises(): any[] {
    if (!this.searchTerm.trim()) {
      return this.entreprises;
    }
    const term = this.searchTerm.toLowerCase();
    return this.entreprises.filter(e => 
      (e.nom && e.nom.toLowerCase().includes(term)) ||
      (e.secteur && e.secteur.toLowerCase().includes(term)) ||
      (e.adresse && e.adresse.toLowerCase().includes(term))
    );
  }

  // Génère les initiales (ex: "Google France" -> "GF")
  getInitials(name: string): string {
    if (!name) return 'E';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}