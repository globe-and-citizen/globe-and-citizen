<template>
  <div class="map-container">
    <div class="map-controls z-50">
      <CustomSelect
        v-model="selectedDataType"
        :options="dataOptions"
        label="Filter By"
        class="select-class"
        data-test="filter-select"
      />
      <CustomButton
        :label="isStatsVisible ? 'Hide Stats' : 'Show Stats'"
        color="primary"
        data-test="toggle-stats"
        @click="toggleStats"
      />
    </div>

    <div class="stats-section" :class="{ 'stats-visible': isStatsVisible }">
      <div class="total-countries">
        <div>
          Total Countries Participated:
          <span class="highlight-text">{{ totalCountriesParticipated }}</span>
        </div>
        <div>
          Total Countries by
          <span class="font-semibold">{{ selectedDataType.label }}:</span>
          <span class="highlight-text">{{ " " }}{{ totalCountries }}</span>
        </div>
      </div>

      <div class="overall-stats">
        Country with most participants:
        <span class="font-semibold">{{
          countryWithMostParticipants.country
        }}</span>
        <span class="font-semibold"
          >{{ " " }}{{ countryWithMostParticipants.icon }}</span
        >
        <div
          v-if="
            countryWithMostParticipants.totalComments ||
            countryWithMostParticipants.totalLikes ||
            countryWithMostParticipants.totalDislikes ||
            countryWithMostParticipants.totalShares
          "
          class="stats-details"
        >
          <span class="stat-item"
            >Comments: {{ countryWithMostParticipants.totalComments }}</span
          >
          <span class="stat-item"
            >Likes: {{ countryWithMostParticipants.totalLikes }}</span
          >
          <span class="stat-item"
            >Dislikes: {{ countryWithMostParticipants.totalDislikes }}</span
          >
          <span class="stat-item"
            >Shares: {{ countryWithMostParticipants.totalShares }}</span
          >
        </div>
      </div>
    </div>

    <div id="map" @mousedown.stop.prevent @touchstart="handleTouchStart"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRaw, watch, watchEffect } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CustomSelect from "@/components/CustomSelect.vue";
import CustomButton from "@/components/CustomButton.vue";
import { countries as allCountries } from "@/components/Charts/Map/countries";

// Types
interface DataOption {
  label: string;
  value: string;
}

interface Interactions {
  likes: number;
  dislikes: number;
}

interface CountryData {
  location: string;
  comments: number;
  interactions: Interactions;
  shares: number;
}

interface CountryInfo {
  code: string;
  country: string;
  coordinates: [number, number];
}

interface CountryWithMostParticipants {
  country: string;
  icon?: string;
  totalComments?: number;
  totalLikes?: number;
  totalDislikes?: number;
  totalShares?: number;
}

// Prop for real data
type IncomingCountryVote = {
  country: string;
  likes: number;
  dislikes: number;
  comments: number;
};
const props = defineProps<{ countryVotes?: IncomingCountryVote[] }>();

// Full countries catalogue from file, normalized to expected type
type RawCountry = {
  country: string;
  code: string;
  coordinates: [number, number] | number[];
};
const countries: CountryInfo[] = (allCountries as RawCountry[]).map((c) => ({
  code: c.code,
  country: c.country,
  coordinates: [c.coordinates[0] as number, c.coordinates[1] as number],
}));

// Refs
const mapRef = ref<L.Map | null>(null);
const totalCountries = ref<number>(0);
const isStatsVisible = ref<boolean>(false);

// Utilities
const normalizeCountryCode = (code: string): string => {
  const upper = (code || "").toUpperCase();
  if (upper === "UK") return "GB"; // alias
  return upper;
};

// Data processing from props
const allInteractions = computed<CountryData[]>(() => {
  const input = props.countryVotes || [];
  return input.map((cv) => ({
    location: normalizeCountryCode(cv.country),
    comments: cv.comments || 0,
    interactions: {
      likes: cv.likes || 0,
      dislikes: cv.dislikes || 0,
    },
    shares: 0, // not provided currently
  }));
});

