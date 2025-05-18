<template>

  <div class="min-h-screen bg-stone-50">
    <Header />
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">New Booking</h1>
      <!-- Контент формы будет добавлен позже -->

      <!-- Шаг 1: Выбор дат и гостей -->
      <div v-if="step === 1" class="bg-white p-6 rounded-lg shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
            <input
              v-model="dateIn"
              type="date"
              class="w-full p-2 border rounded-md"
              :min="minDate"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
            <input
              v-model="dateOut"
              type="date"
              class="w-full p-2 border rounded-md"
              :min="dateIn"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Guests</label>
            <input
              v-model.number="guests"
              type="number"
              min="1"
              class="w-full p-2 border rounded-md"
            />
          </div>
        </div>
        <button
          @click="searchRooms"
          class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          :disabled="!dateIn || !dateOut || !guests"
        >
          Search Rooms
        </button>
      </div>

      <!-- Шаг 2: Выбор номера -->
      <div v-if="step === 2" class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Available Rooms</h2>
        <div class="grid grid-cols-1 gap-4">
          <div
            v-for="room in availableRooms"
            :key="room.id"
            @click="selectRoom(room)"
            class="p-4 border rounded-md cursor-pointer"
            :class="{ 'border-indigo-600': selectedRoom?.id === room.id }"
          >
            <div class="flex justify-between">
              <span class="font-medium">Room #{{ room.number }}</span>
              <span>Capacity: {{ room.capacity }}</span>
            </div>
          </div>
        </div>
        <button @click="step = 1" class="mt-4 bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
          Back
        </button>
      </div>

      <!-- Шаг 3: Добавление жильцов -->
      <div v-if="step === 3" class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">
          Add Guests ({{ guestsAdded }}/{{ selectedRoom.capacity }})
        </h2>

        <div class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input v-model="guest.name" class="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Passport</label>
              <input v-model="guest.passport" class="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
              <input v-model="guest.birthday" type="date" class="w-full p-2 border rounded-md" />
            </div>
          </div>
          <button
            @click="addGuest"
            class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            :disabled="!guestValid"
          >
            Add Guest
          </button>
        </div>

        <div class="mb-6" v-if="customers.length > 0">
          <h3 class="font-medium mb-2">Added Guests:</h3>
          <div
            v-for="(customer, index) in customers"
            :key="index"
            class="p-3 border rounded-md mb-2"
          >
            {{ customer.name }} ({{ customer.passport }})
          </div>
        </div>

        <div class="flex gap-4">
          <button @click="step = 2" class="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
            Back
          </button>
          <button
            @click="completeBooking"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            :disabled="guestsAdded < guests"
          >
            Complete Booking
          </button>
        </div>
      </div>

      <!-- Уведомления -->
      <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
        {{ successMessage }}
      </div>
    </main>
  </div>
</template>

<script setup>

import { ref, computed } from 'vue'
import axios from 'axios'
import Header from '@/components/Header.vue'

const API_HOST = 'http://192.168.0.131:8000'

const step = ref(1)
const dateIn = ref('')
const dateOut = ref('')
const guests = ref(1)
const availableRooms = ref([])
const selectedRoom = ref(null)
const customers = ref([])

const guest = ref({
  name: '',
  passport: '',
  birthday: '',
})

const errorMessage = ref('')
const successMessage = ref('')

const minDate = new Date().toISOString().split('T')[0]

const guestsAdded = computed(() => customers.value.length)
const guestValid = computed(() => {
  return guest.value.name && guest.value.passport && guest.value.birthday
})

const searchRooms = async () => {
  try {
    const response = await axios.get(`${API_HOST}/api/room/free`, {
      params: {
        date_in: dateIn.value,
        date_out: dateOut.value,
      },
    })
    availableRooms.value = response.data
    step.value = 2
    errorMessage.value = ''
  } catch (error) {
    handleError(error)
  }
}

const selectRoom = (room) => {
  if (room.capacity >= guests.value) {
    selectedRoom.value = room
    step.value = 3
    errorMessage.value = ''
  } else {
    errorMessage.value = 'Room capacity is less than selected guests count'
  }
}

const addGuest = () => {
  if (guestsAdded.value >= selectedRoom.value.capacity) return

  customers.value.push({ ...guest.value })
  guest.value = { name: '', passport: '', birthday: '' }
  errorMessage.value = ''
}

const completeBooking = async () => {
  try {
    // Создаем клиентов
    const createdCustomers = []
    for (const customer of customers.value) {
      const response = await axios.post(`${API_HOST}/api/customer`, customer)
      createdCustomers.push(response.data)
    }

    // Создаем бронирование
    const bookingData = {
      room_number: selectedRoom.value.number,
      peoples: guests.value,
      date_in: dateIn.value,
      date_out: dateOut.value,
    }
    const bookingResponse = await axios.post(`${API_HOST}/api/booking`, bookingData)

    await axios.patch(`${API_HOST}/api/booking/${bookingResponse.data.id}`, {
      customers: createdCustomers,
    })

    successMessage.value = 'Booking created successfully!'
    resetForm()
  } catch (error) {
    handleError(error)
  }
}

const resetForm = () => {
  step.value = 1
  dateIn.value = ''
  dateOut.value = ''
  guests.value = 1
  availableRooms.value = []
  selectedRoom.value = null
  customers.value = []
  errorMessage.value = ''
  setTimeout(() => (successMessage.value = ''), 5000)
}

const handleError = (error) => {
  errorMessage.value = error.response?.data?.message || 'An error occurred'
  setTimeout(() => (errorMessage.value = ''), 5000)
}
</script>