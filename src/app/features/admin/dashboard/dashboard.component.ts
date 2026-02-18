import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StoreService } from '../../../core/services/store.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <div>
          <h1>Welcome back, {{ (auth.currentUser()?.ownerName?.split(' ') || ['Merchant'])[0] }}! 👋</h1>
          <p class="subtitle">Here's what's happening with your store today.</p>
        </div>
        @if (store()) {
          <a [routerLink]="['/store', store()!.slug]" target="_blank" class="view-store-btn">
            🔗 View Live Store
          </a>
        }
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg,#25D366,#128C7E)">📦</div>
          <div class="stat-body">
            <span class="stat-value">{{ totalProducts() }}</span>
            <span class="stat-label">Total Products</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg,#667eea,#764ba2)">✅</div>
          <div class="stat-body">
            <span class="stat-value">{{ activeProducts() }}</span>
            <span class="stat-label">Active Products</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg,#f093fb,#f5576c)">⚠️</div>
          <div class="stat-body">
            <span class="stat-value">{{ lowStockProducts() }}</span>
            <span class="stat-label">Low Stock (≤5)</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg,#4facfe,#00f2fe)">👁️</div>
          <div class="stat-body">
            <span class="stat-value">{{ store()?.visits ?? 0 }}</span>
            <span class="stat-label">Store Visits</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section-title">Quick Actions</div>
      <div class="quick-actions">
        <a routerLink="/admin/add-product" class="action-card">
          <span class="action-icon">➕</span>
          <span class="action-label">Add Product</span>
        </a>
        <a routerLink="/admin/products" class="action-card">
          <span class="action-icon">📋</span>
          <span class="action-label">Manage Products</span>
        </a>
        <a routerLink="/admin/settings" class="action-card">
          <span class="action-icon">⚙️</span>
          <span class="action-label">Store Settings</span>
        </a>
        @if (store()) {
          <a [routerLink]="['/store', store()!.slug]" class="action-card">
            <span class="action-icon">🛍️</span>
            <span class="action-label">View Store</span>
          </a>
        }
      </div>

      <!-- Low Stock Alert -->
      @if (lowStockList().length > 0) {
        <div class="section-title">⚠️ Low Stock Alert</div>
        <div class="alert-list">
          @for (p of lowStockList(); track p.id) {
            <div class="alert-item">
              <span class="alert-name">{{ p.name }}</span>
              <span class="alert-stock" [class.critical]="p.stock === 0">
                {{ p.stock === 0 ? 'Out of Stock' : p.stock + ' left' }}
              </span>
            </div>
          }
        </div>
      }

      <!-- Store Info Card -->
      @if (store()) {
        <div class="section-title">Store Info</div>
        <div class="store-info-card">
          <div class="info-row">
            <span class="info-label">Store Name</span>
            <span class="info-value">{{ store()!.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Store URL</span>
            <a [href]="'/store/' + store()!.slug" target="_blank" class="info-link">
              cjstore.com/store/{{ store()!.slug }}
            </a>
          </div>
          <div class="info-row">
            <span class="info-label">WhatsApp</span>
            <span class="info-value">+{{ store()!.whatsapp }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Created</span>
            <span class="info-value">{{ store()!.createdAt | date:'mediumDate' }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 900px; }
    .dashboard-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
    .dashboard-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); }
    .subtitle { color: var(--text-secondary); margin-top: 0.25rem; }
    .view-store-btn { background: var(--primary); color: white; padding: 0.6rem 1.25rem; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 0.9rem; white-space: nowrap; box-shadow: 0 2px 8px rgba(37,211,102,0.3); transition: all 0.2s; }
    .view-store-btn:hover { transform: translateY(-1px); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: var(--card-shadow); transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .stat-label { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem; }
    .section-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 1.5rem 0 0.75rem; }
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }
    .action-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; padding: 1.25rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-decoration: none; transition: all 0.2s; }
    .action-card:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37,211,102,0.15); }
    .action-icon { font-size: 1.8rem; }
    .action-label { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); text-align: center; }
    .alert-list { background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin-bottom: 1rem; }
    .alert-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); }
    .alert-item:last-child { border-bottom: none; }
    .alert-name { font-weight: 500; color: var(--text-primary); font-size: 0.9rem; }
    .alert-stock { font-size: 0.82rem; font-weight: 600; background: #fef3c7; color: #d97706; padding: 0.2rem 0.6rem; border-radius: 50px; }
    .alert-stock.critical { background: #fee2e2; color: #dc2626; }
    .store-info-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 0.5rem; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
    .info-value { font-size: 0.9rem; color: var(--text-primary); font-weight: 600; }
    .info-link { color: var(--primary); text-decoration: none; font-size: 0.9rem; font-weight: 600; }
  `]
})
export class DashboardComponent {
  auth = inject(AuthService);
  private storeService = inject(StoreService);
  private productService = inject(ProductService);

  store = computed(() => {
    const user = this.auth.currentUser();
    if (!user?.storeId) return null;
    return this.storeService.getById(user.storeId) || null;
  });

  private storeProducts = computed(() => {
    const s = this.store();
    if (!s) return [];
    return this.productService.getByStore(s.id);
  });

  totalProducts = computed(() => this.storeProducts().length);
  activeProducts = computed(() => this.storeProducts().filter(p => p.active).length);
  lowStockProducts = computed(() => this.storeProducts().filter(p => p.stock <= 5).length);
  lowStockList = computed(() => this.storeProducts().filter(p => p.stock <= 5).slice(0, 5));
}