const interactionsExists = computed<boolean>(() =>
  allInteractions.value?.some(
    (el) =>
      (el.interactions?.likes || 0) > 0 || (el.interactions?.dislikes || 0) > 0
  )
);
const commentsExists = computed<boolean>(() =>
  allInteractions.value?.some((el) => (el.comments || 0) > 0)
);
const sharesExist = computed<boolean>(() =>
  allInteractions.value?.some((el) => (el.shares || 0) > 0)
);

const selectedDataType = ref<DataOption>({
  label: "Likes and dislikes",
  value: "interactions",
});

const initialDataOptions: DataOption[] = [
  { label: "Likes and dislikes", value: "interactions" },
  { label: "Comments", value: "comments" },
  { label: "Shares", value: "shares" },
];

const dataOptions = ref<DataOption[]>([]);

// Functions
const updateDataOptions = (): void => {
  dataOptions.value = initialDataOptions.filter((option) => {
    if (option.value === "interactions") return interactionsExists.value;
    if (option.value === "comments") return commentsExists.value;
    if (option.value === "shares") return sharesExist.value;
    return false;
  });

  if (
    !dataOptions.value.some(
      (option) => option.value === selectedDataType.value.value
    )
  ) {
    selectedDataType.value = dataOptions.value[0] || { label: "", value: "" };
  }
  updateTotalCountries();
};

const updateTotalCountries = (): void => {
  if (!allInteractions.value) return;

  if (selectedDataType.value.value === "interactions") {
    totalCountries.value = allInteractions.value.filter(
      (el) =>
        (el.interactions?.likes || 0) > 0 ||
        (el.interactions?.dislikes || 0) > 0
    ).length;
  } else if (selectedDataType.value.value === "comments") {
    totalCountries.value = allInteractions.value.filter(
      (el) => (el.comments || 0) > 0
    ).length;
  } else if (selectedDataType.value.value === "shares") {
    totalCountries.value = allInteractions.value.filter(
      (el) => (el.shares || 0) > 0
    ).length;
  }
};

const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Computed properties
const totalCountriesParticipated = computed<number>(() => {
  return new Set(allInteractions.value.map((entry) => entry.location)).size;
});

const countryWithMostParticipants = computed<CountryWithMostParticipants>(
  () => {
    const data = allInteractions.value;
    const maxCountryCode = data.reduce(
      (maxCountry, entry) => {
        const totalParticipation =
          entry.comments +
          entry.interactions.likes +
          entry.interactions.dislikes +
          entry.shares;
        if (totalParticipation > maxCountry.participation) {
          return {
            country: entry.location,
            participation: totalParticipation,
            totalComments: entry.comments,
            totalLikes: entry.interactions.likes,
            totalDislikes: entry.interactions.dislikes,
            totalShares: entry.shares,
          };
        }

        return maxCountry;
      },
      {
        country: "",
        participation: 0,
        totalComments: 0,
        totalLikes: 0,
        totalDislikes: 0,
        totalShares: 0,
      }
    );

    const icon = getFlagEmoji(maxCountryCode.country);

    const allEqual = data.every((entry) => {
      const totalParticipations =
        entry.comments +
        entry.interactions.likes +
        entry.interactions.dislikes +
        entry.shares;
      return totalParticipations === maxCountryCode.participation;
    });

    if (allEqual && data.length > 1) {
      return { country: "Equal participation. 🌍" };
    }

    return {
      country:
        countries.find((country) => country.code === maxCountryCode.country)
          ?.country || "Unknown",
      icon,
      totalLikes: maxCountryCode.totalLikes,
      totalDislikes: maxCountryCode.totalDislikes,
      totalShares: maxCountryCode.totalShares,
      totalComments: maxCountryCode.totalComments,
    };
  }
);

