import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { PreloaderService, SettingsService } from '@core';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet />
  `,
  imports: [RouterOutlet],
})
export class App implements OnInit, AfterViewInit {
  private readonly preloader = inject(PreloaderService);
  private readonly settings = inject(SettingsService);
  private readonly router = inject(Router);
  private currentBuildHash: string | null = null;

  ngOnInit() {
    this.settings.setDirection();
    this.settings.setTheme();

    // Active la réinitialisation des composants lors d'une navigation sur la même route
    this.router.onSameUrlNavigation = 'reload';

    // 1. Rafraîchit automatiquement la vue active dès que tu reviens sur l'onglet
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.refreshCurrentView();
      }
    });

    // 2. Rafraîchit automatiquement les données toutes les 6 secondes en arrière-plan
    setInterval(() => {
      if (!document.hidden) {
        this.refreshCurrentView();
      }
    }, 6000);

    // 3. Recharge automatiquement l'application après un git push / déploiement Vercel
    this.checkAppVersion();
    setInterval(() => this.checkAppVersion(), 15000);
  }

  ngAfterViewInit() {
    this.preloader.hide();
  }

  private refreshCurrentView(): void {
    const url = this.router.url;
    // Protège la page de login/signup, les modales ouvertes et les formulaires en cours de saisie
    if (!url || url === '/' || url.includes('/auth')) return;
    if (document.querySelector('.cdk-overlay-pane')) return;
    const activeTag = document.activeElement?.tagName;
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

    // Réinitialise proprement le composant courant sans recharger toute la page
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(url);
    });
  }

  private async checkAppVersion(): Promise<void> {
    if (document.hidden) return;
    try {
      const response = await fetch(`${window.location.origin}/index.html?v=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!response.ok) return;

      const html = await response.text();
      const match = html.match(/main-[A-Z0-9]+\.js/i);
      const latestHash = match ? match[0] : null;
      if (!latestHash) return;

      if (!this.currentBuildHash) {
        this.currentBuildHash = latestHash;
      } else if (this.currentBuildHash !== latestHash) {
        window.location.reload();
      }
    } catch {
      // Ignorer silencieusement en cas de coupure réseau temporaire
    }
  }
}