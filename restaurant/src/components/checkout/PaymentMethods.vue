<template>
  <div class="bg-white p-6 rounded-xl shadow-md">
    <h3 class="text-xl font-bold mb-4 text-primary">Paiement</h3>
    
    <div class="space-y-3">
      <label 
        class="flex items-center p-4 border rounded-lg cursor-pointer transition hover:bg-gray-50"
        :class="{'border-secondary ring-1 ring-secondary bg-yellow-50': modelValue === 'cash'}"
      >
        <input 
          type="radio" 
          :value="'cash'" 
          :checked="modelValue === 'cash'"
          @change="$emit('update:modelValue', 'cash')"
          class="h-5 w-5 text-secondary focus:ring-secondary"
        >
        <span class="ml-3 font-medium flex-grow">Espèces (Recommandé)</span>
        <span class="text-2xl">💵</span>
      </label>

      <label 
        class="flex items-center p-4 border rounded-lg cursor-pointer transition hover:bg-gray-50"
        :class="{'border-secondary ring-1 ring-secondary bg-yellow-50': modelValue === 'twint'}"
      >
        <input 
          type="radio" 
          :value="'twint'" 
          :checked="modelValue === 'twint'"
          @change="$emit('update:modelValue', 'twint')"
          class="h-5 w-5 text-secondary focus:ring-secondary"
        >
        <span class="ml-3 font-medium flex-grow">TWINT</span>
        <span class="font-bold text-red-600 italic mr-2 text-xl">TWINT</span>
      </label>

      <label 
        class="flex items-center p-4 border rounded-lg cursor-pointer transition hover:bg-gray-50 opacity-60"
        title="Bientôt disponible"
      >
        <input 
          type="radio" 
          name="payment" 
          disabled
          class="h-5 w-5 text-gray-300"
        >
        <span class="ml-3 font-medium flex-grow text-gray-400">Carte Bancaire (Bientôt)</span>
        <span class="text-2xl grayscale">💳</span>
      </label>
    </div>

    <!-- Twint details if selected -->
    <div v-if="modelValue === 'twint'" class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
      <p class="font-bold mb-2">Comment payer via TWINT :</p>
      <ol class="list-decimal pl-4 space-y-1">
        <li>Scannez le QR Code à la livraison ou envoyez au <strong>079 000 00 00</strong></li>
        <li>Indiquez votre numéro de commande en commentaire</li>
        <li>Montrez la confirmation au livreur</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String
})

defineEmits(['update:modelValue'])
</script>