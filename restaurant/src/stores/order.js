import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', {
  state: () => ({
    currentOrder: null,
    orderHistory: []
  }),

  actions: {
    async createOrder(orderData) {
      // Simulation pour l'instant
      this.currentOrder = {
        id: 'ORD-' + Date.now(),
        status: 'pending', // pending, preparing, delivering, delivered
        createdAt: new Date().toISOString(),
        ...orderData
      }
      return this.currentOrder
    },

    addToHistory(order) {
      this.orderHistory.unshift(order)
    }
  }
})
