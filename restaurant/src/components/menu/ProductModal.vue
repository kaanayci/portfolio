<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Overlay -->
    <div @click="close" class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
    
    <!-- Modal Content -->
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
      
      <!-- Header -->
      <div class="p-4 border-b flex justify-between items-center bg-gray-50">
        <h3 class="text-xl font-bold text-primary">{{ product?.name }}</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="p-4 overflow-y-auto">
        <p class="text-gray-600 mb-6 italic">{{ product?.description }}</p>
        
        <!-- Sauces -->
        <div v-if="product?.hasSauceChoice || product?.hasTaosSauceChoice" class="mb-6">
          <h4 class="font-bold text-gray-800 mb-2">Sauce</h4>
          <div class="grid grid-cols-2 gap-2">
            <label 
              v-for="sauce in availableSauces" 
              :key="sauce"
              class="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 border-gray-200"
              :class="{'border-secondary ring-1 ring-secondary bg-yellow-50': selectedSauce === sauce}"
            >
              <input type="radio" v-model="selectedSauce" :value="sauce" class="text-secondary focus:ring-secondary">
              <span class="text-sm font-medium">{{ sauce }}</span>
            </label>
          </div>
        </div>

        <!-- Extras -->
        <div class="mb-6">
           <h4 class="font-bold text-gray-800 mb-2">Sippléments / Extras</h4>
           <div class="grid grid-cols-1 gap-2">
             <label 
               v-for="extra in availableExtras" 
               :key="extra.name"
               class="flex items-center justify-between cursor-pointer p-2 border rounded-lg hover:bg-gray-50 border-gray-200"
               :class="{'border-secondary ring-1 ring-secondary bg-yellow-50': selectedExtras.includes(extra)}"
             >
               <div class="flex items-center space-x-2">
                 <input type="checkbox" :value="extra" v-model="selectedExtras" class="text-secondary rounded focus:ring-secondary">
                 <span class="text-sm font-medium">{{ extra.name }}</span>
               </div>
               <span class="text-sm text-gray-500">+ {{ extra.price.toFixed(2) }}</span>
             </label>
           </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t bg-gray-50">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-600 font-medium">Quantité</span>
          <div class="flex items-center border rounded-lg bg-white">
            <button 
              @click="quantity > 1 ? quantity-- : null" 
              class="px-3 py-1 text-gray-600 hover:text-primary font-bold text-lg disabled:opacity-50"
              :disabled="quantity <= 1"
            >-</button>
            <span class="px-2 font-bold w-8 text-center">{{ quantity }}</span>
            <button 
              @click="quantity++" 
              class="px-3 py-1 text-gray-600 hover:text-primary font-bold text-lg"
            >+</button>
          </div>
        </div>

        <button 
          @click="confirm"
          class="w-full bg-secondary text-primary font-bold py-3 rounded-lg hover:bg-yellow-500 transition shadow-md flex justify-between px-6"
        >
          <span>Ajouter au panier</span>
          <span>{{ totalPrice.toFixed(2) }} CHF</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMenuStore } from '@/stores/menu'

const props = defineProps({
  isOpen: Boolean,
  product: Object
})

const emit = defineEmits(['close', 'add'])
const menuStore = useMenuStore()

// State
const quantity = ref(1)
const selectedSauce = ref(null)
const selectedExtras = ref([])

// Computed
const availableSauces = computed(() => {
  if (!props.product) return []
  if (props.product.hasTaosSauceChoice) return menuStore.options.tacos_sauces
  if (props.product.hasSauceChoice) return menuStore.options.bases
  if (props.product.hasSaladSauce) return menuStore.options.salad_sauces
  return []
})

const availableExtras = computed(() => {
  if (!props.product) return []
  if (props.product.categoryId === 'pizzas') return menuStore.options.pizza_extras || []
  return menuStore.options.extras || []
})

const totalPrice = computed(() => {
  if (!props.product) return 0
  let base = props.product.price
  
  // Add extras price
  const extrasTotal = selectedExtras.value.reduce((acc, extra) => acc + extra.price, 0)
  
  return (base + extrasTotal) * quantity.value
})

// Setup/Reset when modal opens/product changes
watch(() => props.product, () => {
  quantity.value = 1
  selectedExtras.value = []
  if (availableSauces.value.length > 0) {
    selectedSauce.value = availableSauces.value[0]
  } else {
    selectedSauce.value = null
  }
})

const close = () => {
  emit('close')
}

const confirm = () => {
  emit('add', {
    product: props.product,
    quantity: quantity.value,
    options: {
      sauce: selectedSauce.value,
      extras: selectedExtras.value
    }
  })
}
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}
</style>