<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
    <transition-group name="toast">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id"
        class="pointer-events-auto min-w-[300px] p-4 rounded-lg shadow-lg flex items-center justify-between text-white transform transition-all duration-300"
        :class="{
          'bg-green-500': toast.type === 'success',
          'bg-red-500': toast.type === 'error',
          'bg-blue-500': toast.type === 'info'
        }"
      >
        <div class="flex items-center">
          <span v-if="toast.type === 'success'" class="mr-2">✅</span>
          <span v-if="toast.type === 'error'" class="mr-2">❌</span>
          <span v-if="toast.type === 'info'" class="mr-2">ℹ️</span>
          <span class="font-medium">{{ toast.message }}</span>
        </div>
        <button @click="toastStore.remove(toast.id)" class="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'
const toastStore = useToastStore()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>