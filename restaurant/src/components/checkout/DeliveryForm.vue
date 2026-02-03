<template>
  <div class="bg-white p-6 rounded-xl shadow-md mb-6">
    <h3 class="text-xl font-bold mb-4 text-primary">Mode de réception</h3>
    
    <div class="flex space-x-4 mb-6">
      <button 
        @click="updateMethod('delivery')"
        class="flex-1 py-3 px-4 rounded-lg border-2 font-bold transition flex items-center justify-center space-x-2"
        :class="modelValue.method === 'delivery' ? 'border-secondary bg-yellow-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'"
      >
        <span>🛵</span>
        <span>Livraison</span>
      </button>
      <button 
        @click="updateMethod('takeaway')"
        class="flex-1 py-3 px-4 rounded-lg border-2 font-bold transition flex items-center justify-center space-x-2"
        :class="modelValue.method === 'takeaway' ? 'border-secondary bg-yellow-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'"
      >
        <span>🛍️</span>
        <span>À emporter</span>
      </button>
    </div>

    <form @submit.prevent>
      <!-- Common Fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
          <input 
            type="text" 
            v-model="formData.name"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
            required
            placeholder="Jean Dupont"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input 
            type="tel" 
            v-model="formData.phone"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
            required
            placeholder="079 123 45 67"
          >
        </div>
      </div>

      <!-- Detail Fields based on method -->
      <div v-if="modelValue.method === 'delivery'" class="space-y-4 animate-fade-in">
        <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Zone de livraison</label>
           <select 
             v-model="selectedZone"
             class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
           >
             <option :value="null" disabled>Sélectionner votre localité</option>
             <option v-for="zone in deliveryZones" :key="zone.id" :value="zone">
               {{ zone.name }} (Min. {{ zone.minOrder }} CHF)
             </option>
           </select>
           <p v-if="selectedZone && cartTotal < selectedZone.minOrder" class="text-red-500 text-xs mt-1">
             ⚠️ Minimum de commande pour {{ selectedZone.name }} : {{ selectedZone.minOrder }} CHF
             (Manque {{ (selectedZone.minOrder - cartTotal).toFixed(2) }} CHF)
           </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
          <textarea 
            v-model="formData.address"
            rows="2"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
            required
            placeholder="Rue de la Gare 15, 2610 Saint-Imier"
          ></textarea>
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Remarques (Code porte, étage...)</label>
           <input 
             type="text" 
             v-model="formData.notes"
             class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
             placeholder="Sonnette Dupont, 3ème étage"
           >
        </div>
      </div>

      <div v-else class="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p>📍 Retrait au restaurant : <strong>Coin Régal</strong></p>
        <p>Rue des Marchandises 1, 2610 Saint-Imier</p>
        <p class="mt-1">Votre commande sera prête dans environ 20-30 minutes.</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  cartTotal: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'validation-change'])

// Constants
const deliveryZones = [
  { id: 1, name: 'Saint-Imier', minOrder: 0 },
  { id: 2, name: 'Sonvilier / Villeret', minOrder: 15 },
  { id: 3, name: 'Renan / Cormoret / Courtelary', minOrder: 40 }
]

// State
const formData = ref({
  name: '',
  phone: '',
  address: '',
  notes: ''
})
const selectedZone = ref(null)

// Watchers to update parent v-model
watch([formData, selectedZone], () => {
  emit('update:modelValue', {
    ...props.modelValue,
    customer: formData.value,
    zone: selectedZone.value
  })
}, { deep: true })

// Validation Logic to parent
const isValid = computed(() => {
  if (!formData.value.name || !formData.value.phone) return false
  
  if (props.modelValue.method === 'delivery') {
    if (!formData.value.address || !selectedZone.value) return false
    if (props.cartTotal < selectedZone.value.minOrder) return false
  }
  
  return true
})

watch(isValid, (val) => {
  emit('validation-change', val)
})

const updateMethod = (method) => {
  emit('update:modelValue', { ...props.modelValue, method })
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-in;
}
</style>