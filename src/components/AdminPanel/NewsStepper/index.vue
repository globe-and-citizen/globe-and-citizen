<template>
  <h1 class="text-2xl font-bold mb-4 uppercase">News Processing Workflow</h1>
  <div class="w-full mx-auto p-6">
    <Form
      v-slot="{ meta, values, validate }"
      as=""
      :form="form"
      keep-values
      :validation-schema="toTypedSchema(formSchema[0])"
    >
      <Stepper
        v-slot="{ isNextDisabled, isPrevDisabled, nextStep, prevStep }"
        v-model="stepIndex"
        class="block w-full"
      >
        <form
          @submit="
            (e: Event) => {
              e.preventDefault();
              validate();

              if (stepIndex === steps.length && meta.valid) {
                onSubmit(values);
              }
            }
          "
        >
          <!-- Stepper Header -->
          <div class="flex w-full flex-start gap-2 mb-6 border-b-1 pb-5">
            <StepperItem
              v-for="step in steps"
              :key="step.step"
              v-slot="{ state }"
              class="relative flex w-full flex-col items-center justify-center"
              :step="step.step"
            >
              <StepperSeparator
                v-if="step.step !== steps[steps.length - 1].step"
                class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
              />

              <StepperTrigger as-child>
                <Button
                  :variant="
                    state === 'completed' || state === 'active'
                      ? 'default'
                      : 'outline'
                  "
                  size="icon"
                  class="z-10 rounded-full shrink-0"
                  :class="[
                    state === 'active' &&
                      'ring-2 ring-ring ring-offset-2 ring-offset-background',
                  ]"
                  :disabled="state !== 'completed' && !meta.valid"
                >
                  <component
                    :is="CheckIcon"
                    v-if="state === 'completed'"
                    class="size-5"
                  />
                  <component :is="CircleIcon" v-if="state === 'active'" />
                  <component :is="DotIcon" v-if="state === 'inactive'" />
                </Button>
              </StepperTrigger>

              <div class="mt-5 flex flex-col items-center text-center">
                <StepperTitle
                  :class="[state === 'active' && 'text-primary']"
                  class="text-sm font-semibold transition lg:text-base"
                >
                  {{ step.title }}
                </StepperTitle>
              </div>
            </StepperItem>
          </div>

          <!-- Step Content -->
          <div class="min-h-[400px]">
            <!-- Step 3: Edit Details -->
            <template v-if="stepIndex === 1">
              <div class="space-y-4">
                <h2 class="text-xl font-semibold">Edit Article Details</h2>

                <div class="space-y-2 p-3 border rounded-md bg-muted/30">
                  <h3 class="text-sm font-semibold">
                    Optional: Paste source text to summarize with AI
                  </h3>
                  <p class="text-xs text-muted-foreground">
                    Paste any article/body text below and click "Summarize
                    Text". The generated summary will populate the Content
                    editor. You can still edit it afterwards.
                  </p>
                  <textarea
                    v-model="rawTextForSummary"
                    rows="5"
                    class="w-full text-sm rounded-md border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Paste raw article or notes here..."
                  />
                  <div class="flex items-center gap-3">
                    <Button
                      type="button"
                      size="sm"
                      :disabled="
                        !rawTextForSummary.length ||
                        textSummaryMutation.isPending.value
                      "
                      @click="textSummaryMutation.mutate()"
                    >
                      <component
                        :is="LoaderIcon"
                        v-if="textSummaryMutation.isPending.value"
                        class="size-4 animate-spin mr-2"
                      />
                      Summarize Text
                    </Button>
                    <span v-if="generatedSummary" class="text-xs text-green-600"
                      >Summary ready. You can refine it below.</span
                    >
                  </div>
                </div>

                <FormField v-slot="{ componentField }" name="title">
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        v-bind="componentField"
                        :default-value="selectedArticle?.title || ''"
                        @input="(e: Event) => {
                          componentField.onChange(e);
                          // Auto-generate slug when title changes
                          const target = e.target as HTMLInputElement;
                          if (target.value) {
                            form.setFieldValue('slug', generateSlug(target.value));
                          }
                        }"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="slug">
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        v-bind="componentField"
                        placeholder="article-slug"
                        :default-value="
                          generateSlug(selectedArticle?.title || '')
                        "
                      />
                    </FormControl>
                    <FormMessage />
                    <p class="text-xs text-muted-foreground mt-1">
                      URL-friendly version of the title. Only lowercase letters,
                      numbers, and hyphens are allowed.
                    </p>
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="description">
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        v-bind="componentField"
                        rows="3"
                        :default-value="selectedArticle?.description || ''"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="content">
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <QuillEditor
                        ref="quillRef"
                        content-type="html"
                        theme="snow"
                        :options="{
                          modules: {
                            toolbar: {
                              container: toolbarConfig,
                              handlers: customHandlers,
                            },
                          },
                        }"
                        style="min-height: 200px"
                        :content="
                          generatedSummary || componentField.modelValue || ''
                        "
                        @update:content="componentField.onChange"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <div class="grid grid-cols-2 gap-4">
                  <FormField v-slot="{ componentField }" name="author">
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          v-bind="componentField"
                          :default-value="selectedArticle?.author || ''"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>

                  <FormField v-slot="{ componentField }" name="source">
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          v-bind="componentField"
                          :default-value="selectedArticle?.source?.name || ''"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </div>

                <FormField v-slot="{ componentField }" name="imageUrl">
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <div class="flex flex-col gap-2">
                      <div class="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          :disabled="imageUploading"
                          @click="triggerImageSelect"
                        >
                          <component
                            :is="LoaderIcon"
                            v-if="imageUploading"
                            class="size-4 animate-spin mr-2"
                          />
                          {{
                            imageUploading
                              ? "Uploading..."
                              : componentField.modelValue
                              ? "Replace Image"
                              : "Upload Image"
                          }}
                        </Button>
                        <Button
                          v-if="componentField.modelValue && !imageUploading"
                          type="button"
                          variant="ghost"
                          size="sm"
                          @click="removeUploadedImage"
                        >
                          Remove
                        </Button>
                      </div>
                      <input
                        ref="hiddenImageInput"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="(e: Event) => onImageFileChange(e, componentField)"
                      />
                      <div
                        v-if="componentField.modelValue"
                        class="relative w-40 h-24 rounded border overflow-hidden"
                      >
                        <img
                          :src="componentField.modelValue"
                          alt="Cover"
                          class="object-cover w-full h-full"
                        />
                      </div>
                      <p class="text-xs text-muted-foreground">
                        Upload a cover image.
                      </p>
                      <span
                        v-if="imageUploadError"
                        class="text-xs text-destructive"
                        >{{ imageUploadError }}</span
                      >
                      <FormMessage />
                    </div>
                  </FormItem>
                </FormField>
              </div>
            </template>

            <!-- Step 4: Approve & Publish -->
            <template v-if="stepIndex === 2">
              <div class="space-y-4">
                <h2 class="text-xl font-semibold">Review & Publish</h2>

                <Card class="pt-0">
                  <img
                    v-if="values.imageUrl || selectedArticle?.urlToImage"
                    :src="values.imageUrl || selectedArticle?.urlToImage"
                    alt="Article image"
                    class="w-full h-48 object-cover rounded-t-lg"
                  />
                  <CardHeader>
                    <CardTitle>
                      {{ values.title || selectedArticle?.title }}
                    </CardTitle>
                    <CardDescription>
                      By:
                      {{
                        values.author || selectedArticle?.author || "Unknown"
                      }}
                      | Source:
                      {{
                        values.source ||
                        selectedArticle?.source?.name ||
                        "Unknown"
                      }}
                    </CardDescription>
                    <div class="text-xs text-muted-foreground mt-1">
                      <span class="font-medium">Slug:</span>
                      {{
                        values.slug ||
                        generateSlug(selectedArticle?.title || "")
                      }}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p class="text-sm text-muted-foreground mb-2">
                      {{ values.description || selectedArticle?.description }}
                    </p>
                    <div
                      class="text-sm prose prose-sm max-w-none"
                      v-html="(values.content as string) || generatedSummary || ''"
                    ></div>
                  </CardContent>
                </Card>
              </div>
            </template>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex items-center justify-between mt-8">
            <Button
              :disabled="isPrevDisabled"
              variant="outline"
              size="sm"
              @click="prevStep()"
            >
              Back
            </Button>
            <div class="flex items-center gap-3">
              <Button
                v-if="stepIndex !== 2"
                :type="meta.valid ? 'button' : 'submit'"
                :disabled="isNextDisabled"
                size="sm"
                @click="meta.valid && nextStep()"
              >
                Next
              </Button>
              <Button
                v-if="stepIndex === 2"
                size="sm"
                type="submit"
                :disabled="publishMutation.isPending.value"
              >
                <component
                  :is="LoaderIcon"
                  v-if="publishMutation.isPending.value"
                  class="size-4 animate-spin mr-2"
                />
                Publish Article
              </Button>
            </div>
          </div>
        </form>
      </Stepper>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import CircleIcon from "@/assets/icons/circle.svg";
