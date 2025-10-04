<template>
  <div
    id="reader-insights-sticky"
    :class="{
      'expanded-full-height !flex-col !pb-8 justify-normal !gap-1':
        showFullInsights,
    }"
  >
    <div
      class="max-w-[850px] mx-auto pt-6 lg:pt-9 pb-6 font-lato px-6 md:px-8 lg:px-0"
    >
      <p class="font-semibold">Viewpoint’s Overview</p>
      <div class="flex justify-between flex-wrap gap-4">
        <!-- ACCURACY -->
        <div class="flex gap-2 items-center mt-2">
          <component :is="likedislikeicon" alt="Like/Dislike Icon" />
          <div>
            <p class="font-medium text-black-60 text-xs">Accuracy</p>
            <p class="font-semibold text-black-100 text-base">N/A</p>
          </div>
        </div>

        <!-- TOTAL VIEWs -->
        <div class="flex gap-2 items-center mt-2">
          <component :is="eyeicon" alt="Eye Icon" />
          <div>
            <p class="font-medium text-black-60 text-xs">Total Views</p>
            <p class="font-semibold text-black-100 text-base">N/A</p>
          </div>
        </div>

        <!-- USERS ENGAGED -->
        <div class="flex gap-2 items-center mt-2">
          <component :is="usersIcon" alt="Users Icon" />
          <div>
            <p class="font-medium text-black-60 text-xs">Users Engaged</p>
            <p class="font-semibold text-black-100 text-base">N/A</p>
          </div>
        </div>
        <Button
          size="medium"
          class="px-6 py-3"
          :title="
            showFullInsights ? 'Hide all anthograms' : 'See all anthograms'
          "
          @click="toggleFullInsights"
        />
      </div>
    </div>
    <div
      v-if="showFullInsights"
      class="expanded-charts-container w-full mt-1 rounded-lg border border-gray-200 overflow-hidden shadow-card"
    >
      <div class="sticky top-0 bg-gray-50 p-4 border-b border-gray-200 z-10">
        <h3 class="text-lg font-semibold text-black-100">Detailed Analytics</h3>
      </div>

      <div class="scrollable-content overflow-y-auto p-6 space-y-8">
        <div class="charts-placeholder">
          <div class="mt-2 space-y-6">
            <div class="bg-white rounded-lg shadow-sm">
              <div class="h-[400px]">
                <LeafletMap :country-votes="countryVotes" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 font-lato">
              <div
                v-if="opinion"
                class="chart-container bg-white p-4 rounded-lg shadow-sm"
              >
                <AppBarChart :post="opinion" />
              </div>
              <div class="chart-container bg-white p-4 rounded-lg shadow-sm">
                <h4
                  class="font-semibold text-center text-xl text-black-80 mb-2"
                >
                  Opinion sentiment distribution
                </h4>
                <div style="height: 300px; width: 100%">
                  <v-chart
                    style="height: 100%; width: 100%"
                    :option="sentimentChartOption"
                    autoresize
                  />
                </div>

                <!-- Summary below chart -->
                <div
                  class="mt-4 grid grid-cols-3 text-center text-sm text-black-80"
                >
                  <div>
                    <p class="font-semibold text-green-600">
                      {{ percentages.likes }}%
                    </p>
                    <p>{{ totals.likes }} Agree</p>
                  </div>
                  <div>
                    <p class="font-semibold text-red-600">
                      {{ percentages.dislikes }}%
                    </p>
                    <p>{{ totals.dislikes }} Disagree</p>
                  </div>
                  <div>
                    <p class="font-semibold text-yellow-600">
                      {{ percentages.comments }}%
                    </p>
                    <p>{{ totals.comments }} Comments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Button from "@/components/Button.vue";
import likedislikeicon from "@/assets/icons/like-dislike.svg";
import eyeicon from "@/assets/icons/eye-icon.svg";
import usersIcon from "@/assets/icons/users2.svg";
import LeafletMap from "@/components/Charts/Map/LeafletMap.vue";
import { fetchOpinionById } from "@/api/posts";
import { useQuery } from "@tanstack/vue-query";
import AppBarChart from "@/components//Charts/AppBarChart.vue";
import { computed, ref, watch } from "vue";
import type { Post } from "@/models/Posts";
import { useRoute } from "vue-router";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";
use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent]);

const route = useRoute();
const opinionId = route.params.opinionId as string;
const showFullInsights = ref(false);
const toggleFullInsights = () => {
  showFullInsights.value = !showFullInsights.value;
};

const {
  value: { data: opinion },
} = computed(() =>
  useQuery<Post | null, unknown, Post | null, string[]>({
    queryKey: ["opinion", opinionId],
    queryFn: async () => {
      const response = await fetchOpinionById(opinionId);
      return response as Post | null;
    },
  })
);

const countryVotes = computed(() => {
  return opinion?.value?.country_votes || [];
});

const sentences = computed(() => {
  return opinion?.value?.sentences || [];
});

const totals = computed(() =>
  sentences.value.reduce(
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
const percentages = computed(() => {
  const total = totals.value.total || 1;
  return {
    likes: Math.round((totals.value.likes / total) * 100),
    dislikes: Math.round((totals.value.dislikes / total) * 100),
    comments: Math.round((totals.value.comments / total) * 100),
  };
});

const sentimentChartOption = computed(() => {
  const { likes, dislikes, comments } = totals.value;

  return {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    series: [
      {
        name: "Sentiments",
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: "outside",
          formatter: "{b}\n{c} ({d}%)",
          fontSize: 12,
          textWrapMode: "wrap",
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
        },
        emphasis: {
          scale: true,
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        data: [
          { value: likes, name: "Agree", itemStyle: { color: "#0b831e" } },
          {
            value: dislikes,
            name: "Disagree",
            itemStyle: { color: "#9d0c1a" },
          },
          {
            value: comments,
            name: "Commented",
            itemStyle: { color: "#e39619" },
          },
        ],
      },
    ],
  };
});

console.log(sentimentChartOption);
watch(showFullInsights, (newVal) => {
  if (newVal) {
    const el = document.getElementById("reader-insights-sticky");
    el?.scrollIntoView({ behavior: "smooth" });
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
});
</script>
<style>
.reader-insights-sticky.expanded-full-height {
  height: 100vh;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.expanded-charts-container {
  display: flex;
  flex-direction: column;
  transform-origin: top;
}

.expand-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-enter-from {
  height: 0px;
  opacity: 0;
  transform: translateY(-20px);
}

.expand-leave-to {
  height: 0px;
  opacity: 0;
  transform: translateY(-10px);
}

.scrollable-content {
  flex: 1;
  max-height: calc(100vh - 220px);

  @media (max-width: 608px) {
    max-height: calc(100vh - 250px);
  }
  @media (max-width: 396px) {
    max-height: calc(100vh - 320px);
  }
}

.scrollable-content::-webkit-scrollbar {
  width: 3px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.01);
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scrollable-content {
  animation: fadeInContent 0.6s ease-out 0.2s both;
}

@keyframes fadeInContent {
  from {
    opacity: 0;
    transform: translateY(-80px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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
</style>
