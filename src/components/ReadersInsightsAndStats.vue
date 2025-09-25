<template>
  <div
    class="flex flex-col xl:flex-row mb-2 gap-5 items-bseline xl:items-center font-lato justify-between"
  >
    <!-- SEE READERS INSIGHT TOGGLE -->
    <div class="min-w-[260px] flex justify-between items-center">
      <span class="text-xl text-black-100 font-semibold">
        {{ modelValue ? "Hide Readers Insight" : "See Readers Insight" }}
      </span>
      <label class="toggle-switch">
        <input
          type="checkbox"
          :checked="modelValue"
          @change="
            $emit(
              'update:modelValue',
              ($event.target as HTMLInputElement).checked
            )
          "
        />
        <span class="toggle-slider"></span>
      </label>
    </div>
    <!-- STATS SECTION -->
    <div class="flex flex-col w-full xl:w-5/12">
      <div class="flex justify-between gap-6">
        <div>
          <p class="text-base font-semibold text-black-100">
            An overview of the reader's response
          </p>
          <p class="text-xs font-medium text-black-40 pt-1 pb-4">
            Based on {{ totals.total ?? 0 }} reactions
          </p>
        </div>
        <div class="text-xs text-black-60">
          <div class="flex items-center gap-2">
            <div class="w-[65px]">Agree</div>
            <div class="w-24 md:w-28 bg-transparent h-2">
              <div
                class="bg-linear-to-r from-[rgba(11,131,30,0)] to-[rgba(11,131,30,0.5)] h-2 rounded-tr-md rounded-br-md"
                :style="`width: ${
                  (totals && (totals?.likes / totals?.total) * 100) || 0
                }%`"
              ></div>
            </div>
            <span
              >{{
                (totals && Math.round((totals?.likes / totals?.total) * 100)) ||
                0
              }}%</span
            >
          </div>
          <div class="flex items-center gap-2">
            <div class="w-[65px]">Disagree</div>
            <div class="w-24 md:w-28 bg-transparent h-2">
              <div
                class="bg-linear-to-r from-[rgba(157,12,26,0)] to-[rgba(157,12,26,0.5)] h-2 rounded-tr-md rounded-br-md"
                :style="`width: ${
                  (totals && (totals?.dislikes / totals?.total) * 100) || 0
                }%`"
              ></div>
            </div>
            <span
              >{{
                (totals &&
                  Math.round((totals?.dislikes / totals?.total) * 100)) ||
                0
              }}%</span
            >
          </div>
          <div class="flex items-center gap-2">
            <div class="w-[65px]">Commented</div>
            <div class="w-24 md:w-28 bg-transparent h-2">
              <div
                class="bg-linear-to-r from-[rgba(227,150,25,0)] to-[rgba(227,150,25,0.5)] h-2 rounded-tr-md rounded-br-md"
                :style="`width: ${
                  (totals && (totals?.comments / totals?.total) * 100) || 0
                }%`"
              ></div>
            </div>
            <span
              >{{
                (totals &&
                  Math.round((totals?.comments / totals?.total) * 100)) ||
                0
              }}%</span
            >
          </div>
        </div>
      </div>
      <div>
        <Button
          title="See all anthograms"
          size="medium"
          variant="secondary"
          :url="`${postSlug}/stats`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "@/components/Button.vue";
import type { Sentence } from "@/models/Posts";
import { computed } from "vue";
import { useRoute } from "vue-router";
const props = defineProps<{
  modelValue: boolean;
  sentences?: Sentence[];
}>();
const route = useRoute();
const postSlug = route.params.id as string;

const sentencesComputed = computed(() => props.sentences || []);
const totals = computed(() =>
  sentencesComputed.value.reduce(
    (acc, sentence) => {
      acc.likes += sentence.opinions.likes;
      acc.dislikes += sentence.opinions.dislikes;
      acc.comments += sentence.opinions.comments.length;
      acc.total +=
        sentence.opinions.likes +
        sentence.opinions.dislikes +
        sentence.opinions.comments.length;
      return acc;
    },
    { likes: 0, dislikes: 0, comments: 0, total: 0 }
  )
);

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>

<style>
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(14, 12, 12, 0.4);
  border-radius: 24px;
  transition: background-color 0.3s ease;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: rgba(14, 12, 12, 1);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-switch input:focus + .toggle-slider {
}
</style>
