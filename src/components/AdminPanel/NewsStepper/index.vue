<template>
  <h1 class="text-2xl font-bold mb-4 uppercase">News Processing Workflow</h1>
  <div class="w-full mx-auto p-6">
    <Stepper v-model="stepIndex" class="block w-full">
      <form @submit.prevent="onSubmit(savedValues)">
        <div class="flex w-full flex-start gap-2"></div>
        <!-- Step Content -->
        <div class="min-h-[400px]">
          <template v-if="stepIndex === 1">
            <div class="space-y-4">
              <h2 class="text-xl font-semibold">Edit Article Details</h2>
              <div class="mb-4 space-y-2">
                <label
                  v-if="hideSummarize === false"
                  class="block font-medium text-sm"
                  >Select input method:</label
                >
                <div class="flex items-center gap-6">
                  <label
                    v-if="hideSummarize === false"
                    class="flex items-center space-x-2 text-sm"
                  >
                    <input
                      v-model="inputMode"
                      type="radio"
                      name="inputMode"
                      value="ai-summary"
                      class="form-radio"
                    />
                    <span>Summarize with AI</span>
                  </label>

                  <label class="flex items-center space-x-2 text-sm">
                    <input
                      v-model="inputMode"
                      type="radio"
                      name="inputMode"
                      value="polymarket"
                      class="form-radio"
                    />
                    <span>Use Polymarket URL</span>
                  </label>
                </div>
              </div>

              <div
                v-if="inputMode === 'ai-summary' && !polymarketSummary"
                class="space-y-2 p-3 border rounded-md bg-muted/30"
              >
                <h3 class="text-sm font-semibold">
                  Optional: Paste source text to summarize with AI
                </h3>
                <p class="text-xs text-muted-foreground">
                  Paste any article/body text below and click "Summarize Text".
                  The generated summary will populate the Content editor.
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
                  <span
                    v-if="generatedSummary && !polymarketSummary"
                    class="text-xs text-green-600"
                  >
                    Summary ready. You can refine it below.
                  </span>
                </div>
              </div>

              <div
                v-if="inputMode === 'polymarket'"
                class="space-y-2 p-3 border rounded-md bg-muted/30"
              >
                <h3 class="text-sm font-semibold">
                  Optional: Paste Polymarket Event or Market URL
                  <span class="text-muted-foreground text-xs"
                    >(form will auto-fill)</span
                  >
                </h3>
                <Input
                  v-model="polymarketUrl"
                  placeholder="https://polymarket.com/event/some-slug"
                  class="text-sm"
                />
                <div class="flex items-center gap-3 mt-2">
                  <Button
                    type="button"
                    size="sm"
                    :disabled="!polymarketUrl || polymarketLoading"
                    @click="handlePolymarketFetch"
                  >
                    <component
                      :is="LoaderIcon"
                      v-if="polymarketLoading"
                      class="size-4 animate-spin mr-2"
                    />
                    Get Data
                  </Button>
                  <span v-if="polymarketError" class="text-xs text-red-600">
                    {{ polymarketError }}
                  </span>
                  <span v-if="polymarketSuccess" class="text-xs text-green-600">
                    Data loaded successfully!
                  </span>
                </div>
                <p class="text-xs text-muted-foreground mt-1">
                  Paste a valid Polymarket event or market URL.
                </p>
              </div>

              <FormField v-slot="{ componentField }" name="title">
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="slug">
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="text" />
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
                    <Textarea v-bind="componentField" rows="3" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="content">
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <TipTap
                      :model-value="componentField.modelValue || ''"
                      min-height="300px"
                      placeholder="Start writing your article content..."
                      @update:model-value="componentField.onChange"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="source">
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

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

          <!-- Step 2: Approve & Publish -->
          <ApproveAndPublish
            v-if="stepIndex === 2"
            :review-data="savedValues"
          />
        </div>

        <!-- Navigation Buttons -->
        <div class="flex items-center justify-between mt-8">
          <Button
            :disabled="isFirstStep"
            variant="outline"
            size="sm"
            @click.prevent="handlePrev"
          >
            Back
          </Button>
          <div class="flex items-center gap-3">
            <Button
              v-if="!isLastStep"
              type="button"
              size="sm"
              :disabled="!meta.valid"
              @click.prevent="handleNext"
            >
              Next
            </Button>
            <Button v-if="isLastStep" size="sm" type="submit">
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
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { toTypedSchema } from "@vee-validate/zod";
import LoaderIcon from "@/assets/icons/loader.svg";
import { computed, ref, watch, onMounted } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { Button } from "../../../components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import TipTap from "@/components/Editor/TipTap.vue";
import type { NewsApiArticle } from "@/models/News";
import type { NewPostType } from "@/models/Posts";
import { useForm } from "vee-validate";
import { formSchema } from "./types";
import { postNewsArticle, generateSummaryFromText } from "@/api/posts.ts";
import { generateSlug } from "@/composables/utils.ts";
import { uploadToCloudinary } from "@/api/images.ts";
import { getPolymarketDataBySlug } from "@/api/polymarket";
import { useRouter } from "vue-router";
import ApproveAndPublish from "./ApproveAndPublish.vue";
import { useGlobalStore } from "@/store/globalStore";

const router = useRouter();
const queryClient = useQueryClient();

const props = defineProps({
  hideSummarize: {
    type: Boolean,
    default: false,
  },
});

const stepIndex = ref<number>(1);
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
const selectedArticle = ref<NewsApiArticle | null>(null);
const generatedSummary = ref<string>("");
const polymarketSummary = ref<string>("");
const rawTextForSummary = ref<string>("");