import LoaderIcon from "@/assets/icons/loader.svg";
import CheckIcon from "@/assets/icons/check.svg";
import DotIcon from "@/assets/icons/dot.svg";
import { ref, watchEffect } from "vue";

import { useMutation } from "@tanstack/vue-query";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Stepper,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "../../../components/ui/stepper";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";

import type { NewsApiArticle } from "@/models/News";
import type { NewPostType } from "@/models/Posts";
import { useForm } from "vee-validate";
import { formSchema } from "./types";
import { postNewsArticle, generateSummaryFromText } from "@/api/posts.ts";
import { generateSlug } from "@/composables/utils.ts";
import { uploadToCloudinary } from "@/api/images.ts";

// Type for QuillEditor instance
export interface QuillEditorInstance {
  getQuill(): {
    getSelection(): { index: number; length: number } | null;
    insertEmbed(index: number, type: string, value: string): void;
    setSelection(index: number): void;
    formatText(
      index: number,
      length: number,
      format: string,
      value: string
    ): void;
    format(format: string, value: boolean): void;
  };
}

const stepIndex = ref(1);
const selectedArticle = ref<NewsApiArticle | null>(null);
const generatedSummary = ref<string>("");
const rawTextForSummary = ref<string>("");

// AI summarization mutation (manual paste text)
const textSummaryMutation = useMutation({
  mutationFn: async () => {
    return await generateSummaryFromText(rawTextForSummary.value);
  },
  onSuccess: (data) => {
    generatedSummary.value = data;
    form.setFieldValue("content", data);
  },
});

