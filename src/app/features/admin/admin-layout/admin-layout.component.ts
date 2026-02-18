import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { StoreService } from '../../../core/services/store.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="admin-shell" [class.sidebar-collapsed]="collapsed()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <a routerLink="/" class="sidebar-brand">
            <span class="brand-icon">🛍️</span>
            @if (!collapsed()) { <span class="brand-name">CJ<span class="accent">Store</span></span> }
          </a>
          <button class="collapse-btn" (click)="collapsed.set(!collapsed())" title="Toggle sidebar">
            {{ collapsed() ? '→' : '←' }}
          </button>
        </div>

        @if (!collapsed() && store()) {
          <div class="store-badge">
            <div class="store-avatar">{{ store()!.name[0] }}</div>
            <div class="store-info">
              <span class="store-name">{{ store()!.name }}</span>
              <a [href]="'/store/' + store()!.slug" target="_blank" class="store-url">
                /store/{{ store()!.slug }}
              </a>
            </div>
          </div>
        }

        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"
            class="nav-item" [title]="collapsed() ? 'Dashboard' : ''">
            <span class="nav-icon">📊</span>
            @if (!collapsed()) { <span>Dashboard</span> }
          </a>
          <a routerLink="/admin/add-product" routerLinkActive="active"
            class="nav-item" [title]="collapsed() ? 'Add Product' : ''">
            <span class="nav-icon">➕</span>
            @if (!collapsed()) { <span>Add Product</span> }
          </a>
          <a routerLink="/admin/products" routerLinkActive="active"
            class="nav-item" [title]="collapsed() ? 'Products' : ''">
            <span class="nav-icon">📦</span>
            @if (!collapsed()) { <span>My Products</span> }
          </a>
          <a routerLink="/admin/settings" routerLinkActive="active"
            class="nav-item" [title]="collapsed() ? 'Settings' : ''">
            <span class="nav-icon">⚙️</span>
            @if (!collapsed()) { <span>Store Settings</span> }
          </a>
          @if (store()) {
            <a [routerLink]="['/store', store()!.slug]" target="_blank"
              class="nav-item" [title]="collapsed() ? 'View Store' : ''">
              <span class="nav-icon">🔗</span>
              @if (!collapsed()) { <span>View Store</span> }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()" [title]="collapsed() ? 'Logout' : ''">
            <span class="nav-icon">🚪</span>
            @if (!collapsed()) { <span>Logout</span> }
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="admin-main">
        <header class="admin-topbar">
          <div class="topbar-left">
            <button class="mobile-menu-btn" (click)="mobileOpen.set(!mobileOpen())">☰</button>
            <h2 class="page-title">Admin Dashboard</h2>
          </div>
          <div class="topbar-right">
            <span class="user-chip">👤 {{ auth.currentUser()?.ownerName }}</span>
          </div>
        </header>
        <div class="admin-content">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
    styles: [`
    .admin-shell {
      display: flex; min-height: 100vh; background: var(--bg);
    }
    .sidebar {
      width: 240px; background: var(--surface-dark, #0f0f19);
      color: white; display: flex; flex-direction: column;
      transition: width 0.3s ease; flex-shrink: 0;
      position: sticky; top: 0; height: 100vh; overflow-y: auto;
    }
    .admin-shell.sidebar-collapsed .sidebar { width: 64px; }
    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .sidebar-brand {
      display: flex; align-items: center; gap: 0.5rem;
      text-decoration: none; font-size: 1.2rem; font-weight: 800; color: white;
    }
    .brand-icon { font-size: 1.3rem; }
    .accent { color: var(--primary); }
    .collapse-btn {
      background: rgba(255,255,255,0.1); border: none; color: white;
      width: 28px; height: 28px; border-radius: 6px; cursor: pointer;
      font-size: 0.8rem; transition: background 0.2s; flex-shrink: 0;
    }
    .collapse-btn:hover { background: rgba(255,255,255,0.2); }
    .store-badge {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .store-avatar {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--primary); display: flex; align-items: center;
      justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0;
    }
    .store-info { display: flex; flex-direction: column; gap: 0.15rem; overflow: hidden; }
    .store-name { font-weight: 700; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .store-url { font-size: 0.72rem; color: var(--primary); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sidebar-nav { flex: 1; padding: 0.75rem 0; display: flex; flex-direction: column; gap: 0.25rem; }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.7rem 1rem; color: rgba(255,255,255,0.65);
      text-decoration: none; font-size: 0.9rem; font-weight: 500;
      border-radius: 0; transition: all 0.2s; white-space: nowrap;
    }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
    .nav-item.active { background: rgba(37,211,102,0.15); color: var(--primary); border-right: 3px solid var(--primary); }
    .nav-icon { font-size: 1.1rem; flex-shrink: 0; width: 20px; text-align: center; }
    .sidebar-footer { padding: 1rem 0; border-top: 1px solid rgba(255,255,255,0.08); }
    .logout-btn {
      display: flex; align-items: center; gap: 0.75rem;
      width: 100%; padding: 0.7rem 1rem; background: none; border: none;
      color: rgba(255,255,255,0.5); cursor: pointer; font-size: 0.9rem;
      transition: all 0.2s; white-space: nowrap;
    }
    .logout-btn:hover { color: #f87171; background: rgba(248,113,113,0.1); }
    .admin-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .admin-topbar {
      background: var(--card-bg); border-bottom: 1px solid var(--border);
      padding: 0 1.5rem; height: 60px; display: flex;
      align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 50;
    }
    .topbar-left { display: flex; align-items: center; gap: 1rem; }
    .mobile-menu-btn { display: none; background: none; border: none; font-size: 1.3rem; cursor: pointer; color: var(--text-primary); }
    .page-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
    .user-chip {
      background: var(--surface); border: 1px solid var(--border);
      padding: 0.35rem 0.85rem; border-radius: 50px;
      font-size: 0.85rem; color: var(--text-secondary);
    }
    .admin-content { padding: 1.5rem; flex: 1; }
    @media (max-width: 768px) {
      .mobile-menu-btn { display: block; }
      .sidebar { position: fixed; left: -240px; z-index: 200; height: 100vh; }
    }
  `]
})
export class AdminLayoutComponent {
    auth = inject(AuthService);
    private storeService = inject(StoreService);
    private router = inject(Router);
    collapsed = signal(false);
    mobileOpen = signal(false);

    store = () => {
        const user = this.auth.currentUser();
        if (!user?.storeId) return null;
        return this.storeService.getById(user.storeId);
    };

    logout(): void {
        this.auth.logout();
        this.router.navigate(['/login']);
    }
}
