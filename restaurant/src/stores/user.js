import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null, // Firebase user object
    profile: null, // Firestore user data
    isAuthenticated: false,
    loyaltyPoints: 0
  }),

  actions: {
    setUser(user) {
      this.user = user
      this.isAuthenticated = !!user
    },

    setProfile(profile) {
      this.profile = profile
      if (profile && profile.loyaltyPoints) {
        this.loyaltyPoints = profile.loyaltyPoints
      }
    },

    addLoyaltyPoints(amount) {
      // 1 CHF = 1 Point
      this.loyaltyPoints += Math.floor(amount)
      // TODO: Update Firestore
    },

    logout() {
      this.user = null
      this.profile = null
      this.isAuthenticated = false
      this.loyaltyPoints = 0
    }
  }
})
