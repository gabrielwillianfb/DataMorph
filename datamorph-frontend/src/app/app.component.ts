import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@auth0/auth0-angular';
import { ToastContainerComponent } from './core/components/toast/toast-container.component';
import { I18nService } from './core/services/i18n.service';
import { TranslatePipe } from './core/pipes/translate.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    ToastContainerComponent,
    TranslatePipe
  ],
  template: `
    <div class="layout-container">
      <app-toast-container></app-toast-container>

      <!-- Top Header Navigation -->
      <header class="app-header">
        <div class="header-inner">
          <!-- Logo & Brand Identity -->
          <div class="brand-container">
            <a routerLink="/" class="brand-link">
              <div class="brand-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 7C4 5.34315 5.34315 4 7 4H17C18.6569 4 20 5.34315 20 7V9C20 10.6569 18.6569 12 17 12H7C5.34315 12 4 10.6569 4 9V7Z" fill="white" fill-opacity="0.9"/>
                  <path d="M4 15C4 13.3431 5.34315 12 7 12H17C18.6569 12 20 13.3431 20 15V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V15Z" fill="white" fill-opacity="0.5"/>
                  <circle cx="15" cy="8" r="1.5" fill="#2563EB"/>
                  <circle cx="9" cy="16" r="1.5" fill="#2563EB"/>
                </svg>
              </div>
              <div class="brand-text">
                <span class="brand-title">{{ 'brand.name' | t }}</span>
                <span class="brand-tag">{{ 'brand.tag' | t }}</span>
              </div>
            </a>
          </div>

          <!-- Desktop Navigation Links -->
          <nav class="desktop-nav" aria-label="Main Navigation">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              <mat-icon>dashboard</mat-icon>
              <span>{{ 'nav.overview' | t }}</span>
            </a>
            <a routerLink="/studio" routerLinkActive="active" class="nav-item">
              <mat-icon>tune</mat-icon>
              <span>{{ 'nav.studio' | t }}</span>
            </a>
            <a routerLink="/quarantine" routerLinkActive="active" class="nav-item">
              <mat-icon>shield</mat-icon>
              <span>{{ 'nav.quarantine' | t }}</span>
            </a>
            <a routerLink="/batches" routerLinkActive="active" class="nav-item">
              <mat-icon>inventory_2</mat-icon>
              <span>{{ 'nav.batches' | t }}</span>
            </a>
          </nav>

          <!-- Right Action Controls -->
          <div class="header-right">
            <!-- Language Switcher -->
            <div class="lang-switcher" [title]="'common.language' | t">
              <button
                type="button"
                class="lang-pill"
                [class.active]="i18n.isPt()"
                (click)="i18n.setLang('pt-BR')"
                aria-label="Português do Brasil"
              >
                PT
              </button>
              <button
                type="button"
                class="lang-pill"
                [class.active]="i18n.isEn()"
                (click)="i18n.setLang('en-US')"
                aria-label="English (US)"
              >
                EN
              </button>
            </div>

            <!-- Authentication Status / Profile -->
            @if (auth.isLoading$ | async) {
              <div class="auth-loading">
                <span class="loading-pulse"></span>
                <span>{{ 'nav.authenticating' | t }}</span>
              </div>
            } @else if (auth.isAuthenticated$ | async) {
              @if (auth.user$ | async; as user) {
                <div class="user-profile">
                  @if (user.picture) {
                    <img [src]="user.picture" class="user-avatar" [alt]="user.name || 'User'" />
                  } @else {
                    <div class="avatar-placeholder">{{ (user.name || user.email || 'U')[0].toUpperCase() }}</div>
                  }
                  <div class="user-details">
                    <span class="user-name">{{ user.name || user.email }}</span>
                    <span class="user-status-pill">
                      <span class="status-indicator"></span>
                      {{ 'nav.sessionSecure' | t }}
                    </span>
                  </div>
                  <button type="button" class="btn-logout" (click)="logout()" [title]="'nav.logout' | t" [attr.aria-label]="'nav.logout' | t">
                    <mat-icon>logout</mat-icon>
                    <span class="logout-text">{{ 'nav.logout' | t }}</span>
                  </button>
                </div>
              }
            } @else {
              <button type="button" class="dm-btn dm-btn-primary dm-btn-sm" (click)="login()">
                <mat-icon>login</mat-icon>
                <span>{{ 'nav.login' | t }}</span>
              </button>
            }

            <!-- Mobile Hamburger Toggle -->
            <button
              type="button"
              class="mobile-menu-toggle"
              (click)="mobileMenuOpen.set(!mobileMenuOpen())"
              [attr.aria-expanded]="mobileMenuOpen()"
              [attr.aria-label]="mobileMenuOpen() ? ('nav.closeMenu' | t) : ('nav.menu' | t)"
            >
              <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
            </button>
          </div>
        </div>

        <!-- Mobile Drawer / Dropdown Menu -->
        @if (mobileMenuOpen()) {
          <div class="mobile-drawer-backdrop" (click)="mobileMenuOpen.set(false)">
            <div class="mobile-drawer" (click)="$event.stopPropagation()">
              <nav class="mobile-nav">
                <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="mobileMenuOpen.set(false)" class="mobile-nav-item">
                  <mat-icon>dashboard</mat-icon>
                  <span>{{ 'nav.overview' | t }}</span>
                </a>
                <a routerLink="/studio" routerLinkActive="active" (click)="mobileMenuOpen.set(false)" class="mobile-nav-item">
                  <mat-icon>tune</mat-icon>
                  <span>{{ 'nav.studio' | t }}</span>
                </a>
                <a routerLink="/quarantine" routerLinkActive="active" (click)="mobileMenuOpen.set(false)" class="mobile-nav-item">
                  <mat-icon>shield</mat-icon>
                  <span>{{ 'nav.quarantine' | t }}</span>
                </a>
                <a routerLink="/batches" routerLinkActive="active" (click)="mobileMenuOpen.set(false)" class="mobile-nav-item">
                  <mat-icon>inventory_2</mat-icon>
                  <span>{{ 'nav.batches' | t }}</span>
                </a>
              </nav>

              <div class="mobile-drawer-footer">
                <div class="mobile-lang-row">
                  <span class="mobile-lang-label">{{ 'common.language' | t }}:</span>
                  <div class="lang-switcher">
                    <button type="button" class="lang-pill" [class.active]="i18n.isPt()" (click)="i18n.setLang('pt-BR')">PT-BR</button>
                    <button type="button" class="lang-pill" [class.active]="i18n.isEn()" (click)="i18n.setLang('en-US')">EN-US</button>
                  </div>
                </div>

                @if (auth.isAuthenticated$ | async) {
                  <button type="button" class="dm-btn dm-btn-danger dm-btn-sm" style="width: 100%;" (click)="logout()">
                    <mat-icon>logout</mat-icon>
                    <span>{{ 'nav.logout' | t }}</span>
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </header>

      <!-- Main Application Container -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--dm-bg-app);
    }

    .app-header {
      background: var(--dm-bg-surface);
      border-bottom: 1px solid var(--dm-border-subtle);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    }

    .header-inner {
      max-width: 1440px;
      margin: 0 auto;
      height: 64px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    /* Brand Logo */
    .brand-container {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--dm-radius-md);
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(15, 23, 42, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .brand-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--dm-text-primary);
      letter-spacing: -0.02em;
    }
    .brand-tag {
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--dm-primary);
    }

    /* Desktop Navigation */
    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 64px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 14px;
      border-radius: var(--dm-radius-md);
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--dm-text-secondary);
      text-decoration: none;
      transition: all 0.15s ease;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--dm-text-muted);
        transition: color 0.15s ease;
      }

      &:hover {
        background: var(--dm-bg-subtle);
        color: var(--dm-text-primary);
        mat-icon {
          color: var(--dm-text-primary);
        }
      }

      &.active {
        background: var(--dm-primary-subtle);
        color: var(--dm-primary);
        font-weight: 700;
        mat-icon {
          color: var(--dm-primary);
        }
      }
    }

    /* Header Right Actions */
    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Language Switcher */
    .lang-switcher {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid var(--dm-border-default);
      border-radius: var(--dm-radius-full);
      padding: 3px;
      gap: 3px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .lang-pill {
      border: none;
      background: transparent;
      padding: 4px 10px;
      border-radius: var(--dm-radius-full);
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--dm-text-secondary);
      cursor: pointer;
      transition: all 0.12s ease;

      &:hover {
        color: var(--dm-text-primary);
        background: var(--dm-bg-subtle);
      }

      &.active {
        background: var(--dm-primary);
        color: #ffffff;
        box-shadow: 0 1px 2px rgba(37, 99, 235, 0.3);
      }
    }

    /* Auth Profile Badge */
    .auth-loading {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
      color: var(--dm-text-muted);
    }
    .loading-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--dm-primary);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.3; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.1); }
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 6px 4px 10px;
      background: var(--dm-bg-surface);
      border: 1px solid var(--dm-border-subtle);
      border-radius: var(--dm-radius-full);
      box-shadow: var(--dm-shadow-xs);
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid var(--dm-border-default);
    }
    .avatar-placeholder {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--dm-text-primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8125rem;
      font-weight: 600;
    }
    .user-details {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .user-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--dm-text-primary);
      max-width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-status-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.6875rem;
      color: var(--dm-success-text);
      font-weight: 500;
    }
    .status-indicator {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--dm-success);
    }
    .btn-logout {
      display: flex;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--dm-radius-full);
      padding: 4px 8px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--dm-text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: var(--dm-danger-bg);
        color: var(--dm-danger);
        border-color: var(--dm-danger-border);
      }
    }

    /* Mobile Menu Toggle */
    .mobile-menu-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--dm-radius-md);
      border: 1px solid var(--dm-border-default);
      background: var(--dm-bg-surface);
      color: var(--dm-text-secondary);
      cursor: pointer;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    /* Mobile Drawer */
    .mobile-drawer-backdrop {
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(4px);
      z-index: 99;
      display: flex;
      justify-content: flex-start;
      animation: fadeIn 0.2s ease;
    }
    .mobile-drawer {
      width: 280px;
      height: calc(100vh - 64px);
      background: var(--dm-bg-surface);
      border-right: 1px solid var(--dm-border-default);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20px 16px;
      box-shadow: var(--dm-shadow-xl);
      animation: slideInDrawer 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideInDrawer {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--dm-radius-md);
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--dm-text-secondary);
      text-decoration: none;
      transition: all 0.15s ease;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--dm-text-muted);
      }

      &:hover {
        background: var(--dm-bg-subtle);
        color: var(--dm-text-primary);
      }

      &.active {
        background: var(--dm-primary-subtle);
        color: var(--dm-primary);
        font-weight: 600;
        mat-icon { color: var(--dm-primary); }
      }
    }

    .mobile-drawer-footer {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--dm-border-subtle);
    }
    .mobile-lang-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8125rem;
      color: var(--dm-text-secondary);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      padding: 28px 24px 48px;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
    }

    /* Responsiveness Breakpoints */
    @media (max-width: 900px) {
      .desktop-nav {
        display: none;
      }
      .mobile-menu-toggle {
        display: flex;
      }
      .logout-text {
        display: none;
      }
      .user-name {
        max-width: 90px;
      }
    }

    @media (max-width: 600px) {
      .header-inner {
        padding: 0 16px;
      }
      .main-content {
        padding: 20px 16px 36px;
      }
      .brand-tag {
        display: none;
      }
      .user-details {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  public auth = inject(AuthService);
  public i18n = inject(I18nService);
  public mobileMenuOpen = signal<boolean>(false);

  public login(): void {
    this.auth.loginWithRedirect();
  }

  public logout(): void {
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }
}
