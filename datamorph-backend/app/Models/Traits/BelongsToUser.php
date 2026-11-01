<?php

namespace App\Models\Traits;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait BelongsToUser
{
    /**
     * Boot the trait to automatically scope queries and attach user_id.
     */
    protected static function bootBelongsToUser(): void
    {
        static::addGlobalScope('user_isolation', function (Builder $builder) {
            $user = Auth::guard('web')->user()
                ?? Auth::user()
                ?? auth('auth0-api')->user();

            if ($user && isset($user->id)) {
                $builder->where($builder->qualifyColumn('user_id'), $user->id);
            } elseif (!app()->runningInConsole()) {
                // Em requisições HTTP sem usuário autenticado, bloqueia qualquer retorno de dados de inquilino
                $builder->whereRaw('1 = 0');
            }
        });

        static::creating(function ($model) {
            $user = Auth::guard('web')->user()
                ?? Auth::user()
                ?? auth('auth0-api')->user();

            if ($user && isset($user->id) && empty($model->user_id)) {
                $model->user_id = $user->id;
            }
        });
    }

    /**
     * Relation to the owner User.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
