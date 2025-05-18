<template>
  <div v-if="visible" class="qr-modal-overlay">
    <div class="qr-modal">
      <div class="qr-modal-header">
        <h3>QR-код бронирования</h3>
        <button @click="close" class="close-btn">&times;</button>
      </div>
      <div class="qr-content">
        <VueQrcode v-if="qrData" :value="qrData" :size="256" class="qr-code" />
        <div v-else class="loading">Загрузка QR-кода...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import VueQrcode from 'vue-qrcode'

const props = defineProps({
  visible: Boolean,
  qrData: String,
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.qr-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.qr-modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 90%;
}

.qr-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
}

.qr-content {
  text-align: center;
}

.loading {
  padding: 20px;
  font-size: 18px;
}

.qr-code {
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
