import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useOrderStore = defineStore('order', {
  state: () => ({
    // Load ALL orders from storage (Admin view)
    orders: JSON.parse(localStorage.getItem('all_orders') || '[]')
  }),

  getters: {
    // Get orders for the current logged-in user
    userOrders: (state) => {
      const userStore = useUserStore()
      if (!userStore.user) return []
      return state.orders.filter(o => o.customerEmail === userStore.user.email)
    },
    
    // Get all orders (Admin view)
    allOrders: (state) => {
       return state.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },

    pendingOrders: (state) => {
      return state.orders.filter(o => o.status === 'pending').length
    }
  },

  actions: {
    createOrder(orderData) {
      const userStore = useUserStore()
      
      const newOrder = {
        id: 'CR-' + Math.floor(Math.random() * 1000000),
        status: 'pending', // pending, preparing, ready, delivered
        createdAt: new Date().toISOString(),
        customerEmail: userStore.user?.email || 'guest',
        customerName: orderData.details?.customer?.name || orderData.customer?.name || 'Client',
        ...orderData
      }

      this.orders.unshift(newOrder)
      this.saveOrders()
      return newOrder
    },

    updateStatus(orderId, newStatus) {
      const order = this.orders.find(o => o.id === orderId)
      if (order) {
        order.status = newStatus
        this.saveOrders()
      }
    },

    saveOrders() {
      localStorage.setItem('all_orders', JSON.stringify(this.orders))
      // Trigger event for other tabs
      window.dispatchEvent(new Event('storage')) 
    },
    
    // To be called when storage changes in another tab
    reloadFromStorage() {
       const stored = localStorage.getItem('all_orders')
       if (stored) {
         this.orders = JSON.parse(stored)
       }
    }
  }
})

