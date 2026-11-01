<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FileBatch;
use App\Models\MappingRecipe;
use App\Models\Pipeline;
use App\Models\QuarantineRecord;
use App\Services\Mapping\MappingEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Spatie\SimpleExcel\SimpleExcelReader;

class DataMorphController extends Controller
{
    private MappingEngine $engine;

    public function __construct()
    {
        $this->engine = new MappingEngine();
    }

    private function getTenantOutputDir(string $userId): string
    {
        $dir = storage_path("app/tenants/{$userId}/outputs");
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
        return $dir;
    }

    /**
     * Inspeciona um arquivo enviado (CSV ou XLSX), extraindo colunas e primeiras 10 linhas.
     */
    public function inspectFile(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:51200', // max 50MB
        ]);

        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName();
        $extension = strtolower($uploadedFile->getClientOriginalExtension());

        // Salva temporariamente em storage/app/tenants/{userId}/uploads
        $userId = \Illuminate\Support\Facades\Auth::id() ?? 'shared';
        $storedPath = $uploadedFile->storeAs("tenants/{$userId}/uploads", uniqid('upload_') . '.' . $extension);
        $fullPath = Storage::path($storedPath);

        try {
            $reader = SimpleExcelReader::create($fullPath);
            
            // Se for CSV, tenta detectar delimitador
            if ($extension === 'csv' || $extension === 'txt') {
                $firstLine = file($fullPath)[0] ?? '';
                if (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
                    $reader->useDelimiter(';');
                }
            }

            $sampleRows = [];
            $columns = [];

            $rows = $reader->getRows();
            $count = 0;
            foreach ($rows as $row) {
                if ($count === 0) {
                    $columns = array_keys($row);
                }
                $sampleRows[] = $row;
                $count++;
                if ($count >= 10) {
                    break;
                }
            }

            return response()->json([
                'success' => true,
                'filename' => $originalName,
                'temp_path' => $storedPath,
                'columns' => $columns,
                'sample_rows' => $sampleRows,
                'sample_count' => count($sampleRows),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao inspecionar arquivo: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Processa um arquivo contra uma receita de mapeamento.
     */
    public function processBatch(Request $request): JsonResponse
    {
        // Se a receita foi enviada como JSON string via FormData, decodifica para array
        if (is_string($request->input('recipe'))) {
            $decoded = json_decode($request->input('recipe'), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $request->merge(['recipe' => $decoded]);
            }
        }

        $request->validate([
            'temp_path' => 'nullable|string',
            'file' => 'nullable|file',
            'filename' => 'nullable|string',
            'pipeline_name' => 'nullable|string',
            'recipe' => 'required|array',
        ]);

        $filename = $request->input('filename', 'arquivo_processado.csv');
        $storedPath = $request->input('temp_path');

        $userId = \Illuminate\Support\Facades\Auth::id() ?? 'shared';
        if ($request->hasFile('file')) {
            $uploaded = $request->file('file');
            $filename = $uploaded->getClientOriginalName();
            $storedPath = $uploaded->storeAs("tenants/{$userId}/uploads", uniqid('batch_') . '.' . $uploaded->getClientOriginalExtension());
        }

        if (!$storedPath || !Storage::exists($storedPath)) {
            return response()->json(['success' => false, 'message' => 'Arquivo não encontrado para processamento.'], 404);
        }

        $fullPath = Storage::path($storedPath);
        $extension = pathinfo($fullPath, PATHINFO_EXTENSION);
        $fileHash = hash_file('sha256', $fullPath);

        // 1. Obter ou criar Pipeline
        $pipeline = Pipeline::firstOrCreate(
            ['name' => $request->input('pipeline_name', 'Pipeline Geral B2B')],
            ['source_type' => 'MANUAL', 'status' => 'ACTIVE']
        );

        // 2. Salvar Receita de Mapeamento
        $recipe = MappingRecipe::create([
            'pipeline_id' => $pipeline->id,
            'name' => 'Receita ' . date('d/m/Y H:i:s'),
            'version' => 1,
            'dsl_definition' => $request->input('recipe'),
            'is_active' => true,
        ]);

        // 3. Criar Lote de Arquivo
        $batch = FileBatch::create([
            'pipeline_id' => $pipeline->id,
            'recipe_id' => $recipe->id,
            'original_filename' => $filename,
            'file_hash_sha256' => $fileHash,
            'status' => 'PROCESSING',
            'started_at' => now(),
        ]);

        $reader = SimpleExcelReader::create($fullPath);
        if ($extension === 'csv' || $extension === 'txt') {
            $firstLine = file($fullPath)[0] ?? '';
            if (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
                $reader->useDelimiter(';');
            }
        }

        // Prepara saída normalizada isolada por tenant
        $userId = \Illuminate\Support\Facades\Auth::id() ?? ($batch->user_id ?? 'shared');
        $outputDir = $this->getTenantOutputDir((string)$userId);
        $outputCleanCsv = $outputDir . '/' . $batch->id . '_clean.csv';
        $writer = \Spatie\SimpleExcel\SimpleExcelWriter::create($outputCleanCsv);

        $totalRows = 0;
        $successRows = 0;
        $quarantinedRows = 0;
        $previewSuccess = [];
        $previewQuarantine = [];

        foreach ($reader->getRows() as $index => $rawRow) {
            $totalRows++;
            $result = $this->engine->transformRow($rawRow, $recipe->dsl_definition);

            if ($result->isValid) {
                $successRows++;
                $writer->addRow($result->transformedData);
                if (count($previewSuccess) < 15) {
                    $previewSuccess[] = $result->transformedData;
                }
            } else {
                $quarantinedRows++;
                $record = QuarantineRecord::create([
                    'file_batch_id' => $batch->id,
                    'source_row_number' => $index + 1,
                    'raw_data' => $result->rawData,
                    'error_details' => $result->errors,
                    'resolution_status' => 'PENDING',
                ]);

                if (count($previewQuarantine) < 10) {
                    $previewQuarantine[] = [
                        'id' => $record->id,
                        'row_number' => $index + 1,
                        'raw_data' => $result->rawData,
                        'errors' => $result->errors,
                    ];
                }
            }
        }

        $writer->close();

        $batch->update([
            'total_rows' => $totalRows,
            'success_rows' => $successRows,
            'quarantined_rows' => $quarantinedRows,
            'status' => $quarantinedRows > 0 ? 'WARNING' : 'COMPLETED',
            'finished_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'batch' => $batch,
            'stats' => [
                'total_rows' => $totalRows,
                'success_rows' => $successRows,
                'quarantined_rows' => $quarantinedRows,
                'success_rate' => $totalRows > 0 ? round(($successRows / $totalRows) * 100, 1) : 100,
            ],
            'preview_success' => $previewSuccess,
            'preview_quarantine' => $previewQuarantine,
        ]);
    }

    /**
     * Lista todos os lotes de arquivos processados.
     */
    public function listBatches(): JsonResponse
    {
        $batches = FileBatch::with('pipeline')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        // Garante que o status e a contagem de quarentena de cada lote estejam sincronizados
        foreach ($batches as $batch) {
            $pending = QuarantineRecord::where('file_batch_id', $batch->id)
                ->where('resolution_status', 'PENDING')
                ->count();

            $changed = false;
            if ($batch->quarantined_rows !== $pending) {
                $batch->quarantined_rows = $pending;
                $batch->success_rows = max(0, $batch->total_rows - $pending);
                $changed = true;
            }

            if ($pending === 0 && $batch->status === 'WARNING') {
                $batch->status = 'COMPLETED';
                $changed = true;
            }

            if ($changed) {
                $batch->save();
            }
        }

        return response()->json([
            'success' => true,
            'batches' => $batches,
        ]);
    }

    /**
     * Lista todos os registros em quarentena.
     */
    public function listQuarantine(Request $request): JsonResponse
    {
        $query = QuarantineRecord::with('batch')
            ->orderBy('created_at', 'desc');

        if ($request->has('batch_id')) {
            $query->where('file_batch_id', $request->query('batch_id'));
        }

        if ($request->has('status') && $request->query('status') !== 'ALL') {
            $query->where('resolution_status', $request->query('status'));
        }

        $records = $query->limit(100)->get();

        return response()->json([
            'success' => true,
            'records' => $records,
            'total_pending' => QuarantineRecord::where('resolution_status', 'PENDING')->count(),
            'total_resolved' => QuarantineRecord::where('resolution_status', 'RESOLVED')->count(),
        ]);
    }

    /**
     * Corrige pontualmente um registro em quarentena e reavalia via Engine.
     */
    public function updateQuarantineRecord(Request $request, string $id): JsonResponse
    {
        $record = QuarantineRecord::with('batch.recipe')->findOrFail($id);

        $request->validate([
            'raw_data' => 'required|array',
        ]);

        $newRawData = $request->input('raw_data');
        $recipe = $record->batch->recipe?->dsl_definition ?? [];

        // Reavalia a linha
        $result = $this->engine->transformRow($newRawData, $recipe);

        if ($result->isValid) {
            $record->update([
                'raw_data' => $newRawData,
                'error_details' => [],
                'resolution_status' => 'RESOLVED',
                'resolution_notes' => 'Corrigido e aprovado pelo operador via Mesa de Quarentena.',
            ]);

            // Atualiza estatísticas do lote com base no estado real de pendências
            $batch = $record->batch;
            $pendingRemaining = QuarantineRecord::where('file_batch_id', $batch->id)
                ->where('resolution_status', 'PENDING')
                ->count();

            $newSuccessRows = max(0, $batch->total_rows - $pendingRemaining);

            $batch->update([
                'quarantined_rows' => $pendingRemaining,
                'success_rows' => $newSuccessRows,
                'status' => $pendingRemaining === 0 ? 'COMPLETED' : 'WARNING',
            ]);

            return response()->json([
                'success' => true,
                'is_resolved' => true,
                'message' => 'Registro corrigido e validado com sucesso!',
                'record' => $record->fresh(),
                'transformed_data' => $result->transformedData,
                'batch' => $batch->fresh(),
            ]);
        }

        // Se ainda possuir erros
        $record->update([
            'raw_data' => $newRawData,
            'error_details' => $result->errors,
            'resolution_status' => 'PENDING',
        ]);

        return response()->json([
            'success' => false,
            'is_resolved' => false,
            'message' => 'O registro ainda contém inconsistências.',
            'record' => $record->fresh(),
            'errors' => $result->errors,
        ], 422);
    }

    /**
     * Exporta o lote de dados limpo e normalizado (incluindo linhas corrigidas da quarentena).
     */
    public function exportBatch(string $id, string $format = 'csv')
    {
        $batch = FileBatch::with('recipe')->findOrFail($id);
        $userId = \Illuminate\Support\Facades\Auth::id() ?? ($batch->user_id ?? 'shared');
        $outputDir = $this->getTenantOutputDir((string)$userId);
        $outputCleanCsv = "{$outputDir}/{$batch->id}_clean.csv";

        // Gera arquivo consolidado na hora
        $consolidatedPath = "{$outputDir}/{$batch->id}_consolidated." . ($format === 'xlsx' ? 'xlsx' : 'csv');
        $writer = \Spatie\SimpleExcel\SimpleExcelWriter::create($consolidatedPath);

        // 1. Escreve linhas que passaram de primeira
        if (file_exists($outputCleanCsv)) {
            $reader = SimpleExcelReader::create($outputCleanCsv);
            foreach ($reader->getRows() as $row) {
                $writer->addRow($row);
            }
        }

        // 2. Escreve linhas que foram resolvidas na quarentena
        $resolvedRecords = QuarantineRecord::where('file_batch_id', $batch->id)
            ->where('resolution_status', 'RESOLVED')
            ->get();

        $recipe = $batch->recipe?->dsl_definition ?? [];
        foreach ($resolvedRecords as $rec) {
            $transformed = $this->engine->transformRow($rec->raw_data, $recipe);
            if ($transformed->isValid) {
                $writer->addRow($transformed->transformedData);
            }
        }

        $writer->close();

        $downloadName = pathinfo($batch->original_filename, PATHINFO_FILENAME) . '_normalizado.' . ($format === 'xlsx' ? 'xlsx' : 'csv');

        return response()->download($consolidatedPath, $downloadName);
    }

    /**
     * Visualiza as linhas do lote normalizado (preview da tabela final).
     */
    public function previewBatch(string $id): JsonResponse
    {
        $batch = FileBatch::with('recipe')->findOrFail($id);
        $userId = \Illuminate\Support\Facades\Auth::id() ?? ($batch->user_id ?? 'shared');
        $outputDir = $this->getTenantOutputDir((string)$userId);
        $outputCleanCsv = "{$outputDir}/{$batch->id}_clean.csv";

        $rows = [];
        if (file_exists($outputCleanCsv)) {
            $reader = SimpleExcelReader::create($outputCleanCsv);
            $count = 0;
            foreach ($reader->getRows() as $row) {
                $rows[] = $row;
                $count++;
                if ($count >= 50) break;
            }
        }

        // Adiciona linhas resolvidas
        $resolvedRecords = QuarantineRecord::where('file_batch_id', $batch->id)
            ->where('resolution_status', 'RESOLVED')
            ->limit(20)
            ->get();

        $recipe = $batch->recipe?->dsl_definition ?? [];
        foreach ($resolvedRecords as $rec) {
            $transformed = $this->engine->transformRow($rec->raw_data, $recipe);
            if ($transformed->isValid) {
                $item = $transformed->transformedData;
                $item['_status'] = 'RESOLVIDO_QUARENTENA';
                $rows[] = $item;
            }
        }

        return response()->json([
            'success' => true,
            'batch' => $batch,
            'total_preview' => count($rows),
            'columns' => count($rows) > 0 ? array_keys($rows[0]) : [],
            'rows' => $rows,
        ]);
    }

    /**
     * Retorna métricas globais para a Home / Dashboard.
     */
    public function getDashboardStats(): JsonResponse
    {
        $totalBatches = FileBatch::count();
        $totalRows = (int) FileBatch::sum('total_rows');
        $quarantinedRows = (int) QuarantineRecord::where('resolution_status', 'PENDING')->count();
        $resolvedRows = (int) QuarantineRecord::where('resolution_status', 'RESOLVED')->count();
        $successRows = max(0, $totalRows - $quarantinedRows);

        $successRate = $totalRows > 0 ? round(($successRows / $totalRows) * 100, 1) : 100.0;
        // Cada 100 registros manuais economizam aproximadamente 0.5h de digitação
        $hoursSaved = round(($totalRows * 0.005), 1);

        return response()->json([
            'success' => true,
            'stats' => [
                'total_batches' => $totalBatches,
                'total_rows' => $totalRows,
                'success_rows' => $successRows,
                'quarantined_rows' => $quarantinedRows,
                'resolved_rows' => $resolvedRows,
                'success_rate' => $successRate,
                'hours_saved' => $hoursSaved,
            ],
        ]);
    }
}
