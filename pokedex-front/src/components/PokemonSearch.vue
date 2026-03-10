<template>
  <div>
    <input
      v-model="term"
      @input="search"
      placeholder="Buscar pokemon..."
    />

    <ul>
        <li v-for="pokemon in results" :key="pokemon.name">

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

</script>