import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

const PAGE_SIZE = 8;

@Component({
    selector: 'app-manage-products',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="manage-products">
      <div class="page-header">
        <div>
          <h1>My Products</h1>
          <p class="subtitle">{{ allProducts().length }} total products in your store</p>
        </div>
        <a routerLink="/admin/add-product" class="btn-add">➕ Add Product</a>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <input [(ngModel)]="searchQuery" (ngModelChange)="currentPage.set(1)"
          type="text" placeholder="Search products..." class="search-input" />
        <select [(ngModel)]="filterStatus" (ngModelChange)="currentPage.set(1)" class="filter-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      @if (pagedProducts().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">📦</span>
          <h3>No products found</h3>
          <p>{{ allProducts().length === 0 ? 'Add your first product to get started.' : 'Try adjusting your search.' }}</p>
          <a routerLink="/admin/add-product" class="btn-primary">Add First Product</a>
        </div>
      } @else {
        <!-- Table -->
        <div class="table-wrap">
          <table class="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of pagedProducts(); track p.id) {
                <tr [class.editing]="editingId() === p.id">
                  <td class="product-cell">
                    <div class="product-thumb">
                      @if (p.image) {
                        <img [src]="p.image" [alt]="p.name" (error)="onImgError($event)" />
                      } @else {
                        <div class="thumb-placeholder">{{ p.name[0] }}</div>
                      }
                    </div>
                    <div class="product-info">
                      <span class="product-name">{{ p.name }}</span>
                      <span class="product-desc">{{ p.description | slice:0:50 }}...</span>
                    </div>
                  </td>
                  <td><span class="category-chip">{{ p.category }}</span></td>
                  <td class="price-cell">₹{{ p.price | number }}</td>
                  <td>
                    <span class="stock-badge"
                      [class.low]="p.stock > 0 && p.stock <= 5"
                      [class.out]="p.stock === 0">
                      {{ p.stock }}
                    </span>
                  </td>
                  <td>
                    <button class="status-toggle" (click)="toggleActive(p)"
                      [class.active]="p.active">
                      {{ p.active ? 'Active' : 'Inactive' }}
                    </button>
                  </td>
                  <td class="actions-cell">
                    <button class="btn-icon edit" (click)="startEdit(p)" title="Edit">✏️</button>
                    <button class="btn-icon delete" (click)="confirmDelete(p)" title="Delete">🗑️</button>
                  </td>
                </tr>
                @if (editingId() === p.id) {
                  <tr class="edit-row">
                    <td colspan="6">
                      <div class="inline-edit">
                        <div class="edit-fields">
                          <input [(ngModel)]="editName" placeholder="Name" />
                          <input [(ngModel)]="editPrice" type="number" placeholder="Price" />
                          <input [(ngModel)]="editStock" type="number" placeholder="Stock" />
                        </div>
                        <div class="edit-actions">
                          <button class="btn-save" (click)="saveEdit(p)">✓ Save</button>
                          <button class="btn-cancel-edit" (click)="editingId.set(null)">✕ Cancel</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="currentPage() === 1" (click)="currentPage.set(currentPage() - 1)">← Prev</button>
            @for (p of pageNumbers(); track p) {
              <button class="page-btn" [class.active]="p === currentPage()" (click)="currentPage.set(p)">{{ p }}</button>
            }
            <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="currentPage.set(currentPage() + 1)">Next →</button>
            <span class="page-info">{{ currentPage() }} / {{ totalPages() }}</span>
          </div>
        }
      }
    </div>

    <app-confirm-modal
      [visible]="showModal()"
      title="Delete Product"
      [message]="'Are you sure you want to delete &quot;' + (deleteTarget()?.name ?? '') + '&quot;? This cannot be undone.'"
      confirmLabel="Delete"
      (confirm)="doDelete()"
      (cancel)="showModal.set(false)"
    />
  `,
    styles: [`
    .manage-products { }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
    .subtitle { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
    .btn-add { background: var(--primary); color: white; padding: 0.6rem 1.25rem; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 0.9rem; white-space: nowrap; }
    .search-bar { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 200px; padding: 0.6rem 0.9rem; border: 1.5px solid var(--border); border-radius: 10px; background: var(--surface); color: var(--text-primary); font-size: 0.9rem; }
    .search-input:focus { outline: none; border-color: var(--primary); }
    .filter-select { padding: 0.6rem 0.9rem; border: 1.5px solid var(--border); border-radius: 10px; background: var(--surface); color: var(--text-primary); font-size: 0.9rem; cursor: pointer; }
    .empty-state { text-align: center; padding: 4rem 2rem; }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
    .empty-state h3 { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); }
    .empty-state p { color: var(--text-secondary); margin: 0.5rem 0 1.5rem; }
    .btn-primary { background: var(--primary); color: white; padding: 0.65rem 1.5rem; border-radius: 50px; text-decoration: none; font-weight: 600; }
    .table-wrap { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; overflow-x: auto; }
    .products-table { width: 100%; border-collapse: collapse; min-width: 700px; }
    .products-table thead { background: var(--surface); }
    .products-table th { padding: 0.85rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
    .products-table td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .products-table tr:last-child td { border-bottom: none; }
    .products-table tr:hover td { background: var(--surface); }
    .products-table tr.editing td { background: rgba(37,211,102,0.05); }
    .product-cell { display: flex; align-items: center; gap: 0.75rem; min-width: 200px; }
    .product-thumb { width: 44px; height: 44px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
    .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-placeholder { width: 100%; height: 100%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary); font-size: 1.1rem; }
    .product-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .product-name { font-weight: 600; color: var(--text-primary); font-size: 0.9rem; }
    .product-desc { font-size: 0.78rem; color: var(--text-secondary); }
    .category-chip { background: var(--surface); border: 1px solid var(--border); padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.78rem; font-weight: 500; color: var(--text-secondary); white-space: nowrap; }
    .price-cell { font-weight: 700; color: var(--text-primary); }
    .stock-badge { background: #dcfce7; color: #16a34a; padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.82rem; font-weight: 600; }
    .stock-badge.low { background: #fef3c7; color: #d97706; }
    .stock-badge.out { background: #fee2e2; color: #dc2626; }
    .status-toggle { padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: var(--surface); color: var(--text-secondary); transition: all 0.2s; }
    .status-toggle.active { background: #dcfce7; color: #16a34a; border-color: #86efac; }
    .actions-cell { display: flex; gap: 0.4rem; }
    .btn-icon { background: none; border: 1px solid var(--border); border-radius: 8px; padding: 0.35rem 0.5rem; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
    .btn-icon.edit:hover { background: #dbeafe; border-color: #93c5fd; }
    .btn-icon.delete:hover { background: #fee2e2; border-color: #fca5a5; }
    .edit-row td { padding: 0; }
    .inline-edit { padding: 0.75rem 1rem; background: rgba(37,211,102,0.05); display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
    .edit-fields { display: flex; gap: 0.5rem; flex-wrap: wrap; flex: 1; }
    .edit-fields input { padding: 0.5rem 0.75rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary); font-size: 0.9rem; min-width: 120px; }
    .edit-fields input:focus { outline: none; border-color: var(--primary); }
    .edit-actions { display: flex; gap: 0.5rem; }
    .btn-save { background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
    .btn-cancel-edit { background: var(--surface); border: 1px solid var(--border); color: var(--text-secondary); padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem; }
    .pagination { display: flex; align-items: center; gap: 0.4rem; margin-top: 1rem; flex-wrap: wrap; }
    .page-btn { padding: 0.4rem 0.75rem; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
    .page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
    .page-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { font-size: 0.82rem; color: var(--text-secondary); margin-left: 0.5rem; }
  `]
})
export class ManageProductsComponent {
    private auth = inject(AuthService);
    private productService = inject(ProductService);

    searchQuery = '';
    filterStatus = 'all';
    currentPage = signal(1);
    showModal = signal(false);
    deleteTarget = signal<Product | null>(null);
    editingId = signal<string | null>(null);
    editName = '';
    editPrice = 0;
    editStock = 0;

    allProducts = computed(() => {
        const user = this.auth.currentUser();
        if (!user?.storeId) return [];
        let products = this.productService.getByStore(user.storeId);
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        }
        if (this.filterStatus === 'active') products = products.filter(p => p.active);
        if (this.filterStatus === 'inactive') products = products.filter(p => !p.active);
        return products;
    });

    totalPages = computed(() => Math.max(1, Math.ceil(this.allProducts().length / PAGE_SIZE)));
    pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
    pagedProducts = computed(() => {
        const start = (this.currentPage() - 1) * PAGE_SIZE;
        return this.allProducts().slice(start, start + PAGE_SIZE);
    });

    toggleActive(p: Product): void {
        this.productService.update(p.id, { active: !p.active });
    }

    confirmDelete(p: Product): void {
        this.deleteTarget.set(p);
        this.showModal.set(true);
    }

    doDelete(): void {
        const t = this.deleteTarget();
        if (t) this.productService.delete(t.id);
        this.showModal.set(false);
        this.deleteTarget.set(null);
        if (this.currentPage() > this.totalPages()) this.currentPage.set(this.totalPages());
    }

    startEdit(p: Product): void {
        this.editingId.set(p.id);
        this.editName = p.name;
        this.editPrice = p.price;
        this.editStock = p.stock;
    }

    saveEdit(p: Product): void {
        this.productService.update(p.id, { name: this.editName, price: this.editPrice, stock: this.editStock });
        this.editingId.set(null);
    }

    onImgError(e: Event): void {
        (e.target as HTMLImageElement).style.display = 'none';
    }
}
