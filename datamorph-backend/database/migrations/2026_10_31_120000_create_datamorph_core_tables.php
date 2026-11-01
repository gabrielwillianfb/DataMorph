<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pipelines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('source_type')->default('MANUAL'); // MANUAL, SFTP, EMAIL, API
            $table->json('source_config')->nullable();
            $table->json('target_schema')->nullable();
            $table->string('status')->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('mapping_recipes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('pipeline_id')->constrained('pipelines')->cascadeOnDelete();
            $table->integer('version')->default(1);
            $table->string('name');
            $table->json('dsl_definition');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('file_batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('pipeline_id')->nullable()->constrained('pipelines')->nullOnDelete();
            $table->foreignUuid('recipe_id')->nullable()->constrained('mapping_recipes')->nullOnDelete();
            $table->string('original_filename');
            $table->string('file_hash_sha256')->index();
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('success_rows')->default(0);
            $table->unsignedInteger('quarantined_rows')->default(0);
            $table->string('status')->default('PENDING'); // PENDING, PROCESSING, COMPLETED, WARNING, FAILED
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });

        Schema::create('quarantine_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('file_batch_id')->constrained('file_batches')->cascadeOnDelete();
            $table->unsignedInteger('source_row_number');
            $table->json('raw_data');
            $table->json('error_details');
            $table->string('resolution_status')->default('PENDING'); // PENDING, RESOLVED, DISCARDED
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quarantine_records');
        Schema::dropIfExists('file_batches');
        Schema::dropIfExists('mapping_recipes');
        Schema::dropIfExists('pipelines');
    }
};
