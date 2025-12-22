<template>
  <div class="space-y-10">
    <!-- Title Row -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">Polymarket Trackers</h1>

      <div class="flex gap-2">
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          @click="openCreateModal"
        >
          Create Alert
        </button>

        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          @click="fetchTrackers"
        >
          Refresh
        </button>
      </div>
    </div>

    <!-- Trackers Table -->
    <section>
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Active Trackers</h2>

      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full bg-white">
          <thead>
            <tr class="bg-gray-100 text-left border-b">
              <th class="px-4 py-3 font-medium">Type</th>
              <!-- <th class="px-4 py-3 font-medium">Trigger</th> -->
              <th class="px-4 py-3 font-medium">Legs</th>
              <th class="px-4 py-3 font-medium text-center">Hold</th>
              <th class="px-4 py-3 font-medium text-center">Current metric</th>
              <th class="px-4 py-3 font-medium text-center">Triggered (n)</th>
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
              <td class="px-4 py-3">
                {{
                  tracker.alert_type === "sum" || tracker.legs
                    ? "Multi"
                    : "Single"
                }}
              </td>

              <!-- <td class="px-4 py-3">
                <span v-if="tracker.alert_type === 'sum' || tracker.legs">
                  p1 + … + p{{ (tracker.legs?.length ?? 0) || '—' }}
                  {{ tracker.operator ?? '—' }} {{ tracker.threshold ?? '—' }}
                </span>
                <span v-else>
                  {{ tracker.outcome_name ?? '—' }} /
                  {{ (tracker.direction ?? '—').toString().toUpperCase() }} @
                  {{ tracker.target_price ?? '—' }}
                </span>
              </td> -->

              <td class="px-4 py-3 max-w-xs truncate">
                <span v-if="tracker.alert_type === 'sum' || tracker.legs">
                  {{ formatLegs(tracker) }}
                </span>
                <span v-else>
                  {{ tracker.market_url ?? "—" }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span v-if="tracker.alert_type === 'sum' || tracker.legs">
                  <span v-if="tracker.operator === 'lt'"> {{ "<" }} </span>
                  <span v-if="tracker.operator === 'lte'"> {{ "<=" }} </span>
                  <span v-if="tracker.operator === 'gt'"> {{ ">" }} </span>
                  <span v-if="tracker.operator === 'gte'"> {{ ">=" }} </span>
                  {{ tracker.threshold ?? "—" }}
                </span>
                <span v-else>
                  {{ tracker.target_price ?? "—" }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                {{ tracker.current_metric ?? "—" }}
              </td>
              <td class="px-4 py-3 text-center">
                {{ tracker.total_trigger_count }}
              </td>
              <td class="px-4 py-3 text-gray-600">
                {{ new Date(tracker.created_at || "").toLocaleDateString() }}
              </td>

              <td class="px-4 py-3 text-right space-x-3">
                <!-- <button
                  class="text-blue-600 hover:text-blue-800"
                  @click="editTracker(tracker)"
                >
                  Edit
                </button> -->

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

    <PolymarketAlertWizardModal
      :is-open="isCreateModalOpen"
      @close="isCreateModalOpen = false"
      @created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { deleteAlert, fetchAlerts } from "@/api/polymarket";
import { onMounted, ref } from "vue";
import PolymarketAlertWizardModal from "@/components/PolymarketAlertWizardModal.vue";

type Tracker = {
  id?: number | string;
  created_at?: string;

  // classic single
  market_url?: string;
  market_id?: string;
  direction?: "buy" | "sell";
  target_price?: number;
  outcome_id?: string;
  outcome_name?: string;

  // sum alert
  alert_type?: "sum";
  operator?: string;
  threshold?: number;
  legs?: Array<{
    market_url?: string;
    outcome_id?: string;
    outcome_name?: string;
  }>;
};

const trackers = ref<Tracker[]>([]);

const isCreateModalOpen = ref(false);

const openCreateModal = () => {
  isCreateModalOpen.value = true;
};

const handleCreated = async () => {
  await fetchTrackers();
};

const editTracker = (tracker: Tracker) => {
  console.log("Edit tracker requested:", tracker);
};

const removeTracker = async (id?: number | string) => {
  if (id === undefined || id === null) return;
  try {
    await deleteAlert(id);
    await fetchTrackers();
  } catch (err) {
    console.error("Failed to delete tracker:", err);
    alert("Could not delete tracker.");
  }
};

const formatLegs = (tracker: Tracker) => {
  if (!tracker.legs || tracker.legs.length === 0) return "—";
  return tracker.legs.map((l) => `${l.outcome_name ?? "—"}`).join(" + ");
};

const fetchTrackers = async () => {
  try {
    const response = await fetchAlerts();
    trackers.value = response.data || [];
  } catch (err) {
    console.error("Failed to fetch trackers:", err);
    alert("Could not load trackers.");
  }
};

onMounted(() => {
  fetchTrackers();
});
</script>
