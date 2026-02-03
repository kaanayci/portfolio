<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-primary">Administration</h1>
      
      <!-- Tabs -->
      <div class="flex space-x-2 bg-gray-200 p-1 rounded-lg">
        <button 
           @click="activeTab = 'stock'"
           class="px-4 py-2 rounded-md transition font-bold"
           :class="activeTab === 'stock' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'"
        >
          📦 Stock
        </button>
        <button 
           @click="activeTab = 'orders'"
           class="px-4 py-2 rounded-md transition font-bold flex items-center"
           :class="activeTab === 'orders' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'"
        >
          📝 Commandes
          <span class="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{{ orderStore.pendingOrders }}</span>
        </button>
      </div>
    </div>

    <!-- STOCK VIEW -->
    <div v-if="activeTab === 'stock'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Gestion des Produits</h2>
        <button @click="resetStock" class="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm">
          Tout Disponible
        </button>
      </div>

    <!-- Filters -->
    <div class="mb-6 flex gap-4 overflow-x-auto pb-2">
      <button 
        @click="selectedCategory = 'all'"
        class="px-4 py-2 rounded-full whitespace-nowrap transition-colors border"
        :class="selectedCategory === 'all' ? 'bg-secondary text-primary font-bold border-secondary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
      >
        Tout
      </button>
      <button 
        v-for="cat in menuStore.categories" 
        :key="cat.id"
        @click="selectedCategory = cat.id"
        class="px-4 py-2 rounded-full whitespace-nowrap transition-colors border"
        :class="selectedCategory === cat.id ? 'bg-secondary text-primary font-bold border-secondary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Stock Table -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 text-gray-600 uppercase text-sm font-bold">
          <tr>
            <th class="p-4 border-b">ID</th>
            <th class="p-4 border-b">Produit</th>
            <th class="p-4 border-b">Prix</th>
            <th class="p-4 border-b">Statut</th>
            <th class="p-4 border-b">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-gray-50">
            <td class="p-4 text-gray-500">#{{ product.id }}</td>
            <td class="p-4 font-medium text-gray-900">{{ product.name }}</td>
            <td class="p-4">{{ product.price.toFixed(2) }} CHF</td>
            <td class="p-4">
               <span 
                 class="px-2 py-1 rounded text-sm font-bold"
                 :class="product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
               >
                 {{ product.available ? 'Disponible' : 'Indisponible' }}
               </span>
            </td>
            <td class="p-4">
              <label class="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  class="sr-only peer"
                  :checked="product.available"
                  @change="toggleProduct(product)"
                >
                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                <span class="ms-3 text-sm font-medium text-gray-900">{{ product.available ? 'On' : 'Off' }}</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
    
    <!-- ORDERS VIEW -->
    <div v-if="activeTab === 'orders'">
      <AdminOrders />
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { useOrderStore } from '@/stores/order'
import AdminOrders from '@/components/admin/AdminOrders.vue'

const menuStore = useMenuStore()
const orderStore = useOrderStore()
const activeTab = ref('stock')

// Stock Logic
const selectedCategory = ref('all')

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'all') return menuStore.products
  return menuStore.products.filter(p => p.categoryId === selectedCategory.value)
})

const toggleProduct = (product) => {
  menuStore.toggleAvailability(product.id, !product.available)
}

const resetStock = () => {
  if(confirm("Voulez-vous rendre tous les produits disponibles ?")) {
     menuStore.products.forEach(p => menuStore.toggleAvailability(p.id, true))
  }
}
</script>
