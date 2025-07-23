<template>
  <div class="flex flex-col md:flex-row md:h-[calc(100vh-139px)]">
    <!-- Left side with gradient background and heading -->
    <div
      class="h-[150px] md:h-full md:flex-1/2 bg-cover bg-center"
      :style="{
        backgroundImage: `linear-gradient(to bottom, rgba(14, 12, 12, 1), rgba(14, 12, 12, 0)), url(${bgImg})`,
      }"
    >
      <div
        class="text-white text-2xl sm:text-3xl md:text-5xl uppercase font-lato max-w-full md:max-w-[573px] font-extrabold p-6 sm:p-8 md:pt-24 md:pl-9 flex items-center md:items-start justify-center md:justify-start h-full md:h-auto"
      >
        <span class="text-center md:text-left leading-tight">
          Your identity is protected by Layer 8 encryption
        </span>
      </div>
    </div>

    <!-- Right side form -->
    <div
      class="flex md:flex-1/2 justify-center items-center p-4 md:p-0 py-8 md:py-0"
    >
      <div class="max-w-[482px] w-full px-4">
        <div class="mb-6">
          <h4
            class="font-lato text-xl sm:text-2xl font-bold text-secondary-black mb-2"
          >
            Don't just read the news—be part of it.
          </h4>
          <p class="font-lato font-normal text-sm sm:text-base text-black-100">
            Share your opinion, decide who's telling the truth, write articles,
            and more — all without revealing your identity, thanks to
            <strong>Layer8</strong>
            encryption protecting your data.
          </p>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit="onSubmit">
          <input
            v-model="first_name"
            type="text"
            placeholder="Name"
            class="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <input
            v-model="username"
            type="text"
            placeholder="Username"
            class="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />

          <p class="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
            By signing up, you confirm that you have read and agree to our
            <strong class="text-black">Terms of Service</strong> and
            <strong class="text-black">Privacy Policy</strong>.
          </p>

          <button
            type="submit"
            :disabled="signUpMutation.isPending"
            class="w-full bg-black text-white py-3 rounded font-bold mt-4 text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            <span v-if="signUpMutation.isPending">Creating account...</span>
            <span v-else>Join the conversation</span>
          </button>

          <div class="flex items-center my-4">
            <div class="flex-grow h-px bg-gray-300"></div>
            <span class="px-2 text-sm text-gray-500">or</span>
            <div class="flex-grow h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            class="w-full border border-black text-black py-3 rounded font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <img src="" alt="Layer8" class="h-5" />
            Sign up with <strong>Layer 8</strong>
          </button>

          <p class="text-sm text-center mt-4 text-gray-600">
            Already have an account?
            <RouterLink
              to="/sign-in"
              class="text-black font-medium underline hover:no-underline"
            >
              Sign in now
            </RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMutation } from "@tanstack/vue-query";
import bgImg from "../assets/images/sign-in-img.png";
import { useRouter } from "vue-router";
import { signUpApi } from "../api/auth.ts";

const router = useRouter();
// Form state
const first_name = ref("");
const email = ref("");
const username = ref("");
const password = ref("");

const signUpMutation = useMutation({
  mutationFn: signUpApi,
  onSuccess: () => {
    console.log("Sign-up successful");
    router.push("/sign-in");
  },
  onError: (error: unknown) => {
    console.error("Sign-up error:", error);
  },
});

// Handle form submit
function onSubmit(e: Event) {
  e.preventDefault();
  signUpMutation.mutate({
    first_name: first_name.value,
    email: email.value,
    username: username.value,
    password: password.value,
  });
}
</script>
