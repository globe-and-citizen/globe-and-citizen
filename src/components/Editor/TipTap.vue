<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import Heading from "@tiptap/extension-heading";
import ResizableImage from "@/components/Editor/extensions/ResizableImage";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { ref, watch } from "vue";
import { uploadToCloudinary } from "@/api/images";
import { toast } from "vue3-toastify";
import type { EditorView } from "@tiptap/pm/view";
import type { Slice } from "@tiptap/pm/model";
import BoldIcon from "@/components/Editor/icons/bold.svg";
import ItalicIcon from "@/components/Editor/icons/italic.svg";
import UnderlineIcon from "@/components/Editor/icons/underline.svg";
import StrikeIcon from "@/components/Editor/icons/strikethrough.svg";
import BulletList from "@/components/Editor/icons/bulletlist.svg";
import OrderedList from "@/components/Editor/icons/orderedlist.svg";
import BlockQuote from "@/components/Editor/icons/blockquote.svg";
import HighlightIcon from "@/components/Editor/icons/highlight.svg";
import InlineCodeIcon from "@/components/Editor/icons/code.svg";
import CodeBlockIcon from "@/components/Editor/icons/codeblock.svg";
import SuperScriptIcon from "@/components/Editor/icons/superscript.svg";
import SubScriptIcon from "@/components/Editor/icons/subscript.svg";
import LinkIcon from "@/components/Editor/icons/link.svg";
import AlignLeftIcon from "@/components/Editor/icons/alignleft.svg";
import AlignCenterIcon from "@/components/Editor/icons/aligncenter.svg";
import AlignRightIcon from "@/components/Editor/icons/alignright.svg";
import AlignJustifyIcon from "@/components/Editor/icons/alignjustify.svg";
import ImageIcon from "@/components/Editor/icons/image.svg";
import TableIcon from "@/components/Editor/icons/table.svg";
import ColumnInsertLeft from "@/components/Editor/icons/columninsertleft.svg";
import ColumnInsertRight from "@/components/Editor/icons/columninsertright.svg";
import RowInsertBottom from "@/components/Editor/icons/rowinsertbottom.svg";
import RowInsertTop from "@/components/Editor/icons/rowinserttop.svg";
import DeleteTable from "@/components/Editor/icons/deletetable.svg";
import UndoIcon from "@/components/Editor/icons/undo.svg";
import RedoIcon from "@/components/Editor/icons/redo.svg";
import { Dropcursor } from "@tiptap/extension-dropcursor";

interface Props {
  modelValue?: string;
  placeholder?: string;
  minHeight?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "Start writing...",
  minHeight: "300px",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const isUploading = ref(false);

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: false, // We'll use the separate Heading extension for more control
    }),
    Heading.configure({
      levels: [1, 2, 3, 4, 5, 6],
    }),
    Highlight,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    TextStyle,
    Color,
    FontFamily.configure({
      types: ["textStyle"],
    }),
    Subscript,
    Superscript,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-blue-600 underline",
      },
    }),
    CodeBlock.configure({
      HTMLAttributes: {
        class: "bg-gray-100 dark:bg-gray-800 p-4 rounded",
      },
    }),
    ResizableImage,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Dropcursor,
  ],
  editorProps: {
    attributes: {
      class:
        "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
      style: `min-height: ${props.minHeight}`,
    },
    handleDrop: (
      _view: EditorView,
      event: DragEvent,
      _slice: Slice,
      moved: boolean
    ) => {
      if (
        !moved &&
        event.dataTransfer &&
        event.dataTransfer.files &&
        event.dataTransfer.files[0]
      ) {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file.type.includes("image/")) {
          handleImageUpload(file);
          return true;
        }
      }
      return false;
    },
    handlePaste: (_view: EditorView, event: ClipboardEvent) => {
      const items = Array.from(event.clipboardData?.items || []);
      for (const item of items) {
        if (item.type.indexOf("image") === 0) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleImageUpload(file);
          }
          return true;
        }
      }
      return false;
    },
  },
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML());
  },
});

const handleImageUpload = async (file: File) => {
  if (!editor.value) return;

  isUploading.value = true;
  try {
    const url = await uploadToCloudinary(file);
    editor.value.chain().focus().setImage({ src: url }).run();
    toast("Image uploaded successfully!", {
      autoClose: 3000,
      type: "success",
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    toast("Image upload failed", {
      autoClose: 3000,
      type: "error",
    });
  } finally {
    isUploading.value = false;
  }
};

const triggerImageUpload = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };
  input.click();
};

