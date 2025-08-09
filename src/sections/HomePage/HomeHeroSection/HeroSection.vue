<template>
  <div class="flex flex-col md:flex-row items-center">
    <div class="flex-1/2">
      <h1
        class="font-libre font-bold text-4xl md:text-5xl text-secondary-black text-balance pb-4 text-center md:text-left"
      >
        Trust what you read. Share what you know.
      </h1>
      <p class="hidden md:block font-lato text-base font-normal pr-3">
        Read with intent, share with purpose, and call out what’s false.
        Together, we’re building authentic, decentralized media – because truth
        shouldn’t be globalized, it should be grounded.
      </p>
      <p
        class="block md:hidden font-lato text-base font-normal pr-3 text-center"
      >
        Read with intent, share with purpose, and call out what’s false.
      </p>
      <div
        class="pt-6 mx-auto md:mx-0 flex flex-col md:flex-row gap-8 w-full items-center"
      >
        <Button variant="primary" title="Explore now" size="medium" />
        <div class="relative">
          <p class="font-lato text-base font-semibold">Customize your feed</p>
          <p
            class="font-lato text-[8px] font-bold text-primary-red absolute bottom-5 -right-6 uppercase"
          >
            Coming soon
          </p>
        </div>
      </div>
    </div>
    <div class="flex-1/2 h-[439px]">
      <img :src="heroImage" class="h-[inherit] object-cover w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import heroImage from "./img.png";
import Button from "../../../components/Button/Button.vue";
</script>
