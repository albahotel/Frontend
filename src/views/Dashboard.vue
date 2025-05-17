<!-- Dashboard.vue -->
<template >
  <div class="dashboard flex  min-h-screen h-screen max-h-screen overflow-hidden">
    <!-- Основной блок с календарем -->
    <div class="w-9/12 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto">
        <BookingCalendar
          :level="1"
          :start-date="currentWeek.start"
          :end-date="currentWeek.end"
          @new-booking="handleNewBooking"
          @change-week="handleWeekChange"
        />
      </div>
    </div>

    <!-- Блок уведомлений -->
    <Notifications />
  </div>
</template>



<script setup>
import { ref, computed } from 'vue'
import BookingCalendar from '@/components/BookingCalendar.vue'
import Notifications from '@/components/Notifications.vue'

const initialDate = new Date('2025-05-19')
const currentDate = ref(initialDate)

const currentWeek = computed(() => {
  const start = new Date(currentDate.value)
  start.setDate(start.getDate() - start.getDay() + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
})

const handleWeekChange = (weeks) => {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() + weeks * 7)
  currentDate.value = newDate
}

const handleNewBooking = () => {
  console.log('Обработка новой брони')
}
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