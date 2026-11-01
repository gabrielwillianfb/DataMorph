<?php

use App\Http\Controllers\Api\DataMorphController;
use App\Http\Middleware\ResolveAuth0User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Endpoint Público de Healthcheck
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'service' => 'DataMorph Engine',
        'version' => '1.0.0',
        'php_version' => PHP_VERSION,
        'timestamp' => now()->toISOString(),
    ]);
});

// Rotas Protegidas por Autenticação Auth0 e Isolamento de Usuário
Route::middleware(['auth:auth0-api', ResolveAuth0User::class])->group(function () {
    // Perfil do Usuário Autenticado
    Route::get('/me', function () {
        $user = Auth::user();
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user?->id,
                'name' => $user?->name,
                'email' => $user?->email,
                'avatar' => $user?->avatar,
                'role' => $user?->role ?? 'MEMBER',
            ],
        ]);
    });

    // Ingestão, Mapeamento e Quarentena
    Route::post('/files/inspect', [DataMorphController::class, 'inspectFile']);
    Route::post('/batches/process', [DataMorphController::class, 'processBatch']);
    Route::get('/batches', [DataMorphController::class, 'listBatches']);
    Route::get('/batches/{id}/preview', [DataMorphController::class, 'previewBatch']);
    Route::get('/batches/{id}/export/{format?}', [DataMorphController::class, 'exportBatch']);
    Route::get('/quarantine', [DataMorphController::class, 'listQuarantine']);
    Route::patch('/quarantine/{id}', [DataMorphController::class, 'updateQuarantineRecord']);
    Route::get('/dashboard/stats', [DataMorphController::class, 'getDashboardStats']);

    // Prefixo v1 para compatibilidade
    Route::prefix('v1')->group(function () {
        Route::post('/files/inspect', [DataMorphController::class, 'inspectFile']);
        Route::post('/batches/process', [DataMorphController::class, 'processBatch']);
        Route::get('/batches', [DataMorphController::class, 'listBatches']);
        Route::get('/batches/{id}/preview', [DataMorphController::class, 'previewBatch']);
        Route::get('/batches/{id}/export/{format?}', [DataMorphController::class, 'exportBatch']);
        Route::get('/quarantine', [DataMorphController::class, 'listQuarantine']);
        Route::patch('/quarantine/{id}', [DataMorphController::class, 'updateQuarantineRecord']);
        Route::get('/dashboard/stats', [DataMorphController::class, 'getDashboardStats']);
    });
});
