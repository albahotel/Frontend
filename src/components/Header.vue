<template>
  <header class="bg-stone-50 shadow-sm">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Логотип -->
        <router-link
          to="/dashboard"
          class="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          AlbaHotel
        </router-link>

        <!-- Навигация -->
        <div class="flex space-x-8">
          <router-link
            to="/dashboard"
            active-class="border-b-2 border-indigo-600 text-indigo-600"
            class="text-gray-500 hover:text-indigo-600 px-1 pt-1 text-sm font-medium transition-colors"
          >
            Dashboard
          </router-link>

          <router-link
            to="/add_booking"
            active-class="border-b-2 border-indigo-600 text-indigo-600"
            class="text-gray-500 hover:text-indigo-600 px-1 pt-1 text-sm font-medium transition-colors"
          >
            Add Booking
          </router-link>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
/* Стили уже встроены в классы Tailwind */
</style>
