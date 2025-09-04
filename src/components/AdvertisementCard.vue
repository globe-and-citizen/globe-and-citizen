<template>
  <div
    class="font-lato font-bold text-black-40 rounded-sm overflow-hidden shadow-card-hard transition bg-white"
    :class="{
      'flex w-full min-h-[268px] max-w-[992px] ': props.layout === 'horizontal',
      'flex flex-col items-center text-center max-w-md':
        props.layout === 'vertical',
    }"
    :style="{ background: props.background }"
  >
    <!-- Horizontal Layout -->
    <template v-if="props.layout === 'horizontal'">
      <div class="w-[332px]">
        <img
          v-if="props.image"
          :src="props.image"
          alt="Ad Image"
          class="w-full h-full object-none rounded-sm"
        />
      </div>
      <div class="w-1/2 flex-1 p-6 flex flex-col justify-between">
        <div>
          <p class="uppercase font-semibold text-base mb-4 tracking-wider">
            Advertisement
          </p>
          <h2
            class="text-xl font-bold text-secondary-black mb-2 font-libre text-heading-h4"
          >
            {{ props.title }}
          </h2>
          <p class="text-black-80 text-base mb-4 font-normal">
            {{ props.description }}
          </p>
        </div>
        <Button
          class="p-4 !w-fit"
          variant="secondary"
          size="medium"
          :title="props.buttonTitle"
          icon-position="right"
          :icon="arrowBackIcon"
          :url="props.url"
          is-external
        />
      </div>
    </template>

    <!-- Vertical Layout -->
    <template v-if="props.layout === 'vertical'">
      <div class="flex flex-col items-center mb-4 px-4">
        <p class="uppercase pt-6 pb-2 text-xs">Advertisement</p>
        <div class="px-6 w-full">
          <img
            v-if="props.image"
            :src="props.image"
            alt="Ad Image"
            class="w-full h-36 object-none rounded-sm mb-6"
          />
        </div>
        <h2
          class="text-xl font-bold text-secondary-black mb-2 font-libre text-heading-h4"
        >
          {{ props.title }}
        </h2>
        <p class="text-black-80 text-base mb-4 font-normal">
          {{ props.description }}
        </p>
        <Button
          class="p-4 !w-fit"
          variant="secondary"
          size="medium"
          :title="props.buttonTitle"
          icon-position="right"
          :icon="arrowBackIcon"
          :url="props.url"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Button from "./Button.vue";
import arrowBackIcon from "../assets/arrow-back.svg";

const props = defineProps<{
  background?: string;
  image?: string;
  title: string;
  description: string;
  buttonTitle: string;
  url: string;
  layout: "horizontal" | "vertical";
}>();
</script>
