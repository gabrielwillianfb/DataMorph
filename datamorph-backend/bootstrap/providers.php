<?php

use App\Providers\AppServiceProvider;
use Auth0\Laravel\ServiceProvider as Auth0ServiceProvider;

return [
    AppServiceProvider::class,
    Auth0ServiceProvider::class,
];
