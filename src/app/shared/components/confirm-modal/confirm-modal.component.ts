import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (visible) {
      <div class="modal-overlay" (click)="cancel.emit()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-icon">⚠️</div>
          <h3 class="modal-title">{{ title }}</h3>
          <p class="modal-message">{{ message }}</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="cancel.emit()">Cancel</button>
            <button class="btn-confirm" (click)="confirm.emit()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal {
      background: var(--card-bg); border-radius: 20px;
      padding: 2rem; max-width: 400px; width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.25s ease;
      text-align: center;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .modal-title { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
    .modal-message { color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.5rem; }
    .modal-actions { display: flex; gap: 0.75rem; justify-content: center; }
    .btn-cancel {
      padding: 0.6rem 1.5rem; border-radius: 50px;
      border: 1px solid var(--border); background: var(--surface);
      color: var(--text-secondary); cursor: pointer; font-weight: 500;
      transition: all 0.2s;
    }
    .btn-cancel:hover { background: var(--border); }
    .btn-confirm {
      padding: 0.6rem 1.5rem; border-radius: 50px;
      background: var(--danger); color: white; border: none;
      cursor: pointer; font-weight: 600; transition: all 0.2s;
    }
    .btn-confirm:hover { background: #b91c1c; transform: scale(1.02); }
  `]
})
export class ConfirmModalComponent {
    @Input() visible = false;
    @Input() title = 'Confirm Action';
    @Input() message = 'Are you sure you want to proceed?';
    @Input() confirmLabel = 'Delete';
    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
}
