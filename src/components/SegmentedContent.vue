<template>
  <!-- Root wrapper: overflow-hidden restored; toolbar coordinates now relative so no internal scroll expansion -->
  <div ref="rootEl" class="overflow-hidden relative pb-30">
    <div
      class="post-content flip-container relative max-w-[700px]"
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
      <button class="cursor-pointer" @click="openCommentBox = !openCommentBox">
        💬
      </button>
      <button class="cursor-pointer ml-2" @click="dismissToolbar">✖</button>
    </div>

    <!-- Reaction Tooltip -->
    <div
      v-if="
        activeSentenceId &&
        toolbarPosition &&
        activeSentenceReactions &&
        (activeSentenceReactions.likes > 0 ||
          activeSentenceReactions.dislikes > 0 ||
          activeSentenceReactions.comments.length > 0)
      "
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
            activeSentenceReactions?.comments.length
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
          <span class="comment-user">{{ comment.user_name }}:</span>
          <span class="comment-text">{{ comment.text }}</span>
        </div>
      </div>
    </div>

    <!-- Optional Comment Box -->
    <div
      v-if="openCommentBox"
      class="comment-box absolute"
      :style="{
        top: toolbarPosition?.top ? toolbarPosition?.top + 40 + 'px' : '40px',
        left: toolbarPosition?.left + 'px',
      }"
    >
      <textarea
        v-model="commentText"
        placeholder="Write a comment..."
      ></textarea>
      <button @click="submitComment">Submit</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
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
    user_name: string;
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
  postType: "opinion" | "post";
  showAnnotations: boolean;
}>();

const annotatedHTML = ref<string>("");
const rootEl = ref<HTMLElement | null>(null);
const showAnnotations = computed(() => props.showAnnotations);
const isFlipping = ref<boolean>(false);
let handleClickOutside: (e: MouseEvent) => void;

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
      queryKey: [props.postType === "opinion" ? "opinion" : "post"],
    });
  },
  onError: (error) => {
    console.error("Error updating user:", error);
  },
});

// Function to determine highlight color based on reactions
function getReactionHighlightClass(opinions: SentenceOpinions): string {
  const { likes, dislikes, comments } = opinions;

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

  if (comments.length > 0) {
    return "highlight-has-comment";
  }
  return "";
}

function onSentenceClick(e: MouseEvent) {
  const span = (e.target as HTMLElement).closest(
    "[data-sentence-id]"
  ) as HTMLElement;
  if (!rootEl.value) return;
  if (span) {
    activeSentenceId.value = span.dataset.sentenceId || "";
    const sentenceRect = span.getBoundingClientRect();
    const rootRect = rootEl.value.getBoundingClientRect();

    const estimatedToolbarWidth = 140;
    const padding = 8;

    // Coordinates relative to root (no window scroll needed, avoids inflating container height)
    let top = sentenceRect.top - rootRect.top - 44; // 44px above sentence
    let left =
      sentenceRect.left -
      rootRect.left +
      sentenceRect.width / 2 -
      estimatedToolbarWidth / 2;

    // Clamp within root bounds
    const maxLeft = rootRect.width - estimatedToolbarWidth - padding;
    if (left < padding) left = padding;
    if (left > maxLeft) left = maxLeft;
    if (top < 0) top = 0; // prevent going beyond top

    toolbarPosition.value = { top, left };
  } else {
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
    postType: props.postType,
  });
  dismissToolbar();
}

function submitComment() {
  if (!activeSentenceId.value || !commentText.value) return;
  postSentenceAnnotation({
    sentence_id: activeSentenceId.value,
    type: "comment",
    postType: props.postType,
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
      "sentence-span !relative hover:bg-green-100 !cursor-pointer ";

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

watch(
  () => props.showAnnotations,
  () => {
    isFlipping.value = true;
    setTimeout(() => {
      updateAnnotatedHTML();
    }, 200);
    setTimeout(() => {
      isFlipping.value = false;
    }, 400);
  }
);

onMounted(() => {
  updateAnnotatedHTML();
  handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const postContent = document.querySelectorAll(".post-content");
    const toolbar = document.querySelector(".sentence-toolbar");
    const commentBox = document.querySelector(".comment-box");

    if (
      !Array.from(postContent).some((el) => el.contains(target)) &&
      !toolbar?.contains(target) &&
      !commentBox?.contains(target)
    ) {
      dismissToolbar();
    }
  };

  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
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

.sentence-span {
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 4px;
  padding: 2px;
}

.sentence-span:hover {
  background-color: #eef6ff;
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

.highlight-has-comment {
  background: rgba(59, 130, 246, 0.15) !important; /* light blue tint */
  text-decoration: underline;
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  z-index: 300; /* Above side toggle */
  min-width: 130px;
  height: 36px;
  align-items: center;
  justify-content: center;
  transition: top 0.15s, left 0.15s;
  backdrop-filter: blur(2px);
}

.reaction-tooltip {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  z-index: 290; /* Slightly below toolbar */
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
  min-width: 150px;
}

.comments-header {
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  font-size: 14px;
}

.comment-item {
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 1.4;
}

.comment-user {
  font-weight: 600;
  color: #6b7280;
  margin-right: 4px;
}

.comment-text {
  color: #374151;
}

.comment-box {
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