const setLink = () => {
  if (!editor.value) return;

  const previousUrl = editor.value.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);

  if (url === null) {
    return;
  }

  if (url === "") {
    editor.value.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor.value
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
};

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value && editor.value.getHTML() !== newValue) {
      editor.value.commands.setContent(newValue);
    }
  }
);

// Toolbar functions
const toggleBold = () => editor.value?.chain().focus().toggleBold().run();
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run();
const toggleUnderline = () =>
  editor.value?.chain().focus().toggleUnderline().run();
const toggleStrike = () => editor.value?.chain().focus().toggleStrike().run();
const toggleHighlight = () =>
  editor.value?.chain().focus().toggleHighlight().run();
const toggleSubscript = () =>
  editor.value?.chain().focus().toggleSubscript().run();
const toggleSuperscript = () =>
  editor.value?.chain().focus().toggleSuperscript().run();
const toggleBlockquote = () =>
  editor.value?.chain().focus().toggleBlockquote().run();
const toggleCodeBlock = () =>
  editor.value?.chain().focus().toggleCodeBlock().run();
const toggleCode = () => editor.value?.chain().focus().toggleCode().run();
const toggleBulletList = () =>
  editor.value?.chain().focus().toggleBulletList().run();
const toggleOrderedList = () =>
  editor.value?.chain().focus().toggleOrderedList().run();

const setHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
  editor.value?.chain().focus().toggleHeading({ level }).run();
};

const setTextAlign = (alignment: "left" | "center" | "right" | "justify") => {
  editor.value?.chain().focus().setTextAlign(alignment).run();
};

const setColor = (color: string) => {
  editor.value?.chain().focus().setColor(color).run();
};

const undo = () => editor.value?.chain().focus().undo().run();
const redo = () => editor.value?.chain().focus().redo().run();

// Table functions
const insertTable = () => {
  editor.value
    ?.chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run();
};

const deleteTable = () => {
  editor.value?.chain().focus().deleteTable().run();
};

const addColumnBefore = () => {
  editor.value?.chain().focus().addColumnBefore().run();
};

const addColumnAfter = () => {
  editor.value?.chain().focus().addColumnAfter().run();
};

const deleteColumn = () => {
  editor.value?.chain().focus().deleteColumn().run();
};

const addRowBefore = () => {
  editor.value?.chain().focus().addRowBefore().run();
};

const addRowAfter = () => {
  editor.value?.chain().focus().addRowAfter().run();
};

const deleteRow = () => {
  editor.value?.chain().focus().deleteRow().run();
};

// const toggleHeaderColumn = () => {
//   editor.value?.chain().focus().toggleHeaderColumn().run();
// };

// const toggleHeaderRow = () => {
//   editor.value?.chain().focus().toggleHeaderRow().run();
// };

// const toggleHeaderCell = () => {
//   editor.value?.chain().focus().toggleHeaderCell().run();
// };

// const mergeCells = () => {
//   editor.value?.chain().focus().mergeCells().run();
// };

// const splitCell = () => {
//   editor.value?.chain().focus().splitCell().run();
// };
</script>

