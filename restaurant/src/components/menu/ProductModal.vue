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
        <div v-if="availableSauces.length > 0" class="mb-6">
          <h4 class="font-bold text-gray-800 mb-2">Sauces (choix multiple)</h4>
          <div class="grid grid-cols-2 gap-2">
            <label 
              v-for="sauce in availableSauces" 
              :key="sauce"
              class="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 border-gray-200"
              :class="{'border-secondary ring-1 ring-secondary bg-yellow-50': selectedSauces.includes(sauce)}"
            >
              <input type="checkbox" v-model="selectedSauces" :value="sauce" class="text-secondary rounded focus:ring-secondary">
              <span class="text-sm font-medium">{{ sauce }}</span>
            </label>
          </div>
        </div>

        <!-- Meats Tacos -->
        <div v-if="availableMeats.length > 0" class="mb-6">
          <h4 class="font-bold text-gray-800 mb-2">Viandes</h4>
          <p class="text-xs text-secondary mb-2">2 viandes = +1 CHF, 3 viandes = +2 CHF</p>
          <div class="grid grid-cols-2 gap-2">
             <label 
               v-for="meat in availableMeats" 
               :key="meat"
               class="flex items-center justify-between cursor-pointer p-2 border rounded-lg hover:bg-gray-50 border-gray-200"
               :class="{'border-secondary ring-1 ring-secondary bg-yellow-50': selectedMeats.includes(meat)}"
             >
               <div class="flex items-center space-x-2">
                 <input type="checkbox" :value="meat" v-model="selectedMeats" class="text-secondary rounded focus:ring-secondary">
                 <span class="text-sm font-medium">{{ meat }}</span>
               </div>
             </label>
          </div>
        </div>

        <!-- Extras -->
        <div class="mb-6">
           <h4 class="font-bold text-gray-800 mb-2">Suppléments / Extras</h4>
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
        <div v-if="errorMessage" class="mb-4 text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
          {{ errorMessage }}
        </div>
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
const selectedSauces = ref([])
const selectedExtras = ref([])
const selectedMeats = ref([])
const errorMessage = ref('')

// Computed
const availableSauces = computed(() => {
  if (!props.product) return []
  if (props.product.hasTaosSauceChoice) return menuStore.options.tacos_sauces
  if (props.product.hasSauceChoice || props.product.hasTacosOptions) return menuStore.options.bases
  if (props.product.hasSaladSauce) return menuStore.options.salad_sauces
  return []
})

const availableMeats = computed(() => {
  if (props.product?.hasTacosOptions && menuStore.options.tacos_meats) {
    return menuStore.options.tacos_meats
  }
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
  
  // Add meats price supplement for tacos
  let meatsSupplement = 0
  if (props.product.hasTacosOptions && selectedMeats.value.length > 1) {
    if (selectedMeats.value.length === 2) meatsSupplement = 1
    else if (selectedMeats.value.length >= 3) meatsSupplement = 2
  }

  return (base + extrasTotal + meatsSupplement) * quantity.value
})

// Setup/Reset when modal opens/product changes
watch(() => props.product, () => {
  quantity.value = 1
  selectedExtras.value = []
  selectedMeats.value = []
  selectedSauces.value = []
  errorMessage.value = ''
})

const close = () => {
  emit('close')
}

const confirm = () => {
  if (availableSauces.value.length > 0 && selectedSauces.value.length === 0) {
    errorMessage.value = "Veuillez choisir au moins une sauce."
    return
  }

  if (availableMeats.value.length > 0 && selectedMeats.value.length === 0) {
    errorMessage.value = "Veuillez choisir au moins une viande."
    return
  }
  
  errorMessage.value = ''
  emit('add', {
    product: props.product,
    quantity: quantity.value,
    options: {
      sauces: selectedSauces.value,
      extras: selectedExtras.value,
      meats: selectedMeats.value
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