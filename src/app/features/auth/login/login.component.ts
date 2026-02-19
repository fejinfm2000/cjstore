import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-logo">🔐</span>
          <h1>Welcome Back</h1>
          <p>Login to manage your store</p>
        </div>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input formControlName="email" type="email" placeholder="you@example.com"
              [class.invalid]="isInvalid('email')" />
            @if (isInvalid('email')) {
              <span class="field-error">Valid email is required</span>
            }
          </div>
          <div class="form-group">
            <label>Password</label>
            <input formControlName="password" type="password" placeholder="Your password"
              [class.invalid]="isInvalid('password')" />
            @if (isInvalid('password')) {
              <span class="field-error">Password is required</span>
            }
          </div>

          <div class="demo-hint">
            <strong>Demo:</strong> demo&#64;cjstore.com / demo123
          </div>

          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) {
              <span class="btn-spinner"></span> Logging in...
            } @else {
              Login to Dashboard
            }
          </button>
        </form>

        <p class="auth-footer">
          New here? <a routerLink="/register">Open a free store</a>
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
      padding: 2.5rem; width: 100%; max-width: 440px;
      box-shadow: var(--card-shadow); border: 1px solid var(--border);
    }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-logo { font-size: 3rem; display: block; margin-bottom: 0.5rem; }
    .auth-header h1 { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); }
    .auth-header p { color: var(--text-secondary); margin-top: 0.25rem; }
    .alert { padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1rem; font-size: 0.9rem; }
    .alert-error { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
    .auth-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
    input {
      padding: 0.65rem 0.9rem; border-radius: 10px;
      border: 1.5px solid var(--border); background: var(--surface);
      color: var(--text-primary); font-size: 0.95rem;
      transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
    }
    input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,211,102,0.15); }
    input.invalid { border-color: var(--danger); }
    .field-error { font-size: 0.78rem; color: var(--danger); }
    .demo-hint {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 0.6rem 0.9rem;
      font-size: 0.82rem; color: var(--text-secondary);
    }
    .btn-submit {
      background: var(--primary); color: white; border: none;
      padding: 0.85rem; border-radius: 12px; font-size: 1rem;
      font-weight: 700; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      box-shadow: 0 4px 16px rgba(37,211,102,0.3);
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.error.set(err.error?.message || err.error || 'Invalid email or password.');
        this.loading.set(false);
      }
    });
  }
}
