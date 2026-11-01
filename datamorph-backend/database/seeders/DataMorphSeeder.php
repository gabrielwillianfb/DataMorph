<?php

namespace Database\Seeders;

use App\Models\FileBatch;
use App\Models\MappingRecipe;
use App\Models\Pipeline;
use App\Models\QuarantineRecord;
use App\Services\Mapping\MappingEngine;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Spatie\SimpleExcel\SimpleExcelReader;

class DataMorphSeeder extends Seeder
{
    public function run(): void
    {
        $pipeline = Pipeline::create([
            'name' => 'Carteira de Cobrança Itaú Unibanco',
            'source_type' => 'MANUAL',
            'status' => 'ACTIVE',
        ]);

        $recipe = MappingRecipe::create([
            'pipeline_id' => $pipeline->id,
            'name' => 'De-Para Padrão Remessa Itaú',
            'version' => 1,
            'dsl_definition' => [
                'mappings' => [
                    'documento' => ['source' => 'NUM_CPF', 'transformers' => ['trim', 'document']],
                    'nome_completo' => ['source' => 'NOME_CLIENTE', 'transformers' => ['trim']],
                    'valor_divida' => ['source' => 'VALOR_DIVIDA', 'transformers' => ['currency']],
                    'data_vencimento' => ['source' => 'DATA_VENC', 'transformers' => [['type' => 'date', 'options' => ['source_formats' => ['d/m/Y']]]]],
                    'status_ocorrencia' => ['source' => 'COD_OCORRENCIA', 'transformers' => [['type' => 'lookup', 'options' => ['dictionary' => ['01' => 'ACORDO_FIRMADO', '02' => 'QUEBRA_ACORDO']]]]],
                ],
            ],
            'is_active' => true,
        ]);

        $filePath = Storage::path('samples/cobranca_itau_sample.csv');
        if (!file_exists($filePath)) {
            return;
        }

        $batch = FileBatch::create([
            'pipeline_id' => $pipeline->id,
            'recipe_id' => $recipe->id,
            'original_filename' => 'cobranca_itau_sample.csv',
            'file_hash_sha256' => hash_file('sha256', $filePath),
            'status' => 'PROCESSING',
            'started_at' => now()->subMinutes(15),
        ]);

        $reader = SimpleExcelReader::create($filePath)->useDelimiter(';');
        $engine = new MappingEngine();

        $total = 0;
        $success = 0;
        $quarantine = 0;

        foreach ($reader->getRows() as $index => $row) {
            $total++;
            $result = $engine->transformRow($row, $recipe->dsl_definition);
            if ($result->isValid) {
                $success++;
            } else {
                $quarantine++;
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
            'total_rows' => $total,
            'success_rows' => $success,
            'quarantined_rows' => $quarantine,
            'status' => $quarantine > 0 ? 'WARNING' : 'COMPLETED',
            'finished_at' => now()->subMinutes(14),
        ]);
    }
}
