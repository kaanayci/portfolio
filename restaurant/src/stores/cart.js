import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart_items') || '[]')
  }),

  getters: {
    itemCount: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
    
    cartTotal: (state) => {
      return state.items.reduce((total, item) => {
        let itemPrice = item.product.price
        
        // Ajouter le prix des extras
        if (item.selectedExtras && item.selectedExtras.length > 0) {
           item.selectedExtras.forEach(extra => {
             itemPrice += extra.price || 0
           })
        }
        
        return total + (itemPrice * item.quantity)
      }, 0)
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
          options, // Sauces, etc.
          selectedExtras: options.extras || [],
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
