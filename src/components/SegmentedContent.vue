<template>
  <!-- Simplified wrapper: sentence interactions removed; flip animation preserved -->
  <div ref="rootEl" class="overflow-hidden relative pb-30">
    <div
      class="post-content flip-container relative max-w-[700px]"
      :class="{ flipping: isFlipping }"
      v-html="displayHTML"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from "vue";

import lightGallery from "lightgallery";
import lgZoom from "lightgallery/plugins/zoom";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
const props = defineProps<{
  content: string;
  // Keeping sentences & postType props for future reactivation (anthograms) – unused for now
  sentences: unknown;
  postType: "opinion" | "post";
  showAnnotations: boolean;
}>();

// Direct content rendering (no sentence splitting/highlights)
const displayHTML = ref<string>("");
const rootEl = ref<HTMLElement | null>(null);
const isFlipping = ref<boolean>(false);
function updateDisplayHTML() {
  // For now, we simply assign the raw content (no sentence annotation).
  displayHTML.value = props.content || "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lgInstances: any[] = [];

function initLightGallery() {
  if (!rootEl.value) return;

  lgInstances.forEach((instance) => {
    try {
      instance.destroy(true);
    } catch {
      // ignore
    }
  });
  lgInstances = [];

  // Find post-content containers ONLY inside this component
  const postContentEls = rootEl.value.querySelectorAll(".post-content");
  if (!postContentEls.length) return;

  // Collect images inside scoped post-content blocks
  const allImgs: HTMLImageElement[] = [];
  postContentEls.forEach((postContentEl) => {
    const imgs = Array.from(
      postContentEl.querySelectorAll("img")
    ) as HTMLImageElement[];
    allImgs.push(...imgs);
  });

  if (!allImgs.length) return;

  // Wrap each image in <a> if not already (scoped)
  allImgs.forEach((img) => {
    const parent = img.parentElement;
    if (!parent || parent.tagName.toLowerCase() !== "a") {
      const wrapper = document.createElement("a");
      wrapper.href = img.src;
      wrapper.classList.add("lg-item");

      if (img.complete && img.naturalWidth) {
        wrapper.setAttribute(
          "data-lg-size",
          `${img.naturalWidth}-${img.naturalHeight}`
        );
      } else {
        img.addEventListener("load", () => {
          wrapper.setAttribute(
            "data-lg-size",
            `${img.naturalWidth}-${img.naturalHeight}`
          );
        });
      }

      wrapper.setAttribute("data-sub-html", img.alt || "");
      img.parentNode?.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    } else {
      parent.classList.add("lg-item");
      if (
        img.complete &&
        img.naturalWidth &&
        !parent.getAttribute("data-lg-size")
      ) {
        parent.setAttribute(
          "data-lg-size",
          `${img.naturalWidth}-${img.naturalHeight}`
        );
      }
    }
  });

  postContentEls.forEach((postContentEl) => {
    const instance = lightGallery(postContentEl as HTMLElement, {
      selector: ".lg-item",
      plugins: [lgZoom, lgThumbnail],
      speed: 400,
      zoom: true,
      download: false,
    });
    lgInstances.push(instance);
  });
}

// If the raw content changes, refresh display
watch(
  () => props.content,
  async () => {
    updateDisplayHTML();
    await nextTick();
    initLightGallery();
  }
);

watch(
  () => props.showAnnotations,
  () => {
    // Maintain flip animation even though annotations are disabled.
    isFlipping.value = true;
    setTimeout(() => {
      // Potential future hook: switch between different content views.
      updateDisplayHTML();
    }, 200);
    setTimeout(() => {
      isFlipping.value = false;
    }, 400);
  }
);

onMounted(() => {
  updateDisplayHTML();

  nextTick(() => {
    if (!rootEl.value) return;
    const allPostContentEls = rootEl.value.querySelectorAll(".post-content");
    const allImgs: HTMLImageElement[] = [];
    allPostContentEls.forEach((el) => {
      const imgs = Array.from(el.querySelectorAll("img")) as HTMLImageElement[];
      allImgs.push(...imgs);
    });

    if (allImgs.length) {
      let loaded = 0;
      allImgs.forEach((img) => {
        if (img.complete) {
          loaded++;
          if (loaded === allImgs.length) initLightGallery();
        } else {
          img.addEventListener("load", () => {
            loaded++;
            if (loaded === allImgs.length) initLightGallery();
          });
        }
      });
    } else {
      initLightGallery();
    }
  });

  // Removed outside click handling since interactive sentence UI is disabled.
});

onUnmounted(() => {
  lgInstances.forEach((instance) => {
    try {
      instance.destroy(true);
    } catch {
      // ignore
    }
  });
  lgInstances = [];
});
</script>

<style>
/* Page flip animation styles */
.flip-container {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.flip-container.flipping {
  transform: rotateY(90deg) scaleX(0);
}

/* Removed sentence highlight & interaction styles. Keeping only flip & gallery related styles. */

.post-content a {
  display: inline-block;
  cursor: zoom-in;
  pointer-events: auto;
  position: relative;
  z-index: 1;
}
.post-content img {
  pointer-events: none;
}
</style>
