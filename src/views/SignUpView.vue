<template>
  <div class="flex h-[calc(100vh-81px)]">
    <div
      class="flex-1/2 h-full bg-cover bg-center"
      :style="{
        backgroundImage: `linear-gradient(to bottom, rgba(14, 12, 12, 1), rgba(14, 12, 12, 0)), url(${bgImg})`,
      }"
    >
      <div
        class="text-white text-5xl uppercase font-lato max-w-[573px] font-extrabold pt-24 pl-9"
      >
        Your identity is protected by Layer 8 encryption
      </div>
    </div>

    <div class="flex flex-1/2 h-full justify-center items-center">
      <div class="max-w-[482px] w-full px-4">
        <div class="mb-6">
          <h4 class="font-lato text-2xl font-bold text-secondary-black mb-2">
            Don’t just read the news—be part of it.
          </h4>
          <p class="font-lato font-normal text-base text-black-100">
            Share your opinion, decide who’s telling the truth, write articles,
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
            class="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none"
          />
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none"
          />
          <input
            v-model="username"
            type="text"
            placeholder="Username"
            class="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none"
          />
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none"
          />

          <p class="text-xs text-gray-600 mt-2">
            By signing up, you confirm that you have read and agree to our
            <strong>Terms of Service</strong> and
            <strong>Privacy Policy</strong>.
          </p>

          <button
            type="submit"
            class="w-full bg-black text-white py-3 rounded font-bold mt-4"
          >
            Join the conversation
          </button>

          <div class="flex items-center my-4">
            <div class="flex-grow h-px bg-gray-300"></div>
            <span class="px-2 text-sm text-gray-500">or</span>
            <div class="flex-grow h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            class="w-full border border-black text-black py-3 rounded font-bold flex items-center justify-center gap-2"
          >
            <img src="" alt="Layer8" class="h-5" />
            Sign up with <strong>Layer 8</strong>
          </button>

          <p class="text-sm text-center mt-4 text-gray-600">
            Already have an account?
            <RouterLink to="/sign-in" class="text-black font-medium underline"
              >Sign in now</RouterLink
            >
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
