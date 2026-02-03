<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-3xl font-bold mb-6 text-primary flex items-center">
      <span class="mr-3">🛒</span> Mon Panier
    </h1>

    <div v-if="cartStore.items.length === 0" class="text-center py-16 bg-white rounded-xl shadow-sm">
      <div class="text-6xl mb-4">🍽️</div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
      <p class="text-gray-500 mb-6">Découvrez nos délicieux plats et commencez à commander !</p>
      <RouterLink to="/menu" class="bg-secondary text-primary font-bold py-3 px-8 rounded-lg hover:bg-yellow-500 transition inline-block">
        Parcourir le menu
      </RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items List -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
          <span class="font-bold text-gray-700">{{ cartStore.itemCount }} articles</span>
          <button @click="cartStore.clearCart" class="text-red-500 text-sm hover:underline">Vider le panier</button>
        </div>
        
        <div class="p-4">
          <CartItem 
            v-for="(item, index) in cartStore.items" 
            :key="index"
            :item="item"
            :index="index"
            @update-qty="handleUpdateQty"
          />
        </div>
      </div>

      <!-- Summary & Checkout -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-md p-6 sticky top-4">
          <h2 class="text-xl font-bold mb-4 text-primary">Récapitulatif</h2>
          
          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{{ cartStore.cartTotal.toFixed(2) }} CHF</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Livraison (estimée)</span>
              <span class="text-sm italic">Calculé à l'étape suivante</span>
            </div>
            <div class="border-t pt-3 flex justify-between items-center text-lg font-bold text-primary">
              <span>Total</span>
              <span>{{ cartStore.cartTotal.toFixed(2) }} CHF</span>
            </div>
          </div>

          <RouterLink to="/checkout" class="w-full bg-secondary text-primary font-bold py-3 px-4 rounded-lg hover:bg-yellow-500 transition block text-center shadow-md">
            Passer la commande
          </RouterLink>
          
          <RouterLink to="/menu" class="block text-center mt-4 text-gray-500 hover:text-primary text-sm">
            Continuer mes achats
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import CartItem from '@/components/cart/CartItem.vue'

const cartStore = useCartStore()

const handleUpdateQty = ({ index, quantity }) => {
  cartStore.updateQuantity(index, quantity)
}
</script>