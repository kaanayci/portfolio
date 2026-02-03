<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 text-primary">📦 Suivi des Commandes</h2>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="order in orderStore.allOrders" 
        :key="order.id"
        class="bg-white rounded-xl shadow border p-4 flex flex-col justify-between"
        :class="rigorousStatusColor(order.status)"
      >
        <!-- Header -->
        <div class="flex justify-between items-start mb-4 border-b pb-2">
          <div>
            <span class="font-bold text-lg">#{{ order.id }}</span>
            <p class="text-xs text-gray-500">{{ new Date(order.createdAt).toLocaleString() }}</p>
          </div>
          <span class="px-2 py-1 rounded text-xs uppercase font-bold text-white bg-gray-500" :class="getStatusBadge(order.status)">
            {{ getStatusLabel(order.status) }}
          </span>
        </div>

        <!-- Details -->
        <div class="mb-4 flex-grow">
          <p class="font-bold mb-1">{{ order.customerName }}</p>
          <p class="text-sm text-gray-600 mb-2">
            {{ order.details?.customer?.address || order.customer?.address || 'Pas d\'adresse' }}
          </p>
          <p v-if="order.details?.customer?.phone" class="text-sm text-gray-600">
             Tel: {{ order.details.customer.phone }}
          </p>
          
          <ul class="text-sm space-y-1 bg-gray-50 p-2 rounded mt-2">
            <li v-for="(item, idx) in order.items" :key="idx" class="flex justify-between">
              <span>{{ item.quantity }}x {{ item.product.name }}</span>
              <!-- Show sauce/meat options if any (simplified) -->
            </li>
          </ul>
          
          <div v-if="order.details && order.details.comment" class="mt-2 text-xs bg-yellow-50 p-2 border border-yellow-200 rounded text-yellow-800">
             📝 Note: {{ order.details.comment }}
          </div>
        </div>

        <!-- Total -->
        <div class="flex justify-between items-center font-bold text-lg mb-4">
           <span>Total</span>
           <span>{{ order.total.toFixed(2) }} CHF</span>
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-2 gap-2 mt-auto print:hidden">
          <button @click="printTicket(order)" class="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded text-sm font-bold flex items-center justify-center">
            🖨️ Ticket
          </button>
          
          <select 
            :value="order.status" 
            @change="e => updateStatus(order.id, e.target.value)"
            class="border rounded text-sm p-1 font-bold"
          >
             <option value="pending">En attente</option>
             <option value="preparing">En cuisine</option>
             <option value="ready">Prêt</option>
             <option value="delivered">Livré</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="orderStore.allOrders.length === 0" class="text-center py-10 text-gray-500">
       Aucune commande pour le moment.
    </div>

    <!-- Hidden Ticket Template for Printing -->
    <div id="print-area" class="hidden print:block print:w-full">
       <div v-if="printOrder" class="ticket p-0 bg-white text-black font-mono text-xs w-[300px] mx-auto">
          <div class="text-center mb-4">
            <h1 class="text-xl font-bold">COIN RÉGAL</h1>
            <p>123 Rue de la Liberté</p>
            <p>1200 Genève</p>
          </div>
          <div class="border-b border-black mb-2 flex justify-between">
             <span>CMD: {{ printOrder.id }}</span>
             <span>{{ new Date(printOrder.createdAt).toLocaleTimeString() }}</span>
          </div>
          
          <div class="mb-4">
             <p class="font-bold">{{ printOrder.customerName }}</p>
             <p>{{ printOrder.details?.customer?.address || printOrder.customer?.address || '' }}</p>
             <p>Tel: {{ printOrder.details?.customer?.phone || printOrder.customer?.phone || '' }}</p>
             <p v-if="printOrder.details?.comment">NOTE: {{ printOrder.details.comment }}</p>
             
             <!-- QR Code Map -->
             <div v-if="qrCodeUrl" class="my-2 flex flex-col items-center">
               <img :src="qrCodeUrl" class="w-24 h-24 border border-black" />
               <span class="text-[10px] mt-1">Scanner pour l'itinéraire</span>
             </div>
          </div>

          <table class="w-full mb-4 text-left">
             <tr v-for="(item, i) in printOrder.items" :key="i" class="align-top border-b border-dashed border-gray-400">
                <td class="w-8 font-bold pt-2">{{ item.quantity }}x</td>
                <td class="pt-2 pb-2">
                   <div class="font-bold">{{ item.product.name }}</div>
                   
                   <!-- Sauces -->
                   <div v-if="item.options?.sauces && item.options.sauces.length" class="pl-2">
                     - Sauces: {{ item.options.sauces.join(', ') }}
                   </div>
                   
                   <!-- Viandes -->
                   <div v-if="item.options?.meats && item.options.meats.length" class="pl-2">
                     - Viandes: {{ item.options.meats.join(', ') }}
                   </div>
                   
                   <!-- Extras -->
                   <div v-if="item.options?.extras && item.options.extras.length" class="pl-2">
                      <div v-for="ex in item.options.extras" :key="ex.name || ex">
                        + {{ ex.name || ex }}
                      </div>
                   </div>

                   <!-- Commentaire Item -->
                   <div v-if="item.options?.comment" class="pl-2 font-bold mt-1">
                     Note: {{ item.options.comment }}
                   </div>
                </td>
                <td class="text-right pt-2 font-bold">{{ (item.product.price * item.quantity).toFixed(2) }}</td>
             </tr>
          </table>

          <div class="border-t border-black pt-2 flex justify-between text-lg font-bold">
             <span>TOTAL</span>
             <span>{{ printOrder.total.toFixed(2) }} CHF</span>
          </div>
          
          <div class="mt-8 text-center">
             <p>MERCI DE VOTRE VISITE !</p>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import QRCode from 'qrcode'

