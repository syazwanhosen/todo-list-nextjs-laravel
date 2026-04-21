<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('todos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('completed')->default(false);
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->timestamp('due_date')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'completed']);
            $table->index(['user_id', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('todos');
    }
};
