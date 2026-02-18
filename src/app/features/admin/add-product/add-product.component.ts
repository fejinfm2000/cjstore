import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';

const CATEGORIES = ['T-Shirts', 'Jeans', 'Dresses', 'Footwear', 'Hoodies', 'Formal', 'Accessories', 'Bags', 'Electronics', 'Groceries', 'Books', 'Sports', 'Other'];

@Component({
    selector: 'app-add-product',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="add-product">
      <div class="page-header">
        <h1>Add New Product</h1>
        <p class="subtitle">Fill in the details to list a new product in your store.</p>
      </div>

      @if (success()) {
        <div class="alert alert-success">
          ✅ Product added successfully! <button (click)="success.set(false)">✕</button>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="submit()" class="product-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Product Name *</label>
            <input formControlName="name" type="text" placeholder="e.g. Classic White Tee"
              [class.invalid]="isInvalid('name')" />
            @if (isInvalid('name')) { <span class="field-error">Product name is required</span> }
          </div>

          <div class="form-group">
            <label>Category *</label>
            <select formControlName="category" [class.invalid]="isInvalid('category')">
              <option value="">Select category</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
            @if (isInvalid('category')) { <span class="field-error">Category is required</span> }
          </div>

          <div class="form-group">
            <label>Price (₹) *</label>
            <input formControlName="price" type="number" min="0" placeholder="e.g. 599"
              [class.invalid]="isInvalid('price')" />
            @if (isInvalid('price')) { <span class="field-error">Valid price is required</span> }
          </div>

          <div class="form-group">
            <label>Stock Quantity *</label>
            <input formControlName="stock" type="number" min="0" placeholder="e.g. 50"
              [class.invalid]="isInvalid('stock')" />
            @if (isInvalid('stock')) { <span class="field-error">Stock quantity is required</span> }
          </div>

          <div class="form-group full">
            <label>Description *</label>
            <textarea formControlName="description" rows="4"
              placeholder="Describe your product in detail..."
              [class.invalid]="isInvalid('description')"></textarea>
            @if (isInvalid('description')) { <span class="field-error">Description is required</span> }
          </div>

          <div class="form-group full">
            <label>Image URL (optional)</label>
            <input formControlName="image" type="url" placeholder="https://example.com/product.jpg" />
            @if (form.get('image')?.value) {
              <div class="image-preview">
                <img [src]="form.get('image')?.value" alt="Preview" (error)="onImgError($event)" />
              </div>
            }
          </div>

          <div class="form-group">
            <label class="toggle-label">
              <input formControlName="active" type="checkbox" class="toggle-input" />
              <span class="toggle-track"></span>
              <span>Active (visible in store)</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="resetForm()">Reset</button>
          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) { <span class="btn-spinner"></span> Saving... }
            @else { ➕ Add Product }
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .add-product { max-width: 700px; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
    .subtitle { color: var(--text-secondary); margin-top: 0.25rem; }
    .alert { padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .alert-success { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
    .alert button { background: none; border: none; cursor: pointer; font-size: 1rem; color: inherit; }
    .product-form { background: var(--card-bg); border: 1px solid var(--border); border-radius: 20px; padding: 1.75rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group.full { grid-column: 1 / -1; }
    label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
    input, select, textarea {
      padding: 0.65rem 0.9rem; border-radius: 10px;
      border: 1.5px solid var(--border); background: var(--surface);
      color: var(--text-primary); font-size: 0.95rem;
      transition: border-color 0.2s; font-family: inherit;
    }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,211,102,0.15); }
    input.invalid, select.invalid, textarea.invalid { border-color: var(--danger); }
    .field-error { font-size: 0.78rem; color: var(--danger); }
    .image-preview { margin-top: 0.5rem; }
    .image-preview img { max-width: 120px; max-height: 120px; border-radius: 10px; object-fit: cover; border: 1px solid var(--border); }
    .toggle-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
    .toggle-input { display: none; }
    .toggle-track {
      width: 44px; height: 24px; background: var(--border); border-radius: 50px;
      position: relative; transition: background 0.2s; flex-shrink: 0;
    }
    .toggle-track::after {
      content: ''; position: absolute; top: 3px; left: 3px;
      width: 18px; height: 18px; border-radius: 50%; background: white;
      transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .toggle-input:checked + .toggle-track { background: var(--primary); }
    .toggle-input:checked + .toggle-track::after { transform: translateX(20px); }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .btn-cancel { background: var(--surface); border: 1px solid var(--border); color: var(--text-secondary); padding: 0.65rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-cancel:hover { border-color: var(--primary); color: var(--primary); }
    .btn-submit { background: var(--primary); color: white; border: none; padding: 0.65rem 1.75rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
    .btn-submit:hover:not(:disabled) { background: #1da851; }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AddProductComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private productService = inject(ProductService);
    private router = inject(Router);

    categories = CATEGORIES;
    loading = signal(false);
    success = signal(false);

    form = this.fb.group({
        name: ['', Validators.required],
        category: ['', Validators.required],
        price: [null as number | null, [Validators.required, Validators.min(0)]],
        stock: [null as number | null, [Validators.required, Validators.min(0)]],
        description: ['', Validators.required],
        image: [''],
        active: [true]
    });

    isInvalid(field: string): boolean {
        const ctrl = this.form.get(field);
        return !!(ctrl?.invalid && ctrl?.touched);
    }

    onImgError(e: Event): void {
        (e.target as HTMLImageElement).style.display = 'none';
    }

    resetForm(): void {
        this.form.reset({ active: true });
        this.success.set(false);
    }

    submit(): void {
        this.form.markAllAsTouched();
        if (this.form.invalid) return;
        const user = this.auth.currentUser();
        if (!user?.storeId) return;
        this.loading.set(true);
        const v = this.form.value;
        this.productService.create({
            storeId: user.storeId,
            name: v.name!,
            description: v.description!,
            price: v.price!,
            category: v.category!,
            stock: v.stock!,
            image: v.image || '',
            active: v.active ?? true
        });
        this.loading.set(false);
        this.success.set(true);
        this.resetForm();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
