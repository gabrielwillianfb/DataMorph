<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_health_check_returns_healthy_status(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'healthy',
                'service' => 'DataMorph Engine',
                'version' => '1.0.0',
            ])
            ->assertJsonStructure([
                'status',
                'service',
                'version',
                'php_version',
                'timestamp',
            ]);
    }
}
