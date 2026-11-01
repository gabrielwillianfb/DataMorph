<?php

namespace Tests\Feature;

use App\Models\FileBatch;
use App\Models\MappingRecipe;
use App\Models\Pipeline;
use App\Models\QuarantineRecord;
use App\Services\Mapping\MappingEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BatchProcessingPipelineTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_batch_ingestion_and_quarantine_lifecycle(): void
    {
        // 1. Criar Pipeline
        $pipeline = Pipeline::create([
            'name' => 'Remessa Cobrança Banco Itaú',
            'source_type' => 'MANUAL',
            'status' => 'ACTIVE',
        ]);

        // 2. Criar Receita
        $recipe = MappingRecipe::create([
            'pipeline_id' => $pipeline->id,
            'name' => 'Layout V1 Itaú De-Para',
            'version' => 1,
            'dsl_definition' => [
                'mappings' => [
                    'documento' => ['source' => 'CPF', 'transformers' => ['trim', 'document']],
                    'valor' => ['source' => 'VALOR', 'transformers' => ['currency']],
                    'vencimento' => ['source' => 'DATA', 'transformers' => ['date']],
                ],
            ],
        ]);

        // 3. Criar Lote de Arquivo
        $batch = FileBatch::create([
            'pipeline_id' => $pipeline->id,
            'recipe_id' => $recipe->id,
            'original_filename' => 'base_itau_20261031.csv',
            'file_hash_sha256' => hash('sha256', 'mock_content'),
            'status' => 'PROCESSING',
        ]);

        // 4. Processar Linhas (1 válida e 1 inválida com CPF repetido)
        $rows = [
            ['CPF' => '123.456.789-09', 'VALOR' => 'R$ 1.250,00', 'DATA' => '15/10/2026'],
            ['CPF' => '111.111.111-11', 'VALOR' => 'R$ 500,00', 'DATA' => '16/10/2026'],
        ];

        $engine = new MappingEngine();
        $successCount = 0;
        $quarantineCount = 0;

        foreach ($rows as $index => $row) {
            $result = $engine->transformRow($row, $recipe->dsl_definition);
            if ($result->isValid) {
                $successCount++;
            } else {
                $quarantineCount++;
                QuarantineRecord::create([
                    'file_batch_id' => $batch->id,
                    'source_row_number' => $index + 1,
                    'raw_data' => $result->rawData,
                    'error_details' => $result->errors,
                    'resolution_status' => 'PENDING',
                ]);
            }
        }

        $batch->update([
            'total_rows' => count($rows),
            'success_rows' => $successCount,
            'quarantined_rows' => $quarantineCount,
            'status' => $quarantineCount > 0 ? 'WARNING' : 'COMPLETED',
        ]);

        // Asserções
        $this->assertEquals(2, $batch->total_rows);
        $this->assertEquals(1, $batch->success_rows);
        $this->assertEquals(1, $batch->quarantined_rows);
        $this->assertEquals('WARNING', $batch->status);
        $this->assertDatabaseHas('quarantine_records', [
            'file_batch_id' => $batch->id,
            'source_row_number' => 2,
            'resolution_status' => 'PENDING',
        ]);

        // 5. Simular resolução na Mesa de Quarentena
        $quarantineRecord = QuarantineRecord::where('file_batch_id', $batch->id)->first();
        $this->assertNotNull($quarantineRecord);

        // Operador corrige o CPF na tela
        $fixedRaw = $quarantineRecord->raw_data;
        $fixedRaw['CPF'] = '987.654.321-00';

        $fixedResult = $engine->transformRow($fixedRaw, $recipe->dsl_definition);
        $this->assertTrue($fixedResult->isValid);

        $quarantineRecord->update([
            'resolution_status' => 'RESOLVED',
            'resolution_notes' => 'CPF corrigido manualmente pelo operador.',
        ]);

        $this->assertEquals('RESOLVED', $quarantineRecord->fresh()->resolution_status);
    }
}
