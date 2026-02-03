import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('user'),
    orderCount: parseInt(localStorage.getItem('orderCount')) || 0
  }),

  getters: {
    isEligibleForFreeItem: (state) => {
      // 11ème commande gratuite (donc après 10 commandes payées)
      return state.isAuthenticated && state.orderCount > 0 && state.orderCount % 10 === 0
    },
    ordersUntilFreeItem: (state) => {
      return 10 - (state.orderCount % 10)
    }
  },

  actions: {
    login(email, password) {
      // Mock login implementation
      if (email && password) {
        this.user = { email, name: email.split('@')[0] }
        this.isAuthenticated = true
        this.saveState()
        return true
      }
      return false
    },

    register(email, password) {
      // Mock register
      return this.login(email, password)
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      this.orderCount = 0 // Optional: reset count or keep it? Keeping it in localStorage might be better if real app, but here we reset session but data is in localStorage usually.
      // But for this simplifiction let's clear data on logout so another user can login
      localStorage.removeItem('user')
      localStorage.removeItem('orderCount')
    },

    incrementOrderCount() {
      this.orderCount++
      this.saveState()
    },

    saveState() {
      if (this.user) localStorage.setItem('user', JSON.stringify(this.user))
      localStorage.setItem('orderCount', this.orderCount.toString())
    }
  }
})
