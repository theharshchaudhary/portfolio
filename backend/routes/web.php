<?php

use Illuminate\Support\Facades\Route;

// In production the static site answers "/"; Laravel only handles /api and /admin.
Route::redirect('/', '/admin');
