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
