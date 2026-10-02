<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no', 40)->unique();
            $table->string('name', 255);
            $table->string('email', 255)->index();
            $table->string('phone', 50)->nullable();
            $table->string('company', 255)->nullable();
            $table->string('subject', 255);
            $table->text('message');
            $table->string('source', 50)->default('website')->index();
            $table->string('campaign_tag', 100)->nullable()->index();
            $table->string('status', 30)->default('new')->index();
            $table->string('priority', 30)->default('normal')->index();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('last_contacted_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
