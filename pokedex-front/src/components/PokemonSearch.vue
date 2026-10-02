<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getPokemonDetails, getPokemonList, getPokemonTypes } from '../services/pokemonApi'

const search = ref('')
const selectedType = ref('')
const currentPage = ref(1)
const pokemon = ref([])
const types = ref([])
const pagination = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)
const errorMessage = ref('')
const selectedPokemon = ref(null)
const detailLoading = ref(false)
const detailError = ref('')
let listController
let debounceTimer
let detailRequest = 0

const pageNumbers = computed(() => {
  const first = Math.max(1, currentPage.value - 2)
  const last = Math.min(pagination.value.last_page, first + 4)
  return Array.from({ length: last - first + 1 }, (_, index) => first + index)
})

const statLabels = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. especial',
  'special-defense': 'Def. especial',
  speed: 'Velocidade',
}

function formatName(name = '') {
  return name.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatNumber(id) {
  return `#${String(id).padStart(4, '0')}`
}

function typeClass(type) {
  return `type-${type}`
}

function imageFor(item, artwork = false) {
  return artwork
    ? item.sprites?.official_artwork || item.sprites?.front_default
    : item.sprites?.front_default || item.sprites?.official_artwork
}

function changePage(page) {
  if (page < 1 || page > pagination.value.last_page || page === currentPage.value) return
  currentPage.value = page
}

async function loadPokemon() {
  listController?.abort()
  const controller = new AbortController()
  listController = controller
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await getPokemonList({
      search: search.value.trim(),
      type: selectedType.value,
      page: currentPage.value,
      perPage: 24,
    }, { signal: controller.signal })
    pokemon.value = result.data
    pagination.value = result.meta
  } catch (error) {
    if (!controller.signal.aborted && error.name !== 'AbortError') {
      errorMessage.value = error.message
      pokemon.value = []
    }
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

async function openDetails(item) {
  const requestId = ++detailRequest
  selectedPokemon.value = item
  detailLoading.value = true
  detailError.value = ''

  try {
    const details = await getPokemonDetails(item.id)
    if (requestId === detailRequest) selectedPokemon.value = details
  } catch (error) {
    if (requestId === detailRequest) detailError.value = error.message
  } finally {
    if (requestId === detailRequest) detailLoading.value = false
  }
}

function closeDetails() {
  detailRequest += 1
  selectedPokemon.value = null
  detailLoading.value = false
}

function handleKeydown(event) {
  if (event.key === 'Escape' && selectedPokemon.value) closeDetails()
}

watch([search, selectedType], () => {
  currentPage.value = 1
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(loadPokemon, 250)
})

watch(currentPage, loadPokemon)

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  loadPokemon()
  try {
    const result = await getPokemonTypes()
    types.value = result.data
  } catch {
    types.value = []
  }
})

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  listController?.abort()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <main class="pokedex-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="Pokédex, início">
        <span class="brand-mark" aria-hidden="true"><span></span></span>
        <span>POKÉDEX<span class="brand-period">.</span></span>
      </a>
      <div class="topbar-note"><span class="live-dot"></span> DATABASE ONLINE</div>
    </header>

    <section id="top" class="intro" aria-labelledby="page-title">
      <div class="intro-copy">
        <p class="eyebrow"><span>01</span> NATIONAL INDEX</p>
        <h1 id="page-title">Conheça todos.<br><span>Um por um.</span></h1>
        <p class="intro-description">Uma coleção para explorar, comparar e descobrir o mundo Pokémon.</p>
      </div>
      <div class="intro-stat" aria-label="Quantidade de resultados">
        <span class="intro-stat-label">REGISTROS</span>
        <strong>{{ String(pagination.total || 0).padStart(4, '0') }}</strong>
        <span class="intro-stat-foot">espécies catalogadas</span>
      </div>
    </section>

    <section class="catalog" aria-label="Catálogo de Pokémon">
      <div class="catalog-toolbar">
        <label class="search-field">
          <span class="search-icon" aria-hidden="true">⌕</span>
          <span class="visually-hidden">Buscar Pokémon por nome</span>
          <input v-model="search" type="search" placeholder="Buscar por nome..." autocomplete="off">
          <kbd>⌕</kbd>
        </label>
        <label class="filter-field">
          <span class="visually-hidden">Filtrar por tipo</span>
          <select v-model="selectedType">
            <option value="">Todos os tipos</option>
            <option v-for="type in types" :key="type.name" :value="type.name">{{ formatName(type.name) }}</option>
          </select>
          <span class="select-arrow" aria-hidden="true">⌄</span>
        </label>
        <p class="result-count" aria-live="polite">
          <span>{{ loading ? '···' : String(pagination.total).padStart(3, '0') }}</span> RESULTADOS
        </p>
      </div>

      <div v-if="loading" class="pokemon-grid" aria-label="Carregando Pokémon" aria-busy="true">
        <div v-for="item in 12" :key="item" class="pokemon-skeleton"></div>
      </div>
      <div v-else-if="errorMessage" class="state-panel state-error" role="alert">
        <span class="state-code">CONNECTION_ERROR</span>
        <h2>Não foi possível carregar a Pokédex.</h2>
        <p>{{ errorMessage }}</p>
        <button class="text-button" type="button" @click="loadPokemon">Tentar novamente <span aria-hidden="true">↗</span></button>
      </div>
      <div v-else-if="pokemon.length" class="pokemon-grid">
        <button
          v-for="item in pokemon"
          :key="item.id"
          class="pokemon-card"
          :class="`card-${item.types[0] || 'normal'}`"
          type="button"
          :aria-label="`Ver detalhes de ${formatName(item.name)}`"
          @click="openDetails(item)"
        >
          <span class="card-number">{{ formatNumber(item.id) }}</span>
          <span class="card-art">
            <img v-if="imageFor(item)" :src="imageFor(item)" :alt="formatName(item.name)" loading="lazy">
            <span v-else class="image-fallback" aria-hidden="true">{{ formatName(item.name).slice(0, 1) }}</span>
          </span>
          <span class="card-info">
            <span class="card-name">{{ formatName(item.name) }}</span>
            <span class="type-list">
              <span v-for="type in item.types" :key="type" class="type-badge" :class="typeClass(type)">{{ formatName(type) }}</span>
            </span>
          </span>
          <span class="card-arrow" aria-hidden="true">↗</span>
        </button>
      </div>
      <div v-else class="state-panel">
        <span class="state-code">NO_MATCH_FOUND</span>
        <h2>Nenhum Pokémon encontrado.</h2>
        <p>Experimente outro nome ou remova o filtro selecionado.</p>
      </div>

      <nav v-if="!loading && !errorMessage && pagination.last_page > 1" class="pagination" aria-label="Paginação do catálogo">
        <button type="button" class="page-arrow" :disabled="currentPage === 1" aria-label="Página anterior" @click="changePage(currentPage - 1)">←</button>
        <button
          v-for="page in pageNumbers"
          :key="page"
          type="button"
          class="page-number"
          :class="{ 'is-current': page === currentPage }"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="changePage(page)"
        >{{ String(page).padStart(2, '0') }}</button>
        <span class="page-divider">/</span>
        <span class="page-total">{{ String(pagination.last_page).padStart(2, '0') }}</span>
        <button type="button" class="page-arrow" :disabled="currentPage === pagination.last_page" aria-label="Próxima página" @click="changePage(currentPage + 1)">→</button>
      </nav>
    </section>

    <footer class="page-footer">
      <span>POKÉDEX <span class="brand-period">/</span> FULL-STACK STUDY</span>
      <span>DATA PROVIDED BY POKEAPI</span>
    </footer>

    <Transition name="modal">
      <div v-if="selectedPokemon" class="modal-backdrop" @click.self="closeDetails">
        <section class="pokemon-modal" role="dialog" aria-modal="true" :aria-label="`Detalhes de ${formatName(selectedPokemon.name)}`">
          <button class="modal-close" type="button" aria-label="Fechar detalhes" @click="closeDetails">×</button>
          <div class="modal-visual" :class="`card-${selectedPokemon.types?.[0] || 'normal'}`">
            <span class="modal-number">{{ formatNumber(selectedPokemon.id) }}</span>
            <img v-if="imageFor(selectedPokemon, true)" :src="imageFor(selectedPokemon, true)" :alt="formatName(selectedPokemon.name)">
            <span v-else class="image-fallback" aria-hidden="true">{{ formatName(selectedPokemon.name).slice(0, 1) }}</span>
          </div>
          <div class="modal-content">
            <p class="eyebrow"><span>SPECIMEN</span> {{ formatNumber(selectedPokemon.id) }}</p>
            <h2>{{ formatName(selectedPokemon.name) }}</h2>
            <div class="type-list modal-types">
              <span v-for="type in selectedPokemon.types" :key="type" class="type-badge" :class="typeClass(type)">{{ formatName(type) }}</span>
            </div>
            <p v-if="detailError" class="detail-error" role="alert">{{ detailError }}</p>
            <div v-if="detailLoading" class="detail-loading" role="status">Carregando dados...</div>
            <template v-else-if="!detailError">
              <div class="measurements">
                <div><span>ALTURA</span><strong>{{ (selectedPokemon.height / 10).toFixed(1) }} <small>m</small></strong></div>
                <div><span>PESO</span><strong>{{ (selectedPokemon.weight / 10).toFixed(1) }} <small>kg</small></strong></div>
              </div>
              <div class="detail-block">
                <h3>HABILIDADES <span>{{ String(selectedPokemon.abilities?.length || 0).padStart(2, '0') }}</span></h3>
                <div class="ability-list">
                  <span v-for="ability in selectedPokemon.abilities" :key="ability.name">{{ formatName(ability.name) }}<i v-if="ability.is_hidden"> · oculta</i></span>
                </div>
              </div>
              <div class="detail-block">
                <h3>ATRIBUTOS <span>BASE STATS</span></h3>
                <div v-for="stat in selectedPokemon.stats" :key="stat.name" class="stat-row">
                  <span class="stat-label">{{ statLabels[stat.name] || formatName(stat.name) }}</span>
                  <span class="stat-track"><span :style="{ width: `${Math.min(stat.base_stat / 255 * 100, 100)}%` }"></span></span>
                  <strong>{{ String(stat.base_stat).padStart(3, '0') }}</strong>
                </div>
              </div>
            </template>
          </div>
        </section>
      </div>
    </Transition>
  </main>
</template>