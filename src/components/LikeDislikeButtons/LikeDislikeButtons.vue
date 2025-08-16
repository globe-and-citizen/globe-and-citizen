<template>
  <div class="flex items-center gap-3 md:gap-4 mb-4">
    <!-- Like Button -->
    <button
      :class="[
        'flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-colors text-sm md:text-base',
        userVote === 1
          ? 'bg-green-50 border-green-300 text-green-700'
          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100',
      ]"
      @click="$emit('react', 1)"
    >
      <svg
        class="w-4 h-4 md:w-5 md:h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"
        />
      </svg>
      <span class="text-sm font-medium">{{ likes }}</span>
    </button>

    <!-- Dislike Button -->
    <button
      :class="[
        'flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-colors text-sm md:text-base',
        userVote === -1
          ? 'bg-red-50 border-red-300 text-red-700'
          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100',
      ]"
      @click="$emit('react', -1)"
    >
      <svg
        class="w-4 h-4 md:w-5 md:h-5 rotate-180"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"
        />
      </svg>
      <span class="text-sm font-medium">{{ dislikes }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  likes: number | undefined;
  dislikes: number | undefined;
  userVote: number | null | undefined;
}>();

defineEmits<{
  (e: "react", score: 1 | -1): void;
}>();
</script>
