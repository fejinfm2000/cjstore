import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/services/product.service';
import { Store } from '../../../core/services/store.service';
import { FeatureFlagService } from '../../../core/services/feature-flag.service';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="product-card" [class.out-of-stock]="product.stock === 0">
      <a [routerLink]="['/store', store.slug, 'product', product.id]" class="card-image-link">
        <div class="card-image">
          @if (product.image) {
            <img [src]="product.image" [alt]="product.name" loading="lazy" />
          } @else {
            <div class="image-placeholder">
              <span class="placeholder-icon">{{ getCategoryIcon(product.category) }}</span>
            </div>
          }
          <div class="card-badge">
            @if (product.stock === 0) {
              <span class="badge out">Out of Stock</span>
            } @else if (product.stock <= 5) {
              <span class="badge low">Only {{ product.stock }} left</span>
            }
          </div>
        </div>
      </a>
      <div class="card-body">
        <span class="category-tag">{{ product.category }}</span>
        <a [routerLink]="['/store', store.slug, 'product', product.id]" class="product-name">
          {{ product.name }}
        </a>
        <p class="product-desc">{{ product.description }}</p>
        <div class="card-footer">
          <span class="price">₹{{ product.price | number }}</span>
          <div class="card-actions">
            @if (features.isEnabled('whatsappOrder') && product.stock > 0) {
              <button class="btn-whatsapp" (click)="orderWhatsApp()" title="Order on WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order
              </button>
            }
            @if (features.isEnabled('onlineShopping') && product.stock > 0) {
              <button class="btn-cart" (click)="addToCart.emit(product)">
                🛒 Add to Cart
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .product-card {
      background: var(--card-bg);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: var(--card-shadow);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      display: flex; flex-direction: column;
      border: 1px solid var(--border);
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--card-shadow-hover);
    }
    .product-card.out-of-stock { opacity: 0.7; }
    .card-image-link { text-decoration: none; }
    .card-image {
      position: relative; height: 200px; overflow: hidden;
      background: var(--surface);
    }
    .card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .product-card:hover .card-image img { transform: scale(1.05); }
    .image-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--surface) 0%, var(--border) 100%);
    }
    .placeholder-icon { font-size: 3.5rem; opacity: 0.6; }
    .card-badge { position: absolute; top: 10px; left: 10px; }
    .badge {
      padding: 0.25rem 0.6rem; border-radius: 50px;
      font-size: 0.75rem; font-weight: 600;
    }
    .badge.out { background: #fee2e2; color: #dc2626; }
    .badge.low { background: #fef3c7; color: #d97706; }
    .card-body {
      padding: 1rem 1.25rem 1.25rem;
      display: flex; flex-direction: column; gap: 0.4rem; flex: 1;
    }
    .category-tag {
      font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--primary);
    }
    .product-name {
      font-size: 1rem; font-weight: 700; color: var(--text-primary);
      text-decoration: none; line-height: 1.3;
    }
    .product-name:hover { color: var(--primary); }
    .product-desc {
      font-size: 0.85rem; color: var(--text-secondary);
      line-height: 1.5; display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      flex: 1;
    }
    .card-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 0.5rem; flex-wrap: wrap; gap: 0.5rem;
    }
    .price { font-size: 1.2rem; font-weight: 800; color: var(--text-primary); }
    .card-actions { display: flex; gap: 0.5rem; }
    .btn-whatsapp {
      display: flex; align-items: center; gap: 0.4rem;
      background: #25D366; color: white;
      border: none; padding: 0.45rem 0.9rem; border-radius: 50px;
      font-size: 0.85rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s; box-shadow: 0 2px 8px rgba(37,211,102,0.3);
    }
    .btn-whatsapp:hover { background: #1da851; transform: scale(1.05); }
    .btn-cart {
      background: var(--primary-light); color: var(--primary);
      border: 1px solid var(--primary); padding: 0.45rem 0.9rem;
      border-radius: 50px; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-cart:hover { background: var(--primary); color: white; }
  `]
})
export class ProductCardComponent {
    @Input({ required: true }) product!: Product;
    @Input({ required: true }) store!: Store;
    @Output() addToCart = new EventEmitter<Product>();

    features = inject(FeatureFlagService);

    getCategoryIcon(cat: string): string {
        const icons: Record<string, string> = {
            'T-Shirts': '👕', 'Jeans': '👖', 'Dresses': '👗', 'Footwear': '👟',
            'Hoodies': '🧥', 'Formal': '👔', 'Accessories': '💍', 'Bags': '👜',
            'Electronics': '📱', 'Groceries': '🥦', 'Books': '📚', 'Sports': '⚽'
        };
        return icons[cat] || '🛍️';
    }

    orderWhatsApp(): void {
        const msg = encodeURIComponent(
            `Hello 👋\nI want to order:\n\nStore: ${this.store.name}\nProduct: ${this.product.name}\nPrice: ₹${this.product.price}\n\nPlease confirm availability.`
        );
        window.open(`https://wa.me/${this.store.whatsapp}?text=${msg}`, '_blank');
    }
}