const hiddenImageInput = ref<HTMLInputElement | null>(null);
const imageUploading = ref(false);
const imageUploadError = ref("");
const polymarketUrl = ref("");
const polymarketError = ref("");
const polymarketLoading = ref(false);
const polymarketSuccess = ref(false);
const inputMode = ref<"ai-summary" | "polymarket">(
  props.hideSummarize ? "polymarket" : "ai-summary"
);

const globalStore = useGlobalStore();
const generatedApiPost = computed(() => globalStore.generatedPost);
const initialValues = {
  title: "",
  slug: "",
  description: "",
  content: "",
  imageUrl: "",
};

const form = useForm({
  validationSchema: toTypedSchema(formSchema[0]),
  initialValues,
});

onMounted(() => {
  if (generatedApiPost.value) {
    const post = generatedApiPost.value;
    setValues({
      title: post.title || "",
      slug: generateSlug(post.title || ""),
      description: post.description || "",
      content: post.content || "",
      imageUrl: post.urlToImage || "",
      source: post.url || "",
    });
    savedValues.value = {
      title: post.title || "",
      slug: generateSlug(post.title || ""),
      description: post.description || "",
      content: post.content || "",
      imageUrl: post.urlToImage || "",
      source: post.url || "",
    };
  }
});

const { setValues, setFieldValue, setFieldTouched, meta, validate } = form;

const textSummaryMutation = useMutation({
  mutationFn: async () => {
    return await generateSummaryFromText(rawTextForSummary.value);
  },
  onSuccess: (data) => {
    generatedSummary.value = data;
    setFieldValue("content", data);
    setFieldTouched("content", true);
  },
});

// Publish article mutation
const publishMutation = useMutation({
  mutationFn: postNewsArticle,
  onSuccess: () => {
    router.push(`/`).catch((err) => {
      console.error("Navigation error:", err);
    });

    queryClient.invalidateQueries({
      queryKey: ["users-news-articles"],
    });
    queryClient.invalidateQueries({
      queryKey: ["allPosts"],
    });
    globalStore.setGeneratedPost({
      author: "",
      content: null,
      description: null,
      publishedAt: null,
      source: "",
      title: null,
      url: null,
      urlToImage: null,
    });
    selectedArticle.value = null;
    generatedSummary.value = "";
    rawTextForSummary.value = "";
    polymarketUrl.value = "";
    polymarketSuccess.value = false;
    form.resetForm();
    form.setValues(initialValues);
  },
});

const {
  data: polymarketData,
  isFetching: polymarketIsFetching,
  error: polymarketQueryError,
  refetch: fetchPolymarket,
} = useQuery({
  queryKey: computed(() => ["polyMarketData", polymarketUrl.value]),
  queryFn: async () => {
    const url = new URL(polymarketUrl.value);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const typeFromUrl = pathParts[0];
    const slug = pathParts[1];

    const type =
      typeFromUrl === "event"
        ? "events"
        : typeFromUrl === "market"
        ? "markets"
        : null;

    if (!type || !slug) {
      throw new Error("Invalid Polymarket URL.");
    }

    const response = await getPolymarketDataBySlug(type, slug);
    return response;
  },
  enabled: false,
});

watch(
  () => [polymarketIsFetching.value, polymarketQueryError.value],
  () => {
    polymarketLoading.value = polymarketIsFetching.value;
    polymarketError.value = polymarketQueryError.value?.message || "";
  }
);

const savedValues = ref(
  {} as {
    title?: string | undefined;
    description?: string | undefined;
    content?: string | undefined;
    imageUrl?: string | undefined;
    author?: string | undefined;
    source?: string | undefined;
    slug?: string | undefined;
  }
);

watch(
  () => polymarketData.value,
  async (data: any) => {
    if (!data) return;

    const formValues = {
      title: data.title,
      slug: generateSlug(data.title),
      description: data.description,
      content: data.summary,
      imageUrl: data.image,
      author: form.values.author,
      source: polymarketUrl.value,
    };
    polymarketSummary.value = data.description || "";
    setValues(formValues);
    savedValues.value = { ...formValues };
    polymarketSuccess.value = true;
  }
);

function handlePolymarketFetch() {
  polymarketError.value = "";
  polymarketSuccess.value = false;
  fetchPolymarket();
}

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
    setFieldValue("imageUrl", url);
    setFieldTouched("imageUrl", true);
  } catch (err) {
    console.error(err);
    imageUploadError.value = "Failed to upload image. Please try again.";
  } finally {
    imageUploading.value = false;
    if (target) target.value = "";
  }
}

function removeUploadedImage() {
  setFieldValue("imageUrl", "");
  setFieldTouched("imageUrl", true);
}

// Helper computed values
const totalSteps = computed(() => steps.length);
const isFirstStep = computed(() => stepIndex.value === 1);
const isLastStep = computed(() => stepIndex.value === totalSteps.value);

async function handleNext() {
  try {
    const result = await validate();
    if (result.valid) {
      if (stepIndex.value < totalSteps.value) stepIndex.value += 1;
      savedValues.value = { ...result.values };
    }
  } catch (err) {
    console.error("Validation error:", err);
  }
}

function handlePrev() {
  if (stepIndex.value > 1) {
    if (savedValues.value) {
      setValues(savedValues.value);
    }
    stepIndex.value -= 1;
  }
}

function onSubmit(values: Record<string, unknown>) {
  if (stepIndex.value === totalSteps.value) {
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
    form.resetForm();
  } else {
    handleNext();
  }
}

onMounted(() => {
  if (!generatedApiPost.value?.content) {
    form.resetForm();
  }
});
</script>

<style scoped>
* {
  font-family: Lato, serif;
}
</style>
