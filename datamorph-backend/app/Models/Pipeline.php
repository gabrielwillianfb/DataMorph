<?php

namespace App\Models;

use App\Models\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pipeline extends Model
{
    use HasFactory, HasUuids, BelongsToUser;

    protected $fillable = [
        'user_id',
        'name',
        'source_type',
        'source_config',
        'target_schema',
        'status',
    ];

    protected $casts = [
        'source_config' => 'array',
        'target_schema' => 'array',
    ];

    public function recipes(): HasMany
    {
        return $this->hasMany(MappingRecipe::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(FileBatch::class);
    }
}
