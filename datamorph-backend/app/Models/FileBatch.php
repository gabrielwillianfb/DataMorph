<?php

namespace App\Models;

use App\Models\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FileBatch extends Model
{
    use HasFactory, HasUuids, BelongsToUser;

    protected $fillable = [
        'user_id',
        'pipeline_id',
        'recipe_id',
        'original_filename',
        'file_hash_sha256',
        'total_rows',
        'success_rows',
        'quarantined_rows',
        'status',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'total_rows' => 'integer',
        'success_rows' => 'integer',
        'quarantined_rows' => 'integer',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function recipe(): BelongsTo
    {
        return $this->belongsTo(MappingRecipe::class);
    }

    public function quarantineRecords(): HasMany
    {
        return $this->hasMany(QuarantineRecord::class);
    }
}
