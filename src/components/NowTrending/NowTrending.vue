<template>
  <router-link
    v-if="post?.id"
    v-slot="{ navigate }"
    :to="{ name: 'PostView', params: { id: post.id } }"
    custom
  >
    <div
      class="flex bg-white shadow-md overflow-hidden max-h-[328px] rounded-sm cursor-pointer"
      @click="navigate"
    >
      <!-- Left Image Section -->
      <div class="w-1/2 relative">
        <img
          :src="
            post?.url_to_image ||
            'https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ='
          "
          alt="American Flag"
          class="object-cover h-full w-full rounded-sm"
        />
        <div
          v-if="showWinnerTag"
          class="absolute bottom-4 left-4 bg-white-80 p-1 text-sm font-semibold rounded shadow flex items-center gap-1"
        >
          <component :is="editorsChoice" />
          Editor’s Choice Winner
        </div>
      </div>

      <!-- Right Content Section -->
      <div class="w-1/2 p-6 pl-8 flex flex-col justify-between">
        <div
          class="font-lato text-primary-red font-bold text-xl mb-2 border-b border-b-red-20 w-fit"
        >
          Now Trending
        </div>
        <div class="flex items-center gap-2 mb-4">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="user image"
            class="w-8 h-8 rounded-full"
          />
          <p class="font-semibold font-lato text-black">
            {{ post?.author.substring(0, 20) + "..." }}
          </p>
          <p class="font-medium text-black-60 font-lato text-xs">
            {{
              post?.created_at
                ? new Date(post.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Unknown date"
            }}
          </p>
        </div>

        <h4 class="font-libre text-2xl font-semibold mb-2">
          {{ post?.title }}
        </h4>
        <p class="text-black-80 mb-3 font-lato font-normal">
          {{ post?.description?.substring(0, 60) + "..." }}
        </p>
        <div class="flex gap-3 mb-4 font-lato font-bold text-xs capitalize">
          <span
            v-for="(tag, index) in post?.categories || []"
            :key="index"
            class="text-primary-red text-sm"
            >{{ tag }}</span
          >
        </div>

        <div
          class="flex items-center text-xs font-medium font-lato text-black-60 gap-4"
        >
          <div class="flex items-center gap-1">
            <component :is="timeIcon" />
            Reading time: 5 minutes
          </div>
          <div class="flex items-center gap-1">
            <component :is="commentsIcon" />
            Discussions: 3
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import editorsChoice from "../../assets/editors-choice.svg";
import timeIcon from "../../assets/clock-icon.svg";
import commentsIcon from "../../assets/comment-icon.svg";
import type { Post } from "../../models/Posts";
const props = withDefaults(
  defineProps<{
    post?: Post;
    showWinnerTag?: boolean;
  }>(),
  {
    post: undefined,
    showWinnerTag: false,
  }
);
console.log(props.post);
</script>
