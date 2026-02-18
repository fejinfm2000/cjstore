import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="coming-soon">
      <div class="cs-icon">🛒</div>
      <h1>Cart Coming Soon</h1>
      <p>Online shopping is not yet enabled. Enable the <code>onlineShopping</code> feature flag to activate cart functionality.</p>
      <a routerLink="/" class="btn-home">← Back to Home</a>
    </div>
  `,
    styles: [`
    .coming-soon { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem; gap: 1rem; }
    .cs-icon { font-size: 4rem; }
    h1 { font-size: 2rem; font-weight: 800; color: var(--text-primary); }
    p { color: var(--text-secondary); max-width: 400px; line-height: 1.6; }
    code { background: var(--surface); padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
    .btn-home { background: var(--primary); color: white; padding: 0.65rem 1.5rem; border-radius: 50px; text-decoration: none; font-weight: 600; }
  `]
})
export class CartComponent { }
