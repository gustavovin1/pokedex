<?php

namespace App\Services;

use App\Repositories\PokemonRepository;
use Illuminate\Support\Facades\Cache;

class PokemonService
{
    protected $pokemonRepository;

    public function __construct(PokemonRepository $pokemonRepository)
    {
        $this->pokemonRepository = $pokemonRepository;
    }

    public function searchByTerm($term)
    {
        $pokemons = Cache::remember('pokemon_list', 3600, function () {
            return $this->pokemonRepository->list();
        });

        return collect($pokemons)
            ->filter(function ($pokemon) use ($term) {
                return str_contains($pokemon['name'], strtolower($term));
            })
            ->values();
    }

    public function search($name)
    {
        return $this->pokemonRepository->findByName($name);
    }
}
