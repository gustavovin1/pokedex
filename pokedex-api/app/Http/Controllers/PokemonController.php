<?php

namespace App\Http\Controllers;

use App\Services\PokemonService;

class PokemonController extends Controller
{
    protected $pokemonService;

    public function __construct(PokemonService $pokemonService)
    {
        $this->pokemonService = $pokemonService;
    }

    public function searchList($term)
    {
        return $this->pokemonService->searchByTerm($term);
    }

    public function search($name)
    {
        return $this->pokemonService->search($name);
    }
}
