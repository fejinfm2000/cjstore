import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { StoreService } from '../../../core/services/store.service';

@Component({
    selector: 'app-store-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="store-settings">
      <div class="page-header">
        <h1>Store Settings</h1>
        <p class="subtitle">Manage your store profile and preferences.</p>
      </div>

      @if (success()) {
        <div class="alert alert-success">✅ Settings saved successfully!</div>
      }
      @if (error()) {
        <div class="alert alert-error">{{ error() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="submit()" class="settings-form">
        <div class="settings-section">
          <h3>Store Profile</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Store Name *</label>
              <input formControlName="name" type="text" [class.invalid]="isInvalid('name')" />
              @if (isInvalid('name')) { <span class="field-error">Store name is required</span> }
            </div>
            <div class="form-group">
              <label>Store Slug (URL)</label>
              <div class="slug-display">
                <span class="slug-prefix">cjstore.com/store/</span>
                <span class="slug-value">{{ form.get('slug')?.value }}</span>
              </div>
              <span class="field-hint">Slug cannot be changed after creation.</span>
            </div>
            <div class="form-group">
              <label>WhatsApp Number *</label>
              <input formControlName="whatsapp" type="tel" placeholder="919876543210"
                [class.invalid]="isInvalid('whatsapp')" />
              @if (isInvalid('whatsapp')) { <span class="field-error">Valid WhatsApp number required</span> }
              <span class="field-hint">Include country code (e.g. 91 for India)</span>
            </div>
            <div class="form-group">
              <label>Store Logo URL</label>
              <input formControlName="logo" type="url" placeholder="https://example.com/logo.png" />
              @if (form.get('logo')?.value) {
                <img [src]="form.get('logo')?.value" alt="Logo preview" class="logo-preview" (error)="onImgError($event)" />
              }
            </div>
            <div class="form-group full">
              <label>Store Description</label>
              <textarea formControlName="description" rows="3"
                placeholder="Tell customers what your store is about..."></textarea>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Appearance</h3>
          <div class="theme-options">
            <label class="theme-option" [class.selected]="form.get('theme')?.value === 'light'">
              <input type="radio" formControlName="theme" value="light" />
              <span class="theme-preview light-preview">☀️</span>
              <span>Light</span>
            </label>
            <label class="theme-option" [class.selected]="form.get('theme')?.value === 'dark'">
              <input type="radio" formControlName="theme" value="dark" />
              <span class="theme-preview dark-preview">🌙</span>
              <span>Dark</span>
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h3>Store URL</h3>
          <div class="url-display">
            <span class="url-text">cjstore.com/store/{{ form.get('slug')?.value }}</span>
            <button type="button" class="btn-copy" (click)="copyUrl()">
              {{ copied() ? '✓ Copied!' : '📋 Copy URL' }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) { <span class="btn-spinner"></span> Saving... }
            @else { 💾 Save Settings }
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .store-settings { max-width: 700px; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
    .subtitle { color: var(--text-secondary); margin-top: 0.25rem; }
    .alert { padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1rem; font-size: 0.9rem; }
    .alert-success { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
    .alert-error { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
    .settings-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .settings-section { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; }
    .settings-section h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group.full { grid-column: 1 / -1; }
    label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
    input, textarea {
      padding: 0.65rem 0.9rem; border-radius: 10px;
      border: 1.5px solid var(--border); background: var(--surface);
      color: var(--text-primary); font-size: 0.95rem;
      transition: border-color 0.2s; font-family: inherit;
    }
    input:focus, textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,211,102,0.15); }
    input.invalid { border-color: var(--danger); }
    .field-error { font-size: 0.78rem; color: var(--danger); }
    .field-hint { font-size: 0.78rem; color: var(--text-secondary); }
    .slug-display { display: flex; align-items: center; padding: 0.65rem 0.9rem; border: 1.5px solid var(--border); border-radius: 10px; background: var(--surface); gap: 0.25rem; }
    .slug-prefix { font-size: 0.8rem; color: var(--text-secondary); }
    .slug-value { font-weight: 600; color: var(--primary); font-size: 0.9rem; }
    .logo-preview { width: 60px; height: 60px; border-radius: 10px; object-fit: cover; border: 1px solid var(--border); margin-top: 0.25rem; }
    .theme-options { display: flex; gap: 1rem; }
    .theme-option { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem 1.5rem; border: 2px solid var(--border); border-radius: 14px; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; font-weight: 500; }
    .theme-option input { display: none; }
    .theme-option.selected { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
    .theme-preview { font-size: 1.8rem; }
    .url-display { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .url-text { font-size: 0.95rem; color: var(--primary); font-weight: 600; background: var(--surface); padding: 0.6rem 1rem; border-radius: 10px; border: 1px solid var(--border); flex: 1; }
    .btn-copy { background: var(--surface); border: 1.5px solid var(--border); color: var(--text-secondary); padding: 0.6rem 1rem; border-radius: 10px; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; white-space: nowrap; }
    .btn-copy:hover { border-color: var(--primary); color: var(--primary); }
    .form-actions { display: flex; justify-content: flex-end; }
    .btn-submit { background: var(--primary); color: white; border: none; padding: 0.75rem 2rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 16px rgba(37,211,102,0.3); }
    .btn-submit:hover:not(:disabled) { background: #1da851; }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class StoreSettingsComponent implements OnInit {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private storeService = inject(StoreService);

    loading = signal(false);
    success = signal(false);
    error = signal('');
    copied = signal(false);

    form = this.fb.group({
        name: ['', Validators.required],
        slug: [{ value: '', disabled: true }],
        whatsapp: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
        logo: [''],
        description: [''],
        theme: ['light']
    });

    ngOnInit(): void {
        const user = this.auth.currentUser();
        if (!user?.storeId) return;
        const store = this.storeService.getById(user.storeId);
        if (store) {
            this.form.patchValue({
                name: store.name,
                slug: store.slug,
                whatsapp: store.whatsapp,
                logo: store.logo,
                description: store.description,
                theme: store.theme
            });
        }
    }

    isInvalid(field: string): boolean {
        const ctrl = this.form.get(field);
        return !!(ctrl?.invalid && ctrl?.touched);
    }

    onImgError(e: Event): void {
        (e.target as HTMLImageElement).style.display = 'none';
    }

    copyUrl(): void {
        const slug = this.form.get('slug')?.value;
        navigator.clipboard.writeText(`${window.location.origin}/store/${slug}`);
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
    }

    submit(): void {
        this.form.markAllAsTouched();
        if (this.form.invalid) return;
        const user = this.auth.currentUser();
        if (!user?.storeId) return;
        this.loading.set(true);
        const v = this.form.getRawValue();
        this.storeService.update(user.storeId, {
            name: v.name!,
            whatsapp: v.whatsapp!,
            logo: v.logo || '',
            description: v.description || '',
            theme: (v.theme as 'light' | 'dark') || 'light'
        });
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.success.set(false), 3000);
    }
}
