<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Http;

class PokemonRepository
{
    public function list($limit = 10000)
    {
        $response = Http::get("https://pokeapi.co/api/v2/pokemon?limit=".$limit);

        return $response->json()['results'];
    }

    public function findByName($name)
    {
        $pokemon = Http::get("https://pokeapi.co/api/v2/pokemon/".$name);
        if ($pokemon->failed()) {
            return "not found";
        }

        return [
            'name'   => $pokemon['name'],
            'height' => $pokemon['height'],
            'weight' => $pokemon['weight'],
            'sprite' => $pokemon['sprites']['front_default'],
            'types'  => collect($pokemon['types'])->pluck('type.name')
        ];
    }
}
