<template>
  <header class="w-full bg-white shadow-sm md:px-8 lg:px-[120px]">
    <div
      class="gc-container flex items-center justify-between py-4 min-h-[81px]"
    >
      <!-- Logo & Nav -->
      <div class="flex items-center space-x-6">
        <RouterLink
          to="/"
          class="flex items-center space-x-1 text-lg font-semibold text-gray-800"
        >
          <component :is="logo" />
          <span class="font-libre font-medium text-xl tracking-[-1.5px]"
            >Globe & Citizen</span
          >
        </RouterLink>

        <!-- Links -->
        <nav
          v-if="headerState !== 'default'"
          class="flex items-center gap-6 font-semibold text-base font-lato"
        >
          <RouterLink
            to="/trending"
            active-class="text-red-500 border-b-1 !border-b-red-500 pb-1.5 hover:border-b-red-500"
            class="text-black-100 py-2 px-[8.5px] pb-1.5 border-b-1 border-b-transparent hover:border-b-1 hover:border-b-black-100"
            >Trending</RouterLink
          >
          <RouterLink
            to="/about-us"
            active-class="text-red-500 border-b-1 !border-b-red-500 pb-1.5 hover:border-b-red-500"
            class="text-black-100 py-2 px-[8.5px] pb-1.5 border-b-1 border-b-transparent hover:border-b-1 hover:border-b-black-100"
            >About us</RouterLink
          >
          <RouterLink
            to="/become-a-contributor"
            active-class="text-red-500 border-b-1 !border-b-red-500 pb-1.5 hover:border-b-red-500"
            class="text-black-100 py-2 px-[8.5px] pb-1.5 border-b-1 border-b-transparent hover:border-b-1 hover:border-b-black-100"
            >Become a contributor</RouterLink
          >
        </nav>
      </div>

      <!-- Right section -->
      <div class="flex items-center">
        <template
          v-if="headerState === 'no-user' || headerState === 'no-user-search'"
        >
          <RouterLink
            to="/sign-up"
            class="text-base font-lato text-black-100 font-semibold border-b-1 border-black pb-2.5 hover:text-black self-end mr-8"
            >Register</RouterLink
          >
          <RouterLink
            to="/sign-in"
            class="bg-black font-lato font-semibold text-white px-6 py-3 rounded-md text-base hover:opacity-90"
          >
            Sign in
          </RouterLink>
        </template>

        <template v-if="headerState === 'logged-in'">
          <div class="flex gap-2">
            <!-- User Info -->
            <a
              href="#"
              class="flex items-center text-gray-700 hover:text-gray-900"
              @click="open"
              >Write
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.99902 21.0013H6.74902L17.809 9.94128L14.059 6.19128L2.99902 17.2513V21.0013ZM4.99902 18.0813L14.059 9.02128L14.979 9.94128L5.91902 19.0013H4.99902V18.0813Z"
                  fill="#0E0C0C"
                />
                <path
                  d="M18.369 3.29128C17.979 2.90128 17.349 2.90128 16.959 3.29128L15.129 5.12128L18.879 8.87128L20.709 7.04128C21.099 6.65128 21.099 6.02128 20.709 5.63128L18.369 3.29128Z"
                  fill="#0E0C0C"
                />
              </svg>
            </a>

            <button
              class="text-gray-700 hover:text-gray-900 cursor-pointer"
              @click="logOut"
            >
              Logout
            </button>
            <button class="text-gray-600 hover:text-gray-900">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21.75C13.1 21.75 14 20.85 14 19.75H10C10 20.85 10.9 21.75 12 21.75ZM18 15.75V10.75C18 7.68 16.37 5.11 13.5 4.43V3.75C13.5 2.92 12.83 2.25 12 2.25C11.17 2.25 10.5 2.92 10.5 3.75V4.43C7.64 5.11 6 7.67 6 10.75V15.75L4 17.75V18.75H20V17.75L18 15.75ZM16 16.75H8V10.75C8 8.27 9.51 6.25 12 6.25C14.49 6.25 16 8.27 16 10.75V16.75Z"
                  fill="#0E0C0C"
                />
              </svg>
            </button>
            <img
              src="@/assets/user-placeholder.png"
              alt="User Avatar"
              class="w-8 h-8 rounded-full object-cover cursor-pointer"
              @click="$router.push('/profile')"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Search -->
    <div
      v-if="headerState === 'no-user-search' || headerState === 'logged-in'"
      class="max-w-7xl mx-auto pb-4"
    >
      <div class="mx-auto">
        <div class="relative">
          <span
            class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"
          >
            <!-- Search Icon -->
          </span>
          <input
            type="text"
            class="w-full font-lato text-base font-semibold pl-10 pr-4 py-2 border rounded-md border-black-20 focus:outline-none focus:ring-1 placeholder:text-black-60"
            placeholder="Search"
            :value="searchStore.query"
            @input="onSearchInput"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from "vue";
import { useAuthStore } from "@/store/authStore.ts";
import logo from "../../assets/logo.svg";
import { useRouter } from "vue-router";
import { useSearchStore } from "@/store/searchStore.ts";
import { useDebounceFn } from "@vueuse/core";
import { useModal } from "vue-final-modal";
import ModalConfirmPlainCss from "./ModalConfirPlainCss.vue";

type HeaderState = "default" | "no-user" | "no-user-search" | "logged-in";
const authStore = useAuthStore();
const router = useRouter();
const searchStore = useSearchStore();
const { open, close } = useModal({
  component: ModalConfirmPlainCss,
  attrs: {
    title: "Hello World!",
    onConfirm() {
      close();
    },
  },
  slots: {
    default: "<p>The content of the modal</p>",
  },
});
const headerState: ComputedRef<HeaderState> = computed(() => {
  return authStore.user?.id ? "logged-in" : "no-user-search";
});

const logOut = () => {
  authStore.logout();
  router.push("/");
};

const debounceSearch = useDebounceFn((val: string) => {
  searchStore.setQuery(val);
}, 500);

const onSearchInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  debounceSearch(target.value);
};
</script>
