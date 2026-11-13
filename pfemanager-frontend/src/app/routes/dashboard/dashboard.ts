import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MtxProgressModule } from '@ng-matero/extensions/progress';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  imports: [
    CommonModule, 
    RouterLink, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    MtxProgressModule
  ],
})
export class Dashboard implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Variable de rôle calculée au démarrage
  isAdmin = false;
  isEntreprise = false;
  userName = 'Utilisateur';
  mesSujetsCount = 0;

  stats = [
    { title: 'Total Sujets', amount: '0', progress: 70 },
    { title: 'Entreprises', amount: '0', progress: 50 },
    { title: 'Laboratoires', amount: '0', progress: 60 },
    { title: 'En Attente', amount: '0', progress: 30 },
  ];

  mesSujetsStats = { total: 0, valides: 0, enAttente: 0, refuses: 0 };

  techList: { name: string; count: number; percentage: number }[] = [];

  ngOnInit(): void {
    // 1. Détection stricte du rôle
    const raw = localStorage.getItem('auth-user') || sessionStorage.getItem('auth-user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        this.userName = `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Étudiant';
        const roles: string[] = (user.roles || []).map((r: any) => 
          (typeof r === 'string' ? r : (r.libelle || r.name || '')).toUpperCase()
        );
        this.isAdmin = roles.some(r => r.includes('ADMIN'));
        this.isEntreprise = roles.some(r => r.includes('ENTREPRISE') || r.includes('ENSEIGNANT'));

        const endpoint = user.idEntreprise
          ? `/api/sujets/entreprise/${user.idEntreprise}`
          : (user.idLabo ? `/api/sujets/labo/${user.idLabo}` : null);

        if (this.isEntreprise && endpoint) {
          this.http.get<any[]>(endpoint).subscribe({
            next: (sujets) => {
              const list = sujets || [];
              this.mesSujetsStats = {
                total: list.length,
                valides: list.filter(s => s.statut === 'VALIDE').length,
                enAttente: list.filter(s => s.statut === 'EN_ATTENTE').length,
                refuses: list.filter(s => s.statut === 'REFUSE').length,
              };
              this.cdr.detectChanges();
            },
          });
        }
      } catch (e) {
        this.isAdmin = false;
      }
    }

    // 2. Chargement des statistiques
    this.http.get<any>('/api/dashboard/stats').subscribe({
      next: (data) => {
        this.stats[0].amount = String(data.totalSujets ?? 0);
        this.stats[1].amount = String(data.totalEntreprises ?? 0);
        this.stats[2].amount = String(data.totalLabos ?? 0);
        this.stats[3].amount = String(data.sujetsEnAttente ?? 0);

        const total = data.totalSujets || 1;
        const repartition = data.repartitionParTechnologie || {};

        this.techList = Object.entries(repartition).map(([name, count]) => {
          const c = count as number;
          return {
            name,
            count: c,
            percentage: Math.round((c / total) * 100),
          };
        });

        this.cdr.detectChanges();
      },
    });
  }

  allerVers(url: string): void {
    this.router.navigateByUrl(url);
  }
}