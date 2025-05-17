<!-- components/Notifications.vue -->
<template>
  <div class="w-3/12 flex flex-col h-full overflow-hidden">
    <div class="bg-stone-50 rounded-lg shadow-md p-4 h-full flex flex-col overflow-y-auto">
      <h2 class="text-xl font-semibold mb-4">Уведомления</h2>
      
      <div v-if="loading" class="text-gray-500">Загрузка...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <div v-else class="flex-1">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="mb-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="font-medium">Комната {{ notification.room_number }}</span>
              <span class="text-sm text-gray-500 ml-2">{{ notification.category_name }}</span>
            </div>
            <span 
              class="text-xs px-2 py-1 rounded-full"
              :class="notification.completed_at ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
            >
              {{ notification.completed_at ? 'Завершено' : 'Активно' }}
            </span>
          </div>
          <p class="text-sm mb-2">{{ notification.comment }}</p>
          <div class="text-xs text-gray-500">
            <div>Создано: {{ formatDate(notification.created_at) }}</div>
            <div v-if="notification.completed_at">
              Завершено: {{ formatDate(notification.completed_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const server_host = 'http://10.65.158.59:8000'

const notifications = ref([])
const loading = ref(true)
const error = ref(null)

const formatDate = (dateString) => {
  const options = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }
  return new Date(dateString).toLocaleDateString('ru-RU', options)
}

const fetchNotifications = async () => {
  try {
    const response = await fetch(server_host + '/api/alert')
    if (!response.ok) throw new Error('Ошибка загрузки')
    notifications.value = await response.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchNotifications)
</script>