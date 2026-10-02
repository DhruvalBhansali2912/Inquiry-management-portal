<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Serves the React SPA. Single Page Application router handles all views
| (Public Inquiry Form, Admin Login, Dashboard, Inquiries, Detail, etc.)
*/
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
