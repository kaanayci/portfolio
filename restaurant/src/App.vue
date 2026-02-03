<script setup>
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header Placeholder -->
    <header class="bg-primary text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold text-secondary">Coin Régal</h1>
        <nav>
          <RouterLink to="/" class="mr-4 hover:text-secondary">Accueil</RouterLink>
          <RouterLink to="/menu" class="hover:text-secondary">Menu</RouterLink>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto p-4">
      <RouterView />
    </main>

    <!-- Footer Placeholder -->
    <footer class="bg-dark text-white p-4 text-center mt-auto">
      <p>&copy; 2026 Coin Régal. Tous droits réservés.</p>
    </footer>
  </div>
</template>
