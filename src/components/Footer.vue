<template>
  <footer
    class="w-full bg-black-100 text-white-80 shadow-sm md:px-8 xl:px-[120px] font-lato"
  >
    <div
      class="gc-container flex flex-col md:flex-row items-center md:items-flex-start gap-10 lg:gap-20 py-10 min-h-[81px] px-4 md:px-0 pb-32"
    >
      <div class="flex gap-0.5">
        <component :is="logo" />

        <span class="font-libre font-medium text-xl tracking-[-1.5px]"
          >Globe <span class="text-xs">&</span> Citizen</span
        >
      </div>
      <nav class="flex flex-col items-center md:items-baseline gap-6 flex-1">
        <RouterLink
          to="/about-us"
          class="flex items-center text-base font-semibold"
          >About us</RouterLink
        >
        <RouterLink
          to="/become-a-contributor"
          class="flex items-center text-base font-semibold"
          >Become a contributor</RouterLink
        >
        <div
          class="flex items-center text-base font-semibold cursor-pointer"
          @click="runLatencyTest"
        >
          Run Latency Test
        </div>
      </nav>

      <div
        class="max-w-[450px] flex flex-col gap-4 items-center md:items-baseline"
      >
        <p class="font-bold text-xl">Follow</p>
        <p class="text-center md:text-left">
          Need support, want to share feedback, or have a question? Get in touch
          with us anytime.
        </p>
        <div class="flex gap-4">
          <a
            href="https://t.me/+IbsdqnqY5OcwNzZh"
            target="_blank"
            rel="noopener noreferrer"
          >
            <component :is="telegram" alt="Telegram" />
          </a>
          <a
            href="https://github.com/globe-and-citizen"
            target="_blank"
            rel="noopener noreferrer"
          >
            <component :is="github" alt="Telegram" />
          </a>
          <a
            href="https://discord.gg/kBpdUbkNQU"
            target="_blank"
            rel="noopener noreferrer"
          >
            <component :is="discord" alt="Telegram" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
<script setup lang="ts">
import logo from "@/assets/logo.svg";
import telegram from "@/assets/icons/telegram.svg";
import github from "@/assets/icons/github.svg";
import discord from "@/assets/icons/discord.svg";
import { runLatencyTest } from "@/api/latency";
</script>

<style scoped>
a :deep(svg path) {
  fill: #fdfcfc99;
  transition: fill 0.3s ease;
  opacity: 1;
}

a:hover :deep(svg path) {
  fill: white;
  opacity: 0.7;
}
</style>
