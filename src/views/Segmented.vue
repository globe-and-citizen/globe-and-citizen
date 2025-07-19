<template>
  <div class="overflow-hidden">
    <div class="flex mb-2 justify-between pr-1 py-2">
      <span class="text-xl text-black-100 font-semibold">
        {{ showAnnotations ? "Hide Readers Insight" : "See Readers Insight" }}
      </span>
      <label class="toggle-switch">
        <input
          v-model="showAnnotations"
          type="checkbox"
          @change="toggleAnnotations"
        />
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div
      class="post-content flip-container"
      :class="{ flipping: isFlipping }"
      @click="onSentenceClick"
      v-html="annotatedHTML"
    ></div>
    <!-- Reaction Toolbar -->
    <div
      v-if="activeSentenceId && toolbarPosition"
      class="sentence-toolbar"
      :style="{
        top: toolbarPosition.top + 'px',
        left: toolbarPosition.left + 'px',
        cursor: 'pointer',
      }"
    >
      <button style="cursor: pointer" @click="react('like')">👍</button>
      <button class="cursor-pointer" @click="react('dislike')">👎</button>
      <button class="cursor-pointer" @click="openCommentBox = true">💬</button>
      <button class="cursor-pointer ml-2" @click="dismissToolbar">✖</button>
    </div>

    <!-- Reaction Tooltip -->
    <div
      v-if="activeSentenceId && toolbarPosition && activeSentenceReactions"
      class="reaction-tooltip"
      :style="{
        top: toolbarPosition.top + 40 + 'px',
        left: toolbarPosition.left + 'px',
      }"
    >
      <div class="reaction-stats">
        <div v-if="activeSentenceReactions.likes > 0" class="reaction-item">
          <span class="reaction-icon">👍</span>
          <span class="reaction-count">{{
            activeSentenceReactions.likes
          }}</span>
        </div>
        <div v-if="activeSentenceReactions.dislikes > 0" class="reaction-item">
          <span class="reaction-icon">👎</span>
          <span class="reaction-count">{{
            activeSentenceReactions.dislikes
          }}</span>
        </div>
        <div
          v-if="activeSentenceReactions.comments.length > 0"
          class="reaction-item"
        >
          <span class="reaction-icon">💬</span>
          <span class="reaction-count">{{
            activeSentenceReactions.comments.length
          }}</span>
        </div>
      </div>

      <div
        v-if="activeSentenceReactions.comments.length > 0"
        class="comments-section"
      >
        <div class="comments-header">Comments:</div>
        <div
          v-for="comment in activeSentenceReactions.comments"
          :key="comment.user"
          class="comment-item"
        >
          <span class="comment-user">User {{ comment.user }}:</span>
          <span class="comment-text">{{ comment.text }}</span>
        </div>
      </div>
    </div>

    <!-- Optional Comment Box -->
    <div v-if="openCommentBox" class="comment-box">
      <textarea
        v-model="commentText"
        placeholder="Write a comment..."
      ></textarea>
      <button @click="submitComment">Submit</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import type { SentenceReactionRequestPayload } from "@/models/Reactions/reactions.ts";
import { postSentenceReaction } from "@/api/reactions.ts";

interface SentenceOpinions {
  sentence_id: string;
  likes: number;
  dislikes: number;
  comments: Array<{
    user: number;
    text: string;
  }>;
}

interface Sentence {
  id: string | number;
  position: number;
  content: string;
  opinions: SentenceOpinions;
}

const props = defineProps<{
  content: string;
  sentences: Sentence[];
}>();

const annotatedHTML = ref<string>("");
const showAnnotations = ref<boolean>(false);
const isFlipping = ref<boolean>(false);

// Interactivity state
const activeSentenceId = ref<string>("");
const toolbarPosition = ref<{ top: number; left: number } | null>(null);
const openCommentBox = ref(false);
const commentText = ref("");
const queryClient = useQueryClient();

