<template>
  <div class="w-3/12 flex flex-col h-full overflow-hidden">
    <div class="bg-stone-50 rounded-lg shadow-md p-4 h-full flex flex-col overflow-y-auto">
      <!-- Заголовок -->
      <div class="mb-6 pt-3 py-5">
        <h2 class="text-base font-semibold text-gray-900 text-center text-xl leading-8 truncate">
          Notifications
        </h2>
      </div>

      <!-- Состояния загрузки и ошибок -->
      <div v-if="loading" class="text-gray-500">Loading...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <div v-if="is_empty === 1" class="text-center text-gray-500 py-6">
        No notifications
      </div>
      <!-- Список уведомлений -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="mb-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="font-medium block">Room {{ notification.room_number }}</span>
              <span class="text-sm text-gray-500 mt-1 block">
                {{ notification.category_name }}
              </span>
            </div>
          </div>
          <p class="text-sm mb-2">{{ notification.comment }}</p>
          <div class="flex justify-between items-end">
            <div class="text-xs text-gray-500">
              <div>Создано: {{ formatDate(notification.created_at) }}</div>
              <div v-if="notification.completed_at">
                Завершено: {{ formatDate(notification.completed_at) }}
              </div>
            </div>
            <!-- Кнопка завершения -->
            <button
              @click="completeAlert(notification.id)"
              class="py-1.5 px-3 bg-indigo-600 rounded-xl text-xs font-semibold text-white transition-all duration-300 hover:bg-indigo-700"
              :disabled="notification.completed_at"
            >
              {{ notification.completed_at ? 'Завершено' : 'Завершить' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'

const API_HOST = 'http://10.65.158.59:8000'
const WS_HOST = 'ws://10.65.158.59:8000'

const notifications = ref([])
const loading = ref(true)
const error = ref(null)
const ws = ref(null)
const updateInterval = ref(null)
const is_empty = ref(0)

// Форматирование даты
const formatDate = (dateString) => {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return new Date(dateString).toLocaleDateString('ru-RU', options)
}

// Первичная загрузка данных через REST API
const fetchAlerts = async () => {
  try {
    const response = await axios.get(`${API_HOST}/api/alert`)
    notifications.value = response.data
    if (notifications.value.length === 0) {
      is_empty.value = 1
    }
    loading.value = false
  } catch (err) {
    error.value = 'Ошибка загрузки уведомлений'
    loading.value = false
  }
}

// Инициализация WebSocket
const initWebSocket = () => {
  ws.value = new WebSocket(`${WS_HOST}/ws/alert`)

  ws.value.onopen = () => {
    console.log('WebSocket connected')
    // Запускаем периодические запросы
    updateInterval.value = setInterval(() => {
      ws.value.send(
        JSON.stringify({
          action: 'get_awaiting_alerts',
          data: null,
        }),
      )
    }, 5000)
  }

  ws.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      console.log('Received message:', data)
      if (data.action === 'get_awaiting_alerts') {
        notifications.value = data.alerts
        if (notifications.value.length === 0) {
          is_empty.value = 1
        } else {
          is_empty.value = 0
        }
      }
    } catch (err) {
      console.error('Error parsing message:', err)
    }
  }

  ws.value.onerror = (error) => {
    console.error('WebSocket error:', error)
    error.value = 'Ошибка соединения'
  }

  ws.value.onclose = () => {
    console.log('WebSocket closed')
    if (updateInterval.value) clearInterval(updateInterval.value)
  }
}

// Завершение уведомления
const completeAlert = (alertId) => {
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
    error.value = 'Соединение не активно'
    return
  }

  ws.value.send(
    JSON.stringify({
      action: 'complete_alert',
      data: { alert_id: alertId },
    }),
  )
}

// Жизненный цикл компонента
onMounted(async () => {
  await fetchAlerts()
  initWebSocket()
})

onBeforeUnmount(() => {
  if (ws.value) {
    ws.value.close()
  }
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
})
</script>

<style>
/* Стили скроллбара */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(243, 244, 246, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1);
}

* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 5px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #a5b4fc;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #818cf8;
}

html {
  scroll-behavior: smooth;
}

tbody {
  scrollbar-gutter: stable both-edges;
}
</style>
