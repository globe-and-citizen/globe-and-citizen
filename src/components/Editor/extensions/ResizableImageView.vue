<template>
  <NodeViewWrapper
    class="tiptap-resizable-image"
    :class="{ 'is-selected': selected, 'is-resizing': isResizing }"
    data-drag-handle
  >
    <div
      ref="containerRef"
      class="tiptap-resizable-image__container"
      :style="containerStyle"
    >
      <img
        ref="imageRef"
        :src="node.attrs.src"
        :alt="node.attrs.alt || ''"
        :title="node.attrs.title || ''"
        :style="imageStyle"
        draggable="false"
      />
      <span
        v-if="editor.isEditable && (selected || isResizing)"
        class="tiptap-resizable-image__handle"
        role="presentation"
        @mousedown.prevent="startResize"
        @touchstart.prevent="startResizeTouch"
      />
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from "@tiptap/vue-3";
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps(nodeViewProps);

const containerRef = ref<HTMLDivElement | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);
const isResizing = ref(false);

const minWidth = 80;

const width = computed(() => props.node.attrs.width as number | null);

const containerStyle = computed(() => {
  if (!width.value) return {};
  return {
    width: `${width.value}px`,
  };
});

const imageStyle = computed(() => ({
  maxWidth: "100%",
  height: "auto",
  borderRadius: "0.5rem",
  display: "block",
}));

const removeListeners = () => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("touchend", handleTouchEnd);
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
};

const handleMouseMove = (event: MouseEvent) => {
  performResize(event.clientX);
};

const handleMouseUp = () => {
  isResizing.value = false;
  removeListeners();
};

const handleTouchMove = (event: TouchEvent) => {
  if (!event.touches.length) return;
  performResize(event.touches[0].clientX);
};

const handleTouchEnd = () => {
  isResizing.value = false;
  removeListeners();
};

let startX = 0;
let startWidth = 0;
const startResize = (event: MouseEvent) => {
  if (!containerRef.value) return;

  if (typeof props.getPos === "function") {
    props.editor.commands.setNodeSelection(props.getPos() || 0);
  }

  startX = event.clientX;
  const box = containerRef.value.getBoundingClientRect();
  startWidth = box.width;

  isResizing.value = true;

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  document.body.style.userSelect = "none";
  document.body.style.cursor = "se-resize";
};

const startResizeTouch = (event: TouchEvent) => {
  if (!containerRef.value || !event.touches.length) return;

  if (typeof props.getPos === "function") {
    props.editor.commands.setNodeSelection(props.getPos() || 0);
  }

  startX = event.touches[0].clientX;
  const box = containerRef.value.getBoundingClientRect();
  startWidth = box.width;

  isResizing.value = true;

  document.addEventListener("touchmove", handleTouchMove);
  document.addEventListener("touchend", handleTouchEnd);
  document.body.style.userSelect = "none";
  document.body.style.cursor = "se-resize";
};

const performResize = (clientX: number) => {
  if (!containerRef.value) return;

  const deltaX = clientX - startX;
  let newWidth = startWidth + deltaX;
  if (newWidth < minWidth) newWidth = minWidth;

  const editorDom = props.editor.view.dom as HTMLElement | null;
  if (editorDom) {
    const editorWidth = editorDom.clientWidth;
    if (editorWidth) {
      const paddingAllowance = 32;
      const maxWidth = Math.max(minWidth, editorWidth - paddingAllowance);
      newWidth = Math.min(newWidth, maxWidth);
    }
  }

  props.updateAttributes({
    width: Math.round(newWidth),
  });
};

onBeforeUnmount(() => {
  removeListeners();
});
</script>

<style scoped>
.tiptap-resizable-image {
  display: inline-block;
  position: relative;
}

.tiptap-resizable-image__container {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.tiptap-resizable-image img {
  user-select: none;
}

.tiptap-resizable-image.is-selected img,
.tiptap-resizable-image.is-resizing img {
  outline: 2px solid #3b82f6;
}

.tiptap-resizable-image__handle {
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  background-color: #2563eb;
  border-radius: 3px;
  cursor: se-resize;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.3);
}

.tiptap-resizable-image__handle::after {
  content: "";
  position: absolute;
  inset: 2px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 1px;
}
</style>
