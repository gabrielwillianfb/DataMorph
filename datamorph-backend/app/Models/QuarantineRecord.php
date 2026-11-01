<?php

namespace App\Models;

use App\Models\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuarantineRecord extends Model
{
    use HasFactory, HasUuids, BelongsToUser;

    protected $fillable = [
        'user_id',
        'file_batch_id',
        'source_row_number',
        'raw_data',
        'error_details',
        'resolution_status',
        'resolution_notes',
    ];

    protected $casts = [
        'source_row_number' => 'integer',
        'raw_data' => 'array',
        'error_details' => 'array',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(FileBatch::class, 'file_batch_id');
    }
}