const steps = [
  {
    step: 1,
    title: "Create News Article",
  },
  {
    step: 2,
    title: "Approve & Publish",
  },
];

const quillRef = ref<QuillEditorInstance | null>(null);
const hiddenImageInput = ref<HTMLInputElement | null>(null);
const imageUploading = ref(false);
const imageUploadError = ref("");

// Simple toolbar array to ensure buttons appear
const toolbarConfig = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ["clean"],
  ["link", "image"],
];

// Custom handlers
const customHandlers = {
  image: function () {
    // File upload option
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const cloudinaryUrl = await uploadToCloudinary(file);
          if (quillRef.value) {
            const quill = quillRef.value.getQuill();
            const range = quill.getSelection();
            if (range) {
              quill.insertEmbed(range.index, "image", cloudinaryUrl);
              quill.setSelection(range.index + 1);
            }
          }
        } catch (error) {
          console.error("Upload failed:", error);
        }
      }
    };
  },
};

// Publish article mutation
const publishMutation = useMutation({
  mutationFn: postNewsArticle,
  onSuccess: () => {
    stepIndex.value = 1;
    selectedArticle.value = null;
    generatedSummary.value = "";
    rawTextForSummary.value = "";
    form.resetForm();
  },
});

function triggerImageSelect() {
  imageUploadError.value = "";
  hiddenImageInput.value?.click();
}

