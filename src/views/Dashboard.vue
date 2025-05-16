<template>
  <div class="dashboard">
    <BookingCalendar
      :level="1"
      :start-date="currentWeek.start"
      :end-date="currentWeek.end"
      @new-booking="handleNewBooking"
      @change-week="handleWeekChange"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BookingCalendar from '@/components/BookingCalendar.vue'

const initialDate = new Date('2025-05-19')
const currentDate = ref(initialDate)

const currentWeek = computed(() => {
  const start = new Date(currentDate.value)
  start.setDate(start.getDate() - start.getDay() + 1) // Понедельник текущей недели

  const end = new Date(start)
  end.setDate(start.getDate() + 6) // Воскресенье недели

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