const orderStore = useOrderStore()
// For live reload simulation
let intervalId = null

const printOrder = ref(null)
const qrCodeUrl = ref(null)

const getStatusBadge = (status) => {
   const map = {
     pending: 'bg-red-500',
     preparing: 'bg-orange-500',
     ready: 'bg-green-500',
     delivered: 'bg-blue-500'
   }
   return map[status] || 'bg-gray-500'
}

const getStatusLabel = (status) => {
   const map = {
     pending: 'En attente',
     preparing: 'En cuisine',
     ready: 'Prêt',
     delivered: 'Livré'
   }
   return map[status] || status
}

// Just for visual border color on card
const rigorousStatusColor = (status) => {
    return status === 'pending' ? 'border-red-500 border-l-4' : 'border-gray-200'
}

const updateStatus = (id, status) => {
   orderStore.updateStatus(id, status)
}

const printTicket = async (order) => {
   printOrder.value = order
   
   // Generate QR Code for delivery address
   const address = order.details?.customer?.address || order.customer?.address
   if (address) {
     const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
     try {
       qrCodeUrl.value = await QRCode.toDataURL(mapsUrl, { width: 120, margin: 1 })
     } catch (err) {
       console.error('QR Gen Error', err)
       qrCodeUrl.value = null
     }
   } else {
     qrCodeUrl.value = null
   }

   setTimeout(() => {
     window.print()
   }, 100)
}

onMounted(() => {
   // Initial load
   orderStore.reloadFromStorage()
   
   // Poll for new orders (since localStorage events don't trigger in same tab, but we want to be safe)
   intervalId = setInterval(() => {
      orderStore.reloadFromStorage()
   }, 5000)
   
   window.addEventListener('storage', () => {
      orderStore.reloadFromStorage()
   })
})

onUnmounted(() => {
   if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
@media print {
  /* Hide everything in the body by default */
  :global(body > *) {
    visibility: hidden;
  }
  
  /* Make sure the main app container is technically visible for flow, 
     but its children are hidden unless they are the print area */
  :global(#app) {
    visibility: visible;
  }
  
  :global(#app > *) {
    visibility: hidden;
  }

  /* Make print area visible and positioned absolutely to cover everything */
  #print-area {
    visibility: visible;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    background: white;
    color: black;
    z-index: 9999;
  }
  
  /* Ensure children of print area are visible */
  #print-area * {
    visibility: visible;
  }

  .ticket {
     font-family: 'Courier New', Courier, monospace;
     width: 80mm; /* Largeur standard ticket */
     max-width: 100%;
     margin: 0;
     padding: 5mm;
     font-size: 12px;
     line-height: 1.2;
  }

  /* Forcer le noir et blanc pour le thermique */
  .ticket * {
    color: black !important;
    border-color: black !important;
  }
  
  @page { 
    margin: 0; 
    size: auto;
  }
}
</style>