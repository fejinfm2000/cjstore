import { Component } from '@angular/core';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    template: `
    <div class="spinner-wrap">
      <div class="spinner"></div>
    </div>
  `,
    styles: [`
    .spinner-wrap {
      display: flex; align-items: center; justify-content: center;
      padding: 3rem;
    }
    .spinner {
      width: 44px; height: 44px;
      border: 4px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoadingSpinnerComponent { }
