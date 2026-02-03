<template>
  <div class="container mx-auto p-4 max-w-3xl">
    <!-- Back Link -->
    <RouterLink to="/panier" class="inline-flex items-center text-gray-500 hover:text-primary mb-6 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Retour au panier
    </RouterLink>

    <h1 class="text-3xl font-bold mb-6 text-primary">Finaliser la commande</h1>

    <div v-if="cartStore.itemCount === 0" class="text-center py-10 bg-white rounded-xl shadow-md">
      <p class="mb-4">Votre panier est vide.</p>
      <RouterLink to="/menu" class="text-secondary font-bold hover:underline">Retourner au menu</RouterLink>
    </div>

    <div v-else>
      <!-- Step 1: Delivery Info -->
      <DeliveryForm 
        v-model="orderData" 
        :cartTotal="cartStore.cartTotal"
        @validation-change="isFormValid = $event"
      />

      <!-- Step 2: Payment -->
      <PaymentMethods 
        v-model="paymentMethod" 
        class="mb-6"
      />

      <!-- Order Summary (Mini) -->
      <div class="bg-white p-6 rounded-xl shadow-md mb-6 border-t-4 border-secondary">
        <h3 class="text-lg font-bold mb-4">Total à payer</h3>
        <div class="flex justify-between items-center text-3xl font-bold text-primary">
          <span>Total TTC</span>
          <span>{{ cartStore.cartTotal.toFixed(2) }} CHF</span>
        </div>
        <p class="text-gray-500 text-sm mt-2 text-right">TVA incluse</p>
      </div>

      <!-- Action -->
      <button 
        @click="submitOrder"
        :disabled="!isFormValid || isSubmitting"
        class="w-full bg-secondary text-primary font-bold py-4 rounded-xl hover:bg-yellow-500 transition shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <svg v-if="isSubmitting" class="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isSubmitting ? 'Traitement en cours...' : 'Confirmer la commande' }}</span>
      </button>
      
      <p v-if="!isFormValid" class="text-center text-red-500 mt-4 text-sm">
        Veuillez remplir tous les champs obligatoires et vérifier le minimum de commande.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import DeliveryForm from '@/components/checkout/DeliveryForm.vue'
import PaymentMethods from '@/components/checkout/PaymentMethods.vue'

const router = useRouter()
const cartStore = useCartStore()
// const orderStore = useOrderStore() // Will be used later

const orderData = ref({
  method: 'delivery', // 'delivery' | 'takeaway'
  customer: {},
  zone: null
})

const paymentMethod = ref('cash')
const isFormValid = ref(false)
const isSubmitting = ref(false)

const submitOrder = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true

  // Simulate API call
  setTimeout(() => {
    // Generate simulated Order ID
    const orderId = 'CR-' + Math.floor(Math.random() * 1000000)

    console.log('Order Submitted:', {
      items: cartStore.items,
      total: cartStore.cartTotal,
      details: orderData.value,
      payment: paymentMethod.value,
      id: orderId
    })

    // Success -> Clear Cart & Redirect
    cartStore.clearCart()
    isSubmitting.value = false
    
    // In real app, redirect to confirmation page
    router.push('/') 
    alert(`Commande confirmée ! Numéro : ${orderId}`)
    
  }, 1500)
}
</script>