<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-primary">Notre Menu</h1>
    
    <div v-if="menuStore.loading" class="text-center py-10">
      Chargement...
    </div>

    <div v-else>
      <!-- Search Bar -->
      <div class="mb-6 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Rechercher un produit (Pizza, Kebab, Coca...)" 
          aria-label="Rechercher un produit"
          class="pl-10 w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary focus:border-transparent shadow-sm"
        >
      </div>

      <!-- Categories Filter -->
      <div class="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar" role="group" aria-label="Filtrer par catégorie">
        <button 
          @click="selectedCategory = 'all'"
          :aria-pressed="selectedCategory === 'all'"
          class="px-4 py-2 rounded-full whitespace-nowrap transition-colors border shadow-sm"
          :class="selectedCategory === 'all' ? 'bg-secondary text-primary font-bold border-secondary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
        >
          Tout
        </button>
        <button 
          v-for="category in menuStore.categories" 
          :key="category.id"
          :aria-pressed="selectedCategory === category.id"
          class="px-4 py-2 rounded-full whitespace-nowrap transition-colors border shadow-sm"
          :class="selectedCategory === category.id ? 'bg-secondary text-primary font-bold border-secondary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
          @click="selectedCategory = category.id"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DishCard 
          v-for="product in filteredProducts" 
          :key="product.id"
          :product="product"
          @add-to-cart="openProductModal"
        />
        
        <!-- No Results -->
        <div v-if="filteredProducts.length === 0" class="col-span-full text-center py-10 bg-gray-50 rounded-xl">
          <p class="text-gray-500 text-lg">Aucun produit ne correspond à votre recherche 😕</p>
          <button @click="resetFilters" class="mt-2 text-secondary font-bold underline">Voir tout le menu</button>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <ProductModal 
      :is-open="isModalOpen"
      :product="selectedProduct"
      @close="isModalOpen = false"
      @add="addToCart"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast' // Toast
import DishCard from '@/components/menu/DishCard.vue'
import ProductModal from '@/components/menu/ProductModal.vue'

const menuStore = useMenuStore()
const cartStore = useCartStore()
const toast = useToastStore()
const selectedCategory = ref('all') // Default to 'all' is better for search
const searchQuery = ref('')

// Modal State
const isModalOpen = ref(false)
const selectedProduct = ref(null)

const filteredProducts = computed(() => {
  let products = menuStore.products

  // Filter by Category
  if (selectedCategory.value !== 'all') {
    products = products.filter(p => p.categoryId === selectedCategory.value)
  }

  // Filter by Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query))
    )
  }

  return products
})

const resetFilters = () => {
  selectedCategory.value = 'all'
  searchQuery.value = ''
}

const openProductModal = (product) => {
  selectedProduct.value = product
  isModalOpen.value = true
}

const addToCart = (payload) => {
  cartStore.addItem(payload.product, payload.quantity, payload.options)
  isModalOpen.value = false
  toast.success(`Ajouté: ${payload.quantity}x ${payload.product.name}`)
}
</script>
