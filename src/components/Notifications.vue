<template>
  <div class="w-3/12 flex flex-col h-full overflow-hidden">
    <div class="bg-stone-50 rounded-lg shadow-md p-4 h-full flex flex-col overflow-y-auto ">
      <!-- Заголовок -->
      <div class="mb-6 pt-3 py-5">
        
        <!-- flex flex-col md:flex-row max-md:gap-3 items-center justify-between mb-5 py-5 -->
        <h2 class="text-base font-semibold text-gray-900 text-center text-xl leading-8 font-semibold text-gray-900 truncate"> <!-- Изменены стили -->
          Уведомления
        </h2>
      </div>

      <div v-if="loading" class="text-gray-500">Загрузка...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <div class="flex-1 min-h-0 overflow-y-auto ">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="mb-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="font-medium block">Комната {{ notification.room_number }}</span> <!-- Добавлен block -->
              <span class="text-sm text-gray-500 mt-1 block"> <!-- Новый блок -->
                {{ notification.category_name }}
              </span>
            </div>

          </div>
          <p class="text-sm mb-2">{{ notification.comment }}</p>
          <div class="flex justify-between items-end"> <!-- Добавлен flex-контейнер -->
            <div class="text-xs text-gray-500">
              <div>Создано: {{ formatDate(notification.created_at) }}</div>
              <div v-if="notification.completed_at">
                Завершено: {{ formatDate(notification.completed_at) }}
              </div>
            </div>
            <!-- Кнопка Завершить -->
            <button
              class="py-1.5 px-3 bg-indigo-600 rounded-xl text-xs font-semibold text-white transition-all duration-300 hover:bg-indigo-700"
            >
              Завершить
            </button>
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

<style>
/* Общие стили для скроллбаров */
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
  box-shadow: inset 0 0 2px rgba(0,0,0,0.1);
}

/* Для Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* Специфичные стили для таблицы */
tbody::-webkit-scrollbar {
  width: 6px;
}

tbody::-webkit-scrollbar-thumb {
  background: #94a3b8;
}

/* Стили для блока уведомлений */
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

/* Плавный скролл */
html {
  scroll-behavior: smooth;
}

/* Дополнительные улучшения для таблицы */
tbody {
  scrollbar-gutter: stable both-edges;
}
</style>