// Computed property to get reactions for active sentence
const activeSentenceReactions = computed(() => {
  if (!activeSentenceId.value) return null;
  const sentence = props.sentences.find(
    (s) => s.id.toString() === activeSentenceId.value
  );
  return sentence?.opinions || null;
});

const { mutate: postSentenceAnnotation } = useMutation({
  mutationFn: (payload: SentenceReactionRequestPayload) =>
    postSentenceReaction(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["opinion"],
    });
    console.log("success");
  },
  onError: (error) => {
    console.error("Error updating user:", error);
  },
});

// Function to determine highlight color based on reactions
function getReactionHighlightClass(opinions: SentenceOpinions): string {
  const { likes, dislikes } = opinions;

  // If more likes than dislikes, show positive highlight
  if (likes > dislikes) {
    if (likes <= 10) return "highlight-positive-light";
    if (likes <= 50) return "highlight-positive-medium";
    return "highlight-positive-dark";
  }

  // If more dislikes than likes, show negative highlight
  if (dislikes > likes) {
    if (dislikes <= 10) return "highlight-negative-light";
    if (dislikes <= 50) return "highlight-negative-medium";
    return "highlight-negative-dark";
  }

  // Equal or no reactions
  if (likes > 0 || dislikes > 0) {
    return "highlight-neutral";
  }

  return "";
}

// Toggle annotations visibility with flip effect
function toggleAnnotations() {
  isFlipping.value = true;

  // Change content at the midpoint when it's not visible
  setTimeout(() => {
    updateAnnotatedHTML();
  }, 200); // Midpoint of the animation

  // End the flip animation
  setTimeout(() => {
    isFlipping.value = false;
  }, 400); // Full animation duration
}

function onSentenceClick(e: MouseEvent) {
  const span = (e.target as HTMLElement).closest(
    "[data-sentence-id]"
  ) as HTMLElement;
  if (span) {
    activeSentenceId.value = span.dataset.sentenceId || "";
    const rect = span.getBoundingClientRect();
    // Center toolbar above the sentence span
    const top = rect.top + window.scrollY - 40; // 40px above
    const left = rect.left + window.scrollX + rect.width / 2 - 60; // center, toolbar width ~120px
    toolbarPosition.value = { top, left };
  } else {
    // Clicked outside any sentence, dismiss toolbar
    dismissToolbar();
  }
}

function dismissToolbar() {
  activeSentenceId.value = "";
  toolbarPosition.value = null;
  openCommentBox.value = false;
}

function react(type: "like" | "dislike") {
  if (!activeSentenceId.value) return;
  postSentenceAnnotation({
    sentence_id: activeSentenceId.value,
    type,
    postType: "entry",
  });
  dismissToolbar();
}

function submitComment() {
  if (!activeSentenceId.value || !commentText.value) return;
  console.log("Comment:", {
    sentenceId: activeSentenceId.value,
    content: commentText.value,
  });
  postSentenceAnnotation({
    sentence_id: activeSentenceId.value,
    type: "comment",
    postType: "entry",
    content: commentText.value,
  });
  commentText.value = "";
  openCommentBox.value = false;
  dismissToolbar();
}