async function onImageFileChange(
  e: Event,
  componentField: { onChange: (val: unknown) => void }
) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  imageUploading.value = true;
  imageUploadError.value = "";
  try {
    const url = await uploadToCloudinary(file);
    componentField.onChange(url);
    form.setFieldValue("imageUrl", url);
  } catch (err) {
    console.error(err);
    imageUploadError.value = "Failed to upload image. Please try again.";
  } finally {
    imageUploading.value = false;
    if (target) target.value = ""; // reset so same file can be re-selected
  }
}

function removeUploadedImage() {
  form.setFieldValue("imageUrl", "");
}

function onSubmit(values: Record<string, unknown>) {
  if (stepIndex.value === steps.length) {
    const title =
      (values.title as string)?.trim() ||
      selectedArticle.value?.title ||
      "Untitled Article";
    const slug =
      (values.slug as string)?.trim() ||
      generateSlug(title || "untitled-article");
    const content =
      (values.content as string)?.trim() ||
      generatedSummary.value ||
      selectedArticle.value?.content ||
      "";
    const description =
      (values.description as string)?.trim() ||
      selectedArticle.value?.description ||
      "";
    const author =
      (values.author as string)?.trim() ||
      selectedArticle.value?.author ||
      "Unknown";
    const sourceName =
      (values.source as string)?.trim() ||
      selectedArticle.value?.source?.name ||
      "";
    const imageUrl =
      (values.imageUrl as string)?.trim() ||
      selectedArticle.value?.urlToImage ||
      "";

    const sourceUrl = selectedArticle.value?.url || "";

    const finalData = {
      title,
      slug,
      content,
      categories: ["news"],
      is_external: true,
      source_url: sourceUrl,
      source_name: sourceName,
      url_to_image: imageUrl,
      author,
      description,
    };
    publishMutation.mutate(finalData as NewPostType);
  }
}

const { setValues } = useForm();

// Initialize the form
const form = useForm({
  validationSchema: toTypedSchema(formSchema[0]),
});

// Initialize imageUrl field (not part of schema yet but used in form)
form.setFieldValue("imageUrl", "");

watchEffect(() => {
  if (stepIndex.value === 2 && selectedArticle.value) {
    setValues({
      title: selectedArticle.value.title || "",
      slug: generateSlug(selectedArticle.value.title || ""),
      description: selectedArticle.value.description || "",
      content: selectedArticle.value.content || "",
      author: selectedArticle.value.author || "Unknown",
      source: selectedArticle.value.source?.name || "Unknown",
      imageUrl: selectedArticle.value.urlToImage || "",
    });
  }
});
</script>

<style scoped>
* {
  font-family: "Times New Roman", serif;
}

/* Quill Editor Styles */
:deep(.ql-editor) {
  min-height: 200px;
  font-family: "Times New Roman", serif;
}

:deep(.ql-toolbar) {
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-radius: 0.375rem 0.375rem 0 0;
}

:deep(.ql-container) {
  border-bottom: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-radius: 0 0 0.375rem 0.375rem;
}

:deep(.ql-editor.ql-blank::before) {
  font-style: italic;
  color: #999;
}

/* Prose styles for content preview */
.prose h1 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.prose h2 {
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.prose h3 {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}
.prose p {
  margin-bottom: 0.5rem;
}
.prose ul {
  list-style-type: disc;
  list-style-position: inside;
  margin-bottom: 0.5rem;
}
.prose ol {
  list-style-type: decimal;
  list-style-position: inside;
  margin-bottom: 0.5rem;
}
.prose blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  font-style: italic;
  margin-bottom: 0.5rem;
}
.prose strong {
  font-weight: bold;
}
.prose em {
  font-style: italic;
}
.prose code {
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  padding: 0 0.25rem;
}
</style>
