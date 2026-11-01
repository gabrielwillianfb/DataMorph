<?php

namespace Tests\Unit;

use App\Services\Mapping\MappingEngine;
use Tests\TestCase;

class MappingEngineTest extends TestCase
{
    private MappingEngine $engine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->engine = new MappingEngine();
    }

    public function test_transforms_valid_row_successfully(): void
    {
        $rawRow = [
            'CPF_RAW' => ' 123.456.789-09 ',
            'NOME_RAW' => '  carlos alberto silva  ',
            'VALOR_RAW' => 'R$ 1.540,80',
            'DATA_RAW' => '15/10/2026',
            'STATUS_RAW' => '01',
        ];

        $recipe = [
            'mappings' => [
                'documento' => [
                    'source' => 'CPF_RAW',
                    'transformers' => [
                        'trim',
                        ['type' => 'document', 'options' => ['validate_checksum' => false]],
                    ],
                ],
                'nome_completo' => [
                    'source' => 'NOME_RAW',
                    'transformers' => ['trim'],
                ],
                'valor_divida' => [
                    'source' => 'VALOR_RAW',
                    'transformers' => ['currency'],
                ],
                'data_vencimento' => [
                    'source' => 'DATA_RAW',
                    'transformers' => [
                        ['type' => 'date', 'options' => ['source_formats' => ['d/m/Y'], 'target_format' => 'Y-m-d']],
                    ],
                ],
                'status_ocorrencia' => [
                    'source' => 'STATUS_RAW',
                    'transformers' => [
                        ['type' => 'lookup', 'options' => ['dictionary' => ['01' => 'ACORDO_FIRMADO', '02' => 'CANCELADO']]],
                    ],
                ],
            ],
        ];

        $result = $this->engine->transformRow($rawRow, $recipe);

        $this->assertTrue($result->isValid);
        $this->assertEmpty($result->errors);
        $this->assertEquals('12345678909', $result->transformedData['documento']);
        $this->assertEquals('carlos alberto silva', $result->transformedData['nome_completo']);
        $this->assertEquals(1540.80, $result->transformedData['valor_divida']);
        $this->assertEquals('2026-10-15', $result->transformedData['data_vencimento']);
        $this->assertEquals('ACORDO_FIRMADO', $result->transformedData['status_ocorrencia']);
    }

    public function test_catches_invalid_rows_and_isolates_errors(): void
    {
        $invalidRow = [
            'CPF_RAW' => '111.111.111-11', // CPF com dígitos repetidos inválido
            'VALOR_RAW' => '-500,00', // Valor negativo não permitido
            'DATA_RAW' => '31/02/2026', // Data inexistente
            'STATUS_RAW' => '99', // Código não mapeado
        ];

        $recipe = [
            'mappings' => [
                'documento' => [
                    'source' => 'CPF_RAW',
                    'transformers' => [
                        ['type' => 'document', 'options' => ['validate_checksum' => true]],
                    ],
                ],
                'valor_divida' => [
                    'source' => 'VALOR_RAW',
                    'transformers' => [
                        ['type' => 'currency', 'options' => ['allow_negative' => false]],
                    ],
                ],
                'data_vencimento' => [
                    'source' => 'DATA_RAW',
                    'transformers' => [
                        ['type' => 'date', 'options' => ['source_formats' => ['d/m/Y']]],
                    ],
                ],
                'status_ocorrencia' => [
                    'source' => 'STATUS_RAW',
                    'transformers' => [
                        ['type' => 'lookup', 'options' => ['dictionary' => ['01' => 'PAGO']]],
                    ],
                ],
            ],
        ];

        $result = $this->engine->transformRow($invalidRow, $recipe);

        $this->assertFalse($result->isValid);
        $this->assertCount(4, $result->errors);
        $this->assertEquals('documento', $result->errors[0]['field']);
        $this->assertEquals('valor_divida', $result->errors[1]['field']);
        $this->assertEquals('data_vencimento', $result->errors[2]['field']);
        $this->assertEquals('status_ocorrencia', $result->errors[3]['field']);
    }

    public function test_stress_transformation_speed(): void
    {
        $rawRow = [
            'CPF' => '123.456.789-09',
            'VALOR' => '1.250,50',
            'DATA' => '01/01/2026',
            'STATUS' => '01',
        ];

        $recipe = [
            'mappings' => [
                'cpf' => ['source' => 'CPF', 'transformers' => ['trim', ['type' => 'document', 'options' => ['validate_checksum' => false]]]],
                'valor' => ['source' => 'VALOR', 'transformers' => ['currency']],
                'data' => ['source' => 'DATA', 'transformers' => ['date']],
                'status' => ['source' => 'STATUS', 'transformers' => [['type' => 'lookup', 'options' => ['dictionary' => ['01' => 'OK']]]]],
            ],
        ];

        $start = microtime(true);
        for ($i = 0; $i < 5000; $i++) {
            $res = $this->engine->transformRow($rawRow, $recipe);
            $this->assertTrue($res->isValid);
        }
        $duration = microtime(true) - $start;

        // 5.000 linhas processadas em menos de 0.5 segundo
        $this->assertLessThan(0.5, $duration, "Processamento de 5.000 linhas demorou {$duration}s");
    }
}
