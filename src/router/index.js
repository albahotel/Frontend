import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/Login.vue'
import AddBooking from '@/views/AddBooking.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/add_booking',
    name: 'AddBooking',
    component: AddBooking,
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
