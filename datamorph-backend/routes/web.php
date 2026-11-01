<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => 'DataMorph API Gateway',
        'status' => 'online',
        'auth' => 'Auth0 Enterprise JWT',
        'docs' => '/api/health',
    ]);
});
