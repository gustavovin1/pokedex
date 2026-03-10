<template>
  <div>
    <input
      v-model="term"
      @input="search"
      placeholder="Buscar pokemon..."
    />

    <ul>
        <li v-for="pokemon in results" :key="pokemon.name">

        <img
            :src="getImage(pokemon.url)"
            width="50"
            @error="setDefault"

        />

        {{ pokemon.name }}

        </li>
    </ul>
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