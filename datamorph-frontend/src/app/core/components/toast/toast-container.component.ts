import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="toast-stack" role="region" aria-live="polite" aria-label="Notifications">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="'toast-' + toast.type" role="alert">
          <div class="toast-icon">
            <mat-icon>{{ getIcon(toast.type) }}</mat-icon>
          </div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button type="button" class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Dismiss notification">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 420px;
      width: calc(100vw - 40px);
      pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      background: var(--dm-bg-surface);
      border-radius: var(--dm-radius-md);
      box-shadow: var(--dm-shadow-lg);
      border: 1px solid var(--dm-border-default);
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: all 0.2s ease;
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .toast-icon {
      width: 28px;
      height: 28px;
      border-radius: var(--dm-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .toast-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .toast-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--dm-text-primary);
      line-height: 1.3;
    }
    .toast-message {
      font-size: 0.8125rem;
      color: var(--dm-text-secondary);
      line-height: 1.45;
      word-break: break-word;
    }
    .toast-close {
      background: none;
      border: none;
      color: var(--dm-text-faint);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--dm-radius-xs);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      margin-left: 4px;
      margin-top: -2px;
    }
    .toast-close:hover {
      color: var(--dm-text-primary);
      background: var(--dm-bg-subtle);
    }
    .toast-close mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Status Colors */
    .toast-success {
      border-left: 3px solid var(--dm-success);
    }
    .toast-success .toast-icon {
      background: var(--dm-success-bg);
      color: var(--dm-success);
    }

    .toast-error {
      border-left: 3px solid var(--dm-danger);
    }
    .toast-error .toast-icon {
      background: var(--dm-danger-bg);
      color: var(--dm-danger);
    }

    .toast-warning {
      border-left: 3px solid var(--dm-warning);
    }
    .toast-warning .toast-icon {
      background: var(--dm-warning-bg);
      color: var(--dm-warning);
    }

    .toast-info {
      border-left: 3px solid var(--dm-primary);
    }
    .toast-info .toast-icon {
      background: var(--dm-primary-subtle);
      color: var(--dm-primary);
    }
  `]
})
export class ToastContainerComponent {
  public toastService = inject(ToastService);

  public getIcon(type: ToastMessage['type']): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
    }
  }
}
