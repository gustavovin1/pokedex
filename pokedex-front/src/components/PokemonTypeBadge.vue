<script setup>
import {
  Brain,
  Bug,
  Circle,
  Cog,
  Droplets,
  Flame,
  Gem,
  Ghost,
  Leaf,
  Moon,
  Mountain,
  Shield,
  Skull,
  Snowflake,
  Sparkles,
  Swords,
  Wind,
  Zap,
} from '@lucide/vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
})

const typeIcons = {
  bug: Bug,
  dark: Moon,
  dragon: Swords,
  electric: Zap,
  fairy: Sparkles,
  fighting: Shield,
  fire: Flame,
  flying: Wind,
  ghost: Ghost,
  grass: Leaf,
  ground: Mountain,
  ice: Snowflake,
  normal: Circle,
  poison: Skull,
  psychic: Brain,
  rock: Gem,
  steel: Cog,
  water: Droplets,
}

function formatName(name) {
  return name.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}
</script>

<template>
  <span class="type-badge" :class="`type-${type}`">
    <component :is="typeIcons[type] || Circle" :size="11" :stroke-width="2" aria-hidden="true" />
    {{ formatName(type) }}
  </span>
</template>