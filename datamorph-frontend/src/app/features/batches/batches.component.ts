import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService, BatchItem } from '../../core/services/api.service';
import { ClarityService } from '../../core/services/clarity.service';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-batches',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatProgressBarModule,
    TranslatePipe
  ],
  template: `
    <div class="batches-container" data-clarity-mask="true">
      <!-- Header -->
      <div class="batches-header">
        <div class="header-titles">
          <h2>{{ 'batches.title' | t }}</h2>
          <p class="subtitle">{{ 'batches.subtitle' | t }}</p>
        </div>
        <div>
          <button type="button" class="dm-icon-btn" (click)="loadBatches()" [title]="'common.refresh' | t" [attr.aria-label]="'common.refresh' | t">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <!-- Normalized Data Preview Modal -->
      @if (previewModalOpen()) {
        <div class="dm-modal-backdrop" (click)="closePreview()">
          <div class="dm-modal-card modal-wide" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
            <div class="dm-modal-header">
              <div class="modal-title-wrap">
                <mat-icon class="icon-primary">table_view</mat-icon>
                <h3>{{ 'batches.btnPreview' | t }}</h3>
              </div>
              <button type="button" class="dm-icon-btn" (click)="closePreview()" [attr.aria-label]="'common.close' | t">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="dm-modal-body">
              @if (previewLoading()) {
                <mat-progress-bar mode="indeterminate"></mat-progress-bar>
              } @else if (previewRows().length === 0) {
                <div class="empty-preview-box">
                  <mat-icon>inbox</mat-icon>
                  <p>{{ 'studio.emptyPreview' | t }}</p>
                </div>
              } @else {
                <div class="dm-table-region modal-table-scroll" tabindex="0" role="region">
                  <table>
                    <thead>
                      <tr>
                        @for (col of previewColumns(); track col) {
                          <th scope="col" class="dm-font-mono">{{ col }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of previewRows(); track $index) {
                        <tr [class.highlight-resolved]="row['_status'] === 'RESOLVIDO_QUARENTENA'">
                          @for (col of previewColumns(); track col) {
                            <td class="dm-font-mono">{{ row[col] ?? '—' }}</td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <div class="dm-modal-footer">
              @if (currentPreviewBatchId(); as batchId) {
                <button type="button" class="dm-btn dm-btn-primary dm-btn-sm" (click)="downloadExport(batchId, 'lote', 'csv')">
                  <mat-icon>download</mat-icon>
                  <span>{{ 'common.downloadCsv' | t }}</span>
                </button>
                <button type="button" class="dm-btn dm-btn-outline dm-btn-sm" (click)="downloadExport(batchId, 'lote', 'xlsx')">
                  <mat-icon>download</mat-icon>
                  <span>{{ 'common.downloadXlsx' | t }}</span>
                </button>
              }
              <button type="button" class="dm-btn dm-btn-outline dm-btn-sm" (click)="closePreview()">
                {{ 'common.close' | t }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (batches().length === 0 && !isLoading()) {
        <div class="dm-card empty-batches-card">
          <div class="empty-icon-wrap">
            <mat-icon>history_toggle_off</mat-icon>
          </div>
          <h3>{{ 'batches.emptyTitle' | t }}</h3>
          <p>{{ 'batches.emptySubtitle' | t }}</p>
          <a routerLink="/studio" class="dm-btn dm-btn-primary dm-btn-md">
            <mat-icon>add</mat-icon>
            <span>{{ 'batches.btnGoToStudio' | t }}</span>
          </a>
        </div>
      } @else {
        <div class="batches-stack">
          @for (batch of batches(); track batch.id) {
            <div class="dm-card batch-item-card">
              <div class="batch-top-row">
                <div class="batch-identity">
                  <div class="batch-file-icon">
                    <mat-icon>inventory_2</mat-icon>
                  </div>
                  <div>
                    <h3 class="filename dm-font-mono">{{ batch.original_filename }}</h3>
                    <span class="pipeline-tag">{{ batch.pipeline?.name || 'Pipeline Padrão Corporativo' }}</span>
                  </div>
                </div>

                <div class="status-wrap">
                  <span class="dm-badge" [ngClass]="getStatusBadgeClass(batch.status)">
                    <span class="dm-dot" [ngClass]="getStatusDotClass(batch.status)"></span>
                    {{ batch.status }}
                  </span>
                </div>
              </div>

              <!-- Batch Statistics Strip -->
              <div class="batch-metrics-strip">
                <div class="metric-block">
                  <span class="metric-label">{{ 'batches.thTotal' | t }}</span>
                  <span class="metric-value dm-font-mono">{{ batch.total_rows | number }}</span>
                </div>
                <div class="metric-block">
                  <span class="metric-label">{{ 'batches.thApproved' | t }}</span>
                  <span class="metric-value text-green dm-font-mono">{{ batch.success_rows | number }}</span>
                </div>
                <div class="metric-block">
                  <span class="metric-label">{{ 'batches.thQuarantine' | t }}</span>
                  <span class="metric-value text-amber dm-font-mono">{{ batch.quarantined_rows | number }}</span>
                </div>
              </div>

              <!-- Batch Footer with Metadata and Actions -->
              <div class="batch-footer-row">
                <div class="date-meta">
                  <mat-icon>schedule</mat-icon>
                  <span>{{ batch.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>

                <div class="batch-actions">
                  <button type="button" class="dm-btn dm-btn-outline dm-btn-sm" (click)="openPreview(batch.id)">
                    <mat-icon>table_view</mat-icon>
                    <span>{{ 'batches.btnPreview' | t }}</span>
                  </button>
                  <button type="button" class="dm-btn dm-btn-primary dm-btn-sm" (click)="downloadExport(batch.id, batch.original_filename, 'csv')">
                    <mat-icon>download</mat-icon>
                    <span>{{ 'batches.btnDownloadCsv' | t }}</span>
                  </button>
                  <button type="button" class="dm-btn dm-btn-outline dm-btn-sm" (click)="downloadExport(batch.id, batch.original_filename, 'xlsx')">
                    <mat-icon>download</mat-icon>
                    <span>{{ 'batches.btnDownloadXlsx' | t }}</span>
                  </button>
                  @if (batch.quarantined_rows > 0) {
                    <a routerLink="/quarantine" [queryParams]="{batch_id: batch.id}" class="dm-btn dm-btn-danger dm-btn-sm">
                      <mat-icon>shield_alert</mat-icon>
                      <span>{{ 'batches.btnViewQuarantine' | t }} ({{ batch.quarantined_rows }})</span>
                    </a>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .batches-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .batches-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .header-titles h2 {
      font-size: 1.625rem;
      font-weight: 800;
      color: var(--dm-text-primary);
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 0.875rem;
      color: var(--dm-text-secondary);
      margin-top: 2px;
      font-weight: 500;
    }

    /* Empty State */
    .empty-batches-card {
      padding: 56px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .empty-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--dm-bg-subtle);
      color: var(--dm-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      mat-icon {
        font-size: 30px;
        width: 30px;
        height: 30px;
      }
    }
    .empty-batches-card h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--dm-text-primary);
    }
    .empty-batches-card p {
      font-size: 0.875rem;
      color: var(--dm-text-muted);
      max-width: 480px;
      margin-bottom: 8px;
    }

    /* Batches Stack */
    .batches-stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .batch-item-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.15s ease;

      &:hover {
        box-shadow: var(--dm-shadow-md);
      }
    }

    .batch-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .batch-identity {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .batch-file-icon {
      width: 42px;
      height: 42px;
      border-radius: var(--dm-radius-md);
      background: var(--dm-primary-subtle);
      border: 1px solid var(--dm-primary-border);
      color: var(--dm-primary);
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }
    .filename {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--dm-text-primary);
      margin: 0;
    }
    .pipeline-tag {
      font-size: 0.78rem;
      color: var(--dm-text-secondary);
      font-weight: 500;
    }

    /* Metrics Strip */
    .batch-metrics-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 14px 18px;
      background: #ffffff;
      border: 1px solid var(--dm-border-default);
      border-radius: var(--dm-radius-md);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .metric-block {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .metric-label {
      font-size: 0.78rem;
      color: var(--dm-text-secondary);
      font-weight: 600;
    }
    .metric-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--dm-text-primary);
    }
    .text-green { color: var(--dm-success); }
    .text-amber { color: var(--dm-warning); }

    /* Footer Row */
    .batch-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--dm-border-subtle);
    }
    .date-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
      color: var(--dm-text-secondary);
      font-weight: 500;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
    .batch-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* Modal Layout */
    .dm-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overscroll-behavior: contain;
    }
    .dm-modal-card {
      background: var(--dm-bg-surface);
      border: 1px solid var(--dm-border-default);
      border-radius: var(--dm-radius-xl);
      box-shadow: var(--dm-shadow-xl);
      width: 100%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .modal-wide {
      max-width: 900px;
    }
    .dm-modal-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--dm-border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fafbfd;

      h3 {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--dm-text-primary);
      }
    }
    .modal-title-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .icon-primary { color: var(--dm-primary); }
    .dm-modal-body {
      padding: 24px;
      overflow-y: auto;
    }
    .dm-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--dm-border-subtle);
      background: #fafbfd;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .modal-table-scroll {
      max-height: 420px;
    }
    .empty-preview-box {
      padding: 48px 24px;
      text-align: center;
      color: var(--dm-text-muted);

      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: var(--dm-text-faint);
        margin-bottom: 8px;
      }
    }
    tr.highlight-resolved {
      background: var(--dm-success-bg);
    }
  `]
})
export class BatchesComponent implements OnInit {
  public api = inject(ApiService);
  private clarity = inject(ClarityService);
  public i18n = inject(I18nService);

