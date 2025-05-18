<template>
  <section class="h-full relative bg-stone-50 flex flex-col">
    <div class="w-full max-w-7xl mx-auto px-6 lg:px-8 flex-1 flex flex-col min-h-0 pb-[30px]">
      <!-- Заголовок и кнопки -->
      <div class="flex flex-col md:flex-row max-md:gap-3 items-center justify-between mb-5 py-5">
        <div class="flex items-center w-[400px]">
          <!-- Левая кнопка -->
          <button
            @click="$emit('change-week', -1)"
            class="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            ←
          </button>

          <!-- Центральный блок -->
          <div class="flex-1 min-w-0 flex justify-center">
            <div class="flex items-center gap-2 truncate">
              <h6 class="text-xl leading-8 font-semibold text-gray-900 truncate">
                {{ weekRange }}
              </h6>
            </div>
          </div>

          <!-- Правая кнопка -->
          <button
            @click="$emit('change-week', 1)"
            class="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
          >
            →
          </button>
        </div>

        <!-- Блок выбора этажа -->
        <div class="flex items-center gap-4">
          <div class="relative">
            <select
              v-model="selectedLevel"
              class="py-2 pl-3 pr-8 bg-white border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
            >
              <option disabled value="">Выберите этаж</option>
              <option v-for="level in availableLevels" :key="level" :value="level">
                Этаж {{ level }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="relative flex-1" style="margin-bottom: 30px">
        <div class="h-full pb-8">
          <!-- Заголовки дней -->
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th
                  class="sticky left-0 bg-stone-50 border-t border-gray-200 p-3.5 text-sm font-medium text-gray-900 text-left z-10"
                >
                  Room
                </th>
                <th
                  v-for="day in weekDays"
                  :key="day.date"
                  class="border-t border-gray-200 p-3.5 text-sm font-medium text-center"
                  :class="{ 'text-indigo-600': isToday(day.dateObj) }"
                >
                  {{ day.label }}<br />
                  <span class="text-sm text-gray-500">{{ day.date.split('-')[2] }}</span>
                </th>
              </tr>
            </thead>

            <!-- Тело таблицы -->
            <tbody class="block overflow-auto h-[calc(100%-60px)] pb-[60px]">
              <tr v-for="room in rooms" :key="room.number">
                <td
                  class="sticky left-0 bg-stone-50 border-t border-r border-gray-200 p-3.5 font-medium text-gray-900 z-10"
                >
                  №{{ room.number }}
                </td>
                <td
                  v-for="day in weekDays"
                  :key="day.date"
                  class="border-t border-r border-gray-200 p-1.5 align-top"
                >
                  <div
                    v-for="booking in getBookingsForCell(room.number, day.dateObj)"
                    :key="booking.id"
                    class="rounded p-1.5 border-l-2 border-green-600 bg-green-50 mb-1 booking-block"
                    @mouseover="showTooltip(booking, $event)"
                    @mouseout="hideTooltip"
                    @click="showContextMenu(booking, $event)"
                  >
                    <div class="text-xs font-normal text-gray-900">
                      {{ booking.customers?.[0]?.name || 'No customer' }}
                    </div>
                    <div class="text-xs font-semibold space-y-1">
                      <div
                        v-if="isCheckIn(booking, day.dateObj)"
                        class="flex items-center gap-1 text-green-600"
                      >
                        <span class="text-[10px]">↑</span> {{ formatDate(booking.date_in) }}
                      </div>
                      <div
                        v-if="isCheckOut(booking, day.dateObj)"
                        class="flex items-center gap-1 text-red-600"
                      >
                        <span class="text-[10px]">↓</span> {{ formatDate(booking.date_out) }}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tooltip для списка клиентов -->
      <div
        v-if="currentBooking"
        class="tooltip"
        :style="{ top: tooltipTop + 'px', left: tooltipLeft + 'px' }"
      >
        <ul>
          <li
            v-for="customer in currentBooking.customers"
            :key="customer.id"
            class="text-sm text-gray-700"
          >
            {{ customer.name }}
          </li>
        </ul>
      </div>

      <!-- Контекстное меню -->
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ top: contextMenu.top + 'px', left: contextMenu.left + 'px' }"
        @click.stop
      >
        <ul>
          <li class="context-menu-item" @click="handleMenuAction('qr-code')">QR-код</li>
        </ul>
      </div>
    </div>
  </section>
  <QrModal 
    :visible="showQrModal"
    :qr-data="qrData"
    @close="showQrModal = false"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import QrModal from '@/components/QRModal.vue'

const showQrModal = ref(false)
const qrData = ref(null)
const currentBookingId = ref(null)

const server_host = 'http://192.168.0.131:8000'

const props = defineProps({
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
})

const emit = defineEmits(['change-week'])

// Состояния
const selectedLevel = ref(1)
const availableLevels = ref([1, 2, 3, 4, 5])
const rooms = ref([])
const bookings = ref([])
const weekDays = ref([])
const showModal = ref(false)
const selectedRoom = ref(null)
const currentBooking = ref(null)
const tooltipTop = ref(0)
const tooltipLeft = ref(0)

// Состояние контекстного меню
const contextMenu = ref({
  visible: false,
  booking: null,
  top: 0,
  left: 0,
})

