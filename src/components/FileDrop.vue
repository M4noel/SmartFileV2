<template>
  <div 
    class="file-drop"
    @dragover.prevent="dragover = true"
    @dragleave="dragover = false"
    @drop.prevent="handleDrop"
    :class="{ 'dragover': dragover }"
  >
    <input 
      type="file"
      :accept="accept"
      @change="handleChange"
      ref="fileInput"
      hidden
    />
    <div class="content">
      <p>{{ dragover ? 'Solte o arquivo aqui!' : 'Arraste ou clique para enviar' }}</p>
      <p class="file-limit">Limite: 50 MB por arquivo</p>
      <button @click="triggerInput">Selecionar Arquivo</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  accept: String
});
const emit = defineEmits(['file-changed']);
const dragover = ref(false);
const fileInput = ref(null);

const triggerInput = () => fileInput.value.click();

const handleDrop = (e) => {
  dragover.value = false;
  if (e.dataTransfer.files.length) {
    emit('file-changed', e.dataTransfer.files[0]);
  }
};

const handleChange = (e) => {
  if (e.target.files.length) {
    emit('file-changed', e.target.files[0]);
  }
};
</script>

<style scoped>
.file-drop {
  border: 2px dashed #4a90e2;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
}
.file-drop.dragover {
  background: #e6f0ff;
  border-color: #2a75ff;
}
.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
button {
  padding: 0.5rem 1rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.file-limit {
  font-size: 0.8rem;
  color: #666;
  margin: 0.5rem 0;
}

.file-limit::before {
  content: "ⓘ ";
}
</style>