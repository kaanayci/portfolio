<template>
  <div class="flex items-start py-4 border-b last:border-0 pl-1">
    <!-- Image (Hidden on mobile used for cart list, but can be added) -->
    <div class="h-20 w-20 bg-gray-100 rounded-lg hidden sm:flex items-center justify-center text-gray-400 mr-4 flex-shrink-0">
      <span class="text-xl">🍕</span>
    </div>

    <div class="flex-grow">
      <div class="flex justify-between items-start">
        <h4 class="font-bold text-primary">{{ item.product.name }}</h4>
        <div class="font-bold text-primary pl-2">
          {{ calculateItemTotal(item).toFixed(2) }} 
        </div>
      </div>
      
      <!-- Options details -->
      <div class="text-sm text-gray-500 mb-2">
         <div v-if="item.options?.sauces && item.options.sauces.length > 0">
           Sauce(s): {{ item.options.sauces.join(', ') }}
         </div>
         <div v-else-if="item.options?.sauce">
           Sauce: {{ item.options.sauce }}
         </div>

         <div v-if="item.options?.meats && item.options.meats.length > 0">
           Viandes: {{ item.options.meats.join(', ') }}
         </div>

         <div v-if="item.options?.extras && item.options.extras.length > 0">
           Suppléments: {{ item.options.extras.map(e => e.name).join(', ') }}
         </div>

         <div v-if="item.options?.comment" class="mt-1 text-orange-600 italic border-l-2 border-orange-300 pl-2">
           Note: {{ item.options.comment }}
         </div>
      </div>

      <!-- Qty Controls -->
      <div class="flex items-center justify-between mt-2 max-w-[150px]">
        <div class="flex items-center border rounded-md bg-white shadow-sm">
          <button 
            @click="updateQty(item.quantity - 1)" 
            class="px-2 py-1 text-gray-600 hover:text-red-500 transition"
          >
            <svg v-if="item.quantity === 1" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span v-else>-</span>
          </button>
          <span class="px-2 text-sm font-medium w-6 text-center select-none">{{ item.quantity }}</span>
          <button 
            @click="updateQty(item.quantity + 1)" 
            class="px-2 py-1 text-gray-600 hover:text-green-600 transition"
          >+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update-qty'])

const updateQty = (newQty) => {
  emit('update-qty', { index: props.index, quantity: newQty })
}

const calculateItemTotal = (item) => {
  let price = item.product.price
  if (item.selectedExtras) {
    item.selectedExtras.forEach(e => price += e.price)
  }
  return price * item.quantity
}
</script>