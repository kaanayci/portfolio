<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-primary">Notre Menu</h1>
    
    <div v-if="menuStore.loading" class="text-center py-10">
      Chargement...
    </div>

    <div v-else>
      <!-- Categories Filter -->
      <div class="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
        <button 
          v-for="category in menuStore.categories" 
          :key="category.id"
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
import DishCard from '@/components/menu/DishCard.vue'
import ProductModal from '@/components/menu/ProductModal.vue'

const menuStore = useMenuStore()
const cartStore = useCartStore()
const selectedCategory = ref('pizzas')

// Modal State
const isModalOpen = ref(false)
const selectedProduct = ref(null)

const filteredProducts = computed(() => {
  return menuStore.getProductsByCategory(selectedCategory.value)
})

const openProductModal = (product) => {
  selectedProduct.value = product
  isModalOpen.value = true
}

const addToCart = (payload) => {
  cartStore.addItem(payload.product, payload.quantity, payload.options)
  isModalOpen.value = false
  // Optional: Show toast notification
}
</script>
