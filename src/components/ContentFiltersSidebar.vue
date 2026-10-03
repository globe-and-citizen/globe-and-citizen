<template>
  <aside class="border-b border-border lg:sticky lg:top-6 lg:border-b-0">
    <div>
      <div class="flex items-center justify-between gap-3 pb-5">
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-semibold">Filter by</h2>
          <span
            v-if="activeFilterCount"
            class="rounded-full bg-foreground px-2 py-0.5 text-xs text-background"
          >
            {{ activeFilterCount }}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="hasActiveFilters"
            type="button"
            class="text-sm underline underline-offset-4"
            @click="clearFilters"
          >
            Clear all
          </button>
        </div>
      </div>

      <details open class="group border-t border-border py-4">
        <summary
          class="flex cursor-pointer list-none items-center justify-between text-base font-medium [&::-webkit-details-marker]:hidden"
        >
          Period
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            class="h-4 w-4 transition-transform group-open:rotate-180"
          >
            <path
              d="m5 8 5 5 5-5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </summary>

        <div class="mt-4 grid gap-4">
          <div class="grid gap-2">
            <Label for="content-period-type">Period type</Label>
            <Select v-model="dateMode">
              <SelectTrigger id="content-period-type" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="range">Date range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="dateMode === 'month'" class="grid gap-2">
            <Label for="content-month">Month</Label>
            <Input id="content-month" v-model="month" type="month" />
          </div>
          <template v-else>
            <div class="grid gap-2">
              <Label for="content-from">From date</Label>
              <Input
                id="content-from"
                v-model="fromDate"
                type="date"
                :max="toDate || undefined"
              />
            </div>
            <div class="grid gap-2">
              <Label for="content-to">To date</Label>
              <Input
                id="content-to"
                v-model="toDate"
                type="date"
                :min="fromDate || undefined"
              />
            </div>
          </template>
        </div>
      </details>

      <details open class="group border-t border-border py-4">
        <summary
          class="flex cursor-pointer list-none items-center justify-between text-base font-medium [&::-webkit-details-marker]:hidden"
        >
          Author
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            class="h-4 w-4 transition-transform group-open:rotate-180"
          >
            <path
              d="m5 8 5 5 5-5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </summary>

        <div class="mt-4">
          <ComboboxRoot
            v-model="authorId"
            :disabled="authorsLoading"
            open-on-click
            open-on-focus
          >
            <ComboboxAnchor class="relative">
              <ComboboxInput
                id="content-author"
                v-model="authorSearch"
                :display-value="authorDisplayValue"
                :placeholder="authorsLoading ? 'Loading authors…' : 'Search authors…'"
                class="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 pr-9 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Search authors"
                @focus="selectInputText"
              />
              <ComboboxTrigger
                class="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" class="h-4 w-4">
                  <path
                    d="m6 8 4 4 4-4"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </ComboboxTrigger>
            </ComboboxAnchor>

            <ComboboxPortal>
              <ComboboxContent
                position="popper"
                align="start"
                :side-offset="4"
                class="z-50 max-h-72 w-[var(--reka-combobox-trigger-width)] min-w-[220px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
              >
                <ComboboxViewport class="max-h-72 overflow-y-auto p-1">
                  <ComboboxEmpty class="px-2 py-6 text-center text-sm text-muted-foreground">
                    No authors found.
                  </ComboboxEmpty>
                  <ComboboxItem
                    value="all"
                    text-value="All authors"
                    class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 pr-8 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                  >
                    All authors
                    <ComboboxItemIndicator class="absolute right-2">✓</ComboboxItemIndicator>
                  </ComboboxItem>
                  <ComboboxItem
                    v-for="author in authors"
                    :key="author.id"
                    :value="author.id.toString()"
                    :text-value="author.username"
                    class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 pr-8 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                  >
                    {{ author.username }}
                    <ComboboxItemIndicator class="absolute right-2">✓</ComboboxItemIndicator>
                  </ComboboxItem>
                </ComboboxViewport>
              </ComboboxContent>
            </ComboboxPortal>
          </ComboboxRoot>
        </div>
      </details>

      <div class="border-t border-border py-4">
        <Button class="w-full" :disabled="isFetching" @click="applyFilters">
          Apply filters
        </Button>
        <p v-if="filterError" class="mt-3 text-sm text-red-600">
          {{ filterError }}
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { ContentAuthor } from "@/api/contentFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from "reka-ui";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps<{
  authors: ContentAuthor[];
  authorsLoading: boolean;
  isFetching: boolean;
}>();