// Загрузка данных
const loadCalendarData = async () => {
  const [roomsRes, bookingsRes] = await Promise.all([
    axios.get(`${server_host}/api/room`, { params: { level: selectedLevel.value } }),
    axios.get(`${server_host}/api/booking`, {
      params: {
        level: selectedLevel.value,
        start_date: props.startDate,
        end_date: props.endDate,
      },
    }),
  ])

  rooms.value = roomsRes.data.sort((a, b) => a.number - b.number);
  bookings.value = bookingsRes.data
}

// Наблюдатели
watch([() => props.startDate, () => props.endDate], () => {
  generateWeekDays()
  loadCalendarData()
})

watch(selectedLevel, () => {
  loadCalendarData()
})

// Форматирование даты
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// Проверка на сегодняшний день
const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// Отображение диапазона недели
const weekRange = computed(() => {
  if (!weekDays.value.length) return ''
  const first = formatDate(weekDays.value[0].date)
  const last = formatDate(weekDays.value[6].date)
  return `${first} - ${last}`
})

// Проверка на заезд
const isCheckIn = (booking, date) => {
  const bookingDate = new Date(booking.date_in).toISOString().split('T')[0]
  return bookingDate === date.toISOString().split('T')[0]
}

// Проверка на выезд
const isCheckOut = (booking, date) => {
  const bookingDate = new Date(booking.date_out).toISOString().split('T')[0]
  return bookingDate === date.toISOString().split('T')[0]
}

// Получение бронирований для ячейки
const getBookingsForCell = (roomNumber, date) => {
  return bookings.value.filter((booking) => {
    return (
      booking.room_number === roomNumber &&
      new Date(booking.date_in) <= date &&
      new Date(booking.date_out) >= date
    )
  })
}

const generateWeekDays = () => {
  const start = new Date(props.startDate)
  const end = new Date(props.endDate)
  const days = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = new Date(d)
    days.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateObj: new Date(date),
    })
  }

  weekDays.value = days
}

// Обработчики для tooltip
const showTooltip = (booking, event) => {
  currentBooking.value = booking
  tooltipTop.value = event.clientY + 10
  tooltipLeft.value = event.clientX + 10
}

const hideTooltip = () => {
  currentBooking.value = null
}

// Обработчики для контекстного меню
const showContextMenu = (booking, event) => {
  event.stopPropagation() // Предотвращаем всплытие события
  contextMenu.value = {
    visible: true,
    booking: booking,
    top: event.clientY,
    left: event.clientX,
  }
}

const hideContextMenu = () => {
  contextMenu.value.visible = false
}

const handleMenuAction = async (action) => {
  if (action === 'qr-code') {
    try {
      currentBookingId.value = contextMenu.value.booking.id
      const response = await axios.get(`${server_host}/api/auth/mobile_token`, { params: { id: currentBookingId.value } })
      qrData.value = response.data
      showQrModal.value = true
    } catch (error) {
      console.error('Ошибка при получении QR-кода:', error)
    }
  }
  hideContextMenu()
}

// Закрытие меню при клике вне его
onMounted(() => {
  window.addEventListener('click', hideContextMenu)
  generateWeekDays()
  loadCalendarData()
})

// Обновляем дни при изменении пропсов
watch(
  () => [props.startDate, props.endDate],
  () => {
    generateWeekDays()
  },
)
</script>

<style>
.relative.bg-stone-50 {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  min-height: 0;
}

tbody {
  display: block;
  overflow-y: auto;
  height: calc(100vh - 260px);
}

thead,
tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.sticky.left-0 {
  position: sticky;
  left: 0;
  background: #fafaf9;
  z-index: 30;
}

thead th {
  position: sticky;
  top: 0;
  background: #fafaf9;
  z-index: 20;
}

.relative.bg-stone-50 {
  height: calc(100vh - 60px);
}

tbody {
  display: block;
  overflow-y: auto;
  padding-bottom: 60px;
}

thead,
tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.sticky.left-0 {
  position: sticky;
  left: 0;
  background: #fafaf9;
  z-index: 30;
  height: 40px;
}

tbody {
  display: table;
  height: 100%;
  width: 100%;
}

.relative.bg-stone-50 {
  height: calc(100vh - 60px);
}

tbody {
  display: block;
  overflow-y: auto;
  max-height: calc(90vh - 100px);
  padding-bottom: 30px;
}

thead,
tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.sticky.left-0 {
  position: sticky;
  left: 0;
  background: #fafaf9;
  z-index: 30;
}

.sticky.left-0 {
  position: sticky;
  left: 0;
  background: #fafaf9;
  z-index: 30;
}

select {
  background-image: none;
  padding-right: 2.5rem;
  transition: all 0.2s;
}

select:focus {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

.sticky.left-0 {
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  z-index: 10;
}

.relative.bg-stone-50 {
  min-height: 100vh;
}

.flex-1.min-h-0 {
  min-height: 0;
}

thead th {
  position: sticky;
  top: 0;
  background: #fafaf9;
  z-index: 20;
}

.sticky.left-0 {
  left: 0;
  z-index: 30;
}

tbody {
  display: block;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

thead,
tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

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

tbody::-webkit-scrollbar {
  width: 6px;
}

tbody::-webkit-scrollbar-thumb {
  background: #94a3b8;
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

.tooltip {
  position: fixed;
  z-index: 100;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 4px;
  pointer-events: none;
  max-width: 200px;
}

/* Стили для контекстного меню */
.context-menu {
  position: fixed;
  z-index: 200; /* Поверх всех элементов */
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 5px 0;
  min-width: 120px;
}

.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.context-menu-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f1f5f9;
}
</style>
