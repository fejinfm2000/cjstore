import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { StoreService } from '../../../core/services/store.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-logo">🛍️</span>
          <h1>Open Your Store</h1>
          <p>Join thousands of entrepreneurs on CJStore</p>
        </div>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label>Shop Name *</label>
              <input formControlName="shopName" type="text" placeholder="e.g. Fashion Hub"
                (input)="onShopNameChange()" [class.invalid]="isInvalid('shopName')" />
              @if (isInvalid('shopName')) {
                <span class="field-error">Shop name is required (min 3 chars)</span>
              }
            </div>
            <div class="form-group">
              <label>Store URL Slug *</label>
              <div class="slug-input">
                <span class="slug-prefix">cjstore.com/store/</span>
                <input formControlName="slug" type="text" placeholder="fashion-hub"
                  [class.invalid]="isInvalid('slug')" />
              </div>
              @if (isInvalid('slug')) {
                <span class="field-error">Slug is required (lowercase, hyphens only)</span>
              }
              @if (slugTaken()) {
                <span class="field-error">This slug is already taken. Try another.</span>
              }
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Owner Name *</label>
              <input formControlName="ownerName" type="text" placeholder="Your full name"
                [class.invalid]="isInvalid('ownerName')" />
              @if (isInvalid('ownerName')) {
                <span class="field-error">Owner name is required</span>
              }
            </div>
            <div class="form-group">
              <label>WhatsApp Number *</label>
              <input formControlName="whatsapp" type="tel" placeholder="919952211933 (with country code)"
                [class.invalid]="isInvalid('whatsapp')" />
              @if (isInvalid('whatsapp')) {
                <span class="field-error">Enter valid WhatsApp number (digits only)</span>
              }
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Email *</label>
              <input formControlName="email" type="email" placeholder="you@example.com"
                [class.invalid]="isInvalid('email')" />
              @if (isInvalid('email')) {
                <span class="field-error">Valid email is required</span>
              }
            </div>
            <div class="form-group">
              <label>Password *</label>
              <input formControlName="password" type="password" placeholder="Min 6 characters"
                [class.invalid]="isInvalid('password')" />
              @if (isInvalid('password')) {
                <span class="field-error">Password must be at least 6 characters</span>
              }
            </div>
          </div>

          <div class="form-group full">
            <label>Store Description</label>
            <textarea formControlName="description" rows="3"
              placeholder="Tell customers what your store is about..."></textarea>
          </div>

          <div class="form-group full">
            <label>Store Logo URL (optional)</label>
            <input formControlName="logo" type="url" placeholder="https://example.com/logo.png" />
          </div>

          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) {
              <span class="btn-spinner"></span> Creating Store...
            } @else {
              🚀 Create My Store
            }
          </button>
        </form>

        <p class="auth-footer">
          Already have an account? <a routerLink="/login">Login here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 6rem 1rem 2rem; background: var(--bg);
    }
    .auth-card {
      background: var(--card-bg); border-radius: 24px;
      padding: 2.5rem; width: 100%; max-width: 720px;
      box-shadow: var(--card-shadow); border: 1px solid var(--border);
    }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-logo { font-size: 3rem; display: block; margin-bottom: 0.5rem; }
    .auth-header h1 { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); }
    .auth-header p { color: var(--text-secondary); margin-top: 0.25rem; }
    .alert { padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1rem; font-size: 0.9rem; }
    .alert-error { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
    .auth-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group.full { grid-column: 1 / -1; }
    label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
    input, textarea {
      padding: 0.65rem 0.9rem; border-radius: 10px;
      border: 1.5px solid var(--border); background: var(--surface);
      color: var(--text-primary); font-size: 0.95rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }
    input:focus, textarea:focus {
      outline: none; border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37,211,102,0.15);
    }
    input.invalid { border-color: var(--danger); }
    .slug-input { display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: 10px; overflow: hidden; background: var(--surface); }
    .slug-prefix { padding: 0.65rem 0.5rem 0.65rem 0.9rem; font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; }
    .slug-input input { border: none; padding-left: 0; flex: 1; box-shadow: none; }
    .slug-input input:focus { box-shadow: none; }
    .field-error { font-size: 0.78rem; color: var(--danger); }
    .btn-submit {
      background: var(--primary); color: white; border: none;
      padding: 0.85rem; border-radius: 12px; font-size: 1rem;
      font-weight: 700; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      margin-top: 0.5rem; box-shadow: 0 4px 16px rgba(37,211,102,0.3);
    }
    .btn-submit:hover:not(:disabled) { background: #1da851; transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-spinner {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer { text-align: center; margin-top: 1.5rem; color: var(--text-secondary); font-size: 0.9rem; }
    .auth-footer a { color: var(--primary); font-weight: 600; text-decoration: none; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private storeService = inject(StoreService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  slugTaken = signal(false);

  form = this.fb.group({
    shopName: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    ownerName: ['', Validators.required],
    whatsapp: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    description: [''],
    logo: ['']
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onShopNameChange(): void {
    const name = this.form.get('shopName')?.value || '';
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    this.form.get('slug')?.setValue(slug, { emitEvent: false });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const v = this.form.value;

    this.auth.register({
      ownerName: v.ownerName!,
      email: v.email!,
      password: v.password!
    }).pipe(
      switchMap(() => this.auth.login(v.email!, v.password!)),
      switchMap((authRes) => {
        return this.storeService.createStore({
          name: v.shopName!,
          slug: v.slug!,
          ownerName: v.ownerName!,
          email: v.email!,
          whatsapp: v.whatsapp!,
          logo: v.logo || '',
          description: v.description || '',
          theme: 'light'
        }, authRes.id);
      })
    ).subscribe({
      next: (store) => {
        const user = this.auth.currentUser();
        if (user) {
          this.auth.updateSession({ ...user, storeId: store.id });
        }
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.error.set(err.error?.message || err.error || 'Registration or Store creation failed.');
        this.loading.set(false);
      }
    });
  }
}
