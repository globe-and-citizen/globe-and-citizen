<template>
  <div class="flex flex-col md:flex-row items-center">
    <div class="flex-1/2">
      <h1
        class="font-libre font-bold text-5xl text-secondary-black text-balance pb-4"
      >
        Trust what you read. Share what you know.
      </h1>
      <p class="font-lato text-base font-normal pr-3">
        Read with intent, share with purpose, and call out what’s false.
        Together, we’re building authentic, decentralized media – because truth
        shouldn’t be globalized, it should be grounded.
      </p>
      <div class="w-fit pt-6">
        <Button variant="primary" title="Explore now" size="medium" />
      </div>
    </div>
    <div class="flex-1/2 h-[439px]">
      <img :src="heroImage" class="h-[inherit] object-cover w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import heroImage from "./img.png";
import Button from "../../components/Button/Button.vue";
</script>
