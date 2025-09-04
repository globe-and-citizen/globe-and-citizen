<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  variant?: 'filled' | 'outlined' | 'text'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

interface Emits {
  (e: 'click', event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'filled',
  size: 'medium',
  disabled: false,
  type: 'button'
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => {
  const baseClasses = 'custom-button'
  const colorClass = `button-${props.color}`
  const variantClass = `button-${props.variant}`
  const sizeClass = `button-${props.size}`
  const disabledClass = props.disabled ? 'button-disabled' : ''

  return [baseClasses, colorClass, variantClass, sizeClass, disabledClass].filter(Boolean).join(' ')
})

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.custom-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  outline: none;
  position: relative;
  overflow: hidden;
}

.custom-button:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* Sizes */
.button-small {
  padding: 8px 12px;
  font-size: 12px;
  min-height: 32px;
}

.button-medium {
  padding: 10px 16px;
  font-size: 14px;
  min-height: 40px;
}

.button-large {
  padding: 12px 20px;
  font-size: 16px;
  min-height: 48px;
}

/* Primary Color */
.button-primary.button-filled {
  background-color: #3b82f6;
  color: white;
}

.button-primary.button-filled:hover:not(.button-disabled) {
  background-color: #2563eb;
}

.button-primary.button-outlined {
  background-color: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.button-primary.button-outlined:hover:not(.button-disabled) {
  background-color: #eff6ff;
}

.button-primary.button-text {
  background-color: transparent;
  color: #3b82f6;
}

.button-primary.button-text:hover:not(.button-disabled) {
  background-color: #eff6ff;
}

/* Secondary Color */
.button-secondary.button-filled {
  background-color: #6b7280;
  color: white;
}

.button-secondary.button-filled:hover:not(.button-disabled) {
  background-color: #4b5563;
}

.button-secondary.button-outlined {
  background-color: transparent;
  color: #6b7280;
  border: 1px solid #6b7280;
}

.button-secondary.button-outlined:hover:not(.button-disabled) {
  background-color: #f9fafb;
}

.button-secondary.button-text {
  background-color: transparent;
  color: #6b7280;
}

.button-secondary.button-text:hover:not(.button-disabled) {
  background-color: #f9fafb;
}

/* Success Color */
.button-success.button-filled {
  background-color: #10b981;
  color: white;
}

.button-success.button-filled:hover:not(.button-disabled) {
  background-color: #059669;
}

.button-success.button-outlined {
  background-color: transparent;
  color: #10b981;
  border: 1px solid #10b981;
}

.button-success.button-outlined:hover:not(.button-disabled) {
  background-color: #ecfdf5;
}

.button-success.button-text {
  background-color: transparent;
  color: #10b981;
}

.button-success.button-text:hover:not(.button-disabled) {
  background-color: #ecfdf5;
}

/* Warning Color */
.button-warning.button-filled {
  background-color: #f59e0b;
  color: white;
}

.button-warning.button-filled:hover:not(.button-disabled) {
  background-color: #d97706;
}

.button-warning.button-outlined {
  background-color: transparent;
  color: #f59e0b;
  border: 1px solid #f59e0b;
}

.button-warning.button-outlined:hover:not(.button-disabled) {
  background-color: #fffbeb;
}

.button-warning.button-text {
  background-color: transparent;
  color: #f59e0b;
}

.button-warning.button-text:hover:not(.button-disabled) {
  background-color: #fffbeb;
}

/* Danger Color */
.button-danger.button-filled {
  background-color: #ef4444;
  color: white;
}

.button-danger.button-filled:hover:not(.button-disabled) {
  background-color: #dc2626;
}

.button-danger.button-outlined {
  background-color: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.button-danger.button-outlined:hover:not(.button-disabled) {
  background-color: #fef2f2;
}

.button-danger.button-text {
  background-color: transparent;
  color: #ef4444;
}

.button-danger.button-text:hover:not(.button-disabled) {
  background-color: #fef2f2;
}

/* Disabled State */
.button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-disabled:hover {
  transform: none;
}

/* Active/Press State */
.custom-button:active:not(.button-disabled) {
  transform: translateY(1px);
}
</style>
