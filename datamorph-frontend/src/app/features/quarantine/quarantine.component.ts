import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService, QuarantineRecord } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ClarityService } from '../../core/services/clarity.service';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-quarantine',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    TranslatePipe
  ],
  template: `
    <div class="quarantine-container" data-clarity-mask="true">
      <!-- Quarantine Header -->
      <div class="quarantine-header">
        <div class="header-titles">
          <h2>{{ 'quarantine.title' | t }}</h2>
          <p class="subtitle">{{ 'quarantine.subtitle' | t }}</p>
        </div>

        <div class="header-actions">
          <mat-button-toggle-group [value]="filterStatus()" (change)="onFilterChange($event.value)">
            <mat-button-toggle value="ALL">{{ 'quarantine.filterAll' | t }}</mat-button-toggle>
            <mat-button-toggle value="PENDING">
              {{ 'quarantine.filterPending' | t }} ({{ pendingCount() }})
            </mat-button-toggle>
            <mat-button-toggle value="RESOLVED">
              {{ 'quarantine.filterResolved' | t }} ({{ resolvedCount() }})
            </mat-button-toggle>
          </mat-button-toggle-group>

          <button type="button" class="dm-icon-btn" (click)="loadRecords()" [title]="'common.refresh' | t" [attr.aria-label]="'common.refresh' | t">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Autonomous Explanatory Banner -->
      <div class="quarantine-guide-banner">
        <div class="banner-icon-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
            <path d="M9 21h6"/>
          </svg>
        </div>
        <div class="banner-text-content">
          <strong class="banner-title">{{ 'quarantine.guideTitle' | t }}</strong>
          <p class="banner-desc">{{ 'quarantine.guideNotice' | t }}</p>
        </div>
      </div>

      @if (isLoading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <!-- Main Quarantine Records Table Container -->
      <div class="dm-card quarantine-table-card">
        <div class="table-meta-bar">
          <div class="meta-left">
            <span class="meta-total">
              {{ 'quarantine.totalShown' | t }} <strong>{{ records().length }} {{ 'common.records' | t }}</strong>
            </span>
            @if (pendingCount() > 0) {
              <span class="dm-badge dm-badge-warning">
                <span class="dm-dot dot-warning"></span>
                {{ pendingCount() }} {{ 'quarantine.awaitingResolution' | t }}
              </span>
            }
          </div>
        </div>

        @if (records().length === 0 && !isLoading()) {
          <div class="empty-quarantine">
            <div class="empty-icon-wrap">
              <mat-icon>verified</mat-icon>
            </div>
            <h3>{{ 'quarantine.emptyTitle' | t }}</h3>
            <p>{{ 'quarantine.emptySubtitle' | t }}</p>
          </div>
        } @else {
          <div class="dm-table-region table-scroll-wrap" tabindex="0" role="region" [attr.aria-label]="'quarantine.title' | t">
            <table>
              <thead>
                <tr>
                  <th scope="col" style="width: 70px;">{{ 'quarantine.thRow' | t }}</th>
                  <th scope="col" style="width: 170px;">{{ 'quarantine.thFile' | t }}</th>
                  <th scope="col">{{ 'quarantine.thRawData' | t }}</th>
                  <th scope="col">{{ 'quarantine.thReason' | t }}</th>
                  <th scope="col" style="width: 110px;">{{ 'quarantine.thStatus' | t }}</th>
                  <th scope="col" style="width: 110px; text-align: center;">{{ 'quarantine.thActions' | t }}</th>
                </tr>
              </thead>
              <tbody>
                @for (rec of records(); track rec.id) {
                  <tr [class.is-resolved]="rec.resolution_status === 'RESOLVED'">
                    <td class="row-cell-num dm-font-mono">#{{ rec.source_row_number }}</td>
                    <td class="file-name-cell dm-font-mono">
                      {{ rec.batch?.original_filename || 'Arquivo' }}
                    </td>

                    <!-- Raw Data Chips -->
                    <td class="raw-data-cell">
                      <div class="raw-chips-flow">
                        @for (key of getRawKeys(rec.raw_data); track key) {
                          <span class="raw-data-pill">
                            <span class="raw-key">{{ key }}:</span>
                            <span class="raw-val dm-font-mono">{{ rec.raw_data[key] }}</span>
                          </span>
                        }
                      </div>
                    </td>

                    <!-- Error Callout / Resolution Notes -->
                    <td class="error-cell">
                      @if (rec.resolution_status === 'RESOLVED') {
                        <span class="dm-badge dm-badge-success">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">check_circle</mat-icon>
                          <span>{{ rec.resolution_notes || ('quarantine.resolvedBadge' | t) }}</span>
                        </span>
                      } @else {
                        <div class="error-stack">
                          @for (err of rec.error_details; track $index) {
                            <div class="error-pill">
                              <mat-icon>error_outline</mat-icon>
                              <div class="error-text-content">
                                <span>{{ err.message }}</span>
                                @if (err.field) {
                                  <span class="error-target-tag dm-font-mono">{{ err.field }}</span>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </td>

                    <!-- Status -->
                    <td>
                      @if (rec.resolution_status === 'RESOLVED') {
                        <span class="dm-badge dm-badge-success">
                          <span class="dm-dot dot-success"></span>
                          {{ rec.resolution_status }}
                        </span>
                      } @else {
                        <span class="dm-badge dm-badge-danger">
                          <span class="dm-dot dot-danger"></span>
                          {{ rec.resolution_status }}
                        </span>
                      }
                    </td>

                    <!-- Actions -->
                    <td class="action-cell">
                      @if (rec.resolution_status === 'PENDING') {
                        <button type="button" class="dm-btn dm-btn-primary dm-btn-sm" (click)="openDrawer(rec)">
                          <mat-icon>edit</mat-icon>
                          <span>{{ 'quarantine.btnFix' | t }}</span>
                        </button>
                      } @else {
                        <span class="approved-text">
                          <mat-icon>done</mat-icon>
                          <span>{{ 'quarantine.approvedTag' | t }}</span>
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Slide-Over Drawer for Precision Data Healing -->
      @if (editingRecord(); as rec) {
        <div class="drawer-backdrop" (click)="cancelEdit()">
          <div class="drawer-surface" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
            <div class="drawer-header">
              <div class="drawer-title-wrap">
                <span class="dm-badge dm-badge-primary dm-font-mono">
                  #{{ rec.source_row_number }}
                </span>
                <div>
                  <h3>{{ 'quarantine.drawerTitle' | t }}</h3>
                  <span class="drawer-sub dm-font-mono">{{ rec.batch?.original_filename || 'Arquivo' }}</span>
                </div>
              </div>
              <button type="button" class="dm-icon-btn" (click)="cancelEdit()" [attr.aria-label]="'common.close' | t">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="drawer-body">
              <!-- Inconsistencies Box -->
              <div class="drawer-alerts-card">
                <div class="alerts-header">
                  <mat-icon>report_problem</mat-icon>
                  <strong>{{ 'quarantine.inconsistenciesTitle' | t }}</strong>
                </div>
                <ul class="alerts-list">
                  @for (err of rec.error_details; track $index) {
                    <li>
                      <span>{{ err.message }}</span>
                      @if (err.field) {
                        <span class="field-badge dm-font-mono">{{ err.field }}</span>
                      }
                    </li>
                  }
                </ul>
              </div>

              <!-- Form Inputs -->
              <div class="drawer-form">
                <span class="form-title">{{ 'quarantine.formTitle' | t }}</span>
                @for (key of getRawKeys(editFormValues()); track key) {
                  <div class="dm-form-group">
                    <label class="dm-font-mono">{{ key }}</label>
                    <input
                      type="text"
                      class="dm-input dm-font-mono"
                      [(ngModel)]="editFormValues()[key]"
                    />
                  </div>
                }
              </div>
            </div>

            <div class="drawer-footer">
              <button type="button" class="dm-btn dm-btn-outline" (click)="cancelEdit()">
                {{ 'quarantine.btnCancel' | t }}
              </button>
              <button
                type="button"
                class="dm-btn dm-btn-primary"
                [disabled]="isSaving()"
                (click)="saveAndRevalidate(rec)"
              >
                <mat-icon>{{ isSaving() ? 'sync' : 'check_circle' }}</mat-icon>
                <span>{{ isSaving() ? ('quarantine.revalidating' | t) : ('quarantine.btnRevalidate' | t) }}</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .quarantine-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Header */
    .quarantine-header {
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
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Autonomous Guide Banner */
    .quarantine-guide-banner {
      background: #ffffff;
      border: 1px solid #bfdbfe;
      border-left: 4px solid var(--dm-primary);
      border-radius: var(--dm-radius-lg);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--dm-shadow-xs);
    }
    .banner-icon-badge {
      width: 40px;
      height: 40px;
      border-radius: var(--dm-radius-md);
      background: var(--dm-primary-subtle);
      border: 1px solid var(--dm-primary-border);
      color: var(--dm-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .banner-text-content {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .banner-title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--dm-text-primary);
      line-height: 1.3;
    }
    .banner-desc {
      font-size: 0.84rem;
      color: var(--dm-text-secondary);
      line-height: 1.5;
    }

    /* Table Card */
    .quarantine-table-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #ffffff;
      border: 1px solid var(--dm-border-default);
    }
    .table-meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--dm-border-subtle);
    }
    .meta-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .meta-total {
      font-size: 0.84rem;
      color: var(--dm-text-secondary);
    }

    /* Empty State */
    .empty-quarantine {
      padding: 56px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .empty-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--dm-success-bg);
      color: var(--dm-success);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }
    .empty-quarantine h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--dm-text-primary);
    }
    .empty-quarantine p {
      font-size: 0.875rem;
      color: var(--dm-text-muted);
      max-width: 460px;
    }

    /* Table Cells */
    .table-scroll-wrap {
      max-height: 600px;
    }
    .row-cell-num {
      color: var(--dm-text-secondary);
      font-weight: 700;
      font-size: 0.8rem;
    }
    .file-name-cell {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--dm-text-primary);
    }
    .raw-data-cell {
      min-width: 220px;
    }
    .raw-chips-flow {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .raw-data-pill {
      background: #ffffff;
      border: 1px solid var(--dm-border-default);
      border-radius: var(--dm-radius-xs);
      padding: 3px 7px;
      font-size: 0.75rem;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    }
    .raw-key {
      color: var(--dm-text-muted);
      font-weight: 700;
    }
    .raw-val {
      color: var(--dm-text-primary);
      font-weight: 600;
    }

    .error-cell {
      min-width: 240px;
    }
    .error-stack {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .error-pill {
      display: inline-flex;
      align-items: flex-start;
      gap: 6px;
      background: var(--dm-danger-bg);
      border: 1px solid var(--dm-danger-border);
      color: var(--dm-danger-text);
      border-radius: var(--dm-radius-sm);
      padding: 5px 8px;
      font-size: 0.75rem;
      line-height: 1.4;

      mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
        margin-top: 1px;
        flex-shrink: 0;
      }
    }
    .error-text-content {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }
    .error-target-tag {
      background: #ffffff;
      border: 1px solid var(--dm-danger-border);
      border-radius: var(--dm-radius-xs);
      padding: 1px 4px;
      font-size: 0.6875rem;
      color: var(--dm-danger);
    }

    .action-cell {
      text-align: center;
    }
    .approved-text {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.78rem;
      color: var(--dm-success);
      font-weight: 600;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    tr.is-resolved {
      background: #fbfdfb;
    }

    /* Slide-Over Drawer */
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      justify-content: flex-end;
      overscroll-behavior: contain;
    }
    .drawer-surface {
      width: 100%;
      max-width: 500px;
      height: 100%;
      background: var(--dm-bg-surface);
      box-shadow: var(--dm-shadow-xl);
      border-left: 1px solid var(--dm-border-default);
      display: flex;
      flex-direction: column;
      animation: slideInDrawer 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideInDrawer {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .drawer-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--dm-border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #fafbfd;
    }
    .drawer-title-wrap {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      h3 {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--dm-text-primary);
        line-height: 1.2;
      }
    }
    .drawer-sub {
      font-size: 0.75rem;
      color: var(--dm-text-muted);
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .drawer-alerts-card {
      background: var(--dm-danger-bg);
      border: 1px solid var(--dm-danger-border);
      border-radius: var(--dm-radius-md);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .alerts-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
      color: var(--dm-danger-text);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
    .alerts-list {
      margin: 0;
      padding-left: 20px;
      font-size: 0.8rem;
      color: var(--dm-danger-text);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .field-badge {
      background: #ffffff;
      border: 1px solid var(--dm-danger-border);
      padding: 1px 4px;
      border-radius: var(--dm-radius-xs);
      font-size: 0.7rem;
      margin-left: 4px;
    }

    .drawer-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .form-title {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--dm-text-secondary);
    }

    .drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--dm-border-subtle);
      background: #fafbfd;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class QuarantineComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private clarity = inject(ClarityService);
  public i18n = inject(I18nService);

  public isLoading = signal<boolean>(false);
  public isSaving = signal<boolean>(false);
  public filterStatus = signal<string>('ALL');
  public records = signal<QuarantineRecord[]>([]);
  public pendingCount = signal<number>(0);
  public resolvedCount = signal<number>(0);

  // Drawer state
  public editingRecord = signal<QuarantineRecord | null>(null);
  public editFormValues = signal<Record<string, any>>({});

  ngOnInit(): void {
    this.clarity.trackEvent('page_view_quarantine');
    this.loadRecords();
  }

  public loadRecords(): void {
    this.isLoading.set(true);
    this.api.getQuarantine(this.filterStatus()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.records.set(res.records);
          this.pendingCount.set(res.total_pending);
          this.resolvedCount.set(res.total_resolved);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error(this.i18n.t('toasts.serverErrorMsg'), this.i18n.t('toasts.serverErrorTitle'));
      }
    });
  }

  public onFilterChange(status: string): void {
    this.filterStatus.set(status);
    this.loadRecords();
  }

  public getRawKeys(rawData: Record<string, any>): string[] {
    return rawData ? Object.keys(rawData) : [];
  }

  public openDrawer(rec: QuarantineRecord): void {
    this.editingRecord.set(rec);
    this.editFormValues.set(JSON.parse(JSON.stringify(rec.raw_data)));
  }

  public cancelEdit(): void {
    this.editingRecord.set(null);
    this.editFormValues.set({});
  }

  public saveAndRevalidate(rec: QuarantineRecord): void {
    this.isSaving.set(true);
    const updatedRaw = this.editFormValues();

    this.api.updateQuarantineRecord(rec.id, updatedRaw).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (res.is_resolved) {
          rec.raw_data = updatedRaw;
          rec.resolution_status = 'RESOLVED';
          rec.resolution_notes = res.record.resolution_notes;
          rec.error_details = [];

          this.pendingCount.update(c => Math.max(0, c - 1));
          this.resolvedCount.update(c => c + 1);

          this.cancelEdit();
          this.toast.success(this.i18n.t('quarantine.successRevalidated'), this.i18n.t('common.success'));
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        const errorMsg = err.error?.message || 'O registro ainda contém inconsistências.';
        if (err.error?.errors) {
          rec.error_details = err.error.errors;
        }
        this.toast.error(errorMsg, this.i18n.t('common.error'));
      }
    });
  }
}
