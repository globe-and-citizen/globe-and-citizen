<template>
  <div class="space-y-10">
    <!-- Title Row -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">Polymarket Trackers</h1>

      <button
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        @click="fetchTrackers"
      >
        Refresh
      </button>
    </div>

    <!-- Add New Tracker -->
    <section class="bg-gray-50 border border-gray-200 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Add New Tracker</h2>

      <div class="flex gap-3 items-center">
        <input
          v-model="urlInput"
          type="text"
          placeholder="Enter Polymarket URL"
          class="flex-1 p-3 border border-gray-300 rounded-lg"
        />

        <button
          class="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium"
          @click="startAddTracker"
        >
          Next
        </button>
      </div>
    </section>

    <!-- Trackers Table -->
    <section>
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Active Trackers</h2>

      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full bg-white">
          <thead>
            <tr class="bg-gray-100 text-left border-b">
              <th class="px-4 py-3 font-medium">Market</th>
              <th class="px-4 py-3 font-medium">High</th>
              <th class="px-4 py-3 font-medium">Low</th>
              <th class="px-4 py-3 font-medium">Target</th>
              <th class="px-4 py-3 font-medium">Created</th>
              <th class="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="tracker in trackers"
              :key="tracker.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-4 py-3 max-w-xs truncate">{{ tracker.url }}</td>

              <td class="px-4 py-3 text-green-600">
                {{ tracker.highPrice ?? "—" }}
              </td>
              <td class="px-4 py-3 text-red-600">
                {{ tracker.lowPrice ?? "—" }}
              </td>

              <td class="px-4 py-3">
                {{ tracker.targetOutcome }} / {{ tracker.targetSide }} @
                {{ tracker.targetPrice }}
              </td>

              <td class="px-4 py-3 text-gray-600">{{ tracker.createdAt }}</td>

              <td class="px-4 py-3 text-right space-x-3">
                <button
                  class="text-blue-600 hover:text-blue-800"
                  @click="editTracker(tracker)"
                >
                  Edit
                </button>

                <button
                  class="text-red-600 hover:text-red-800"
                  @click="removeTracker(tracker.id)"
                >
                  Remove
                </button>
              </td>
            </tr>

            <tr v-if="trackers.length === 0">
              <td
                colspan="6"
                class="px-4 py-5 text-center text-gray-500 italic"
              >
                No trackers yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 bg-[#000000a1] flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl space-y-4">
        <h2 class="text-xl font-semibold">
          {{ editingTracker ? "Edit Tracker" : "Configure Tracker" }}
        </h2>
        <h3 class="text-lg font-bold">{{ modalData.title }}</h3>
        <div v-if="modalData.marketOptions.length > 1">
          <label class="block font-medium">Select Market</label>
          <select
            v-model="modalData.selectedMarketId"
            class="w-full p-3 border rounded"
          >
            <option
              v-for="m in modalData.marketOptions"
              :key="m.id"
              :value="m.id"
            >
              {{ m.title }}
            </option>
          </select>
        </div>
        <!-- Outcome -->
        <label class="block font-medium">Select Outcome</label>
        <select
          v-model="modalData.targetOutcome"
          class="w-full p-3 border rounded"
        >
          <option v-for="o in modalData.availableOutcomes" :key="o" :value="o">
            {{ o }}
          </option>
        </select>

        <!-- Side -->
        <label class="block font-medium">Side</label>
        <select
          v-model="modalData.targetSide"
          class="w-full p-3 border rounded"
        >
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>

        <!-- Price -->
        <label class="block font-medium">Target Price</label>
        <input
          v-model.number="modalData.targetPrice"
          type="number"
          class="w-full p-3 border rounded"
          placeholder="0.50"
          step="0.01"
        />

        <div class="flex justify-end gap-3 pt-4">
          <button class="px-4 py-2" @click="closeModal">Cancel</button>
          <button
            class="bg-green-600 text-white px-4 py-2 rounded-lg"
            @click="saveModal"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPolymarketForPriceAlerts } from "@/api/polymarket";
import { ref } from "vue";

const urlInput = ref("");

const trackers = ref<
  Array<{
    id: number;
    url: string;
    marketId: string;
    createdAt: string;
    highPrice: number | null;
    lowPrice: number | null;
    targetOutcome: string;
    targetSide: "BUY" | "SELL";
    targetPrice: number | null;
  }>
>([]);

// --- Modal State ---
const modalOpen = ref(false);
const editingTracker = ref<null | {
  id: number;
  url: string;
  marketId: string;
  createdAt: string;
  highPrice: number | null;
  lowPrice: number | null;
  targetOutcome: string;
  targetSide: "BUY" | "SELL";
  targetPrice: number | null;
}>(null);

const modalData = ref({
  url: "",
  marketOptions: [] as Array<{ id: string; title: string }>,
  title: "",
  selectedMarketId: "",
  availableOutcomes: ["YES", "NO"],
  targetOutcome: "YES",
  targetSide: "BUY" as "BUY" | "SELL",
  marketId: "",
  targetPrice: null as number | null,
});

// Removed unused mutation setup to satisfy lint rules

const startAddTracker = async () => {
  const url = urlInput.value.trim();
  if (!url) return;

  try {
    const response = await getPolymarketForPriceAlerts(url);
    console.log(response);
    const market: Array<{ id: string; groupItemTitle: string }> =
      response.data.markets;

    modalData.value = {
      url,
      marketOptions: market.map((m) => ({
        id: m.id,
        title: m.groupItemTitle,
      })),
      selectedMarketId: market[0].id,
      availableOutcomes: ["YES", "NO"],
      targetOutcome: "YES",
      targetSide: "BUY",
      marketId: market[0].id,
      targetPrice: null,
      title: response.data.title,
    };

    modalOpen.value = true;
  } catch (err) {
    console.error("Failed to load Polymarket:", err);
    alert("Could not load market data.");
  }
};
// (optional) If needed, add helpers here

const saveModal = () => {
  if (editingTracker.value) {
    Object.assign(editingTracker.value, {
      marketId: modalData.value.selectedMarketId,
      targetOutcome: modalData.value.targetOutcome,
      targetSide: modalData.value.targetSide,
      targetPrice: modalData.value.targetPrice,
    });

    editingTracker.value = null;
  } else {
    trackers.value.push({
      id: Date.now(),
      url: modalData.value.url,
      marketId: modalData.value.selectedMarketId,
      createdAt: new Date().toISOString(),
      highPrice: null,
      lowPrice: null,
      targetOutcome: modalData.value.targetOutcome,
      targetSide: modalData.value.targetSide,
      targetPrice: modalData.value.targetPrice,
    });
  }

  closeModal();
};

const editTracker = (tracker: {
  id: number;
  url: string;
  marketId: string;
  createdAt: string;
  highPrice: number | null;
  lowPrice: number | null;
  targetOutcome: string;
  targetSide: "BUY" | "SELL";
  targetPrice: number | null;
}) => {
  editingTracker.value = tracker;

  modalData.value = {
    url: tracker.url,
    marketOptions: modalData.value.marketOptions, // ideally refetch
    selectedMarketId: tracker.marketId,
    availableOutcomes: ["YES", "NO"],
    targetOutcome: tracker.targetOutcome,
    targetSide: tracker.targetSide,
    marketId: tracker.marketId,
    targetPrice: tracker.targetPrice,
    title: modalData.value.title,
  };

  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  editingTracker.value = null;
};

const removeTracker = (id: number) => {
  trackers.value = trackers.value.filter((t) => t.id !== id);
};

const fetchTrackers = () => {
  console.log("Refresh...");
};
</script>
