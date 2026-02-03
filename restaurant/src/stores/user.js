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
    },
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    login(email, password) {
      // Mock login implementation
      if (email && password) {
        let role = 'user'
        if (email === 'admin@coinregal.com' && password === 'admin123') {
          role = 'admin'
        }
        
        this.user = { email, name: email.split('@')[0], role }
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
      this.orderCount = 0 
      localStorage.removeItem('user')
      // we keep orderCount for user convenience in this demo, but for admin logout consistency:
      if (this.user?.role === 'admin') localStorage.removeItem('orderCount') 
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
