<?php

use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\OpsController;
use App\Http\Controllers\Api\PageViewController;
use App\Http\Middleware\EnsureOpsToken;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('content', ContentController::class);
    Route::post('contact', ContactController::class)->middleware('throttle:contact');
    Route::post('views', PageViewController::class)->middleware('throttle:views');
});

Route::prefix('ops')->middleware(EnsureOpsToken::class)->group(function () {
    Route::post('github-sync', [OpsController::class, 'githubSync']);
    Route::get('status', [OpsController::class, 'status']);
});
