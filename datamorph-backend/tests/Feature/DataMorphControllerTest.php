<?php

namespace Tests\Feature;

use App\Models\FileBatch;
use App\Models\MappingRecipe;
use App\Models\Pipeline;
use App\Models\QuarantineRecord;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class DataMorphControllerTest extends TestCase
{
    use RefreshDatabase;

    private \App\Models\User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = \App\Models\User::create([
            'name' => 'Operador Teste',
            'email' => 'operador@datamorph.io',
            'auth0_sub' => 'auth0|test_123',
            'role' => 'MEMBER',
        ]);
        $this->actingAs($this->user);
        $this->withoutMiddleware([
            \Illuminate\Auth\Middleware\Authenticate::class,
            \App\Http\Middleware\ResolveAuth0User::class,
        ]);
    }

    public function test_can_inspect_csv_file_and_extract_columns(): void
    {
        $csvContent = "CPF;NOME;VALOR\n12345678909;Carlos;150.00\n98765432100;Maria;200.00\n";
        $file = UploadedFile::fake()->createWithContent('teste.csv', $csvContent);

        $response = $this->postJson('/api/files/inspect', [
            'file' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'filename' => 'teste.csv',
            ])
            ->assertJsonStructure([
                'columns',
                'sample_rows',
                'temp_path',
            ]);

        $this->assertContains('CPF', $response->json('columns'));
        $this->assertContains('NOME', $response->json('columns'));
        $this->assertContains('VALOR', $response->json('columns'));
    }

    public function test_can_process_batch_with_quarantine_separation(): void
    {
        $csvContent = "CPF;NOME;VALOR\n12345678909;Carlos;150.00\n11111111111;Invalido;200.00\n";
        $file = UploadedFile::fake()->createWithContent('remessa.csv', $csvContent);

        $recipe = [
            'mappings' => [
                'documento' => ['source' => 'CPF', 'transformers' => ['trim', 'document']],
                'nome' => ['source' => 'NOME', 'transformers' => ['trim']],
                'valor' => ['source' => 'VALOR', 'transformers' => ['currency']],
            ],
        ];

        $response = $this->postJson('/api/batches/process', [
            'file' => $file,
            'filename' => 'remessa.csv',
            'pipeline_name' => 'Teste Pipeline',
            'recipe' => $recipe,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'stats' => [
                    'total_rows' => 2,
                    'success_rows' => 1,
                    'quarantined_rows' => 1,
                    'success_rate' => 50.0,
                ],
            ]);

        $this->assertDatabaseCount('file_batches', 1);
        $this->assertDatabaseCount('quarantine_records', 1);
    }

    public function test_can_inspect_and_process_real_xlsx_file(): void
    {
        $xlsxPath = tempnam(sys_get_temp_dir(), 'test_') . '.xlsx';
        \Spatie\SimpleExcel\SimpleExcelWriter::create($xlsxPath)
            ->addRow(['CPF_ADVOGADO' => '52998224725', 'NOME_ADVOGADO' => 'DOUTOR SILVA', 'VALOR_HONORARIOS' => 'R$ 5.000,00'])
            ->close();

        $uploadedFile = new UploadedFile($xlsxPath, 'bb_consultar_advogado.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

        // 1. Inspecionar XLSX
        $inspectResponse = $this->postJson('/api/files/inspect', [
            'file' => $uploadedFile,
        ]);

        $inspectResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'filename' => 'bb_consultar_advogado.xlsx',
            ]);

        $this->assertContains('CPF_ADVOGADO', $inspectResponse->json('columns'));
        $this->assertContains('NOME_ADVOGADO', $inspectResponse->json('columns'));

        // 2. Processar Lote XLSX
        $recipeJsonString = json_encode([
            'mappings' => [
                'documento' => ['source' => 'CPF_ADVOGADO', 'transformers' => ['trim', 'document']],
                'nome' => ['source' => 'NOME_ADVOGADO', 'transformers' => ['trim']],
                'valor' => ['source' => 'VALOR_HONORARIOS', 'transformers' => ['currency']],
            ],
        ]);

        $processResponse = $this->postJson('/api/batches/process', [
            'temp_path' => $inspectResponse->json('temp_path'),
            'filename' => 'bb_consultar_advogado.xlsx',
            'recipe' => $recipeJsonString,
        ]);

        $processResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'stats' => [
                    'total_rows' => 1,
                    'success_rows' => 1,
                    'quarantined_rows' => 0,
                ],
            ]);

        @unlink($xlsxPath);
    }

    public function test_can_resolve_quarantine_record_inline(): void
    {
        $pipeline = Pipeline::create(['name' => 'P1']);
        $recipe = MappingRecipe::create([
            'pipeline_id' => $pipeline->id,
            'name' => 'R1',
            'dsl_definition' => [
                'mappings' => [
                    'documento' => ['source' => 'CPF', 'transformers' => ['trim', 'document']],
                ],
            ],
        ]);
        $batch = FileBatch::create([
            'pipeline_id' => $pipeline->id,
            'recipe_id' => $recipe->id,
            'original_filename' => 'f.csv',
            'file_hash_sha256' => 'abc',
            'total_rows' => 1,
            'success_rows' => 0,
            'quarantined_rows' => 1,
        ]);
        $quarantine = QuarantineRecord::create([
            'file_batch_id' => $batch->id,
            'source_row_number' => 1,
            'raw_data' => ['CPF' => '11111111111'],
            'error_details' => [['message' => 'CPF inválido']],
            'resolution_status' => 'PENDING',
        ]);

        // Operador corrige para um CPF válido
        $response = $this->patchJson("/api/quarantine/{$quarantine->id}", [
            'raw_data' => ['CPF' => '12345678909'],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'is_resolved' => true,
            ]);

        $this->assertEquals('RESOLVED', $quarantine->fresh()->resolution_status);
        $this->assertEquals(1, $batch->fresh()->success_rows);
        $this->assertEquals(0, $batch->fresh()->quarantined_rows);
    }

    public function test_can_preview_and_export_normalized_batch(): void
    {
        $csvContent = "CPF;NOME;VALOR\n52998224725;Carlos;150.00\n";
        $file = UploadedFile::fake()->createWithContent('export_test.csv', $csvContent);

        $recipe = [
            'mappings' => [
                'documento' => ['source' => 'CPF', 'transformers' => ['trim', 'document']],
                'nome' => ['source' => 'NOME', 'transformers' => ['trim']],
            ],
        ];

        $processResponse = $this->postJson('/api/batches/process', [
            'file' => $file,
            'filename' => 'export_test.csv',
            'recipe' => $recipe,
        ]);

        $batchId = $processResponse->json('batch.id');

        // Test preview
        $previewResponse = $this->getJson("/api/batches/{$batchId}/preview");
        $previewResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'total_preview' => 1,
            ]);

        // Test export CSV
        $exportResponse = $this->get("/api/batches/{$batchId}/export/csv");
        $exportResponse->assertStatus(200)
            ->assertHeader('content-disposition');
    }

    public function test_dashboard_stats_endpoint(): void
    {
        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'stats' => [
                    'total_batches',
                    'total_rows',
                    'success_rows',
                    'quarantined_rows',
                    'resolved_rows',
                    'success_rate',
                    'hours_saved',
                ],
            ]);
    }

    public function test_user_cannot_access_another_users_batch(): void
    {
        $otherUser = \App\Models\User::create([
            'name' => 'Outro Usuário',
            'email' => 'outro@empresa.com',
            'auth0_sub' => 'auth0|other_999',
            'role' => 'MEMBER',
        ]);

        $batch = FileBatch::withoutGlobalScopes()->create([
            'user_id' => $otherUser->id,
            'original_filename' => 'planilha_confidencial_empresa_b.xlsx',
            'file_hash_sha256' => 'hash_secreto_123',
            'total_rows' => 50,
            'status' => 'COMPLETED',
        ]);

        // O usuário logado atual tenta acessar o lote de outro usuário
        $previewResponse = $this->getJson("/api/batches/{$batch->id}/preview");
        $previewResponse->assertStatus(404);
    }
}
