import { BidiModule } from '@angular/cdk/bidi';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, DestroyRef, ViewEncapsulation, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSidenav, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgProgressbar } from 'ngx-progressbar';
import { NgProgressRouter } from 'ngx-progressbar/router';
import { filter } from 'rxjs';

import { AppSettings, SettingsService } from '@core';
import { Header } from '../header/header';
import { SidebarNotice } from '../sidebar-notice/sidebar-notice';
import { Sidebar } from '../sidebar/sidebar';
import { Topmenu } from '../topmenu/topmenu';

const MOBILE_MEDIAQUERY = 'screen and (max-width: 599px)';
const MONITOR_MEDIAQUERY = 'screen and (min-width: 600px)';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterOutlet,
    BidiModule,
    MatSidenavModule,
    NgProgressbar,
    NgProgressRouter,
    Header,
    Topmenu,
    Sidebar,
    SidebarNotice,
  ],
})
export class AdminLayout {
  readonly sidenav = viewChild.required<MatSidenav>('sidenav');
  readonly content = viewChild.required<MatSidenavContent>('content');

  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly settings = inject(SettingsService);

  options = this.settings.options;

  get themeColor() {
    return this.settings.getThemeColor();
  }

  get isOver() {
    return this.isMobileScreen;
  }
  private isMobileScreen = false;

  constructor() {
    // FORCE LE MODE BANDELETTE DE 60PX À TOUJOURS ÊTRE DÉSACTIVÉ
    this.options.sidenavCollapsed = false;

    this.breakpointObserver
      .observe([MOBILE_MEDIAQUERY, MONITOR_MEDIAQUERY])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => {
        this.isMobileScreen = state.breakpoints[MOBILE_MEDIAQUERY];
        this.options.sidenavCollapsed = false;
      });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.isOver) {
          this.sidenav().close();
        }
        this.content().scrollTo({ top: 0 });
      });
  }

  // Le clic ouvre ou ferme directement le tiroir à 100%
  toggleCollapsed() {
    this.options.sidenavCollapsed = false;
    this.sidenav().toggle();
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.options.sidenavOpened = isOpened;
    this.options.sidenavCollapsed = false;
    this.settings.setOptions(this.options);
  }

  updateOptions(options: AppSettings) {
    options.sidenavCollapsed = false;
    this.options = options;
    this.settings.setOptions(options);
    this.settings.setDirection();
    this.settings.setTheme();
  }
}