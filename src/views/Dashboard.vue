<template>
  <div class="dashboard flex flex-col h-screen">
    <!-- Хедер (фиксированная высота) -->
    <Header class="h-16 shrink-0" />

    <!-- Основной контент -->
    <div class="flex-1 flex overflow-hidden bg-gray-50">
      <!-- Блок с календарем -->
      <div class="w-9/12 flex flex-col overflow-hidden pr-4 pl-6 py-4">
        <div class="h-[calc(100vh-112px)]">
          <!-- Измененная строка -->
          <BookingCalendar
            class="h-full"
            :level="1"
            :start-date="currentWeek.start"
            :end-date="currentWeek.end"
            @new-booking="handleNewBooking"
            @change-week="handleWeekChange"
          />
        </div>
      </div>

      <!-- Блок уведомлений -->
      <Notifications class="flex-1 overflow-y-auto" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Header from '@/components/Header.vue'
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

<style scoped>
.dashboard {
  height: 100vh;
}
</style>
