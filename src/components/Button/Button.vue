<template>
  <component
    :is="!disabled && url ? RouterLink : 'button'"
    :to="!disabled && url ? url : undefined"
    :disabled="!url && disabled"
    :class="[
      'flex items-center justify-center w-full font-lato font-semibold text-base transition-colors duration-100 cursor-pointer focus:outline-none',
      {
        'bg-black text-white border-2 rounded border-secondary-black hover:opacity-90':
          variant === 'primary' && !disabled,
        'bg-white-10 text-secondary-black border-2 rounded hover:text-black-60 hover:border-black-60 hover:[&>span>svg>path]:fill-black-60 duration-100 hover:shadow-button-hover hover:transition hover:duration-300':
          variant === 'secondary' && !disabled,
        'bg-transparent text-black border-b border-b-black-60':
          variant === 'tertiary' && !disabled,
      },
      size === 'large'
        ? 'px-3 py-3 h-12'
        : size === 'medium'
        ? 'px-2 py-2.5 h-10'
        : size === 'small'
        ? 'px-2 py-2 h-9'
        : '',
      variant === 'tertiary' ? 'px-0 py-2 h-8' : '',
      disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    ]"
    @click="$emit('click')"
  >
    <!-- Left Icon -->
    <span v-if="icon && iconPosition === 'left'" class="mr-2 flex items-center">
      <component :is="icon" class="w-5 h-5" />
    </span>

    <!-- Button Text -->
    <span>{{ title }}</span>

    <!-- Right Icon -->
    <span
      v-if="icon && iconPosition === 'right'"
      class="ml-2 flex items-center"
    >
      <component :is="icon" />
    </span>
  </component>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

type ButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonSize = "large" | "medium" | "small";
type IconPosition = "left" | "right";

withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    title?: string;
    icon?: object | string;
    iconPosition?: IconPosition;
    url?: string;
  }>(),
  {
    variant: "primary",
    size: "large",
    disabled: false,
    title: "Button",
    iconPosition: "left",
    url: undefined,
    icon: "",
  }
);

defineEmits<{
  (e: "click"): void;
}>();
</script>
