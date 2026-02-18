import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterLink],
    template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <span class="brand-name">🛍️ CJ<span class="accent">Store</span></span>
          <p>The smart multi-vendor commerce platform for every entrepreneur.</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>Platform</h4>
            <a routerLink="/register">Open a Store</a>
            <a routerLink="/login">Login</a>
          </div>
          <div class="link-group">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© {{ year }} CJStore. Built with ❤️ for entrepreneurs.</p>
      </div>
    </footer>
  `,
    styles: [`
    .footer {
      background: var(--surface-dark, #0f0f19);
      color: rgba(255,255,255,0.7);
      margin-top: auto;
    }
    .footer-container {
      max-width: 1280px; margin: 0 auto;
      padding: 3rem 1.5rem 2rem;
      display: flex; gap: 3rem; flex-wrap: wrap;
      justify-content: space-between;
    }
    .footer-brand { flex: 1; min-width: 200px; }
    .brand-name { font-size: 1.4rem; font-weight: 800; color: white; }
    .accent { color: var(--primary); }
    .footer-brand p { margin-top: 0.75rem; line-height: 1.6; font-size: 0.9rem; }
    .footer-links { display: flex; gap: 3rem; flex-wrap: wrap; }
    .link-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .link-group h4 { color: white; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; }
    .link-group a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
    .link-group a:hover { color: var(--primary); }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding: 1rem 1.5rem; text-align: center; font-size: 0.85rem;
    }
  `]
})
export class FooterComponent {
    year = new Date().getFullYear();
}
