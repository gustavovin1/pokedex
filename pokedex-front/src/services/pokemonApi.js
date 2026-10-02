const API_BASE = '/api/pokemon'
const POKEAPI_BASE = 'https://pokeapi.co/api/v2'
const useDirectPokeApi = import.meta.env.VITE_POKEAPI_DIRECT === 'true'
let pokemonCatalogPromise

async function request(url, options = {}) {
  const response = await fetch(url, options)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'Não foi possível carregar os dados da Pokédex.')
  }

  return payload
}

export function getPokemonList({ search = '', type = '', page = 1, perPage = 24 } = {}, options = {}) {
  if (useDirectPokeApi) {
    return getDirectPokemonList({ search, type, page, perPage }, options)
  }

  const query = new URLSearchParams({ page, per_page: perPage })
  if (search) query.set('search', search)
  if (type) query.set('type', type)

  return request(`${API_BASE}?${query}`, options)
}

export function getPokemonTypes(options = {}) {
  if (useDirectPokeApi) {
    return request(`${POKEAPI_BASE}/type`, options).then((payload) => payload.results)
  }

  return request(`${API_BASE}/types`, options)
}

export async function getPokemonDetails(identifier) {
  if (useDirectPokeApi) {
    return normalizePokemon(await request(`${POKEAPI_BASE}/pokemon/${encodeURIComponent(identifier)}`))
  }

  const payload = await request(`${API_BASE}/${encodeURIComponent(identifier)}`)
  return payload.data
}

async function getDirectPokemonList({ search, type, page, perPage }, options) {
  let candidates
  let total

  if (type) {
    const payload = await request(`${POKEAPI_BASE}/type/${encodeURIComponent(type)}`, options)
    candidates = payload.pokemon.map(({ pokemon }) => toCatalogEntry(pokemon))
    candidates = filterByName(candidates, search)
    total = candidates.length
  } else if (search) {
    const catalog = await getPokemonCatalog(options)
    candidates = filterByName(catalog, search)
    total = candidates.length
  } else {
    const offset = (page - 1) * perPage
    const payload = await request(`${POKEAPI_BASE}/pokemon?offset=${offset}&limit=${perPage}`, options)
    candidates = payload.results.map(toCatalogEntry)
    total = payload.count
  }

  const pageItems = type || search
    ? candidates.slice((page - 1) * perPage, page * perPage)
    : candidates
  const data = await Promise.all(pageItems.map(async ({ name }) => {
    const details = await request(`${POKEAPI_BASE}/pokemon/${encodeURIComponent(name)}`, options)
    return normalizePokemon(details)
  }))

  return {
    data,
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      last_page: Math.max(1, Math.ceil(total / perPage)),
    },
  }
}

function getPokemonCatalog(options) {
  if (!pokemonCatalogPromise) {
    pokemonCatalogPromise = request(`${POKEAPI_BASE}/pokemon?limit=2000`, options)
      .then((payload) => payload.results.map(toCatalogEntry))
      .catch((error) => {
        pokemonCatalogPromise = undefined
        throw error
      })
  }

  return pokemonCatalogPromise
}

function toCatalogEntry(pokemon) {
  return { name: pokemon.name, url: pokemon.url }
}

function filterByName(pokemon, search) {
  const term = search.trim().toLowerCase()
  return term ? pokemon.filter(({ name }) => name.includes(term)) : pokemon
}

function normalizePokemon(pokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    height: pokemon.height,
    weight: pokemon.weight,
    sprites: {
      front_default: pokemon.sprites?.front_default ?? null,
      official_artwork: pokemon.sprites?.other?.['official-artwork']?.front_default ?? null,
    },
    types: pokemon.types?.map(({ type }) => type.name) ?? [],
    abilities: pokemon.abilities?.map(({ ability, is_hidden }) => ({
      name: ability.name,
      is_hidden,
    })) ?? [],
    stats: pokemon.stats?.map(({ stat, base_stat }) => ({
      name: stat.name,
      base_stat,
    })) ?? [],
  }
}