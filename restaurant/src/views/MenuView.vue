<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-primary">Notre Menu</h1>
    
    <div v-if="menuStore.loading" class="text-center py-10">
      Chargement...
    </div>

    <div v-else>
      <!-- Categories Filter -->
      <div class="flex overflow-x-auto pb-4 mb-6 gap-2">
        <button 
          v-for="category in menuStore.categories" 
          :key="category.id"
          class="px-4 py-2 rounded-full whitespace-nowrap transition-colors"
          :class="selectedCategory === category.id ? 'bg-secondary text-primary font-bold' : 'bg-white text-gray-600 border hover:bg-gray-50'"
          @click="selectedCategory = category.id"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
        >
          <!-- Image Placeholder -->
          <div class="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
            <span class="text-4xl">🍕</span>
          </div>

          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-primary">{{ product.name }}</h3>
              <span class="bg-primary text-white px-2 py-1 rounded text-sm font-bold">
                {{ product.price.toFixed(2) }} CHF
              </span>
            </div>
            
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ product.description }}</p>

            <button class="w-full bg-secondary text-primary font-bold py-2 rounded-lg hover:bg-yellow-500 transition">
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMenuStore } from '@/stores/menu'

const menuStore = useMenuStore()
const selectedCategory = ref('pizzas')

const filteredProducts = computed(() => {
  return menuStore.getProductsByCategory(selectedCategory.value)
})
</script>
