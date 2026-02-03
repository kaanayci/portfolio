<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <!-- Header Profil -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-primary">Mon Profil</h1>
        <button @click="logout" class="text-sm text-red-500 font-bold hover:underline">Déconnexion</button>
      </div>
      
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
          👤
        </div>
        <div>
           <p class="font-bold text-lg">{{ userStore.user?.email }}</p>
           <p class="text-gray-500 text-sm">Membre Coin Régal</p>
        </div>
      </div>

      <!-- Fidélité -->
      <div class="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
         <h3 class="font-bold text-secondary mb-2">🎁 Fidélité</h3>
         
         <div v-if="userStore.ordersUntilFreeItem > 0">
           <p class="mb-2 text-sm">Plus que <span class="font-bold">{{ userStore.ordersUntilFreeItem }} commandes</span> avant votre récompense !</p>
           <div class="w-full bg-gray-200 rounded-full h-2.5">
             <div class="bg-secondary h-2.5 rounded-full" :style="{ width: ((userStore.orderCount % 10) * 10) + '%' }"></div>
           </div>
         </div>
         <div v-else class="text-green-600 font-bold flex items-center">
            <span>🎉 Félicitations ! Votre prochaine commande bénéficie de 10 CHF de réduction.</span>
         </div>
      </div>
    </div>

    <!-- Historique -->
    <h2 class="text-xl font-bold text-primary mb-4">Mes Commandes</h2>
    
    <div v-if="sortedOrders.length === 0" class="text-center py-8 text-gray-500 bg-white rounded-xl">
       Vous n'avez pas encore passé de commande.
       <br>
       <RouterLink to="/menu" class="text-secondary font-bold underline mt-2 inline-block">Découvrir le menu</RouterLink>
    </div>

    <div class="space-y-4">
      <div 
        v-for="order in sortedOrders" 
        :key="order.id"
        class="bg-white rounded-xl shadow p-4 border border-gray-100"
      >
        <div class="flex justify-between items-start mb-2">
           <div>
              <span class="font-bold text-primary block">Commande #{{ order.id }}</span>
              <span class="text-xs text-gray-500">{{ new Date(order.createdAt).toLocaleDateString() }} à {{ new Date(order.createdAt).toLocaleTimeString() }}</span>
           </div>
           <span class="px-2 py-1 rounded text-xs font-bold" :class="getStatusClass(order.status)">
              {{ getStatusLabel(order.status) }}
           </span>
        </div>

        <div class="py-2 border-t border-b border-dashed border-gray-200 my-2">
           <ul class="text-sm space-y-1">
             <li v-for="(item, idx) in order.items" :key="idx" class="flex justify-between">
                <span>{{ item.quantity }}x {{ item.product.name }}</span>
                <span class="font-medium">{{ (item.product.price * item.quantity).toFixed(2) }}</span>
             </li>
           </ul>
        </div>

        <div class="flex justify-between items-center mt-2">
           <span class="font-bold text-lg">Total: {{ order.total.toFixed(2) }} CHF</span>
           
           <button 
             @click="reorder(order)"
             class="bg-primary text-white text-sm font-bold px-4 py-2 rounded hover:bg-gray-800 transition flex items-center space-x-1"
           >
             <span>🔄</span>
             <span>Commander à nouveau</span>
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()
const cartStore = useCartStore()
const toast = useToastStore()

// Redirect if not logged in
if (!userStore.isAuthenticated) {
  router.push('/login')
}

// Reload orders to ensure we have fresh data
onMounted(() => {
  orderStore.reloadFromStorage()
})

const sortedOrders = computed(() => {
  // Sort user orders by date desc
  return [...orderStore.userOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const getStatusLabel = (status) => {
   const map = {
     pending: 'En attente',
     preparing: 'En cuisine',
     ready: 'Prêt',
     delivered: 'Livré'
   }
   return map[status] || status
}

const getStatusClass = (status) => {
   const map = {
     pending: 'bg-gray-100 text-gray-600',
     preparing: 'bg-orange-100 text-orange-600',
     ready: 'bg-green-100 text-green-600',
     delivered: 'bg-blue-100 text-blue-600'
   }
   return map[status] || 'bg-gray-100'
}

const logout = () => {
  userStore.logout()
  router.push('/')
}

const reorder = (order) => {
  if (confirm("Voulez-vous ajouter le contenu de cette commande à votre panier actuel ?")) {
    order.items.forEach(item => {
      // Re-add each item
      cartStore.addItem(item.product, item.quantity, item.options)
    })
    toast.success("Produits ajoutés au panier !")
    router.push('/panier')
  }
}
</script>
