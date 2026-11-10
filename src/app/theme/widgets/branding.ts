import { Component, input } from '@angular/core';

@Component({
  selector: 'app-branding',
  template: `
    <a class="branding" href="/">
      <!-- Logo PFE -->
      <svg class="branding-logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pfeLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4f46e5" />
            <stop offset="100%" stop-color="#3b82f6" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#pfeLogoGradient)" />
        <path d="M20 11L9 17L20 23L31 17L20 11Z" fill="white" />
        <path d="M13 20.5V25.5C13 25.5 16 28 20 28C24 28 27 25.5 27 25.5V20.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M31 17.5V24.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>

      <!-- Le texte s'affiche TOUJOURS -->
      <span class="branding-name">
        PFE <span class="branding-accent">Manager</span>
      </span>
    </a>
  `,
  styles: `
    .branding {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      text-decoration: none;
      white-space: nowrap;
      color: inherit;
    }

    .branding-logo {
      width: 1.85rem;
      height: 1.85rem;
      flex-shrink: 0;
      filter: drop-shadow(0 2px 5px rgba(79, 70, 229, 0.25));
    }

    .branding-name {
      font-size: 0.95rem;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.3px;
    }

    .branding-accent {
      color: #4f46e5;
      font-weight: 700;
    }
  `,
})
export class Branding {
  readonly showName = input(true);
}