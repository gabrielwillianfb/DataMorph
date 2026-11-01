<?php

namespace App\Models;

use App\Models\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MappingRecipe extends Model
{
    use HasFactory, HasUuids, BelongsToUser;

    protected $fillable = [
        'user_id',
        'pipeline_id',
        'version',
        'name',
        'dsl_definition',
        'is_active',
    ];

    protected $casts = [
        'dsl_definition' => 'array',
        'is_active' => 'boolean',
        'version' => 'integer',
    ];

    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }
}
