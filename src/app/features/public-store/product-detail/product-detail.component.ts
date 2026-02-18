import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoreService, Store } from '../../../core/services/store.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { FeatureFlagService } from '../../../core/services/feature-flag.service';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    @if (loading()) {
      <div class="loading-wrap">
        <div class="spinner"></div>
      </div>
    } @else if (!product() || !store()) {
      <div class="not-found">
        <span class="nf-icon">📦</span>
        <h2>Product Not Found</h2>
        <a [routerLink]="['/store', slug]" class="btn-back">← Back to Store</a>
      </div>
    } @else {
      <div class="detail-page">
        <div class="detail-container">
          <!-- Breadcrumb -->
          <nav class="breadcrumb">
            <a routerLink="/">Home</a>
            <span>›</span>
            <a [routerLink]="['/store', slug]">{{ store()!.name }}</a>
            <span>›</span>
            <span>{{ product()!.name }}</span>
          </nav>

          <div class="detail-grid">
            <!-- Product Image -->
            <div class="image-section">
              @if (product()!.image) {
                <img [src]="product()!.image" [alt]="product()!.name" class="product-image" />
              } @else {
                <div class="image-placeholder">
                  <span>{{ getCategoryIcon(product()!.category) }}</span>
                </div>
              }
              @if (product()!.stock <= 5 && product()!.stock > 0) {
                <div class="stock-warning">⚠️ Only {{ product()!.stock }} left in stock!</div>
              }
              @if (product()!.stock === 0) {
                <div class="stock-out">❌ Out of Stock</div>
              }
            </div>

            <!-- Product Info -->
            <div class="info-section">
              <span class="category-tag">{{ product()!.category }}</span>
              <h1 class="product-name">{{ product()!.name }}</h1>
              <div class="price-row">
                <span class="price">₹{{ product()!.price | number }}</span>
                @if (product()!.stock > 0) {
                  <span class="in-stock">✓ In Stock</span>
                }
              </div>
              <p class="description">{{ product()!.description }}</p>

              <div class="store-info">
                <span class="store-label">Sold by</span>
                <a [routerLink]="['/store', slug]" class="store-link">{{ store()!.name }}</a>
              </div>

              <div class="action-buttons">
                @if (features.isEnabled('whatsappOrder') && product()!.stock > 0) {
                  <button class="btn-whatsapp" (click)="orderWhatsApp()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Order on WhatsApp
                  </button>
                }
                @if (features.isEnabled('onlineShopping') && product()!.stock > 0) {
                  <button class="btn-cart">🛒 Add to Cart</button>
                }
                <a [routerLink]="['/store', slug]" class="btn-back-store">← Back to Store</a>
              </div>

              <!-- WhatsApp Message Preview -->
              @if (features.isEnabled('whatsappOrder')) {
                <div class="message-preview">
                  <h4>📋 Your order message will be:</h4>
                  <pre>{{ whatsappMessage() }}</pre>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    .loading-wrap { display: flex; align-items: center; justify-content: center; min-height: 60vh; }
    .spinner { width: 44px; height: 44px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .not-found { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1rem; }
    .nf-icon { font-size: 4rem; }
    .not-found h2 { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); }
    .btn-back { color: var(--primary); text-decoration: none; font-weight: 600; }
    .detail-page { padding-top: 64px; min-height: 100vh; background: var(--bg); }
    .detail-container { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
    .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 2rem; flex-wrap: wrap; }
    .breadcrumb a { color: var(--primary); text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; gap: 2rem; } }
    .image-section { position: relative; }
    .product-image { width: 100%; border-radius: 20px; object-fit: cover; max-height: 450px; box-shadow: var(--card-shadow); }
    .image-placeholder { width: 100%; height: 350px; border-radius: 20px; background: linear-gradient(135deg, var(--surface), var(--border)); display: flex; align-items: center; justify-content: center; font-size: 6rem; }
    .stock-warning { margin-top: 0.75rem; background: #fef3c7; color: #d97706; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; }
    .stock-out { margin-top: 0.75rem; background: #fee2e2; color: #dc2626; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; }
    .info-section { display: flex; flex-direction: column; gap: 1rem; }
    .category-tag { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary); }
    .product-name { font-size: 2rem; font-weight: 800; color: var(--text-primary); line-height: 1.2; }
    .price-row { display: flex; align-items: center; gap: 1rem; }
    .price { font-size: 2rem; font-weight: 800; color: var(--text-primary); }
    .in-stock { background: #dcfce7; color: #16a34a; padding: 0.3rem 0.75rem; border-radius: 50px; font-size: 0.85rem; font-weight: 600; }
    .description { color: var(--text-secondary); line-height: 1.7; font-size: 1rem; }
    .store-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
    .store-label { color: var(--text-secondary); }
    .store-link { color: var(--primary); font-weight: 600; text-decoration: none; }
    .action-buttons { display: flex; flex-direction: column; gap: 0.75rem; }
    .btn-whatsapp { display: flex; align-items: center; justify-content: center; gap: 0.6rem; background: #25D366; color: white; border: none; padding: 1rem; border-radius: 14px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 16px rgba(37,211,102,0.3); }
    .btn-whatsapp:hover { background: #1da851; transform: translateY(-2px); }
    .btn-cart { background: var(--primary-light); color: var(--primary); border: 1.5px solid var(--primary); padding: 1rem; border-radius: 14px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-cart:hover { background: var(--primary); color: white; }
    .btn-back-store { color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; text-align: center; transition: color 0.2s; }
    .btn-back-store:hover { color: var(--primary); }
    .message-preview { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; }
    .message-preview h4 { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem; }
    .message-preview pre { font-family: inherit; font-size: 0.85rem; color: var(--text-primary); white-space: pre-wrap; margin: 0; line-height: 1.6; }
  `]
})
export class ProductDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private storeService = inject(StoreService);
    private productService = inject(ProductService);
    features = inject(FeatureFlagService);

    slug = '';
    loading = signal(true);
    store = signal<Store | null>(null);
    product = signal<Product | null>(null);

    whatsappMessage = () => {
        const p = this.product();
        const s = this.store();
        if (!p || !s) return '';
        return `Hello 👋\nI want to order:\n\nStore: ${s.name}\nProduct: ${p.name}\nPrice: ₹${p.price}\n\nPlease confirm availability.`;
    };

    ngOnInit(): void {
        this.slug = this.route.snapshot.paramMap.get('slug') || '';
        const productId = this.route.snapshot.paramMap.get('id') || '';
        const s = this.storeService.getBySlug(this.slug);
        const p = this.productService.getById(productId);
        this.store.set(s || null);
        this.product.set(p || null);
        this.loading.set(false);
    }

    getCategoryIcon(cat: string): string {
        const icons: Record<string, string> = {
            'T-Shirts': '👕', 'Jeans': '👖', 'Dresses': '👗', 'Footwear': '👟',
            'Hoodies': '🧥', 'Formal': '👔', 'Accessories': '💍', 'Bags': '👜'
        };
        return icons[cat] || '🛍️';
    }

    orderWhatsApp(): void {
        const msg = encodeURIComponent(this.whatsappMessage());
        window.open(`https://wa.me/${this.store()!.whatsapp}?text=${msg}`, '_blank');
    }
}
