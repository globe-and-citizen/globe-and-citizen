<template>
  <div class="custom-select" :class="{ 'select-open': isOpen }">
    <div
      class="select-trigger"
      :class="{ 'select-focused': isOpen }"
      @click="toggleDropdown"
    >
      <span v-if="label && !modelValue" class="select-label">{{ label }}</span>
      <span class="select-value">{{ modelValue?.label || '' }}</span>
      <svg
        class="select-arrow"
        :class="{ 'arrow-up': isOpen }"
        width="12"
        height="12"
        viewBox="0 0 12 12"
      >
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
      </svg>
    </div>

    <div
      v-show="isOpen"
      class="select-dropdown"
      @click.stop
    >
      <div
        v-for="option in options"
        :key="option.value"
        class="select-option"
        :class="{ 'option-selected': modelValue?.value === option.value }"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface SelectOption {
  label: string
  value: string
}

interface Props {
  modelValue?: SelectOption
  options: SelectOption[]
  label?: string
}

interface Emits {
  (e: 'update:modelValue', value: SelectOption): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option)
  isOpen.value = false
}

const closeDropdown = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.custom-select')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
  font-family: inherit;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  box-sizing: border-box;
}

.select-trigger:hover {
  border-color: #9ca3af;
}

.select-focused {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-label {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 14px;
  pointer-events: none;
  transition: all 0.2s ease;
}

.select-focused .select-label,
.select-trigger:not(:empty) .select-label {
  top: -8px;
  left: 12px;
  font-size: 12px;
  background-color: white;
  padding: 0 4px;
  color: #3b82f6;
}

.select-value {
  flex: 1;
  text-align: left;
  color: #111827;
  font-size: 14px;
}

.select-arrow {
  color: #6b7280;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.arrow-up {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.select-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  color: #111827;
}

.select-option:hover {
  background-color: #f3f4f6;
}

.option-selected {
  background-color: #eff6ff;
  color: #3b82f6;
  font-weight: 600;
}

.option-selected:hover {
  background-color: #dbeafe;
}

/* Scrollbar styling */
.select-dropdown::-webkit-scrollbar {
  width: 6px;
}

.select-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.select-dropdown::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.select-dropdown::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
