<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PokemonController;

Route::prefix('pokemon')->group(function () {
    Route::get('/search-list/{term}', [PokemonController::class, 'searchList']);
    Route::get('/search/{name}', [PokemonController::class, 'search']);
});
