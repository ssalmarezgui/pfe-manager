import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
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
    MtxProgressModule
  ],
})
export class Dashboard implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  stats = [
    { title: 'Total Sujets', amount: '0', progress: 70 },
    { title: 'Entreprises', amount: '0', progress: 50 },
    { title: 'Laboratoires', amount: '0', progress: 60 },
    { title: 'En Attente', amount: '0', progress: 30 },
  ];

  techList: { name: string; count: number; percentage: number }[] = [];

  ngOnInit(): void {
    this.http.get<any>('http://localhost:8080/api/dashboard/stats').subscribe({
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

  // ✅ Redirection garantie au clic
  allerVers(url: string): void {
    this.router.navigateByUrl(url);
  }
}