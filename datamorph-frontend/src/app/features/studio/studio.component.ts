import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ClarityService } from '../../core/services/clarity.service';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

interface TargetFieldDef {
  id: string;
  key: string;
  label: string;
  type: string;
  selectedSource: string;
  transformers: string[];
}

export interface RuleDefinition {
  key: string;
  labelKey: string;
  tooltipKey: string;
  icon: string;
  isCustom?: boolean;
  customLabel?: string;
  customTooltip?: string;
  customType?: 'regex' | 'length' | 'range' | 'replace';
  options?: Record<string, any>;
}

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslatePipe
  ],
  template: `
    <div class="studio-container" data-clarity-mask="true">
      <!-- Studio Header & Step Indicator -->
      <div class="studio-header">
        <div class="header-titles">
          <h2>{{ 'studio.title' | t }}</h2>
          <p class="subtitle">{{ 'studio.subtitle' | t }}</p>
        </div>

        @if (currentFilename()) {
          <div class="header-actions">
            <button type="button" class="dm-btn dm-btn-outline dm-btn-sm" (click)="resetFile()" [disabled]="isProcessing()">
              <mat-icon>refresh</mat-icon>
              <span>{{ 'studio.btnChangeFile' | t }}</span>
            </button>
            <button
              type="button"
              class="dm-btn dm-btn-primary dm-btn-sm"
              (click)="processBatch()"
              [disabled]="isProcessing()"
            >
              <mat-icon>{{ isProcessing() ? 'hourglass_top' : 'play_arrow' }}</mat-icon>
              <span>{{ isProcessing() ? ('studio.processing' | t) : ('studio.btnProcess' | t) }}</span>
            </button>
          </div>
        }
      </div>

      <!-- STATE 1: BEFORE UPLOAD (Universal Drag-and-Drop & Guided Autonomy) -->
      @if (!currentFilename()) {
        <div class="upload-zone-wrapper">
          <div
            class="upload-dropzone"
            [class.drag-over]="isDraggingOver()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onFileDrop($event)"
          >
            <div class="dropzone-icon">
              <mat-icon>cloud_upload</mat-icon>
            </div>
            <h3>{{ 'studio.uploadTitle' | t }}</h3>
            <p class="dropzone-sub">
              {{ 'studio.uploadSubtitle' | t }}
            </p>

            <div class="format-badges">
              <span class="dm-badge dm-badge-neutral">.CSV</span>
              <span class="dm-badge dm-badge-neutral">.XLSX</span>
              <span class="dm-badge dm-badge-neutral">.TXT</span>
            </div>

            <div class="upload-actions">
              <input
                type="file"
                #fileInput
                (change)="onFileSelected($event)"
                accept=".csv,.xlsx,.txt"
                style="display: none"
              />
              <button type="button" class="dm-btn dm-btn-primary dm-btn-lg" (click)="fileInput.click()">
                <mat-icon>folder_open</mat-icon>
                <span>{{ 'studio.btnBrowseFile' | t }}</span>
              </button>
            </div>

            <p class="dropzone-hint">
              <mat-icon>info</mat-icon>
              <span>{{ 'studio.dropzoneHint' | t }}</span>
            </p>
          </div>

          <!-- In-App Guidance for User Autonomy (Replaces external sample spreadsheets) -->
          <div class="guidance-cards-grid">
            <div class="guidance-card">
              <div class="guidance-num">1</div>
              <div class="guidance-text-wrap">
                <h4>{{ 'studio.guidance1Title' | t }}</h4>
                <p>{{ 'studio.guidance1Desc' | t }}</p>
              </div>
            </div>
            <div class="guidance-card">
              <div class="guidance-num">2</div>
              <div class="guidance-text-wrap">
                <h4>{{ 'studio.guidance2Title' | t }}</h4>
                <p>{{ 'studio.guidance2Desc' | t }}</p>
              </div>
            </div>
            <div class="guidance-card">
              <div class="guidance-num">3</div>
              <div class="guidance-text-wrap">
                <h4>{{ 'studio.guidance3Title' | t }}</h4>
                <p>{{ 'studio.guidance3Desc' | t }}</p>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Progress Bar during inspection -->
      @if (isInspecting()) {
        <div class="inspecting-box">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <span class="inspecting-text">
            <mat-icon>sync</mat-icon>
            {{ 'studio.inspecting' | t }}
          </span>
        </div>
      }

      <!-- STATE 2: ACTIVE WORKSPACE AFTER UPLOAD -->
      @if (currentFilename()) {
        <!-- File Summary Bar -->
        <div class="file-summary-strip">
          <div class="file-info-group">
            <div class="file-icon-badge">
              <mat-icon>description</mat-icon>
            </div>
            <div>
              <span class="file-tag">{{ 'studio.fileLoaded' | t }}</span>
              <strong class="file-title dm-font-mono">{{ currentFilename() }}</strong>
            </div>
          </div>
          <div class="file-meta-pills">
            <span class="dm-badge dm-badge-neutral dm-font-mono">
              {{ inspectedColumns().length }} {{ 'studio.columnsDetected' | t }}
            </span>
          </div>
        </div>

        <!-- Outcome Banner (after batch processed) -->
        @if (lastBatchResult(); as res) {
          <div class="outcome-strip" [class.has-quarantine]="res.stats.quarantined_rows > 0">
            <div class="outcome-left">
              <div class="outcome-status-icon">
                <mat-icon>{{ res.stats.quarantined_rows > 0 ? 'warning' : 'check_circle' }}</mat-icon>
              </div>
              <div>
                <strong class="outcome-title">{{ 'studio.outcomeSuccess' | t }}</strong>
                <span class="outcome-id dm-font-mono">{{ 'studio.outcomeBatchId' | t }} {{ res.batch.id }}</span>
              </div>
            </div>

            <div class="outcome-metrics">
              <div class="metric-pill">
                <span class="m-label">{{ 'studio.outcomeTotal' | t }}</span>
                <strong class="m-val">{{ res.stats.total_rows }}</strong>
              </div>
              <div class="metric-pill text-green">
                <span class="m-label">{{ 'studio.outcomeApproved' | t }}</span>
                <strong class="m-val">{{ res.stats.success_rows }}</strong>
              </div>
              <div class="metric-pill text-amber">
                <span class="m-label">{{ 'studio.outcomeQuarantine' | t }}</span>
                <strong class="m-val">{{ res.stats.quarantined_rows }}</strong>
              </div>
              <div class="metric-pill">
                <span class="m-label">{{ 'studio.outcomeRate' | t }}</span>
                <strong class="m-val">{{ res.stats.success_rate }}%</strong>
              </div>
            </div>

            <div class="outcome-actions">
              <button type="button" class="dm-btn dm-btn-outline dm-btn-sm" (click)="openPreview(res.batch.id)">
                <mat-icon>table_view</mat-icon>
                <span>{{ 'studio.btnViewTable' | t }}</span>
              </button>
              <button type="button" class="dm-btn dm-btn-primary dm-btn-sm" (click)="downloadExport(res.batch.id, 'csv')">
                <mat-icon>download</mat-icon>
                <span>{{ 'common.downloadCsv' | t }}</span>
              </button>
              <button type="button" class="dm-btn dm-btn-outline dm-btn-sm" (click)="downloadExport(res.batch.id, 'xlsx')">
                <mat-icon>download</mat-icon>
                <span>{{ 'common.downloadXlsx' | t }}</span>
              </button>
              @if (res.stats.quarantined_rows > 0) {
                <button type="button" class="dm-btn dm-btn-danger dm-btn-sm" (click)="goToQuarantine()">
                  <mat-icon>shield_alert</mat-icon>
                  <span>{{ 'studio.btnGoToQuarantine' | t }} ({{ res.stats.quarantined_rows }})</span>
                </button>
              }
            </div>
          </div>
        }

        <!-- Split Workspace Grid -->
        <div class="workspace-grid">
          <!-- Left Panel: Original Ingested Data -->
          <div class="workspace-panel dm-card">
            <div class="panel-header">
              <div class="panel-title">
                <mat-icon>view_column</mat-icon>
                <span>{{ 'studio.sourcePanelTitle' | t }}</span>
              </div>
            </div>

            <div class="panel-content">
              <span class="panel-sub-label">{{ 'studio.sourcePanelSubtitle' | t }}</span>
              <div class="detected-chips-flow">
                @for (col of inspectedColumns(); track col) {
                  <span class="column-chip dm-font-mono">
                    <mat-icon>grid_on</mat-icon>
                    <span>{{ col }}</span>
                  </span>
                }
              </div>

              <!-- Raw Sample Data Table -->
              <div class="sample-data-section">
                <span class="panel-sub-label">{{ 'studio.sampleDataTitle' | t }}</span>
                <div class="dm-table-region" tabindex="0" role="region" [attr.aria-label]="'studio.sampleDataTitle' | t">
                  <table>
                    <thead>
                      <tr>
                        @for (col of inspectedColumns(); track col) {
                          <th scope="col" class="dm-font-mono">{{ col }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of sampleRows(); track $index) {
                        <tr>
                          @for (col of inspectedColumns(); track col) {
                            <td class="dm-font-mono">{{ row[col] ?? '—' }}</td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel: Target Schema & Rules Configuration -->
          <div class="workspace-panel dm-card">
            <div class="panel-header panel-header-actions">
              <div class="panel-title">
                <mat-icon>tune</mat-icon>
                <span>{{ 'studio.targetPanelTitle' | t }}</span>
              </div>
              <div class="panel-toolbar">
                <button type="button" class="dm-btn dm-btn-outline dm-btn-sm" (click)="openCustomRuleModal()">
                  <mat-icon>add</mat-icon>
                  <span>{{ 'studio.btnNewRule' | t }}</span>
                </button>
                <button type="button" class="dm-btn dm-btn-outline dm-btn-sm" (click)="mapAllColumnsExact()">
                  <mat-icon>auto_mode</mat-icon>
                  <span>{{ 'studio.btnMapExact' | t }}</span>
                </button>
                <button type="button" class="dm-btn dm-btn-outline dm-btn-sm" (click)="addNewField()">
                  <mat-icon>add</mat-icon>
                  <span>{{ 'studio.btnNewField' | t }}</span>
                </button>
              </div>
            </div>

            <div class="panel-content">
              <div class="target-fields-stack">
                @for (field of targetFields(); track field.id; let i = $index) {
                  <div class="field-mapping-card">
                    <div class="field-top-row">
                      <div class="field-inputs-wrap">
                        <div class="field-input-box">
                          <span class="field-input-tag">{{ 'studio.columnLabel' | t }}</span>
                          <input
                            type="text"
                            class="dm-input dm-input-sm field-name-input"
                            [(ngModel)]="field.label"
                            [placeholder]="'studio.columnNamePlaceholder' | t"
                          />
                        </div>
                        <div class="field-input-box">
                          <span class="field-input-tag">{{ 'studio.columnKey' | t }}</span>
                          <input
                            type="text"
                            class="dm-input dm-input-sm dm-font-mono field-key-input"
                            [(ngModel)]="field.key"
                            [placeholder]="'studio.columnKeyPlaceholder' | t"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        class="field-delete-btn"
                        (click)="removeField(i)"
                        [title]="'common.delete' | t"
                        [attr.aria-label]="'common.delete' | t"
                      >
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>

                    <div class="field-select-row">
                      <label class="field-select-label">{{ 'studio.fieldSourceLabel' | t }}</label>
                      <select class="dm-select dm-font-mono" [(ngModel)]="field.selectedSource">
                        <option value="">{{ 'studio.unmappedOption' | t }}</option>
                        @for (col of inspectedColumns(); track col) {
                          <option [value]="col">{{ col }}</option>
                        }
                      </select>
                    </div>

                    <!-- Rules Toggles Flow -->
                    <div class="field-rules-row">
                      <span class="rules-hint-label">{{ 'studio.activeRulesLabel' | t }}</span>
                      <div class="rules-chips-list">
                        @for (rule of allRules(); track rule.key) {
                          <button
                            type="button"
                            class="rule-pill-btn"
                            [class.is-active]="hasTransformer(field, rule.key)"
                            [class.is-custom]="rule.isCustom"
                            (click)="toggleTransformer(field, rule.key)"
                            [matTooltip]="getRuleTooltip(rule)"
                          >
                            <mat-icon>{{ hasTransformer(field, rule.key) ? 'check' : (rule.isCustom ? 'star' : 'add') }}</mat-icon>
                            <span>{{ getRuleLabel(rule) }}</span>
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Custom Rule Creation Modal -->
      @if (customRuleModalOpen()) {
        <div class="dm-modal-backdrop" (click)="closeCustomRuleModal()">
          <div class="dm-modal-card" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
            <div class="dm-modal-header">
              <h3>{{ 'studio.customRuleModalTitle' | t }}</h3>
              <button type="button" class="dm-icon-btn" (click)="closeCustomRuleModal()" [attr.aria-label]="'common.close' | t">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="dm-modal-body">
              <div class="dm-form-group">
                <label>{{ 'studio.ruleNameLabel' | t }}</label>
                <input
                  type="text"
                  class="dm-input"
                  [(ngModel)]="newRuleName"
                  [placeholder]="'studio.ruleNamePlaceholder' | t"
                />
              </div>

              <div class="dm-form-group">
                <label>{{ 'studio.ruleTypeLabel' | t }}</label>
                <select class="dm-select" [(ngModel)]="newRuleType">
                  <option value="regex">{{ 'studio.ruleTypeRegex' | t }}</option>
                  <option value="replace">{{ 'studio.ruleTypeReplace' | t }}</option>
                  <option value="length">{{ 'studio.ruleTypeLength' | t }}</option>
                  <option value="range">{{ 'studio.ruleTypeRange' | t }}</option>
                </select>
              </div>

              @if (newRuleType === 'regex') {
                <div class="dm-form-group">
                  <label>{{ 'studio.rulePatternLabel' | t }}</label>
                  <input
                    type="text"
                    class="dm-input dm-font-mono"
                    [(ngModel)]="newRulePattern"
                    placeholder="^[0-9]{8}$"
                  />
                  <span class="field-hint">{{ 'studio.rulePatternHint' | t }}</span>
                </div>
              }

              @if (newRuleType === 'replace') {
                <div class="form-grid-2">
                  <div class="dm-form-group">
                    <label>{{ 'studio.ruleSearchLabel' | t }}</label>
                    <input
                      type="text"
                      class="dm-input"
                      [(ngModel)]="newRuleSearch"
                      [placeholder]="'studio.ruleSearchPlaceholder' | t"
                    />
                  </div>
                  <div class="dm-form-group">
                    <label>{{ 'studio.ruleReplaceLabel' | t }}</label>
                    <input
                      type="text"
                      class="dm-input"
                      [(ngModel)]="newRuleReplace"
                      [placeholder]="'studio.ruleReplacePlaceholder' | t"
                    />
                  </div>
                </div>
                <div class="checkbox-option-wrap">
                  <label class="dm-checkbox-label">
                    <input type="checkbox" [(ngModel)]="newRuleCaseSensitive" />
                    <span>{{ 'studio.ruleCaseSensitiveLabel' | t }}</span>
                  </label>
                </div>
              }

              @if (newRuleType === 'length') {
                <div class="form-grid-2">
                  <div class="dm-form-group">
                    <label>{{ 'studio.ruleLengthExact' | t }}</label>
                    <input type="number" class="dm-input" [(ngModel)]="newRuleExactLength" placeholder="8" />
                  </div>
                  <div class="dm-form-group">
                    <label>{{ 'studio.ruleLengthMin' | t }}</label>
                    <input type="number" class="dm-input" [(ngModel)]="newRuleMinLength" placeholder="3" />
                  </div>
                </div>
              }

              @if (newRuleType === 'range') {
                <div class="form-grid-2">
                  <div class="dm-form-group">
                    <label>{{ 'studio.ruleRangeMin' | t }}</label>
                    <input type="number" class="dm-input" [(ngModel)]="newRuleMinVal" placeholder="0" />
                  </div>
                  <div class="dm-form-group">
                    <label>{{ 'studio.ruleRangeMax' | t }}</label>
                    <input type="number" class="dm-input" [(ngModel)]="newRuleMaxVal" placeholder="100000" />
                  </div>
                </div>
              }

              <div class="dm-form-group">
                <label>{{ 'studio.ruleMessageLabel' | t }}</label>
                <input
                  type="text"
                  class="dm-input"
                  [(ngModel)]="newRuleMessage"
                  [placeholder]="'studio.ruleMessagePlaceholder' | t"
                />
              </div>
            </div>

            <div class="dm-modal-footer">
              <button type="button" class="dm-btn dm-btn-outline" (click)="closeCustomRuleModal()">
                {{ 'common.cancel' | t }}
              </button>
              <button type="button" class="dm-btn dm-btn-primary" (click)="saveCustomRule()">
                <mat-icon>check</mat-icon>
                <span>{{ 'studio.btnSaveRule' | t }}</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Normalized Data Preview Modal -->
      @if (previewModalOpen()) {
        <div class="dm-modal-backdrop" (click)="closePreview()">
          <div class="dm-modal-card modal-wide" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
            <div class="dm-modal-header">
              <div class="modal-title-wrap">
                <mat-icon class="icon-primary">table_view</mat-icon>
                <h3>{{ 'studio.previewModalTitle' | t }}</h3>
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
                        <tr>
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
                <button type="button" class="dm-btn dm-btn-primary dm-btn-sm" (click)="downloadExport(batchId, 'csv')">
                  <mat-icon>download</mat-icon>
                  <span>{{ 'common.downloadCsv' | t }}</span>
                </button>
                <button type="button" class="dm-btn dm-btn-outline dm-btn-sm" (click)="downloadExport(batchId, 'xlsx')">
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
    </div>
  `,
  styles: [`
    .studio-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Studio Header */
    .studio-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 8px;
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
      gap: 10px;
    }

    /* STATE 1: Universal Drag-and-Drop Zone */
    .upload-zone-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .upload-dropzone {
      background: var(--dm-bg-surface);
      border: 2px dashed var(--dm-border-default);
      border-radius: var(--dm-radius-xl);
      padding: 56px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 14px;
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover, &.drag-over {
        border-color: var(--dm-primary);
        background: #fcfdfe;
      }
    }
    .dropzone-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--dm-primary-subtle);
      color: var(--dm-primary);
      border: 1px solid var(--dm-primary-border);
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }
    .upload-dropzone h3 {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--dm-text-primary);
      margin-top: 4px;
    }
    .dropzone-sub {
      font-size: 0.9375rem;
      color: var(--dm-text-secondary);
      max-width: 520px;
    }
    .format-badges {
      display: flex;
      gap: 8px;
    }
    .upload-actions {
      margin-top: 6px;
    }
    .dropzone-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
      color: var(--dm-text-secondary);
      font-weight: 500;
      margin-top: 8px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    /* In-App Guidance Cards */
    .guidance-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .guidance-card {
      background: #ffffff;
      border: 1px solid var(--dm-border-default);
      border-radius: var(--dm-radius-lg);
      padding: 20px 22px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      box-shadow: var(--dm-shadow-xs);
      transition: all 0.15s ease;

      &:hover {
        border-color: var(--dm-border-strong);
        box-shadow: var(--dm-shadow-sm);
      }
    }
    .guidance-num {
      width: 32px;
      height: 32px;
      border-radius: var(--dm-radius-md);
      background: var(--dm-primary);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
    }
    .guidance-text-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .guidance-card h4 {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--dm-text-primary);
      line-height: 1.3;
    }
    .guidance-card p {
      font-size: 0.84rem;
      color: var(--dm-text-secondary);
      line-height: 1.5;
    }

    /* Inspecting Box */
    .inspecting-box {
      background: var(--dm-bg-surface);
      border: 1px solid var(--dm-border-subtle);
      border-radius: var(--dm-radius-md);
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .inspecting-text {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.84rem;
      color: var(--dm-text-secondary);
      font-weight: 500;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--dm-primary);
        animation: spin 1.5s linear infinite;
      }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* File Summary Strip */
    .file-summary-strip {
      background: var(--dm-bg-surface);
      border: 1px solid var(--dm-border-subtle);
      border-radius: var(--dm-radius-lg);
      padding: 14px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--dm-shadow-xs);
    }
    .file-info-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .file-icon-badge {
      width: 36px;
      height: 36px;
      border-radius: var(--dm-radius-md);
      background: var(--dm-primary-subtle);
      color: var(--dm-primary);
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
    .file-tag {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--dm-text-muted);
      letter-spacing: 0.05em;
      display: block;
    }
    .file-title {
      font-size: 0.9375rem;
      color: var(--dm-text-primary);
    }

    /* Outcome Strip */
    .outcome-strip {
      background: var(--dm-success-bg);
      border: 1px solid var(--dm-success-border);
      border-radius: var(--dm-radius-lg);
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .outcome-strip.has-quarantine {
      background: #fffdf5;
      border-color: #fde68a;
    }
    .outcome-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .outcome-status-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ffffff;
      color: var(--dm-success);
      border: 1px solid var(--dm-success-border);
      display: flex;
      align-items: center;
      justify-content: center;

      .has-quarantine & {
        color: var(--dm-warning);
        border-color: var(--dm-warning-border);
      }

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }
    .outcome-title {
      font-size: 0.9375rem;
      color: var(--dm-text-primary);
      display: block;
    }
    .outcome-id {
      font-size: 0.75rem;
      color: var(--dm-text-muted);
    }
    .outcome-metrics {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .metric-pill {
      background: var(--dm-bg-surface);
      border: 1px solid var(--dm-border-default);
      border-radius: var(--dm-radius-sm);
      padding: 5px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
    }
    .m-label {
      color: var(--dm-text-muted);
    }
    .m-val {
      font-weight: 700;
    }
    .text-green { color: var(--dm-success); }
    .text-amber { color: var(--dm-warning); }
    .outcome-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* Workspace Grid */
    .workspace-grid {
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: 20px;
    }
    .workspace-panel {
      display: flex;
      flex-direction: column;
    }
    .panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--dm-border-subtle);
      background: #fbfcfd;
    }
    .panel-header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--dm-text-primary);

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--dm-primary);
      }
    }
    .panel-toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .panel-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .panel-sub-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--dm-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Column chips */
    .detected-chips-flow {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .column-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #ffffff;
      border: 1px solid var(--dm-border-default);
      border-radius: var(--dm-radius-sm);
      padding: 4px 9px;
      font-size: 0.775rem;
      color: var(--dm-text-primary);
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: var(--dm-primary);
      }
    }

    /* Sample data section */
    .sample-data-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 4px;
    }
    .sample-data-section .dm-table-region {
      max-height: 290px;
    }

    /* Target Fields Stack */
    .target-fields-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .field-mapping-card {
      background: #ffffff;
      border: 1px solid var(--dm-border-default);
      border-radius: var(--dm-radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;

      &:hover {
        border-color: var(--dm-border-strong);
        box-shadow: var(--dm-shadow-xs);
      }
    }
    .field-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .field-inputs-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      flex-wrap: wrap;
    }
    .field-input-box {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 170px;
    }
    .field-input-tag {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--dm-text-muted);
      white-space: nowrap;
    }
    .field-name-input {
      font-weight: 600;
      color: var(--dm-text-primary);
      background: #ffffff;
      height: 32px;
      font-size: 0.8125rem;
    }
    .field-key-input {
      font-size: 0.8125rem;
      color: var(--dm-text-secondary);
      background: #f8fafc;
      height: 32px;
    }
    .checkbox-option-wrap {
      display: flex;
      align-items: center;
      padding: 4px 0;
    }
    .dm-checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--dm-text-primary);
      cursor: pointer;
      font-weight: 500;
    }
    .field-delete-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--dm-text-faint);
      padding: 4px;
      border-radius: var(--dm-radius-xs);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;

      &:hover {
        color: var(--dm-danger);
        background: var(--dm-danger-bg);
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .field-select-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .field-select-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--dm-text-primary);
      white-space: nowrap;
      min-width: 120px;
    }

    .field-rules-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 10px;
      border-top: 1px solid var(--dm-border-subtle);
    }
    .rules-hint-label {
      font-size: 0.75rem;
      color: var(--dm-text-secondary);
      font-weight: 600;
    }
    .rules-chips-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .rule-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 9px;
      border: 1px solid var(--dm-border-default);
      background: #ffffff;
      border-radius: var(--dm-radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--dm-text-primary);
      cursor: pointer;
      transition: all 0.12s ease;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: var(--dm-text-faint);
      }

      &:hover {
        background: var(--dm-bg-subtle);
        border-color: var(--dm-border-strong);
      }

      &.is-active {
        background: var(--dm-primary);
        border-color: var(--dm-primary);
        color: #ffffff;
        font-weight: 600;

        mat-icon {
          color: #ffffff;
        }
      }

      &.is-custom.is-active {
        background: var(--dm-text-primary);
        border-color: var(--dm-text-primary);
        color: #ffffff;
      }
    }

    /* Modal Layouts */
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
      animation: fadeIn 0.15s ease;
      overscroll-behavior: contain;
    }
    .dm-modal-card {
      background: var(--dm-bg-surface);
      border: 1px solid var(--dm-border-default);
      border-radius: var(--dm-radius-xl);
      box-shadow: var(--dm-shadow-xl);
      width: 100%;
      max-width: 520px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .modal-wide {
      max-width: 900px;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
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
    .icon-primary {
      color: var(--dm-primary);
    }
    .dm-modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .dm-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--dm-border-subtle);
      background: #fafbfd;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .field-hint {
      font-size: 0.72rem;
      color: var(--dm-text-muted);
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
    .modal-table-scroll {
      max-height: 420px;
    }

    /* Responsiveness */
    @media (max-width: 1024px) {
      .workspace-grid {
        grid-template-columns: 1fr;
      }
      .guidance-cards-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .field-inputs-wrap {
        flex-direction: column;
        align-items: stretch;
      }
      .field-select-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      .field-select-label {
        min-width: auto;
      }
      .form-grid-2 {
        grid-template-columns: 1fr;
      }
      .outcome-metrics {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class StudioComponent implements OnInit {
  public api = inject(ApiService);
  public i18n = inject(I18nService);
  private toast = inject(ToastService);
  private clarity = inject(ClarityService);
  private router = inject(Router);

  public isInspecting = signal<boolean>(false);
  public isProcessing = signal<boolean>(false);
  public isDraggingOver = signal<boolean>(false);

  public selectedFile = signal<File | null>(null);
  public currentFilename = signal<string>('');
  public tempPath = signal<string>('');
  public inspectedColumns = signal<string[]>([]);
  public sampleRows = signal<Record<string, any>[]>([]);

  public lastBatchResult = signal<any | null>(null);

  // Preview Modal
  public previewModalOpen = signal<boolean>(false);
  public previewLoading = signal<boolean>(false);
  public currentPreviewBatchId = signal<string | null>(null);
  public previewColumns = signal<string[]>([]);
  public previewRows = signal<Record<string, any>[]>([]);

  // Custom Rule Modal
  public customRuleModalOpen = signal<boolean>(false);
  public newRuleName = '';
  public newRuleType: 'regex' | 'length' | 'range' | 'replace' = 'regex';
  public newRulePattern = '';
  public newRuleMessage = '';
  public newRuleSearch = '';
  public newRuleReplace = '';
  public newRuleCaseSensitive = false;
  public newRuleExactLength: number | null = null;
  public newRuleMinLength: number | null = null;
  public newRuleMinVal: number | null = null;
  public newRuleMaxVal: number | null = null;

  // Standard Rules
  private defaultRules: RuleDefinition[] = [
    { key: 'trim', labelKey: 'studio.ruleLabels.trim', tooltipKey: 'studio.ruleTooltips.trim', icon: 'content_cut' },
    { key: 'document', labelKey: 'studio.ruleLabels.document', tooltipKey: 'studio.ruleTooltips.document', icon: 'badge' },
    { key: 'currency', labelKey: 'studio.ruleLabels.currency', tooltipKey: 'studio.ruleTooltips.currency', icon: 'attach_money' },
    { key: 'date', labelKey: 'studio.ruleLabels.date', tooltipKey: 'studio.ruleTooltips.date', icon: 'calendar_today' },
    { key: 'uppercase', labelKey: 'studio.ruleLabels.uppercase', tooltipKey: 'studio.ruleTooltips.uppercase', icon: 'text_fields' },
    { key: 'lowercase', labelKey: 'studio.ruleLabels.lowercase', tooltipKey: 'studio.ruleTooltips.lowercase', icon: 'text_format' },
    { key: 'titlecase', labelKey: 'studio.ruleLabels.titlecase', tooltipKey: 'studio.ruleTooltips.titlecase', icon: 'title' },
    { key: 'unaccent', labelKey: 'studio.ruleLabels.unaccent', tooltipKey: 'studio.ruleTooltips.unaccent', icon: 'spellcheck' },
    { key: 'alphanumeric', labelKey: 'studio.ruleLabels.alphanumeric', tooltipKey: 'studio.ruleTooltips.alphanumeric', icon: 'tag' },
    { key: 'cep', labelKey: 'studio.ruleLabels.cep', tooltipKey: 'studio.ruleTooltips.cep', icon: 'local_post_office' },
    { key: 'phone', labelKey: 'studio.ruleLabels.phone', tooltipKey: 'studio.ruleTooltips.phone', icon: 'phone' },
    { key: 'digits', labelKey: 'studio.ruleLabels.digits', tooltipKey: 'studio.ruleTooltips.digits', icon: 'pin' },
    { key: 'required', labelKey: 'studio.ruleLabels.required', tooltipKey: 'studio.ruleTooltips.required', icon: 'priority_high' },
    { key: 'lookup', labelKey: 'studio.ruleLabels.lookup', tooltipKey: 'studio.ruleTooltips.lookup', icon: 'find_replace' }
  ];

  public customRules = signal<RuleDefinition[]>([]);
  public allRules = signal<RuleDefinition[]>([]);

  public targetFields = signal<TargetFieldDef[]>([
    {
      id: 'tf_1',
      key: 'documento',
      label: 'Documento (CPF/CNPJ)',
      type: 'string',
      selectedSource: '',
      transformers: ['trim', 'document']
    },
    {
      id: 'tf_2',
      key: 'nome_completo',
      label: 'Nome Completo',
      type: 'string',
      selectedSource: '',
      transformers: ['trim', 'titlecase']
    },
    {
      id: 'tf_3',
      key: 'valor_divida',
      label: 'Valor da Dívida / Título',
      type: 'currency',
      selectedSource: '',
      transformers: ['currency']
    },
    {
      id: 'tf_4',
      key: 'data_vencimento',
      label: 'Data de Vencimento',
      type: 'date',
      selectedSource: '',
      transformers: ['date']
    },
    {
      id: 'tf_5',
      key: 'status_ocorrencia',
      label: 'Status da Ocorrência',
      type: 'lookup',
      selectedSource: '',
      transformers: ['lookup']
    }
  ]);

  ngOnInit(): void {
    this.clarity.trackEvent('page_view_studio');
    this.updateAllRules();
  }

  private updateAllRules(): void {
    this.allRules.set([...this.defaultRules, ...this.customRules()]);
  }

  public getRuleLabel(rule: RuleDefinition): string {
    if (rule.isCustom && rule.customLabel) {
      return rule.customLabel;
    }
    return this.i18n.t(rule.labelKey);
  }

  public getRuleTooltip(rule: RuleDefinition): string {
    if (rule.isCustom && rule.customTooltip) {
      return rule.customTooltip;
    }
    return this.i18n.t(rule.tooltipKey);
  }

  // Drag and Drop Handling
  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver.set(true);
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver.set(false);
  }

  public onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.selectedFile.set(file);
      this.currentFilename.set(file.name);
      this.inspectFile(file);
    }
  }

  public openCustomRuleModal(): void {
    this.newRuleName = '';
    this.newRuleType = 'regex';
    this.newRulePattern = '';
    this.newRuleMessage = '';
    this.newRuleSearch = '';
    this.newRuleReplace = '';
    this.newRuleCaseSensitive = false;
    this.newRuleExactLength = null;
    this.newRuleMinLength = null;
    this.newRuleMinVal = null;
    this.newRuleMaxVal = null;
    this.customRuleModalOpen.set(true);
  }

  public closeCustomRuleModal(): void {
    this.customRuleModalOpen.set(false);
  }

  public saveCustomRule(): void {
    if (!this.newRuleName.trim()) {
      this.toast.warning(this.i18n.t('toasts.ruleRequiredName'));
      return;
    }

    const key = 'custom_' + Math.random().toString(36).substring(2, 7);
    const options: Record<string, any> = {
      message: this.newRuleMessage || `Valor não atende à regra '${this.newRuleName}'.`
    };

    if (this.newRuleType === 'regex') {
      if (!this.newRulePattern.trim()) {
        this.toast.warning(this.i18n.t('toasts.ruleRequiredPattern'));
        return;
      }
      options['pattern'] = this.newRulePattern.trim();
    } else if (this.newRuleType === 'replace') {
      if (!this.newRuleSearch.trim()) {
        this.toast.warning(this.i18n.t('toasts.ruleRequiredSearch'));
        return;
      }
      options['search'] = this.newRuleSearch.trim();
      options['replace'] = this.newRuleReplace;
      options['case_sensitive'] = this.newRuleCaseSensitive;
    } else if (this.newRuleType === 'length') {
      if (this.newRuleExactLength !== null) options['exact'] = this.newRuleExactLength;
      if (this.newRuleMinLength !== null) options['min'] = this.newRuleMinLength;
    } else if (this.newRuleType === 'range') {
      if (this.newRuleMinVal !== null) options['min'] = this.newRuleMinVal;
      if (this.newRuleMaxVal !== null) options['max'] = this.newRuleMaxVal;
    }

    const newRule: RuleDefinition = {
      key,
      labelKey: '',
      tooltipKey: '',
      customLabel: `★ ${this.newRuleName}`,
      customTooltip: this.newRuleMessage || this.newRuleName,
      icon: 'star',
      isCustom: true,
      customType: this.newRuleType,
      options
    };

    this.customRules.update(c => [...c, newRule]);
    this.updateAllRules();
    this.closeCustomRuleModal();
    this.toast.success(this.i18n.t('toasts.ruleCreatedMsg'), this.i18n.t('toasts.ruleCreatedTitle'));
  }

  public toggleTransformer(field: TargetFieldDef, ruleKey: string): void {
    const index = field.transformers.indexOf(ruleKey);
    if (index >= 0) {
      field.transformers.splice(index, 1);
    } else {
      field.transformers.push(ruleKey);
    }
  }

  public hasTransformer(field: TargetFieldDef, ruleKey: string): boolean {
    return field.transformers.includes(ruleKey);
  }

  public removeField(index: number): void {
    const current = [...this.targetFields()];
    current.splice(index, 1);
    this.targetFields.set(current);
  }

  public resetFile(): void {
    this.selectedFile.set(null);
    this.currentFilename.set('');
    this.tempPath.set('');
    this.inspectedColumns.set([]);
    this.sampleRows.set([]);
    this.lastBatchResult.set(null);
  }

  public onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.currentFilename.set(file.name);
    this.inspectFile(file);
  }

  private inspectFile(file: File): void {
    this.isInspecting.set(true);
    this.api.inspectFile(file).subscribe({
      next: (res) => {
        this.isInspecting.set(false);
        if (res.success) {
          this.tempPath.set(res.temp_path);
          this.inspectedColumns.set(res.columns);
          this.sampleRows.set(res.sample_rows);
          this.mapAllColumnsExact();
          this.toast.success(`${res.columns.length} ${this.i18n.t('toasts.fileReadyMsg')}`, this.i18n.t('toasts.fileReadyTitle'));
        }
      },
      error: () => {
        this.isInspecting.set(false);
        this.toast.error(this.i18n.t('toasts.serverErrorMsg'), this.i18n.t('toasts.serverErrorTitle'));
      }
    });
  }

  public mapAllColumnsExact(): void {
    const cols = this.inspectedColumns();
    const newFields: TargetFieldDef[] = cols.map((c, idx) => {
      const lower = c.toLowerCase();
      const transformers = ['trim'];
      let type = 'string';
      if (/cpf|cnpj|doc/i.test(lower)) {
        transformers.push('document');
      } else if (/valor|saldo|total|honorario|preco|preço/i.test(lower)) {
        transformers.push('currency');
        type = 'currency';
      } else if (/data|venc|dt|created|nasc/i.test(lower)) {
        transformers.push('date');
        type = 'date';
      } else if (/cep|postal/i.test(lower)) {
        transformers.push('cep');
      } else if (/telefone|tel|celular|fone/i.test(lower)) {
        transformers.push('phone');
      } else if (/nome|cliente|razao|desc/i.test(lower)) {
        transformers.push('titlecase');
      }
      return {
        id: `col_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        key: c.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_'),
        label: c,
        type,
        selectedSource: c,
        transformers
      };
    });
    this.targetFields.set(newFields);
  }

  public addNewField(): void {
    const current = [...this.targetFields()];
    const index = current.length + 1;
    current.push({
      id: `field_${index}_${Math.random().toString(36).substring(2, 7)}`,
      key: `campo_${index}`,
      label: `Campo ${index}`,
      type: 'string',
      selectedSource: '',
      transformers: ['trim']
    });
    this.targetFields.set(current);
  }

  public processBatch(): void {
    const file = this.selectedFile();
    const tempPath = this.tempPath();
    if (!file && !tempPath) {
      this.toast.warning('Envie ou selecione um arquivo primeiro.');
      return;
    }

    const customRulesMap = new Map<string, RuleDefinition>();
    for (const r of this.customRules()) {
      customRulesMap.set(r.key, r);
    }

    const mappings: Record<string, any> = {};
    for (const field of this.targetFields()) {
      if (!field.selectedSource) continue;

      const transformersList: any[] = [];
      for (const t of field.transformers) {
        if (t === 'trim') transformersList.push('trim');
        else if (t === 'document') transformersList.push('document');
        else if (t === 'currency') transformersList.push('currency');
        else if (t === 'date') transformersList.push({ type: 'date', options: { source_formats: ['d/m/Y', 'Y-m-d'] } });
        else if (t === 'uppercase') transformersList.push('uppercase');
        else if (t === 'lowercase') transformersList.push('lowercase');
        else if (t === 'titlecase') transformersList.push('titlecase');
        else if (t === 'unaccent') transformersList.push('unaccent');
        else if (t === 'alphanumeric') transformersList.push('alphanumeric');
        else if (t === 'cep') transformersList.push('cep');
        else if (t === 'phone') transformersList.push('phone');
        else if (t === 'digits') transformersList.push('digits');
        else if (t === 'required') transformersList.push('required');
        else if (t === 'lookup') {
          transformersList.push({
            type: 'lookup',
            options: {
              dictionary: {
                '01': 'ACORDO_FIRMADO',
                '02': 'QUEBRA_ACORDO',
                '03': 'PAGO_A_VISTA'
              },
              default: 'OUTROS'
            }
          });
        } else if (customRulesMap.has(t)) {
          const custom = customRulesMap.get(t)!;
          transformersList.push({
            type: custom.customType || 'regex',
            options: custom.options || {}
          });
        }
      }

      mappings[field.key] = {
        source: field.selectedSource,
        transformers: transformersList
      };
    }

    if (Object.keys(mappings).length === 0) {
      this.toast.warning('Selecione a coluna de origem em ao menos um dos campos antes de processar.');
      return;
    }

    const recipe = { mappings };

    this.isProcessing.set(true);
    this.lastBatchResult.set(null);

    this.api.processBatch({
      file: file || undefined,
      temp_path: tempPath || undefined,
      filename: this.currentFilename(),
      pipeline_name: 'Pipeline ' + this.currentFilename(),
      recipe
    }).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        if (res.success) {
          this.lastBatchResult.set(res);
          this.clarity.trackEvent('batch_processed_real', {
            total: res.stats.total_rows,
            quarantine: res.stats.quarantined_rows
          });
          this.toast.success(
            `${res.stats.success_rows} ${this.i18n.t('quarantine.approvedTag')}, ${res.stats.quarantined_rows} ${this.i18n.t('nav.quarantine')}`,
            this.i18n.t('toasts.batchSuccessTitle')
          );
        }
      },
      error: () => {
        this.isProcessing.set(false);
        this.toast.error(this.i18n.t('toasts.serverErrorMsg'), this.i18n.t('toasts.serverErrorTitle'));
      }
    });
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

  public goToQuarantine(): void {
    this.router.navigate(['/quarantine']);
  }

  public downloadExport(batchId: string, format: 'csv' | 'xlsx'): void {
    const filename = this.currentFilename() || 'normalized_data';
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
      error: () => this.toast.error(this.i18n.t('toasts.downloadFailed'))
    });
  }
}