// Enhanced version of wrapSentencesInHTML with reaction highlighting
function wrapSentencesInHTML(
  htmlContent: string,
  sentences: Sentence[],
  showHighlights: boolean = false
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);

  for (const sentence of sentences) {
    let flatText = "";
    const textNodes: { node: Text; start: number; end: number }[] = [];

    // Rebuild flat text and record offsets
    walker.currentNode = doc.body;
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const start = flatText.length;
      const text = node.textContent || "";
      const end = start + text.length;
      flatText += text;
      textNodes.push({ node, start, end });
    }

    const matchStart = flatText.indexOf(sentence.content);
    if (matchStart === -1) {
      console.warn("Could not match sentence:", sentence.content);
      continue;
    }
    const matchEnd = matchStart + sentence.content.length;

    // Locate start and end nodes
    const startNodeEntry = textNodes.find(
      (n) => matchStart >= n.start && matchStart < n.end
    );
    const endNodeEntry = textNodes.find(
      (n) => matchEnd > n.start && matchEnd <= n.end
    );

    if (!startNodeEntry || !endNodeEntry) continue;

    const range = doc.createRange();
    range.setStart(startNodeEntry.node, matchStart - startNodeEntry.start);
    range.setEnd(endNodeEntry.node, matchEnd - endNodeEntry.start);

    const span = doc.createElement("span");
    // Base classes
    let className =
      "sentence-span relative hover:bg-green-100 !cursor-pointer ";

    // Add reaction-based highlighting only if annotations are shown
    if (showHighlights) {
      const highlightClass = getReactionHighlightClass(sentence.opinions);
      if (highlightClass) {
        className += highlightClass + " ";
      }
    }

    span.className = className;
    span.setAttribute("data-sentence-id", sentence.id.toString());
    span.setAttribute("data-position", sentence.position.toString());

    try {
      range.surroundContents(span);
    } catch (e) {
      console.warn("Failed to surround contents:", e);
    }
    console.log(span.className);
  }

  return doc.body.innerHTML;
}

// Update the annotated HTML when show/hide state changes
function updateAnnotatedHTML() {
  annotatedHTML.value = wrapSentencesInHTML(
    props.content,
    props.sentences,
    showAnnotations.value
  );
}

// Watch for changes in sentences and re-render when needed
watch(
  () => props.sentences,
  () => {
    updateAnnotatedHTML();
  },
  { deep: true }
);

onMounted(() => {
  updateAnnotatedHTML();
});
</script>

<style>
/* Toggle switch styles */
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

/* Page flip animation styles */
.flip-container {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.flip-container.flipping {
  transform: rotateY(90deg) scaleX(0);
}

.sentence-span {
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 4px;
  padding: 2px;
}

.sentence-span:hover {
  background-color: #eef6ff;
}

/* Default highlight for sentences without reactions */
.sentence-span {
}

/* Positive reaction highlights (likes > dislikes) */
.highlight-positive-light {
  background: rgba(34, 197, 94, 0.1) !important;
}

.highlight-positive-medium {
  background: rgba(34, 197, 94, 0.2) !important;
}

.highlight-positive-dark {
  background: rgba(34, 197, 94, 0.3) !important;
}

/* Negative reaction highlights (dislikes > likes) */
.highlight-negative-light {
  background: rgba(239, 68, 68, 0.1) !important;
}

.highlight-negative-medium {
  background: rgba(239, 68, 68, 0.2) !important;
}

.highlight-negative-dark {
  background: rgba(239, 68, 68, 0.3) !important;
}

/* Neutral highlight (equal likes and dislikes) */
.highlight-neutral {
  background: rgba(156, 163, 175, 0.2) !important;
}

.sentence-toolbar {
  position: absolute;
  background: white;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 4px 8px;
  display: flex;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 120px;
  height: 32px;
  align-items: center;
  justify-content: center;
  transition: top 0.15s, left 0.15s;
}

.reaction-tooltip {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 99;
  max-width: 300px;
  font-size: 14px;
}

.reaction-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.reaction-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.reaction-icon {
  font-size: 16px;
}

.reaction-count {
  font-weight: 600;
  color: #374151;
}

.comments-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 8px;
}

.comments-header {
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  font-size: 12px;
}

.comment-item {
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 1.4;
}

.comment-user {
  font-weight: 500;
  color: #6b7280;
  margin-right: 4px;
}

.comment-text {
  color: #374151;
}

.comment-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 200;
  min-width: 300px;
}

.comment-box textarea {
  width: 100%;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  resize: vertical;
  font-family: inherit;
}

.comment-box button {
  margin-top: 8px;
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comment-box button:hover {
  background: #0056b3;
}
</style>
