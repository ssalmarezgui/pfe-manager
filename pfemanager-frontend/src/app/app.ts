import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  private currentBuildHash: string | null = null;

  ngOnInit() {
    this.settings.setDirection();
    this.settings.setTheme();

    // Recharge uniquement lorsqu'une nouvelle version est déployée sur Vercel
    this.checkAppVersion();
    setInterval(() => this.checkAppVersion(), 30000);
  }

  ngAfterViewInit() {
    this.preloader.hide();
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