<template>
  <div class="border border-gray-300 rounded-md overflow-hidden">
    <!-- Toolbar -->
    <div
      v-if="editor"
      class="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1"
    >
      <!-- Text Style Buttons -->
      <div class="flex gap-1 border-r border-gray-300 pr-2 mr-2 h-fit">
        <button
          type="button"
          :class="[
            'p-1 rounded hover:bg-gray-200  transition-colors',
            editor.isActive('bold') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Bold"
          @click="toggleBold"
        >
          <BoldIcon />
        </button>

        <button
          type="button"
          :class="[
            'p-1 rounded hover:bg-gray-200  transition-colors',
            editor.isActive('italic') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Italic"
          @click="toggleItalic"
        >
          <ItalicIcon />
        </button>

        <button
          type="button"
          :class="[
            'p-1 rounded hover:bg-gray-200 transition-colors',
            editor.isActive('underline') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Underline"
          @click="toggleUnderline"
        >
          <UnderlineIcon />
        </button>

        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200  transition-colors',
            editor.isActive('strike') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Strikethrough"
          @click="toggleStrike"
        >
          <StrikeIcon />
        </button>
        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive('code') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Inline Code"
          @click="toggleCode"
        >
          <InlineCodeIcon />
        </button>
        <button
          type="button"
          :class="[
            'p-1 rounded hover:bg-gray-200  transition-colors',
            editor.isActive('highlight') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Highlight"
          @click="toggleHighlight"
        >
          <HighlightIcon />
        </button>
        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200  transition-colors',
            editor.isActive('link') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Insert Link"
          @click="setLink"
        >
          <LinkIcon />
        </button>
      </div>

      <!-- Headings -->
      <div class="flex gap-1 border-r border-gray-300 pr-2 mr-2 h-fit">
        <select
          class="px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900"
          @change="(e: Event) => {
            const level = (e.target as HTMLSelectElement).value;
            if (level === 'p') {
              editor?.chain().focus().setParagraph().run();
            } else {
              setHeading(Number(level) as 1 | 2 | 3 | 4 | 5 | 6);
            }
          }"
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>
      </div>

      <!-- Lists -->
      <div class="flex gap-1 border-r border-gray-300 pr-2 mr-2 h-fit">
        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive('bulletList') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Bullet List"
          @click="toggleBulletList"
        >
          <BulletList />
        </button>

        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive('orderedList') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Ordered List"
          @click="toggleOrderedList"
        >
          <OrderedList />
        </button>
      </div>

      <!-- Script and Special -->
      <div class="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive('subscript') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Subscript"
          @click="toggleSubscript"
        >
          <SubScriptIcon />
        </button>

        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive('superscript') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Superscript"
          @click="toggleSuperscript"
        >
          <SuperScriptIcon />
        </button>

        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive('blockquote') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Blockquote"
          @click="toggleBlockquote"
        >
          <BlockQuote />
        </button>

        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive('codeBlock') ? 'bg-blue-100  text-blue-600' : '',
          ]"
          title="Code Block"
          @click="toggleCodeBlock"
        >
          <CodeBlockIcon />
        </button>
      </div>

      <!-- Text Alignment -->
      <div class="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive({ textAlign: 'left' })
              ? 'bg-blue-100  text-blue-600'
              : '',
          ]"
          title="Align Left"
          @click="setTextAlign('left')"
        >
          <AlignLeftIcon />
        </button>

        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive({ textAlign: 'center' })
              ? 'bg-blue-100  text-blue-600'
              : '',
          ]"
          title="Align Center"
          @click="setTextAlign('center')"
        >
          <AlignCenterIcon />
        </button>

        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive({ textAlign: 'right' })
              ? 'bg-blue-100  text-blue-600'
              : '',
          ]"
          title="Align Right"
          @click="setTextAlign('right')"
        >
          <AlignRightIcon />
        </button>

        <button
          type="button"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive({ textAlign: 'justify' })
              ? 'bg-blue-100  text-blue-600'
              : '',
          ]"
          title="Justify"
          @click="setTextAlign('justify')"
        >
          <AlignJustifyIcon />
        </button>
      </div>

      <!--  Image -->
      <div class="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          type="button"
          :disabled="isUploading"
          class="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-1"
          title="Insert Image"
          @click="triggerImageUpload"
        >
          <ImageIcon v-if="!isUploading" />
          <div
            v-else
            class="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"
          ></div>
        </button>
      </div>

      <!-- Table -->
      <div class="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          type="button"
          class="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Insert Table"
          @click="insertTable"
        >
          <TableIcon />
        </button>

        <!-- Table manipulation buttons - only show when in a table -->
        <template v-if="editor.isActive('table')">
          <button
            type="button"
            class="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Add Column Before"
            @click="addColumnBefore"
          >
            <ColumnInsertLeft />
          </button>

          <button
            type="button"
            class="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Add Column After"
            @click="addColumnAfter"
          >
            <ColumnInsertRight />
          </button>

          <button
            type="button"
            class="p-2 rounded hover:bg-gray-200 transition-colors text-red-600"
            title="Delete Column"
            @click="deleteColumn"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            class="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Add Row Before"
            @click="addRowBefore"
          >
            <RowInsertTop />
          </button>

          <button
            type="button"
            class="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Add Row After"
            @click="addRowAfter"
          >
            <RowInsertBottom />
          </button>

          <button
            type="button"
            class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-red-600"
            title="Delete Row"
            @click="deleteRow"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-red-600"
            title="Delete Table"
            @click="deleteTable"
          >
            <DeleteTable />
          </button>
        </template>
      </div>

      <!-- Color -->
      <div
        class="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2"
      >
        <input
          type="color"
          class="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          title="Text Color"
          @input="(e: Event) => setColor((e.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Font Family
      <div
        class="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2"
      >
        <select
          class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          @change="(e: Event) => setFontFamily((e.target as HTMLSelectElement).value)"
        >
          <option value="">Default Font</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div> -->

      <!-- Undo/Redo -->
      <div class="flex gap-1">
        <button
          type="button"
          :disabled="!editor.can().undo()"
          class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          title="Undo"
          @click="undo"
        >
          <UndoIcon />
        </button>

        <button
          type="button"
          :disabled="!editor.can().redo()"
          class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          title="Redo"
          @click="redo"
        >
          <RedoIcon />
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="bg-white dark:bg-gray-900">
      <editor-content class="ql-editor" :editor="editor" />
    </div>
  </div>
