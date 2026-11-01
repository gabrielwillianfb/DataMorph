import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  php_version: string;
  timestamp: string;
}

export interface DashboardStatsResponse {
  success: boolean;
  stats: {
    total_batches: number;
    total_rows: number;
    success_rows: number;
    quarantined_rows: number;
    resolved_rows: number;
    success_rate: number;
    hours_saved: number;
  };
}

export interface InspectFileResponse {
  success: boolean;
  filename: string;
  temp_path: string;
  columns: string[];
  sample_rows: Record<string, any>[];
  sample_count: number;
}

export interface BatchItem {
  id: string;
  pipeline_id: string;
  original_filename: string;
  file_hash_sha256: string;
  total_rows: number;
  success_rows: number;
  quarantined_rows: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'WARNING' | 'FAILED';
  started_at: string;
  finished_at: string;
  created_at: string;
  pipeline?: {
    id: string;
    name: string;
  };
}

export interface QuarantineRecord {
  id: string;
  file_batch_id: string;
  source_row_number: number;
  raw_data: Record<string, any>;
  error_details: {
    field: string;
    source_field?: string;
    message: string;
    invalid_value?: any;
  }[];
  resolution_status: 'PENDING' | 'RESOLVED' | 'DISCARDED';
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  batch?: BatchItem;
  isEditing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api';

  public getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }

  public getDashboardStats(): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(`${this.baseUrl}/dashboard/stats`);
  }

  public inspectFile(file: File): Observable<InspectFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<InspectFileResponse>(`${this.baseUrl}/files/inspect`, formData);
  }

  public processBatch(payload: {
    file?: File;
    temp_path?: string;
    filename?: string;
    pipeline_name?: string;
    recipe: any;
  }): Observable<any> {
    const formData = new FormData();
    if (payload.file) {
      formData.append('file', payload.file);
    }
    if (payload.temp_path) {
      formData.append('temp_path', payload.temp_path);
    }
    if (payload.filename) {
      formData.append('filename', payload.filename);
    }
    if (payload.pipeline_name) {
      formData.append('pipeline_name', payload.pipeline_name);
    }
    formData.append('recipe', JSON.stringify(payload.recipe));

    return this.http.post<any>(`${this.baseUrl}/batches/process`, formData);
  }

  public getBatches(): Observable<{ success: boolean; batches: BatchItem[] }> {
    return this.http.get<{ success: boolean; batches: BatchItem[] }>(`${this.baseUrl}/batches`);
  }

  public getQuarantine(status?: string, batchId?: string): Observable<{
    success: boolean;
    records: QuarantineRecord[];
    total_pending: number;
    total_resolved: number;
  }> {
    let url = `${this.baseUrl}/quarantine`;
    const params: string[] = [];
    if (status) params.push(`status=${status}`);
    if (batchId) params.push(`batch_id=${batchId}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<any>(url);
  }

  public updateQuarantineRecord(id: string, rawData: Record<string, any>): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/quarantine/${id}`, {
      raw_data: rawData
    });
  }

  public getBatchPreview(id: string): Observable<{
    success: boolean;
    batch: BatchItem;
    total_preview: number;
    columns: string[];
    rows: Record<string, any>[];
  }> {
    return this.http.get<any>(`${this.baseUrl}/batches/${id}/preview`);
  }

  public getBatchExportUrl(id: string, format: 'csv' | 'xlsx' = 'csv'): string {
    return `${this.baseUrl}/batches/${id}/export/${format}`;
  }

  public downloadBatchExport(id: string, format: 'csv' | 'xlsx' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/batches/${id}/export/${format}`, {
      responseType: 'blob'
    });
  }
}
