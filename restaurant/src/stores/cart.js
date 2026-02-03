import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart_items') || '[]')
  }),

  getters: {
    itemCount: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
    
    cartTotal: (state) => {
      return state.items.reduce((total, item) => {
        let itemPrice = item.product.price
        
        // Extras
        if (item.options?.extras && item.options.extras.length > 0) {
           item.options.extras.forEach(extra => {
             itemPrice += extra.price || 0
           })
        }

        // Tacos Meats Supplements
        if (item.options?.meats && item.options.meats.length > 1) {
            if (item.options.meats.length === 2) itemPrice += 1
            else if (item.options.meats.length >= 3) itemPrice += 2
        }
        
        return total + (itemPrice * item.quantity)
      }, 0)
    },

    loyaltyDiscount: (state) => {
      const userStore = useUserStore()
      if (!userStore.isEligibleForFreeItem) return 0
      if (state.items.length === 0) return 0
      
      // Réduction de 10 CHF pour la 11ème commande
      return Math.min(10, state.cartTotal)
    },

    finalTotal: (state) => {
      return Math.max(0, state.cartTotal - state.loyaltyDiscount)
    }
  },

  actions: {
    addItem(product, quantity = 1, options = {}) {
      const existingItemIndex = this.items.findIndex(item => 
        item.product.id === product.id && 
        JSON.stringify(item.options) === JSON.stringify(options)
      )

      if (existingItemIndex > -1) {
        this.items[existingItemIndex].quantity += quantity
      } else {
        this.items.push({
          product,
          quantity,
          options,
          timestamp: Date.now()
        })
      }
      this.saveCart()
    },

    removeItem(index) {
      this.items.splice(index, 1)
      this.saveCart()
    },

    updateQuantity(index, quantity) {
      if (quantity > 0) {
        this.items[index].quantity = quantity
        this.saveCart()
      } else {
        this.removeItem(index)
      }
    },

    clearCart() {
      this.items = []
      this.saveCart()
    },

    saveCart() {
      localStorage.setItem('cart_items', JSON.stringify(this.items))
    }
  }
})
