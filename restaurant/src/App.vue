<script setup>
import { onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import InstallPrompt from '@/components/common/InstallPrompt.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const menuStore = useMenuStore()
const cartStore = useCartStore()
const userStore = useUserStore()

onMounted(() => {
  menuStore.fetchMenu()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <ToastContainer />
    <!-- Header -->
    <header class="bg-primary text-white p-4 shadow-md sticky top-0 z-40">
      <div class="container mx-auto flex justify-between items-center">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center space-x-2 group">
          <img src="@/assets/logo.svg" alt="Logo" class="h-10 w-10 object-contain" />
          <span class="text-xl font-bold text-secondary group-hover:text-white transition">Coin Régal</span>
        </RouterLink>

        <!-- Nav Desktop -->
        <nav class="hidden md:flex items-center space-x-6">
          <RouterLink to="/" class="hover:text-secondary font-medium transition">Accueil</RouterLink>
          <RouterLink to="/menu" class="hover:text-secondary font-medium transition">Menu</RouterLink>
          
          <!-- Cart Icon -->
          <RouterLink to="/panier" class="relative group">
            <div class="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span v-if="cartStore.itemCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-primary">
                {{ cartStore.itemCount }}
              </span>
            </div>
          </RouterLink>

          <!-- Admin Link -->
          <RouterLink v-if="userStore.isAdmin" to="/admin" class="hover:text-secondary font-medium transition flex items-center gap-1 bg-red-800 px-3 py-1 rounded">
             <span>⚙️ Admin</span>
          </RouterLink>

          <!-- User Icon -->
          <RouterLink :to="userStore.isAuthenticated ? '/profil' : '/login'" class="flex items-center space-x-2 hover:text-secondary group">
             <div class="p-1 rounded-full border border-transparent group-hover:border-secondary transition">
                <svg v-if="userStore.isAuthenticated" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span v-else class="font-bold">Connexion</span>
             </div>
             <span v-if="userStore.isAuthenticated" class="text-xs font-bold bg-secondary text-primary px-2 py-1 rounded-full">
               {{ userStore.ordersUntilFreeItem === 0 ? '🎁 Cadeau !' : `${userStore.orderCount % 10}/10` }}
             </span>
          </RouterLink>
        </nav>

        <div class="md:hidden flex items-center space-x-4">
             <!-- Mobile User -->
             <RouterLink :to="userStore.isAuthenticated ? '/profil' : '/login'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
             </RouterLink>

            <!-- Mobile Menu Button (Placeholder) -->
            <RouterLink to="/panier" class="relative p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span v-if="cartStore.itemCount > 0" class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {{ cartStore.itemCount }}
                </span>
            </RouterLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto p-4">
      <RouterView />
    </main>

    <!-- Footer Placeholder -->
    <footer class="bg-dark text-white p-4 text-center mt-auto">
      <p>&copy; 2026 Coin Régal. Tous droits réservés.</p>
    </footer>

    <InstallPrompt />
  </div>
</template>
