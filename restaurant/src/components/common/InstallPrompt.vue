<template>
  <div v-if="showInstallPrompt" class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-primary text-white p-4 rounded-xl shadow-2xl z-50 flex flex-col animate-slide-up border border-secondary">
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center space-x-3">
        <div class="bg-white p-2 rounded-lg h-12 w-12 flex items-center justify-center text-2xl">🍔</div>
        <div>
          <h3 class="font-bold text-lg">Installer l'application</h3>
          <p class="text-xs text-gray-300">Commandez plus rapidement et hors-ligne !</p>
        </div>
      </div>
      <button @click="dismiss" class="text-gray-400 hover:text-white">✕</button>
    </div>
    
    <div class="flex space-x-2 mt-2">
      <button 
        @click="installPWA"
        class="flex-1 bg-secondary text-primary font-bold py-2 rounded-lg hover:bg-yellow-500 transition text-sm"
      >
        Installer
      </button>
      <button 
        @click="dismiss"
        class="flex-1 bg-transparent border border-gray-500 text-white font-bold py-2 rounded-lg hover:bg-white/10 transition text-sm"
      >
        Plus tard
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
let deferredPrompt = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later.
    deferredPrompt = e
    // Update UI notify the user they can install the PWA
    showInstallPrompt.value = true
  })
})

const installPWA = async () => {
  if (!deferredPrompt) return
  
  // Show the install prompt
  deferredPrompt.prompt()
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice
  console.log(`User response to the install prompt: ${outcome}`)
  
  // We've used the prompt, and can't use it again, discard it
  deferredPrompt = null
  showInstallPrompt.value = false
}

const dismiss = () => {
  showInstallPrompt.value = false
}
</script>

<style scoped>
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>