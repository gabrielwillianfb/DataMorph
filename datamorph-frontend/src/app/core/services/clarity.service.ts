import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ClarityService {
  private platformId = inject(PLATFORM_ID);
  private initialized = false;

  /**
   * Inicializa o script do Microsoft Clarity no navegador
   * @param projectId ID do projeto no Microsoft Clarity (ex: configurado no env ou portal)
   */
  public init(projectId: string = 'datamorph-default'): void {
    if (!isPlatformBrowser(this.platformId) || this.initialized) {
      return;
    }

    if (!projectId || projectId === 'datamorph-default') {
      console.log('[ClarityService] Modo de desenvolvimento: Telemetria pronta para chave do Clarity.');
      this.initialized = true;
      return;
    }

    (function (c: any, l: Document, a: string, r: string, i: string, t?: any, y?: any) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", projectId);

    this.initialized = true;
    console.log('[ClarityService] Microsoft Clarity inicializado com sucesso.');
  }

  /**
   * Dispara evento customizado para o Microsoft Clarity e Analytics
   */
  public trackEvent(eventName: string, metadata?: Record<string, any>): void {
    if (isPlatformBrowser(this.platformId) && window.clarity) {
      window.clarity('event', eventName);
      if (metadata) {
        window.clarity('set', eventName, JSON.stringify(metadata));
      }
    }
  }

  /**
   * Identifica sessão do usuário sem expor dados sensíveis (LGPD)
   */
  public identifyUser(hashedUserId: string, sessionId?: string): void {
    if (isPlatformBrowser(this.platformId) && window.clarity) {
      window.clarity('identify', hashedUserId, sessionId);
    }
  }
}