const open = defineModel<boolean>("open", { default: true });
const route = useRoute();
const router = useRouter();
const dateMode = ref<"month" | "range">("month");
const month = ref("");
const fromDate = ref("");
const toDate = ref("");
const authorId = ref("all");
const authorSearch = ref("All authors");
const filterError = ref("");

const activeFilterCount = computed(
  () =>
    Number(
      Boolean(
        firstQueryValue(route.query.month) ||
          firstQueryValue(route.query.from) ||
          firstQueryValue(route.query.to),
      ),
    ) + Number(Boolean(firstQueryValue(route.query.author))),
);
const hasActiveFilters = computed(() => activeFilterCount.value > 0);

watch(
  [() => props.authors, authorId],
  () => {
    authorSearch.value = authorDisplayValue(authorId.value);
  },
  { deep: true },
);

watch(
  () => route.fullPath,
  () => {
    const routeMonth = firstQueryValue(route.query.month);
    const hasRange = Boolean(
      firstQueryValue(route.query.from) || firstQueryValue(route.query.to),
    );
    dateMode.value = routeMonth || !hasRange ? "month" : "range";
    month.value = routeMonth;
    fromDate.value = firstQueryValue(route.query.from);
    toDate.value = firstQueryValue(route.query.to);
    authorId.value = firstQueryValue(route.query.author) || "all";
    filterError.value = "";
  },
  { immediate: true },
);

function applyFilters() {
  filterError.value = "";
  if (!resolveAuthorSelection()) return;
  if (
    dateMode.value === "range" &&
    fromDate.value &&
    toDate.value &&
    fromDate.value > toDate.value
  ) {
    filterError.value = "The from date must be on or before the to date.";
    return;
  }

  const query = withoutFilterQuery();
  if (dateMode.value === "month" && month.value) {
    query.month = month.value;
  } else if (dateMode.value === "range") {
    if (fromDate.value) query.from = fromDate.value;
    if (toDate.value) query.to = toDate.value;
  }
  if (authorId.value !== "all") query.author = authorId.value;

  router.replace({ query });
  if (window.matchMedia("(max-width: 1023px)").matches) open.value = false;
}

function clearFilters() {
  month.value = "";
  fromDate.value = "";
  toDate.value = "";
  authorId.value = "all";
  filterError.value = "";
  router.replace({ query: withoutFilterQuery() });
}

function withoutFilterQuery() {
  const query = { ...route.query };
  delete query.page;
  delete query.month;
  delete query.from;
  delete query.to;
  delete query.author;
  return query;
}

function authorDisplayValue(value: unknown): string {
  const id = String(value ?? "all");
  if (id === "all") return "All authors";
  return props.authors.find((author) => author.id.toString() === id)?.username ?? "";
}

function resolveAuthorSelection(): boolean {
  const search = authorSearch.value.trim();
  if (!search) {
    authorId.value = "all";
    return true;
  }
  if (
    search.toLocaleLowerCase() ===
    authorDisplayValue(authorId.value).toLocaleLowerCase()
  ) {
    return true;
  }

  const exactMatch = props.authors.find(
    (author) =>
      author.username.toLocaleLowerCase() === search.toLocaleLowerCase(),
  );
  if (exactMatch) {
    authorId.value = exactMatch.id.toString();
    return true;
  }

  filterError.value = "Select an author from the search results.";
  return false;
}

function selectInputText(event: FocusEvent) {
  (event.target as HTMLInputElement).select();
}

function firstQueryValue(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? "");
  return typeof value === "string" ? value : "";
}
</script>
