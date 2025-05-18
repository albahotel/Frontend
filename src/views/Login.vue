<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Вход в систему</h2>

      <!-- Форма логина -->
      <div class="space-y-4">
        <!-- Поле логина -->
        <div>
          <label for="login" class="block text-sm font-medium text-gray-700">Логин</label>
          <input
            id="login"
            type="text"
            v-model="form.login"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Введите ваш логин"
          />
        </div>

        <!-- Поле пароля -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Пароль</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Введите ваш пароль"
          />
        </div>

        <!-- Сообщение об ошибке -->
        <div v-if="errorMessage" class="text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>

        <!-- Кнопка входа -->
        <div>
          <button
            @click="handleLogin"
            :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            <span v-if="isLoading">Вход...</span>
            <span v-else>Войти</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Реактивные данные формы
const form = ref({
  login: '',
  password: '',
})

// Состояние загрузки и ошибки
const isLoading = ref(false)
const errorMessage = ref('')

// Роутер для перенаправления
const router = useRouter()

// Функция для логина
const handleLogin = async () => {
  // Сбрасываем сообщение об ошибке
  errorMessage.value = ''
  isLoading.value = true

  try {
    // Отправляем POST-запрос на create-mobile-token
    const response = await axios.post('http://192.168.0.131:8000/create-mobile-token', {
      login: form.value.login,
      password: form.value.password,
    })

    // Предполагаем, что сервер возвращает объект с токеном
    const { token } = response.data

    // Сохраняем токен в localStorage
    localStorage.setItem('authToken', token)

    // Перенаправляем пользователя на страницу Dashboard
    router.push({ name: 'Dashboard' })
  } catch (error) {
    // Обрабатываем ошибку
    if (error.response) {
      errorMessage.value = error.response.data.message || 'Ошибка логина. Проверьте данные.'
    } else {
      errorMessage.value = 'Не удалось подключиться к серверу.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Стили уже встроены в Tailwind */
</style>