// Map handling functions - Fixed parameter types
const handleLikesAndDislikes = (
  data: CountryData[],
  map: L.Map | null
): void => {
  if (!Array.isArray(data) || !map) return;

  const interactionCounts = data.map(
    (item) => item.interactions.likes + item.interactions.dislikes || 0
  );
  const minLikes = Math.min(...interactionCounts);
  const maxLikes = Math.max(...interactionCounts);

  const minRadius = 20000;
  const maxRadius = 150000;

  data.forEach((countryData) => {
    const totalInteractions =
      countryData.interactions.likes + countryData.interactions.dislikes;
    if (totalInteractions > 0) {
      const countryInfo = countries.find(
        (country) => country.code === countryData.location
      );
      if (!countryInfo) return;

      const popupContent = `Country: ${countryInfo.country}<br>Total Likes: ${countryData.interactions.likes}<br>Total Dislikes: ${countryData.interactions.dislikes}`;

      let normalizedRadius =
        minRadius +
        ((totalInteractions - minLikes) / (maxLikes - minLikes)) *
          (maxRadius - minRadius);
      normalizedRadius = Math.max(
        minRadius,
        Math.min(normalizedRadius, maxRadius)
      );

      const circleOptions: L.CircleOptions = {
        radius: normalizedRadius || minRadius,
        fillOpacity: 0.5,
        color: "#e54757",
        fillColor: "#e54757",
        weight: 1.4,
      };

      if (countryInfo.coordinates) {
        L.circle(countryInfo.coordinates, circleOptions)
          .addTo(toRaw(map))
          .bindPopup(popupContent, { autoClose: false, closeOnClick: false });
      }
    }
  });
};

const handleComments = (data: CountryData[], map: L.Map | null): void => {
  if (!Array.isArray(data) || !map) return;

  const commentCounts = data.map((item) => item.comments || 0);
  const minComments = Math.min(...commentCounts);
  const maxComments = Math.max(...commentCounts);

  const minRadius = 20000;
  const maxRadius = 120000;

  data.forEach((countryData) => {
    const commentsCount = countryData.comments || 0;
    if (commentsCount > 0) {
      const countryInfo = countries.find(
        (country) => country.code === countryData.location
      );
      if (!countryInfo) return;

      let normalizedRadius =
        minRadius +
        ((commentsCount - minComments) / (maxComments - minComments)) *
          (maxRadius - minRadius);
      normalizedRadius = Math.max(
        minRadius,
        Math.min(normalizedRadius, maxRadius)
      );

      const popupContent = `Country: ${countryInfo.country}<br>Total Comments: ${commentsCount}`;

      const circleOptions: L.CircleOptions = {
        radius: normalizedRadius || minRadius,
        fillOpacity: 0.5,
        color: "#e54757",
        fillColor: "#e54757",
        weight: 1.4,
      };

      if (countryInfo.coordinates) {
        toRaw(map).setView(countryInfo.coordinates, 3);
        L.circle(countryInfo.coordinates, circleOptions)
          .addTo(toRaw(map))
          .bindPopup(popupContent, { autoClose: false, closeOnClick: false });
      }
    }
  });
};

const handleShares = (data: CountryData[], map: L.Map | null): void => {
  if (!Array.isArray(data) || !map) return;

  const shareCounts = data.map((item) => item.shares || 0);
  const minShares = Math.min(...shareCounts);
  const maxShares = Math.max(...shareCounts);
  const minRadius = 40000;
  const maxRadius = 150000;

  data.forEach((countryData) => {
    const sharesCount = countryData?.shares || 0;
    if (sharesCount > 0) {
      const countryInfo = countries.find(
        (country) => country.code === countryData.location
      );
      if (!countryInfo) return;

      let normalizedRadius =
        minRadius +
        ((sharesCount - minShares) / (maxShares - minShares)) *
          (maxRadius - minRadius);
      normalizedRadius = Math.max(
        minRadius,
        Math.min(normalizedRadius, maxRadius)
      );

      const popupContent = `Country: ${countryInfo.country}<br>Total Shares: ${sharesCount}`;

      const circleOptions: L.CircleOptions = {
        radius: normalizedRadius || minRadius,
        fillOpacity: 0.5,
        color: "#e54757",
        fillColor: "#e54757",
        weight: 1.4,
      };

      if (countryInfo.coordinates) {
        toRaw(map).setView(countryInfo.coordinates, 3);
        L.circle(countryInfo.coordinates, circleOptions)
          .addTo(toRaw(map))
          .bindPopup(popupContent, { autoClose: false, closeOnClick: false });
      }
    }
  });
};