  public isLoading = signal<boolean>(false);
  public batches = signal<BatchItem[]>([]);

  // Preview Modal
  public previewModalOpen = signal<boolean>(false);
  public previewLoading = signal<boolean>(false);
  public currentPreviewBatchId = signal<string | null>(null);
  public previewColumns = signal<string[]>([]);
  public previewRows = signal<Record<string, any>[]>([]);

  ngOnInit(): void {
    this.clarity.trackEvent('page_view_batches');
    this.loadBatches();
  }

  public loadBatches(): void {
    this.isLoading.set(true);
    this.api.getBatches().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.batches.set(res.batches);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  public getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'dm-badge-success';
      case 'PROCESSING': return 'dm-badge-info';
      case 'WARNING': return 'dm-badge-warning';
      case 'FAILED': return 'dm-badge-danger';
      default: return 'dm-badge-neutral';
    }
  }

  public getStatusDotClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'dot-success';
      case 'PROCESSING': return 'dot-primary';
      case 'WARNING': return 'dot-warning';
      case 'FAILED': return 'dot-danger';
      default: return 'dot-primary';
    }
  }

  public openPreview(batchId: string): void {
    this.currentPreviewBatchId.set(batchId);
    this.previewModalOpen.set(true);
    this.previewLoading.set(true);

    this.api.getBatchPreview(batchId).subscribe({
      next: (res) => {
        this.previewLoading.set(false);
        if (res.success) {
          this.previewColumns.set(res.columns);
          this.previewRows.set(res.rows);
        }
      },
      error: () => {
        this.previewLoading.set(false);
      }
    });
  }

  public closePreview(): void {
    this.previewModalOpen.set(false);
    this.currentPreviewBatchId.set(null);
    this.previewRows.set([]);
  }

  public downloadExport(batchId: string, filename: string, format: 'csv' | 'xlsx'): void {
    this.api.downloadBatchExport(batchId, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanName = filename.replace(/\.[^/.]+$/, "");
        a.download = `${cleanName}_normalizado.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        // Fallback or notification
      }
    });
  }
}
