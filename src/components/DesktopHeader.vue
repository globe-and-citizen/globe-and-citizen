<template>
  <header class="w-full bg-white shadow-sm md:px-8 xl:px-[120px]">
    <div
      class="gc-container flex items-center justify-between py-4 min-h-[81px] px-4 md:px-0"
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

        <!-- Desktop Navigation Links -->
        <nav
          v-if="headerState !== 'default'"
          class="hidden lg:flex items-center gap-6 font-semibold text-base font-lato"
        >
          <RouterLink
            to="/top-headlines"
            active-class="text-red-500 border-b-1 !border-b-red-500 pb-1.5 hover:border-b-red-500"
            class="text-black-100 py-2 px-[8.5px] pb-1.5 border-b-1 border-b-transparent hover:border-b-1 hover:border-b-black-100"
            >Top Headlines</RouterLink
          >
          <RouterLink
            to="/all-news?category=all-news"
            active-class="text-red-500 border-b-1 !border-b-red-500 pb-1.5 hover:border-b-red-500"
            class="text-black-100 py-2 px-[8.5px] pb-1.5 border-b-1 border-b-transparent hover:border-b-1 hover:border-b-black-100"
            >News feed</RouterLink
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
        <!-- Desktop Auth Buttons -->
        <template
          v-if="headerState === 'no-user' || headerState === 'no-user-search'"
        >
          <div class="hidden md:flex items-center gap-4">
            <RouterLink to="/sign-up" class="w-fit">
              <Button variant="secondary" title="Sign up" size="medium" />
            </RouterLink>
            <RouterLink to="/sign-in" class="w-fit">
              <Button variant="primary" title="Sign in" size="medium" />
            </RouterLink>
          </div>
        </template>

        <!-- Desktop Logged In Actions -->
        <template v-if="headerState === 'logged-in'">
          <div class="hidden md:flex gap-2">
            <!-- User Info -->
            <button
              v-if="postView"
              class="flex cursor-pointer items-center text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading || !post"
              @click="navigateToCreateOpinion()"
            >
              Write
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
            </button>

            <button
              class="text-gray-700 hover:text-gray-900 cursor-pointer"
              @click="logOut"
            >
              Logout
            </button>
            <img
              v-if="profilePictureUrl"
              :src="
                profilePictureUrl ||
                generateUserIcon(authStore.user?.username || 'A')
              "
              :alt="authStore.user?.username"
              class="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer border border-black-20 p-0.5"
              @click="$router.push('/profile/public-view')"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
              :style="generateUserIcon(authStore.user?.username || 'A')"
              @click="$router.push('/profile/public-view')"
            >
              <span class="text-black text-lg font-semibold">
                {{ authStore.user?.username.charAt(0).toUpperCase() || "A" }}
              </span>
            </div>
          </div>
        </template>

        <!-- Mobile Menu Button -->
        <button
          v-if="headerState !== 'default'"
          class="lg:hidden ml-4 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-label="Toggle menu"
          @click="toggleMobileMenu"
        >
          <svg
            :class="{ 'rotate-90': isMobileMenuOpen }"
            class="w-6 h-6 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="!isMobileMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        @click="closeMobileMenu"
      ></div>
    </Transition>

    <!-- Mobile Menu Drawer -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="transform translate-x-full"
      enter-to-class="transform translate-x-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-full"
    >
      <div
        v-if="isMobileMenuOpen"
        class="fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-[999999] lg:hidden overflow-y-auto"
      >
        <!-- Mobile Menu Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <span class="font-libre font-medium text-lg tracking-[-1px]"
            >Menu</span
          >
          <button
            class="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Close menu"
            @click="closeMobileMenu"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Mobile Menu Content -->
        <div class="p-4">
          <!-- Navigation Links -->
          <nav
            v-if="headerState !== 'default'"
            class="flex flex-col gap-4 font-semibold text-base font-lato mb-6"
          >
            <RouterLink
              to="/top-headlines"
              active-class="text-red-500"
              class="text-black-100 py-3 px-4 rounded-md hover:bg-gray-50 border-l-4 border-transparent hover:border-l-gray-300 active:border-l-red-500"
              @click="closeMobileMenu"
              >Top Headlines</RouterLink
            >
            <RouterLink
              to="/about-us"
              active-class="text-red-500"
              class="text-black-100 py-3 px-4 rounded-md hover:bg-gray-50 border-l-4 border-transparent hover:border-l-gray-300 active:border-l-red-500"
              @click="closeMobileMenu"
              >About us</RouterLink
            >
            <RouterLink
              to="/become-a-contributor"
              active-class="text-red-500"
              class="text-black-100 py-3 px-4 rounded-md hover:bg-gray-50 border-l-4 border-transparent hover:border-l-gray-300 active:border-l-red-500"
              @click="closeMobileMenu"
              >Become a contributor</RouterLink
            >
          </nav>

          <!-- Mobile Auth Buttons -->
          <template
            v-if="headerState === 'no-user' || headerState === 'no-user-search'"
          >
            <div class="flex flex-col gap-3 border-t pt-4">
              <RouterLink
                to="/sign-up"
                class="text-center py-3 px-4 border border-black rounded-md text-base font-lato text-black-100 font-semibold hover:bg-gray-50"
                @click="closeMobileMenu"
                >Sign up</RouterLink
              >
              <RouterLink
                to="/sign-in"
                class="text-center bg-black font-lato font-semibold text-white px-4 py-3 rounded-md text-base hover:opacity-90"
                @click="closeMobileMenu"
              >
                Sign in
              </RouterLink>
            </div>
          </template>

          <!-- Mobile Logged In Actions -->
          <template v-if="headerState === 'logged-in'">
            <div class="border-t pt-4">
              <!-- User Profile Section -->
              <RouterLink
                to="/profile"
                class="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-md"
              >
                <img
                  v-if="userData?.profile_picture_url"
                  :src="
                    userData?.profile_picture_url ||
                    generateUserIcon(userData?.username || 'A')
                  "
                  :alt="userData?.username"
                  class="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  :style="generateUserIcon(userData?.username || 'A')"
                >
                  <span class="text-black text-lg font-semibold">
                    {{ userData?.username?.charAt(0).toUpperCase() || "A" }}
                  </span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">Your Profile</p>
                  <p class="text-xs text-gray-500">View and edit profile</p>
                </div>
              </RouterLink>

              <!-- Mobile Actions -->
              <div class="flex flex-col gap-3">
                <button
                  v-if="postView"
                  class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  :disabled="isLoading || !post"
                  @click="navigateToCreateOpinion()"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.99902 21.0013H6.74902L17.809 9.94128L14.059 6.19128L2.99902 17.2513V21.0013ZM4.99902 18.0813L14.059 9.02128L14.979 9.94128L5.91902 19.0013H4.99902V18.0813Z"
                      fill="currentColor"
                    />
                    <path
                      d="M18.369 3.29128C17.979 2.90128 17.349 2.90128 16.959 3.29128L15.129 5.12128L18.879 8.87128L20.709 7.04128C21.099 6.65128 21.099 6.02128 20.709 5.63128L18.369 3.29128Z"
                      fill="currentColor"
                    />
                  </svg>
                  Write
                </button>

                <button
                  class="w-full py-3 px-4 border border-red-500 text-red-500 rounded-md hover:bg-red-50 font-medium"
                  @click="
                    logOut();
                    closeMobileMenu();
                  "
                >
                  Logout
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <!-- Filters Bar -->
    <div v-if="showFilterBar" class="w-full">
      <nav
        class="gc-container flex items-center gap-6 overflow-x-auto text-base font-lato font-semibold px-4 md:px-0"
      >
        <RouterLink
          :to="{ path: '/all-news', query: { category: 'all-news' } }"
          :class="{ 'text-red-500': currentCategory === 'all-news' }"
          class="py-3 text-gray-800 whitespace-nowrap hover:text-red-500 border-b-2 border-transparent"
        >
          News
        </RouterLink>
        <RouterLink
          :to="{ path: '/all-news', query: { category: 'opinions' } }"
          :class="{ 'text-red-500': currentCategory === 'opinions' }"
          class="py-3 text-gray-800 whitespace-nowrap hover:text-red-500 border-b-2 border-transparent"
        >
          Opinions
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, onMounted, ref, watch } from "vue";
import { useAuthStore } from "@/store/authStore.ts";
import logo from "../assets/logo.svg";
import { useRoute, useRouter } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import type { Post } from "@/models/Posts";
import { fetchPostById } from "@/api/posts.ts";
import { generateUserIcon } from "@/composables/utils.ts";
import { getUser } from "@/api/user.ts";
import type { UserType } from "@/models/Auth";
import Button from "@/components/Button.vue";
import { useNewOpinionStore } from "@/store/newOpinionStore.ts";