// Map initialization
const initMap = async (): Promise<void> => {
  await nextTick();

  if (toRaw(mapRef.value)) {
    // clear previous layers
    toRaw(mapRef.value)!.eachLayer((layer) => {
      toRaw(mapRef.value)!.removeLayer(layer);
    });
  } else {
    // initialize map
    mapRef.value = L.map("map", {
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
      maxBoundsViscosity: 0,
    });
  }

  // add base tiles
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 10,
      minZoom: 3,
    }
  ).addTo(toRaw(mapRef.value) as L.Map);

  // set bounds
  const bounds: L.LatLngBoundsExpression = [
    [-85, -180],
    [85, 180],
  ];
  toRaw(mapRef.value)!.setMaxBounds(bounds);
  toRaw(mapRef.value)!.fitBounds(bounds);

  // ✅ Only draw overlays if data exists
  if (allInteractions.value && allInteractions.value.length) {
    const rawMap = toRaw(mapRef.value);

    if (
      selectedDataType.value.value === "interactions" &&
      interactionsExists.value
    ) {
      handleLikesAndDislikes(allInteractions.value, rawMap as L.Map | null);
    } else if (
      selectedDataType.value.value === "comments" &&
      commentsExists.value
    ) {
      handleComments(allInteractions.value, rawMap as L.Map);
    } else if (selectedDataType.value.value === "shares" && sharesExist.value) {
      handleShares(allInteractions.value, rawMap as L.Map);
    }
  }

  // fix responsiveness
  window.addEventListener("resize", () => {
    toRaw(mapRef.value)!.invalidateSize();
  });
};

const handleTouchStart = (e: TouchEvent): void => {
  e.stopPropagation();
};

const toggleStats = (): void => {
  isStatsVisible.value = !isStatsVisible.value;
};

// Watchers
watchEffect(() => {
  if (allInteractions.value) {
    updateDataOptions();
    initMap();
  }
});

watch(selectedDataType, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await initMap();
  }
});

watch(
  () => props.countryVotes,
  () => {
    updateDataOptions();
    initMap();
  },
  { deep: true }
);
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 33333;
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.stats-section {
  position: absolute;
  top: 60px;
  left: 10px;
  z-index: 33333;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  opacity: 0;
  pointer-events: none;
}

.stats-section.stats-visible {
  max-height: 200px;
  opacity: 1;
  pointer-events: auto;
}

#map {
  height: 80vh;
  border-radius: 10px;
  touch-action: none;
}

@media (max-width: 720px) {
  #map {
    height: 60vh;
  }
}

.select-class {
  width: 200px;
  background-color: white;
  z-index: 999999999;
}

@media (max-width: 720px) {
  .select-class {
    width: 170px;
  }
}

.total-countries {
  border: 1px solid #c2c2c2;
  border-radius: 5px;
  padding: 5px 12px;
  background-color: white;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.total-countries:hover {
  border-color: #000000;
}

.overall-stats {
  border: 1px solid #c2c2c2;
  border-radius: 5px;
  padding: 5px 12px;
  background-color: white;
}

.overall-stats:hover {
  border-color: #000000;
}

.icon-margin {
  margin-right: 0.5rem;
}

.text-primary {
  color: #1976d2;
}

.highlight-text {
  color: #e54757;
}

.font-semibold {
  font-weight: 600;
}

.stats-details {
  font-weight: 400;
  font-size: 13px;
  display: flex;
  gap: 4px;
}

.stat-item {
  font-weight: 500;
  color: #1976d2;
}

@media (min-width: 1024px) {
  .row > .col-md-6 {
    height: auto;
    width: 49%;
    padding: 10px;
  }
}
</style>
