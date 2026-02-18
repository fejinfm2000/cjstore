import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../core/services/store.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-badge">🚀 Multi-Vendor Commerce Platform</div>
        <h1 class="hero-title">
          Launch Your Online Store<br />
          <span class="gradient-text">in Minutes</span>
        </h1>
        <p class="hero-desc">
          CJStore gives every entrepreneur a beautiful online store, unique URL,
          and WhatsApp ordering — no coding required.
        </p>
        <div class="hero-actions">
          <a routerLink="/register" class="btn-hero-primary">
            🛍️ Open Your Free Store
          </a>
          <a [routerLink]="['/store', 'fashion-hub']" class="btn-hero-secondary">
            👀 See Demo Store
          </a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">{{ (stores().length > 100 ? '∞' : stores().length) }}</span><span class="stat-lbl">Stores</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="stat-num">Free</span><span class="stat-lbl">To Start</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="stat-num">WhatsApp</span><span class="stat-lbl">Orders</span></div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="stacked-stores">
          @for (s of top3Stores(); track s.id; let i = $index) {
            <div class="phone-mockup" [style.--index]="i" [style.z-index]="10 - i">
              <div class="phone-screen">
                <div class="mock-store-header" [style.background]="getGradient(s.name)">
                  <div class="mock-logo">{{ s.name[0] }}</div>
                  <div class="mock-store-name">{{ s.name }}</div>
                </div>
                <div class="mock-products">
                  @for (p of getTopProducts(s.id); track p.id) {
                    <div class="mock-product">
                      <div class="mock-img">{{ getCatIcon(p.category) }}</div>
                      <div class="mock-info">
                        <div class="mock-name">{{ p.name }}</div>
                        <div class="mock-price">₹{{ p.price }}</div>
                      </div>
                      <div class="mock-wa">WA</div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="section-container">
        <div class="section-header">
          <h2>Everything You Need to Sell Online</h2>
          <p>A complete commerce platform built for modern entrepreneurs</p>
        </div>
        <div class="features-grid">
          @for (f of features; track f.icon) {
            <div class="feature-card">
              <div class="feature-icon">{{ f.icon }}</div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Live Stores Section -->
    @if (stores().length > 0) {
      <section id="stores" class="live-stores">
        <div class="section-container">
          <div class="section-header">
            <h2>Live Stores on CJStore</h2>
            <p>Browse real stores created by entrepreneurs like you</p>
          </div>
          <div class="stores-grid">
            @for (store of stores(); track store.id) {
              <a [routerLink]="['/store', store.slug]" class="store-card">
                <div class="store-head">
                  <div class="store-avatar">{{ store.name[0] }}</div>
                  <div class="store-details">
                    <h4>{{ store.name }}</h4>
                    <span class="store-url">/store/{{ store.slug }}</span>
                  </div>
                </div>
                <p>{{ store.description }}</p>
                <div class="store-footer">
                  <span class="view-btn">View Store</span>
                  <span class="store-arrow">↗</span>
                </div>
              </a>
            }
          </div>
        </div>
      </section>
    }

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-content">
        <h2>Ready to Start Selling?</h2>
        <p>Join thousands of entrepreneurs. Your store is ready in 2 minutes.</p>
        <a routerLink="/register" class="btn-cta">🚀 Create Your Free Store</a>
      </div>
    </section>
  `,
  styles: [`
    /* Hero */
    .hero {
      min-height: 100vh; display: flex; align-items: center;
      padding: 80px 1.5rem 4rem; position: relative; overflow: hidden;
      gap: 3rem; flex-wrap: wrap;
    }
    .hero-bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 70% 50%, rgba(37,211,102,0.08) 0%, transparent 60%),
                  radial-gradient(ellipse at 20% 80%, rgba(18,140,126,0.06) 0%, transparent 50%);
      pointer-events: none;
    }
    .hero-content { flex: 1; min-width: 300px; max-width: 600px; position: relative; z-index: 1; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: var(--primary-light); color: var(--primary-dark);
      padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.85rem;
      font-weight: 600; margin-bottom: 1.5rem; border: 1px solid rgba(37,211,102,0.2);
    }
    .hero-title {
      font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900;
      color: var(--text-primary); line-height: 1.15; margin-bottom: 1.25rem;
    }
    .gradient-text {
      background: linear-gradient(135deg, #25D366, #128C7E);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-desc { font-size: 1.1rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 2rem; max-width: 480px; }
    .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
    .btn-hero-primary {
      background: var(--primary); color: white; padding: 0.85rem 1.75rem;
      border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 1rem;
      box-shadow: 0 4px 20px rgba(37,211,102,0.35); transition: all 0.2s;
    }
    .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(37,211,102,0.45); }
    .btn-hero-secondary {
      background: var(--card-bg); color: var(--text-primary);
      padding: 0.85rem 1.75rem; border-radius: 50px; text-decoration: none;
      font-weight: 600; font-size: 1rem; border: 1.5px solid var(--border);
      transition: all 0.2s;
    }
    .btn-hero-secondary:hover { border-color: var(--primary); color: var(--primary); }
    .hero-stats { display: flex; align-items: center; gap: 1.5rem; }
    .stat { display: flex; flex-direction: column; }
    .stat-num { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); }
    .stat-lbl { font-size: 0.78rem; color: var(--text-secondary); font-weight: 500; }
    .stat-divider { width: 1px; height: 32px; background: var(--border); }

    /* Phone Mockups Stacking */
    .hero-visual { flex: 1; min-width: 320px; display: flex; justify-content: center; position: relative; z-index: 1; padding: 2rem 0; }
    .stacked-stores { position: relative; width: 280px; height: 420px; }
    
    .phone-mockup {
      width: 260px; background: var(--card-bg);
      border-radius: 32px; padding: 14px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px var(--border);
      position: absolute;
      top: calc(var(--index) * 40px);
      left: calc(var(--index) * 30px);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      animation: float 5s ease-in-out infinite;
      animation-delay: calc(var(--index) * 0.5s);
    }
    .phone-mockup:hover { transform: scale(1.05) translateY(-10px); z-index: 100 !important; }
    
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
    .phone-screen { background: var(--surface); border-radius: 20px; overflow: hidden; height: 350px; }
    .mock-store-header { padding: 0.85rem; display: flex; align-items: center; gap: 0.6rem; }
    .mock-logo { width: 30px; height: 30px; background: rgba(255,255,255,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; font-size: 0.85rem; }
    .mock-store-name { color: white; font-weight: 700; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mock-products { padding: 0.6rem; display: flex; flex-direction: column; gap: 0.45rem; }
    .mock-product { background: var(--card-bg); border-radius: 10px; padding: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .mock-img { font-size: 1.2rem; width: 30px; text-align: center; }
    .mock-info { flex: 1; }
    .mock-name { font-size: 0.7rem; font-weight: 600; color: var(--text-primary); }
    .mock-price { font-size: 0.65rem; color: var(--text-secondary); }
    .mock-wa { background: #25D366; color: white; font-size: 0.55rem; font-weight: 700; padding: 0.2rem 0.4rem; border-radius: 4px; }

    /* Features */
    .features { padding: 5rem 1.5rem; background: var(--surface); }
    .section-container { max-width: 1100px; margin: 0 auto; }
    .section-header { text-align: center; margin-bottom: 3rem; }
    .section-header h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 800; color: var(--text-primary); }
    .section-header p { color: var(--text-secondary); margin-top: 0.5rem; font-size: 1rem; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
    .feature-card {
      background: var(--card-bg); border-radius: 20px; padding: 1.75rem;
      border: 1px solid var(--border); box-shadow: var(--card-shadow);
      transition: transform 0.25s, box-shadow 0.25s;
    }
    .feature-card:hover { transform: translateY(-4px); box-shadow: var(--card-shadow-hover); }
    .feature-icon { font-size: 2.2rem; margin-bottom: 1rem; }
    .feature-card h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
    .feature-card p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; }

    /* Live Stores */
    .live-stores { padding: 5rem 1.5rem; background: var(--bg); }
    .stores-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
      gap: 2rem; 
    }
    @media (max-width: 640px) { .stores-grid { grid-template-columns: 1fr; } }
    
    .store-card {
      background: var(--card-bg); border-radius: 24px;
      padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;
      text-decoration: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid var(--border); position: relative; overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .store-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px;
      background: linear-gradient(90deg, #25D366, #128C7E); opacity: 0; transition: opacity 0.3s;
    }
    .store-card:hover { 
      transform: translateY(-8px); 
      border-color: var(--primary);
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
    }
    .store-card:hover::before { opacity: 1; }
    
    .store-head { display: flex; align-items: center; gap: 1rem; }
    .store-avatar { 
      width: 56px; height: 56px; border-radius: 16px; 
      background: linear-gradient(135deg,#25D366,#128C7E); 
      display: flex; align-items: center; justify-content: center; 
      font-size: 1.5rem; font-weight: 800; color: white; flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(37,211,102,0.2);
    }
    .store-details h4 { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .store-details p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin: 0.5rem 0 1rem; }
    .store-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); pt: 1rem; margin-top: auto; padding-top: 1rem; }
    .store-url { font-size: 0.8rem; color: var(--primary); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
    .store-arrow { 
      width: 32px; height: 32px; border-radius: 50%; background: var(--surface);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; color: var(--text-secondary);
    }
    .store-card:hover .store-arrow { background: var(--primary); color: white; transform: rotate(-45deg); }

    /* CTA */
    .cta {
      padding: 5rem 1.5rem;
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      text-align: center;
    }
    .cta-content { max-width: 600px; margin: 0 auto; }
    .cta h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 800; color: white; margin-bottom: 0.75rem; }
    .cta p { color: rgba(255,255,255,0.85); font-size: 1rem; margin-bottom: 2rem; }
    .btn-cta {
      background: white; color: var(--primary-dark);
      padding: 0.9rem 2rem; border-radius: 50px; text-decoration: none;
      font-weight: 800; font-size: 1rem; display: inline-block;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: all 0.2s;
    }
    .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.2); }
  `]
})
export class HomeComponent {
  private storeService = inject(StoreService);
  private productService = inject(ProductService);
  stores = this.storeService.stores;

  top3Stores = computed(() => {
    return [...this.stores()].sort((a, b) => b.visits - a.visits).slice(0, 3);
  });

  features = [
    { icon: '🏪', title: 'Your Own Store URL', desc: 'Get a unique cjstore.com/store/your-name URL that you can share anywhere.' },
    { icon: '📱', title: 'WhatsApp Ordering', desc: 'Customers order directly via WhatsApp with a pre-filled message. Zero friction.' },
    { icon: '📦', title: 'Product Management', desc: 'Add, edit, and manage your products with images, categories, and stock tracking.' },
    { icon: '🔍', title: 'Search & Filter', desc: 'Customers can search, filter by category, and sort by price to find what they need.' },
    { icon: '🌙', title: 'Dark Mode', desc: 'Beautiful light and dark themes that look great on any device.' },
    { icon: '📊', title: 'Store Analytics', desc: 'Track visits, product views, and store performance from your dashboard.' },
    { icon: '🔐', title: 'Secure Dashboard', desc: 'Each shop owner has their own secure dashboard to manage only their store.' },
    { icon: '🚀', title: 'SaaS Ready', desc: 'Built for scale with JWT auth, Spring Boot backend, and payment integration ready.' }
  ];

  getGradient(name: string): string {
    const colors = ['linear-gradient(135deg, #25D366, #128C7E)', 'linear-gradient(135deg, #667eea, #764ba2)', 'linear-gradient(135deg, #f093fb, #f5576c)'];
    const idx = (name.charCodeAt(0) || 0) % colors.length;
    return colors[idx];
  }

  getTopProducts(storeId: string) {
    return this.productService.getActiveByStore(storeId).slice(0, 3);
  }

  getCatIcon(cat: string): string {
    const icons: Record<string, string> = { 'T-Shirts': '👕', 'Jeans': '👖', 'Dresses': '👗', 'Groceries': '🍎', 'Accessories': '🎧', 'Computing': '💻' };
    return icons[cat] || '🛍️';
  }
}