type HeaderState = "default" | "no-user" | "no-user-search" | "logged-in";
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const showFilterBar = computed(() => {
  return route.path === "/all-news";
});
const storeUsername = computed(() =>
  authStore.user?.username ? authStore.user.username : ""
);

const { data: userData } = useQuery({
  queryKey: ["user", storeUsername.value],
  queryFn: async () => {
    if (!storeUsername.value) {
      throw new Error("User username is not available.");
    }
    const response = await getUser(storeUsername.value);
    return response as Partial<UserType>;
  },
  enabled: computed(() => !!storeUsername.value),
});

const profilePictureUrl = computed(() => {
  return userData.value?.profile_picture_url;
});

const currentCategory = computed(
  () => route.query.category as string | undefined
);

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Close mobile menu when route changes
watch(
  () => router.currentRoute.value.path,
  () => {
    closeMobileMenu();
  }
);

const postView = computed(() => {
  return route.name === "PostView";
});

const postId = computed(() => route.params.id as string);

const { data: post, isLoading } = useQuery<
  Post | null,
  unknown,
  Post | null,
  string[]
>({
  queryKey: ["post", postId],
  queryFn: async () => {
    const response = await fetchPostById(postId.value);
    return response as Post | null;
  },
  enabled: computed(() => postView.value && !!postId.value),
});

const newOpinionStore = useNewOpinionStore();

const headerState: ComputedRef<HeaderState> = computed(() => {
  return authStore.user?.id ? "logged-in" : "no-user-search";
});

const logOut = () => {
  authStore.logout();
  router.push("/");
};

const navigateToCreateOpinion = () => {
  if (!post.value) {
    console.warn("Post data not loaded yet");
    return;
  }

  router.push({
    name: "WriteOpinionView",
  });
};

onMounted(() => {
  newOpinionStore.resetPost();
});
</script>
