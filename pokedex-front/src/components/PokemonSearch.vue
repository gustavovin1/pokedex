<template>
  <div>
    <input
      v-model="term"
      @input="search"
      placeholder="Buscar pokemon..."
    />

  <div class="pokemon-grid">

    <div
      v-for="pokemon in results"
      :key="pokemon.name"
      class="pokemon-card"
    >

      <img
        :src="getImage(pokemon.url)"
        width="80"
        @error="setDefault"
      />

      <div class="pokemon-name">
        {{ pokemon.name.replaceAll('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
      </div>

    </div>

  </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const term = ref('')
const results = ref([])

async function search(){

  if(term.value.length < 2){
    results.value = []
    return
  }

  const response = await fetch(`/api/pokemon/search-list/${term.value}`)
  
  const data = await response.json()

  results.value = data
}

function getImage(url){

  const parts = url.split('/')
  const id = parts[parts.length - 2]

  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`

}

function setDefault(event){
  event.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'
}
</script>
<style scoped>

.pokemon-grid{
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px,1fr));
  gap: 15px;
  margin-top: 20px;
}

.pokemon-card{
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  background: white;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 3px 8px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: transform 0.2s;
}

.pokemon-card:hover{
  transform: scale(1.05);
}

.pokemon-name{
  margin-top: 8px;
  font-weight: bold;
  text-transform: capitalize;
}

</style>