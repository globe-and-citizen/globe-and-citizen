<template>
  <div class="w-full min-w-0 space-y-10">
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
    <div class="w-full">
      <div
        class="w-full max-w-full min-w-0 overflow-x-auto overflow-y-auto max-h-[70vh] md:max-h-none border border-gray-200 rounded-lg overscroll-contain"
      >
        <table class="w-full min-w-[900px] table-fixed bg-white">
          <thead>
            <tr class="bg-gray-100 text-left border-b">
              <th class="px-4 py-3 font-medium w-[90px]">Type</th>
              <th class="px-4 py-3 font-medium">Legs</th>
              <th class="px-4 py-3 font-medium text-center w-[120px]">Hold</th>
              <th class="px-4 py-3 font-medium text-center w-[150px]">
                Current metric
              </th>
              <th class="px-4 py-3 font-medium text-center w-[150px]">
                Triggered (n)
              </th>
              <th class="px-4 py-3 font-medium w-[130px]">Created</th>
              <th class="px-4 py-3 font-medium text-right w-[140px]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="tracker in trackers"
              :key="tracker.id"
              class="border-b cursor-pointer"
              :class="
                tracker?.current_metric === null ||
                tracker?.current_metric === undefined
                  ? 'bg-red-50 hover:bg-red-100'
                  : 'hover:bg-gray-50'
              "
              @click="openPreview(tracker)"
            >
              <td class="px-4 py-3">
                {{
                  tracker.alert_type === "sum" || tracker.legs
                    ? "Multi"
                    : "Single"
                }}
              </td>
              <td class="px-4 py-3 truncate">
                <span v-if="tracker.alert_type === 'sum' || tracker.legs">
                  {{ formatLegs(tracker) }}
                </span>
                <span v-else>
                  {{
                    tracker?.market_url
                      ?.replace(/.*\/(event|market)\//, "")
                      .replace(/\?.*$/, "")
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? "—"
                  }}
                </span>
              </td>
              <td class="px-4 py-3 text-center whitespace-nowrap">
                <span v-if="tracker.legs || tracker.threshold !== undefined">
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
              <td class="px-4 py-3 text-center whitespace-nowrap">
                {{ tracker?.current_metric?.toFixed(3) ?? "—" }}
              </td>
              <td class="px-4 py-3 text-center whitespace-nowrap">
                {{ tracker?.total_trigger_count ?? "—" }}
              </td>
              <td class="px-4 py-3 text-gray-600">
                {{ new Date(tracker.created_at || "").toLocaleDateString() }}
              </td>

              <td class="px-4 py-3 text-right whitespace-nowrap space-x-3">
                <button
                  class="text-blue-600 hover:text-blue-800 cursor-pointer"
                  @click.stop="editTracker(tracker)"
                >
                  Edit
                </button>

                <button
                  class="text-red-600 hover:text-red-800 cursor-pointer"
                  @click.stop="removeTracker(tracker.id)"
                >
                  Remove
                </button>
              </td>
            </tr>

            <tr v-if="trackers.length === 0">
              <td
                colspan="7"
                class="px-4 py-5 text-center text-gray-500 italic"
              >
                No trackers yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <PolymarketAlertWizardModal
      :is-open="isCreateModalOpen"
      mode="create"
      @close="isCreateModalOpen = false"
      @created="handleCreated"
    />

    <PolymarketAlertWizardModal
      :is-open="isEditModalOpen"
      mode="edit"
      :initial-alert="editingTracker"
      @close="closeEditModal"
      @updated="handleUpdated"
    />

    <Dialog
      :open="isPreviewOpen"
      @update:open="(open: boolean) => !open && closePreview()"
    >
      <DialogContent
        class="w-[90vw] max-w-[750px] max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Tracker Preview</DialogTitle>
          <DialogDescription>
            Full details of the selected tracker.
          </DialogDescription>
        </DialogHeader>

        <div v-if="previewTracker" class="grid gap-4 py-4">
          <div class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div class="text-xs text-gray-500">Type</div>
                <div class="font-medium text-gray-800">{{ previewType }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-500">Created</div>
                <div class="font-medium text-gray-800">
                  {{ formatDateTime(previewTracker.created_at) }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-500">Current metric</div>
                <div class="font-medium text-gray-800">
                  {{ previewTracker?.current_metric?.toFixed(3) ?? "—" }}
                </div>
              </div>
              <div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div class="text-xs text-gray-500">Hold</div>
                    <span v-if="previewTracker.operator === 'lt'">
                      {{ "<" }}
                    </span>
                    <span v-if="previewTracker.operator === 'lte'">
                      {{ "<=" }}
                    </span>
                    <span v-if="previewTracker.operator === 'gt'">
                      {{ ">" }}
                    </span>
                    <span v-if="previewTracker.operator === 'gte'">
                      {{ ">=" }}
                    </span>
                    {{ previewTracker.threshold ?? "—" }}
                  </div>
                </div>
              </div>

              <div>
                <div class="text-xs text-gray-500">Triggered (n)</div>
                <div class="font-medium text-gray-800">
                  {{ previewTracker.total_trigger_count ?? "—" }}
                </div>
              </div>
            </div>

            <div v-if="previewIsMulti" class="space-y-2">
              <div class="text-sm font-semibold text-gray-800">Legs</div>
              <div class="space-y-2">
                <div
                  v-for="(leg, idx) in previewTracker.legs ?? []"
                  :key="idx"
                  class="rounded-md border border-gray-200 p-3"
                >
                  <div class="text-sm font-medium text-gray-800 capitalize">
                    {{ previewTracker.direction ?? "" }} @
                    {{ leg.outcome_name ?? "—" }}
                  </div>

                  <div class="text-sm">
                    <span class="text-gray-600">Market: </span>
                    <a
                      v-if="normalizeMarketUrl(leg.market_url)"
                      class="text-blue-600 hover:text-blue-800 underline"
                      :href="normalizeMarketUrl(leg.market_url) || undefined"
                      target="_blank"
                      rel="noreferrer"
                      @click.stop
                    >
                      {{ normalizeMarketUrl(leg.market_url) }}
                    </a>
                    <span v-else class="text-gray-600">—</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="space-y-2">
              <div class="text-sm font-semibold text-gray-800">Market</div>
              <div class="text-sm">
                <a
                  v-if="normalizeMarketUrl(previewTracker.market_url)"
                  class="text-blue-600 hover:text-blue-800 underline"
                  :href="
                    normalizeMarketUrl(previewTracker.market_url) || undefined
                  "
                  target="_blank"
                  rel="noreferrer"
                  @click.stop
                >
                  {{ normalizeMarketUrl(previewTracker.market_url) }}
                </a>
                <span v-else class="text-gray-600">—</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div class="text-xs text-gray-500">Outcome</div>
                  <div class="font-medium text-gray-800">
                    {{ previewTracker.outcome_name ?? "—" }}
                  </div>
                </div>
                <div>
                  <div class="text-xs text-gray-500">Trigger</div>
                  <div class="font-medium text-gray-800">
                    {{
                      (previewTracker.direction ?? "—").toString().toUpperCase()
                    }}
                    @
                    {{ previewTracker.target_price ?? "—" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button @click="closePreview">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { deleteAlert, fetchAlerts, type AlertOperator } from "@/api/polymarket";
import { computed, onMounted, ref } from "vue";
import PolymarketAlertWizardModal from "@/components/PolymarketAlertWizardModal.vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tracker = {
  id?: number | string;
  created_at?: string;

  notify_discord?: boolean;
  discord_webhook?: string;
  repeat?: boolean;

  // classic single
  market_url?: string;
  market_id?: string;
  direction?: "buy" | "sell";
  target_price?: number;
  outcome_id?: string;
  outcome_name?: string;
  current_metric?: number;
  total_trigger_count?: number;

  // sum alert
  alert_type?: "sum";
  operator?: AlertOperator;
  threshold?: number;
  legs?: Array<{
    market_url?: string;
    outcome_id?: string;
    outcome_name?: string;
  }>;
};

// Structural match for PolymarketAlertWizardModal's `initialAlert` prop.
type ExistingAlertLike = {
  id: string | number;

  // single
  market_url?: string;
  market_id?: string;
  outcome_id?: string;
  outcome_name?: string;
  direction?: "buy" | "sell";
  target_price?: number;

  // sum
  alert_type?: "sum";
  operator?: AlertOperator;
  threshold?: number;
  legs?: Array<{
    market_url?: string;
    outcome_id?: string;
    outcome_name?: string;
  }>;

  // notifications
  notify_discord?: boolean;
  discord_webhook?: string;
  repeat?: boolean;
};

const trackers = ref<Tracker[]>([]);

const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const editingTracker = ref<ExistingAlertLike | null>(null);

const isPreviewOpen = ref(false);
const previewTracker = ref<Tracker | null>(null);

const previewIsMulti = computed(() => {
  const t = previewTracker.value;
  if (!t) return false;
  return t.alert_type === "sum" || (t.legs?.length ?? 0) > 0;
});

const previewType = computed(() => (previewIsMulti.value ? "Multi" : "Single"));

const openCreateModal = () => {
  isCreateModalOpen.value = true;
};

const openPreview = (tracker: Tracker) => {
  previewTracker.value = tracker;
  isPreviewOpen.value = true;
};

const closePreview = () => {
  isPreviewOpen.value = false;
  previewTracker.value = null;
};

const handleCreated = async () => {
  await fetchTrackers();
};

const editTracker = (tracker: Tracker) => {
  const id = tracker?.id;
  if (id === undefined || id === null) return;

  editingTracker.value = {
    id,
    market_url: tracker.market_url,
    market_id: tracker.market_id,
    outcome_id: tracker.outcome_id,
    outcome_name: tracker.outcome_name,
    direction: tracker.direction,
    target_price: tracker.target_price,

    alert_type: tracker.alert_type,
    operator: tracker.operator,
    threshold: tracker.threshold,
    legs: tracker.legs?.map((l) => ({
      market_url: l.market_url,
      outcome_id: l.outcome_id,
      outcome_name: l.outcome_name,
    })),

    notify_discord: tracker.notify_discord,
    discord_webhook: tracker.discord_webhook,
    repeat: tracker.repeat,
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingTracker.value = null;
};

const handleUpdated = async () => {
  closeEditModal();
  await fetchTrackers();
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

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const normalizeMarketUrl = (url?: string | null) => {
  const raw = (url ?? "").trim();
  if (!raw) return null;

  if (raw.startsWith("/")) return `https://polymarket.com${raw}`;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("polymarket.com/")) return `https://${raw}`;
  return raw;
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
