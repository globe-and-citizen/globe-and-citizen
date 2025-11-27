import Image from "@tiptap/extension-image";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import ResizableImageView from "./ResizableImageView.vue";
import type { Attribute } from "@tiptap/core";

const parseSizeFromElement = (element: HTMLElement, attr: string) => {
  const dataValue = element.getAttribute(`data-${attr}`);
  if (dataValue) {
    const parsed = parseInt(dataValue, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  const attributeValue = element.getAttribute(attr);
  if (attributeValue) {
    const parsed = parseInt(attributeValue, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  const styleValue = element.style?.[attr as keyof CSSStyleDeclaration];
  if (styleValue) {
    const parsed = parseInt(styleValue.toString(), 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const widthAttribute: Attribute = {
  default: null,
  parseHTML: (element) => parseSizeFromElement(element, "width"),
  renderHTML: (attributes) => {
    if (!attributes.width) return {};

    return {
      style: `width: ${attributes.width}px`,
      "data-width": attributes.width,
    };
  },
};

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: widthAttribute,
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(ResizableImageView);
  },
});

export default ResizableImage;
