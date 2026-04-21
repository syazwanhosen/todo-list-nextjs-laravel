<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TodoController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/todos', [TodoController::class, 'index']);
    Route::post('/todos', [TodoController::class, 'store']);
    Route::get('/todos/{todo}', [TodoController::class, 'show']);
    Route::patch('/todos/{todo}', [TodoController::class, 'update']);
    Route::delete('/todos/{todo}', [TodoController::class, 'destroy']);
    Route::post('/todos/{todo}/toggle', [TodoController::class, 'toggle']);
});
