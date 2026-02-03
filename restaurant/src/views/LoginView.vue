<template>
  <div class="max-w-md mx-auto py-10 px-4">
    <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h1 class="text-2xl font-bold mb-6 text-center text-primary">
        {{ isLogin ? 'Connexion' : 'Inscription' }}
      </h1>
      
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent" 
            placeholder="votre@email.com"
          >
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
          <input 
            v-model="password" 
            type="password" 
            required
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent" 
            placeholder="********"
          >
        </div>

        <button 
          type="submit" 
          class="w-full bg-secondary text-primary font-bold py-3 rounded-lg hover:bg-yellow-500 transition shadow-md"
        >
          {{ isLogin ? 'Se connecter' : "S'inscrire" }}
        </button>
      </form>
      
      <div class="mt-4 text-center">
        <button 
          @click="isLogin = !isLogin" 
          class="text-sm text-gray-600 hover:text-primary underline"
        >
          {{ isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter' }}
        </button>
      </div>

      <div class="mt-8 border-t pt-4">
        <h3 class="font-bold text-center mb-2">Programme de fidélité 🎁</h3>
        <p class="text-sm text-gray-500 text-center">
          Créez un compte et profitez d'un article offert (max 10 CHF) toutes les 10 commandes !
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const router = useRouter()
const userStore = useUserStore()

const handleSubmit = () => {
  let success = false
  if (isLogin.value) {
    success = userStore.login(email.value, password.value)
  } else {
    success = userStore.register(email.value, password.value)
  }
  
  if (success) {
     // Redirect to profile or admin if admin
     if (userStore.isAdmin) router.push('/admin')
     else router.push('/profil')
  } else {
     alert("Erreur d'authentification")
  }
}
</script>
