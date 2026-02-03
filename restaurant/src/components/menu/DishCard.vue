<template>
  <div 
    class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full"
  >
    <!-- Image -->
    <div class="h-48 bg-gray-200 relative">
      <img 
        v-if="product.image"
        :src="'./img/dishes/' + product.image" 
        :alt="product.name"
        class="w-full h-full object-cover"
        @error="$event.target.style.display='none'"
      />
      <!-- Fallback / Placeholder (shown if no image or error hides the img) -->
      <div class="absolute inset-0 flex items-center justify-center text-gray-400 -z-0">
        <span class="text-4xl">🍕</span>
      </div>

      <span v-if="product.isBestSeller" class="absolute top-2 right-2 bg-secondary text-primary text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">
        Best-seller
      </span>
    </div>

    <div class="p-4 flex flex-col flex-grow">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-xl font-bold text-primary">{{ product.name }}</h3>
        <span class="bg-primary text-white px-2 py-1 rounded text-sm font-bold whitespace-nowrap ml-2">
          {{ product.price.toFixed(2) }} CHF
        </span>
      </div>
      
      <p class="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{{ product.description }}</p>

      <button 
        @click="$emit('add-to-cart', product)"
        class="w-full bg-secondary text-primary font-bold py-2 rounded-lg hover:bg-yellow-500 transition active:scale-95"
      >
        Ajouter au panier
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})

defineEmits(['add-to-cart'])
</script>