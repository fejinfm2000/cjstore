import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled()">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">
          <span class="brand-icon">🛍️</span>
          <span class="brand-name">CJ<span class="brand-accent">Store</span></span>
        </a>

        <div class="nav-links" [class.open]="menuOpen()">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/admin" routerLinkActive="active" class="nav-link">Dashboard</a>
            <button class="btn-logout" (click)="logout()">Logout</button>
          } @else {
            <a routerLink="/login" routerLinkActive="active" class="nav-link">Login</a>
            <a routerLink="/register" class="btn-register">Open a Store</a>
          }
          <button class="dark-toggle" (click)="toggleDark()" [title]="isDark() ? 'Light mode' : 'Dark mode'">
            {{ isDark() ? '☀️' : '🌙' }}
          </button>
        </div>

        <button class="hamburger" (click)="menuOpen.set(!menuOpen())" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0,0,0,0.08);
      transition: all 0.3s ease;
    }
    :host-context(.dark-mode) .navbar {
      background: rgba(15,15,25,0.95);
      border-bottom-color: rgba(255,255,255,0.08);
    }
    .navbar.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .nav-container {
      max-width: 1280px; margin: 0 auto;
      padding: 0 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
      height: 64px;
    }
    .nav-brand {
      display: flex; align-items: center; gap: 0.5rem;
      text-decoration: none; font-size: 1.4rem; font-weight: 800;
      color: var(--text-primary);
    }
    .brand-icon { font-size: 1.5rem; }
    .brand-accent { color: var(--primary); }
    .nav-links {
      display: flex; align-items: center; gap: 0.5rem;
    }
    .nav-link {
      text-decoration: none; color: var(--text-secondary);
      padding: 0.5rem 0.75rem; border-radius: 8px;
      font-weight: 500; transition: all 0.2s;
    }
    .nav-link:hover, .nav-link.active { color: var(--primary); background: var(--primary-light); }
    .btn-register {
      background: var(--primary); color: white;
      padding: 0.5rem 1.25rem; border-radius: 50px;
      text-decoration: none; font-weight: 600;
      transition: all 0.2s; box-shadow: 0 2px 8px rgba(37,211,102,0.3);
    }
    .btn-register:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37,211,102,0.4); }
    .btn-logout {
      background: none; border: 1px solid var(--danger);
      color: var(--danger); padding: 0.4rem 1rem; border-radius: 50px;
      cursor: pointer; font-weight: 500; transition: all 0.2s;
    }
    .btn-logout:hover { background: var(--danger); color: white; }
    .dark-toggle {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 50%; width: 36px; height: 36px;
      cursor: pointer; font-size: 1rem; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .dark-toggle:hover { transform: rotate(20deg); }
    .hamburger {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 4px;
    }
    .hamburger span {
      display: block; width: 24px; height: 2px;
      background: var(--text-primary); border-radius: 2px; transition: all 0.3s;
    }
    @media (max-width: 768px) {
      .hamburger { display: flex; }
      .nav-links {
        display: none; position: absolute; top: 64px; left: 0; right: 0;
        background: var(--bg); flex-direction: column; padding: 1rem;
        border-bottom: 1px solid var(--border); gap: 0.5rem;
      }
      .nav-links.open { display: flex; }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  scrolled = signal(false);
  menuOpen = signal(false);
  isDark = signal(false);

  constructor() {
    this.isDark.set(localStorage.getItem('cjstore_dark') === 'true');
    this.applyDark();
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 10); }

  toggleDark() {
    this.isDark.set(!this.isDark());
    localStorage.setItem('cjstore_dark', String(this.isDark()));
    this.applyDark();
  }

  private applyDark() {
    document.body.classList.toggle('dark-mode', this.isDark());
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
