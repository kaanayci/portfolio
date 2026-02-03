import { defineStore } from 'pinia'
import menuData from '@/data/menu.json'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    categories: [],
    products: [],
    options: {},
    loading: false,
    error: null
  }),

  getters: {
    getCategoryById: (state) => (id) => {
      return state.categories.find(c => c.id === id)
    },
    
    getProductsByCategory: (state) => (categoryId) => {
      return state.products.filter(p => p.categoryId === categoryId)
    },

    getBestSellers: (state) => {
      return state.products.filter(p => p.isBestSeller)
    },

    getProductById: (state) => (id) => {
      return state.products.find(p => p.id === id)
    }
  },

  actions: {
    fetchMenu() {
      this.loading = true
      try {
        // Simulation d'un appel API
        this.categories = menuData.categories
        this.products = menuData.products
        this.options = menuData.options
      } catch (err) {
        this.error = "Erreur lors du chargement du menu"
        console.error(err)
      } finally {
        this.loading = false
      }
    }
  }
})
