import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/services/api.service';
import { ClarityService } from '../../core/services/clarity.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, TranslatePipe],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span>{{ 'home.badge' | t }}</span>
          </div>
          <h1>{{ 'home.heroTitle' | t }}</h1>
          <p class="hero-description">
            {{ 'home.heroSubtitle' | t }}
          </p>

          <div class="hero-actions">
            <a routerLink="/studio" class="dm-btn dm-btn-primary dm-btn-lg">
              <mat-icon>add_circle_outline</mat-icon>
              <span>{{ 'home.btnStartStudio' | t }}</span>
            </a>
            <a routerLink="/quarantine" class="dm-btn dm-btn-outline dm-btn-lg">
              <mat-icon>shield</mat-icon>
              <span>{{ 'home.btnQuarantine' | t }}</span>
            </a>
          </div>
        </div>
      </section>

      <!-- How it Works (Autonomous Workflow Explanation) -->
      <section class="workflow-section">
        <div class="section-heading">
          <h2>{{ 'home.howItWorksTitle' | t }}</h2>
          <p>{{ 'home.howItWorksSub' | t }}</p>
        </div>

        <div class="workflow-grid">
          <div class="workflow-card">
            <div class="step-num">01</div>
            <div class="workflow-icon icon-blue">
              <mat-icon>upload_file</mat-icon>
            </div>
            <h3>{{ 'home.step1Title' | t }}</h3>
            <p>{{ 'home.step1Desc' | t }}</p>
          </div>

          <div class="workflow-card">
            <div class="step-num">02</div>
            <div class="workflow-icon icon-purple">
              <mat-icon>schema</mat-icon>
            </div>
            <h3>{{ 'home.step2Title' | t }}</h3>
            <p>{{ 'home.step2Desc' | t }}</p>
          </div>

          <div class="workflow-card">
            <div class="step-num">03</div>
            <div class="workflow-icon icon-green">
              <mat-icon>verified</mat-icon>
            </div>
            <h3>{{ 'home.step3Title' | t }}</h3>
            <p>{{ 'home.step3Desc' | t }}</p>
          </div>
        </div>
      </section>

      <!-- KPI Metrics Dashboard -->
      <section class="kpi-section">
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">{{ 'home.kpiProcessed' | t }}</span>
              <div class="kpi-icon-pill icon-blue">
                <mat-icon>cloud_done</mat-icon>
              </div>
            </div>
            <div class="kpi-value">{{ stats()?.total_rows ?? 0 | number }}</div>
            <div class="kpi-sub">{{ stats()?.total_batches ?? 0 }} {{ 'home.kpiProcessedSub' | t }}</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">{{ 'home.kpiSuccessRate' | t }}</span>
              <div class="kpi-icon-pill icon-green">
                <mat-icon>task_alt</mat-icon>
              </div>
            </div>
            <div class="kpi-value text-green">{{ stats()?.success_rate ?? 100 }}%</div>
            <div class="kpi-sub">{{ stats()?.success_rows ?? 0 | number }} {{ 'home.kpiSuccessRateSub' | t }}</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">{{ 'home.kpiQuarantine' | t }}</span>
              <div class="kpi-icon-pill icon-amber">
                <mat-icon>shield_alert</mat-icon>
              </div>
            </div>
            <div class="kpi-value text-amber">{{ stats()?.quarantined_rows ?? 0 | number }}</div>
            <div class="kpi-sub">{{ stats()?.resolved_rows ?? 0 }} {{ 'home.kpiQuarantineSub' | t }}</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">{{ 'home.kpiHoursSaved' | t }}</span>
              <div class="kpi-icon-pill icon-purple">
                <mat-icon>timer</mat-icon>
              </div>
            </div>
            <div class="kpi-value">{{ stats()?.hours_saved ?? 0 }}h</div>
            <div class="kpi-sub">{{ 'home.kpiHoursSavedSub' | t }}</div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    /* Hero Section */
    .hero-section {
      background: var(--dm-bg-surface);
      border: 1px solid var(--dm-border-subtle);
      border-radius: var(--dm-radius-xl);
      padding: 44px 48px;
      box-shadow: var(--dm-shadow-sm);
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 10px;
      background: var(--dm-primary-subtle);
      color: var(--dm-primary);
      border: 1px solid var(--dm-primary-border);
      border-radius: var(--dm-radius-full);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 14px;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--dm-primary);
    }
    .hero-content h1 {
      font-size: 2.125rem;
      font-weight: 800;
      color: var(--dm-text-primary);
      line-height: 1.22;
      letter-spacing: -0.025em;
      margin-bottom: 14px;
    }
    .hero-description {
      font-size: 1rem;
      color: var(--dm-text-secondary);
      line-height: 1.6;
      max-width: 760px;
      margin-bottom: 28px;
    }
    .hero-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Workflow Section */
    .workflow-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .section-heading h2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--dm-text-primary);
      letter-spacing: -0.015em;
    }
    .section-heading p {
      font-size: 0.9rem;
      color: var(--dm-text-secondary);
      margin-top: 3px;
      font-weight: 500;
    }
    .workflow-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .workflow-card {
      background: var(--dm-bg-surface);
      border: 1px solid var(--dm-border-subtle);
      border-radius: var(--dm-radius-lg);
      padding: 24px;
      position: relative;
      display: flex;
      flex-direction: column;
      box-shadow: var(--dm-shadow-xs);
      transition: transform 0.15s ease, box-shadow 0.15s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--dm-shadow-md);
      }
    }
    .step-num {
      position: absolute;
      top: 18px;
      right: 20px;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--dm-border-default);
      font-family: var(--dm-font-mono);
      line-height: 1;
    }
    .workflow-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--dm-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }
    .workflow-card h3 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--dm-text-primary);
      margin-bottom: 8px;
    }
    .workflow-card p {
      font-size: 0.84rem;
      color: var(--dm-text-secondary);
      line-height: 1.55;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .kpi-card {
      background: var(--dm-bg-surface);
      border: 1px solid var(--dm-border-subtle);
      border-radius: var(--dm-radius-lg);
      padding: 20px 22px;
      box-shadow: var(--dm-shadow-xs);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .kpi-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--dm-text-muted);
    }
    .kpi-icon-pill {
      width: 32px;
      height: 32px;
      border-radius: var(--dm-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
    .kpi-value {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--dm-text-primary);
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .kpi-sub {
      font-size: 0.75rem;
      color: var(--dm-text-faint);
    }

    /* Color Helpers */
    .icon-blue { background: #eff6ff; color: #2563eb; }
    .icon-green { background: #f0fdf4; color: #16a34a; }
    .icon-amber { background: #fffbeb; color: #d97706; }
    .icon-purple { background: #faf5ff; color: #9333ea; }

    .text-green { color: var(--dm-success); }
    .text-amber { color: var(--dm-warning); }

    /* Responsiveness */
    @media (max-width: 1024px) {
      .workflow-grid {
        grid-template-columns: 1fr;
      }
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .hero-section {
        padding: 24px 20px;
      }
      .hero-content h1 {
        font-size: 1.6rem;
      }
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private clarity = inject(ClarityService);

  public stats = signal<any | null>(null);

  ngOnInit(): void {
    this.clarity.init();
    this.clarity.trackEvent('page_view_home');
    this.loadData();
  }

  public loadData(): void {
    this.api.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats.set(res.stats);
        }
      }
    });
  }
}
