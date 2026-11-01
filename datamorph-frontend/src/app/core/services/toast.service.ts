import { Injectable, signal, inject } from '@angular/core';
import { I18nService } from './i18n.service';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private i18n = inject(I18nService);
  public toasts = signal<ToastMessage[]>([]);

  public show(message: string, type: ToastMessage['type'] = 'info', title?: string, duration: number = 4500): void {
    const id = Math.random().toString(36).substring(2, 9);
    
    let defaultTitle = '';
    switch (type) {
      case 'success': defaultTitle = this.i18n.t('common.success'); break;
      case 'error': defaultTitle = this.i18n.t('common.error'); break;
      case 'warning': defaultTitle = this.i18n.t('common.warning'); break;
      case 'info': defaultTitle = this.i18n.t('common.info'); break;
    }

    const newToast: ToastMessage = {
      id,
      type,
      title: title || defaultTitle,
      message,
      duration
    };

    this.toasts.update(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  public success(message: string, title?: string, duration?: number): void {
    this.show(message, 'success', title, duration);
  }

  public error(message: string, title?: string, duration: number = 6000): void {
    this.show(message, 'error', title, duration);
  }

  public warning(message: string, title?: string, duration?: number): void {
    this.show(message, 'warning', title, duration);
  }

  public info(message: string, title?: string, duration?: number): void {
    this.show(message, 'info', title, duration);
  }

  public dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
