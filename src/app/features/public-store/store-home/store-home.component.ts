import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, Store } from '../../../core/services/store.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-store-home',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent, LoadingSpinnerComponent],
    template: `
    @if (loading()) {
      <app-loading-spinner />
    } @else if (!store()) {
      <div class="not-found">
        <div class="nf-icon">🏪</div>
        <h2>Store Not Found</h2>
        <p>The store <strong>{{ slug }}</strong> doesn't exist yet.</p>
        <a routerLink="/register" class="btn-primary">Open Your Own Store</a>
      </div>
    } @else {
      <!-- Store Hero -->
      <div class="store-hero" [style.background]="heroGradient()">
        <div class="hero-content">
          @if (store()!.logo) {
            <img [src]="store()!.logo" [alt]="store()!.name" class="store-logo" />
          } @else {
            <div class="store-logo-placeholder">{{ store()!.name[0] }}</div>
          }
          <div class="hero-text">
            <h1>{{ store()!.name }}</h1>
            <p>{{ store()!.description }}</p>
            <div class="hero-meta">
              <span class="meta-badge">📦 {{ totalProducts() }} Products</span>
              <span class="meta-badge">👁️ {{ store()!.visits }} Visits</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="filter-bar">
        <div class="filter-container">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              [(ngModel)]="searchQuery"
              (ngModelChange)="onFilterChange()"
              type="text"
              placeholder="Search products..."
              class="search-input"
            />
            @if (searchQuery) {
              <button class="clear-btn" (click)="searchQuery=''; onFilterChange()">✕</button>
            }
          </div>

          <select [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="All">All Categories</option>
            @for (cat of categories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>

          <select [(ngModel)]="sortBy" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>
        <div class="result-count">
          {{ filteredProducts().length }} product{{ filteredProducts().length !== 1 ? 's' : '' }} found
        </div>
      </div>

      <!-- Products Grid -->
      <div class="store-content">
        @if (filteredProducts().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🔍</span>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters.</p>
            <button class="btn-secondary" (click)="resetFilters()">Clear Filters</button>
          </div>
        } @else {
          <div class="products-grid">
            @for (product of filteredProducts(); track product.id) {
              <app-product-card [product]="product" [store]="store()!" />
            }
          </div>
        }
      </div>

      <!-- Sticky WhatsApp Button (Mobile) -->
      <a
        [href]="whatsappLink()"
        target="_blank"
        class="sticky-whatsapp"
        title="Chat on WhatsApp"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>Chat with Store</span>
      </a>
    }
  `,
    styles: [`
    .not-found {
      min-height: 60vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center; padding: 2rem;
    }
    .nf-icon { font-size: 4rem; margin-bottom: 1rem; }
    .not-found h2 { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); }
    .not-found p { color: var(--text-secondary); margin: 0.5rem 0 1.5rem; }
    .btn-primary {
      background: var(--primary); color: white; padding: 0.75rem 1.5rem;
      border-radius: 50px; text-decoration: none; font-weight: 600;
      box-shadow: 0 4px 16px rgba(37,211,102,0.3);
    }
    .store-hero {
      padding: 5rem 1.5rem 3rem; color: white; position: relative; overflow: hidden;
    }
    .store-hero::before {
      content: ''; position: absolute; inset: 0;
      background: rgba(0,0,0,0.35);
    }
    .hero-content {
      max-width: 1280px; margin: 0 auto; position: relative;
      display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;
    }
    .store-logo {
      width: 100px; height: 100px; border-radius: 20px;
      object-fit: cover; border: 3px solid rgba(255,255,255,0.5);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .store-logo-placeholder {
      width: 100px; height: 100px; border-radius: 20px;
      background: rgba(255,255,255,0.2); display: flex; align-items: center;
      justify-content: center; font-size: 2.5rem; font-weight: 800;
      border: 3px solid rgba(255,255,255,0.5);
    }
    .hero-text h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; }
    .hero-text p { opacity: 0.9; max-width: 500px; line-height: 1.6; }
    .hero-meta { display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap; }
    .meta-badge {
      background: rgba(255,255,255,0.2); padding: 0.3rem 0.75rem;
      border-radius: 50px; font-size: 0.85rem; backdrop-filter: blur(4px);
    }
    .filter-bar {
      background: var(--card-bg); border-bottom: 1px solid var(--border);
      padding: 1rem 1.5rem; position: sticky; top: 64px; z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .filter-container {
      max-width: 1280px; margin: 0 auto;
      display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;
    }
    .search-box {
      flex: 1; min-width: 200px; position: relative;
      display: flex; align-items: center;
    }
    .search-icon { position: absolute; left: 0.75rem; font-size: 0.9rem; }
    .search-input {
      width: 100%; padding: 0.6rem 2.5rem 0.6rem 2.2rem;
      border: 1.5px solid var(--border); border-radius: 10px;
      background: var(--surface); color: var(--text-primary);
      font-size: 0.9rem; transition: border-color 0.2s;
    }
    .search-input:focus { outline: none; border-color: var(--primary); }
    .clear-btn {
      position: absolute; right: 0.75rem; background: none; border: none;
      cursor: pointer; color: var(--text-secondary); font-size: 0.85rem;
    }
    .filter-select {
      padding: 0.6rem 0.9rem; border: 1.5px solid var(--border); border-radius: 10px;
      background: var(--surface); color: var(--text-primary); font-size: 0.9rem;
      cursor: pointer; min-width: 160px;
    }
    .result-count {
      max-width: 1280px; margin: 0.5rem auto 0;
      font-size: 0.85rem; color: var(--text-secondary);
    }
    .store-content { max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    @media (max-width: 480px) { .products-grid { grid-template-columns: 1fr; } }
    .empty-state {
      text-align: center; padding: 4rem 2rem;
    }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
    .empty-state h3 { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); }
    .empty-state p { color: var(--text-secondary); margin: 0.5rem 0 1.5rem; }
    .btn-secondary {
      background: var(--surface); border: 1.5px solid var(--border);
      color: var(--text-primary); padding: 0.6rem 1.25rem; border-radius: 50px;
      cursor: pointer; font-weight: 500; transition: all 0.2s;
    }
    .btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
    .sticky-whatsapp {
      display: none; position: fixed; bottom: 1.5rem; right: 1.5rem;
      background: #25D366; color: white; border-radius: 50px;
      padding: 0.75rem 1.25rem; text-decoration: none;
      align-items: center; gap: 0.5rem; font-weight: 600;
      box-shadow: 0 4px 20px rgba(37,211,102,0.4);
      z-index: 500; transition: all 0.2s;
    }
    .sticky-whatsapp:hover { transform: scale(1.05); }
    @media (max-width: 768px) { .sticky-whatsapp { display: flex; } }
  `]
})
export class StoreHomeComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private storeService = inject(StoreService);
    private productService = inject(ProductService);

    slug = '';
    loading = signal(true);
    store = signal<Store | null>(null);
    allProducts = signal<Product[]>([]);
    filteredProducts = signal<Product[]>([]);
    categories = signal<string[]>([]);

    searchQuery = '';
    selectedCategory = 'All';
    sortBy = '';

    totalProducts = computed(() => this.allProducts().length);

    heroGradient = computed(() => {
        const colors = ['135deg, #25D366 0%, #128C7E 100%', '135deg, #667eea 0%, #764ba2 100%',
            '135deg, #f093fb 0%, #f5576c 100%', '135deg, #4facfe 0%, #00f2fe 100%',
            '135deg, #43e97b 0%, #38f9d7 100%'];
        const idx = (this.store()?.name.charCodeAt(0) || 0) % colors.length;
        return `linear-gradient(${colors[idx]})`;
    });

    whatsappLink = computed(() => {
        const s = this.store();
        if (!s) return '#';
        return `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(`Hello! I'm browsing your store "${s.name}" on CJStore.`)}`;
    });

    ngOnInit(): void {
        this.slug = this.route.snapshot.paramMap.get('slug') || '';
        const s = this.storeService.getBySlug(this.slug);
        if (s) {
            this.store.set(s);
            this.storeService.incrementVisits(this.slug);
            const products = this.productService.getActiveByStore(s.id);
            this.allProducts.set(products);
            this.filteredProducts.set(products);
            this.categories.set(this.productService.getCategories(s.id));
        }
        this.loading.set(false);
    }

    onFilterChange(): void {
        const s = this.store();
        if (!s) return;
        this.filteredProducts.set(
            this.productService.search(s.id, this.searchQuery, this.selectedCategory, this.sortBy)
        );
    }

    resetFilters(): void {
        this.searchQuery = '';
        this.selectedCategory = 'All';
        this.sortBy = '';
        this.onFilterChange();
    }
}