</template>

<style scoped>
svg {
  height: 16px;
  width: 16px;
}

:deep(.ProseMirror) {
  outline: none;
  min-height: v-bind(minHeight);
  padding: 1rem;
  background: white;
  font-family: Lato, sans-serif !important;
}

:deep(.ProseMirror.dark) {
  background: #111827;
  color: #e5e7eb;
}

:deep(.ProseMirror h1) {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1.25;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1.25;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror h3) {
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 1.25;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror h4) {
  font-size: 1.125rem;
  font-weight: bold;
  line-height: 1.25;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror h5) {
  font-size: 1rem;
  font-weight: bold;
  line-height: 1.25;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror h6) {
  font-size: 0.875rem;
  font-weight: bold;
  line-height: 1.25;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

/* :deep(.ProseMirror p) {
} */

:deep(.ProseMirror ul, .ProseMirror ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

:deep(.ProseMirror li) {
  margin: 0.25rem 0;
}

:deep(.ProseMirror blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
}

:deep(.ProseMirror code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: "Courier New", monospace;
  font-size: 0.875rem;
}

:deep(.ProseMirror pre) {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  overflow-x: auto;
}

:deep(.ProseMirror mark) {
  background-color: #fef3c7;
  padding: 0.125rem;
  border-radius: 0.125rem;
}

:deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}

:deep(.ProseMirror a) {
  color: #3b82f6;
  text-decoration: underline;
}

:deep(.ProseMirror table) {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  overflow: hidden;
  margin: 1rem 0;
}

:deep(.ProseMirror table td, .ProseMirror table th) {
  min-width: 1em;
  border: 2px solid #ced4da;
  padding: 3px 5px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}

:deep(.ProseMirror table td.selectedCell, .ProseMirror table th.selectedCell) {
  background: rgba(200, 200, 255, 0.4);
}

:deep(.ProseMirror table th) {
  font-weight: bold;
  text-align: left;
  background-color: #f1f3f4;
}

:deep(.ProseMirror table .column-resize-handle) {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  z-index: 20;
  background-color: #adf;
  pointer-events: none;
}

:deep(.ProseMirror table .tableWrapper) {
  overflow-x: auto;
}

.tiptap-image-resize-handle {
  width: 10px;
  height: 10px;
  background: white;
  border: 1px solid #999;
  position: absolute;
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
  border-radius: 2px;
}

/* Dark mode styles */
/* .dark :deep(.ProseMirror) {
  background: #111827;
  color: #e5e7eb;
}

.dark :deep(.ProseMirror blockquote) {
  border-left-color: #4b5563;
  color: #9ca3af;
}

.dark :deep(.ProseMirror code) {
  background-color: #374151;
  color: #e5e7eb;
}

.dark :deep(.ProseMirror pre) {
  background-color: #374151;
}

.dark :deep(.ProseMirror mark) {
  background-color: #451a03;
  color: #fbbf24;
}

.dark :deep(.ProseMirror table th) {
  background-color: #374151;
}

.dark :deep(.ProseMirror table td, .dark .ProseMirror table th) {
  border-color: #4b5563;
} */
</style>
