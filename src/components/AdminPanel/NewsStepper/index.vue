<template>
  <div class="mx-auto w-full max-w-full px-0 py-0 sm:px-6 sm:py-6">
    <header class="mb-5 border-b pb-3">
      <h1 class="text-xl font-semibold tracking-tight sm:text-2xl">
        News Processing Workflow
      </h1>
    </header>
    <form @submit.prevent="onSubmit">
      <div class="space-y-6">
        <!-- Title & Slug -->
        <section class="space-y-3">
          <h2 class="text-lg font-semibold">Title & Slug</h2>

          <FormField v-slot="{ componentField }" name="title">
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                  :maxlength="100"
                  placeholder="Enter article title (max 20 words, 100 characters)"
                />
              </FormControl>
              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
              >
                <p class="text-xs text-muted-foreground">
                  {{ titleWordCount }} / 20 words ·
                  {{ (componentField.modelValue as string)?.length ?? 0 }} / 100
                  characters
                </p>
                <FormMessage />
              </div>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="slug">
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="text"
                  readonly
                  class="bg-muted/50 cursor-not-allowed"
                />
              </FormControl>
              <p class="text-xs text-muted-foreground mt-1">
                Auto-generated from the title. It updates as you type.
              </p>
              <FormMessage />
            </FormItem>
          </FormField>
        </section>

        <!-- Prediction -->
        <section class="space-y-3">
          <h2 class="text-lg font-semibold">Prediction</h2>
          <p class="text-sm text-muted-foreground">
            Paste a Polymarket URL or use search to choose an event, a single
            market within it, and commit to Yes or No.
          </p>

          <div class="space-y-3 rounded-lg border bg-muted/20 p-4">
            <div class="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="openPredictionModal"
              >
                {{
                  predictionSelection
                    ? "Change Prediction"
                    : "Select Prediction"
                }}
              </Button>
              <Button
                v-if="predictionSelection"
                type="button"
                variant="ghost"
                size="sm"
                @click="clearPrediction"
              >
                Clear
              </Button>
            </div>

            <div v-if="predictionSelection" class="min-w-0 space-y-1">
              <div class="break-words text-sm">
                <span class="font-medium">Event:</span>
                {{ predictionSelection.eventTitle }}
              </div>
              <div class="break-words text-sm">
                <span class="font-medium">Market:</span>
                {{ predictionSelection.marketQuestion }}
              </div>
              <div class="text-sm">
                <span class="font-medium">Position:</span>
                <span
                  :class="
                    predictionSelection.outcome === 'Yes'
                      ? 'text-green-600 font-semibold'
                      : 'text-red-600 font-semibold'
                  "
                >
                  {{ predictionSelection.outcome }}
                </span>
              </div>
              <a
                :href="predictionSelection.url"
                target="_blank"
                rel="noreferrer"
                class="text-xs text-primary underline-offset-4 hover:underline"
              >
                Open on Polymarket
              </a>
            </div>
          </div>
        </section>

        <!-- TLGP -->
        <section class="space-y-3">
          <h2 class="text-lg font-semibold">
            TLGP
            <span class="text-sm font-normal text-muted-foreground">
              (Too Long Give Prediction)
            </span>
          </h2>
          <p class="text-sm text-muted-foreground">
            A summary of your prediction. Maximum 100 words, 500 characters.
          </p>

          <FormField v-slot="{ componentField }" name="tlgp">
            <FormItem>
              <FormLabel>Prediction summary</FormLabel>
              <FormControl>
                <Textarea
                  v-bind="componentField"
                  rows="5"
                  :maxlength="500"
                  placeholder="Summarize your prediction here..."
                />
              </FormControl>
              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
              >
                <p class="text-xs text-muted-foreground">
                  {{ tlgpWordCount }} / 100 words ·
                  {{ (componentField.modelValue as string)?.length ?? 0 }} / 500
                  characters
                </p>
                <FormMessage />
              </div>
            </FormItem>
          </FormField>
        </section>

        <!-- Rules Analysis -->
        <section class="space-y-3">
          <h2 class="text-lg font-semibold">Rules Analysis</h2>
          <p class="text-sm text-muted-foreground">
            Analyze the rules of the selected market to avoid gotchas. Maximum
            400 words, 2000 characters.
          </p>

          <FormField v-slot="{ componentField }" name="rulesAnalysis">
            <FormItem>
              <FormLabel>Market rules analysis</FormLabel>
              <FormControl>
                <TipTap
                  :model-value="componentField.modelValue || ''"
                  min-height="200px"
                  placeholder="Analyze the market rules and potential gotchas..."
                  @update:model-value="componentField.onChange"
                />
              </FormControl>
              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
              >
                <p class="text-xs text-muted-foreground">
                  {{ rulesAnalysisWordCount }} / 400 words ·
                  {{ rulesAnalysisCharacterCount }} / 2000 characters
                </p>
                <FormMessage />
              </div>
            </FormItem>
          </FormField>
        </section>

        <!-- Full Analysis -->
        <section class="space-y-3">
          <h2 class="text-lg font-semibold">Full Analysis</h2>
          <p class="text-sm text-muted-foreground">
            Write the full details of your prediction and explain the logic of
            your bet. Maximum 1000 words, 5000 characters.
          </p>

          <FormField v-slot="{ componentField }" name="fullAnalysis">
            <FormItem>
              <FormLabel>Prediction analysis</FormLabel>
              <FormControl>
                <TipTap
                  :model-value="componentField.modelValue || ''"
                  min-height="300px"
                  placeholder="Write your full analysis here..."
                  @update:model-value="componentField.onChange"
                />
              </FormControl>
              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
              >
                <p class="text-xs text-muted-foreground">
                  {{ fullAnalysisWordCount }} / 1000 words ·
                  {{ fullAnalysisCharacterCount }} / 5000 characters
                </p>
                <FormMessage />
              </div>
            </FormItem>
          </FormField>
        </section>

        <!-- Cover Image -->
        <section class="space-y-3">
          <h2 class="text-lg font-semibold">Cover Image</h2>
          <p class="text-sm text-muted-foreground">
            Use the Polymarket thumbnail or upload your own image.
          </p>

          <div class="space-y-4">
            <!-- Polymarket image option -->
            <div
              v-if="polymarketImage"
              class="flex flex-col items-start gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:gap-4"
              :class="
                usePolymarketImage
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              "
            >
              <img
                :src="polymarketImage"
                alt="Polymarket thumbnail"
                class="w-20 h-20 rounded-lg object-cover border"
              />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium">Polymarket Thumbnail</p>
                <p class="text-xs text-muted-foreground">
                  From the prediction market
                </p>
              </div>
              <Button
                type="button"
                :variant="usePolymarketImage ? 'default' : 'outline'"
                size="sm"
                @click="selectPolymarketImage"
              >
                {{ usePolymarketImage ? "Selected" : "Use This" }}
              </Button>
            </div>

            <!-- Upload option -->
            <div
              class="flex flex-col items-start gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:gap-4"
              :class="
                !usePolymarketImage && imageUrl
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              "
            >
              <div
                v-if="imageUrl"
                class="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border"
              >
                <img
                  :src="imageUrl"
                  alt="Uploaded cover"
                  class="object-cover w-full h-full"
                />
              </div>
              <div
                v-else
                class="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border text-xs text-muted-foreground"
              >
                No image
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium">Upload Your Own</p>
                <p class="text-xs text-muted-foreground">
                  Recommended: max 2MB, landscape orientation
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <Button
                  v-if="imageUrl && usePolymarketImage"
                  type="button"
                  variant="outline"
                  size="sm"
                  @click="selectUploadedImage"
                >
                  Use This
                </Button>
                <Button
                  type="button"
                  variant="outline"
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
                      : imageUrl
                        ? "Replace"
                        : "Upload"
                  }}
                </Button>
                <Button
                  v-if="imageUrl"
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
                @change="onImageFileChange"
              />
            </div>

            <span v-if="imageUploadError" class="text-xs text-destructive">{{
              imageUploadError
            }}</span>

            <p class="text-xs text-muted-foreground">
              {{
                usePolymarketImage
                  ? "Using Polymarket thumbnail."
                  : imageUrl
                    ? "Using uploaded image."
                    : "No cover image selected."
              }}
            </p>
          </div>
        </section>
      </div>

      <!-- Submit Button -->
      <div class="mt-6 flex items-center justify-end">
        <Button
          type="submit"
          class="w-full sm:w-auto"
          :disabled="publishMutation.isPending.value"
        >
          <component
            :is="LoaderIcon"
            v-if="publishMutation.isPending.value"
            class="size-4 animate-spin"
          />
          Publish Article
        </Button>
      </div>
    </form>
  </div>

  <!-- Prediction Market Selection Modal -->
  <MarketSelectionModal
    v-model:open="predictionModalOpen"
    title="Select Prediction Market"
    @confirm="onPredictionConfirm"
    @cancel="predictionModalOpen = false"
  />
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import LoaderIcon from "@/assets/icons/loader.svg";
import { computed, ref, watch } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
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
import type { NewPostType } from "@/models/Posts";
import { useForm } from "vee-validate";
import { formSchema, getTextLength, getWordCount } from "./types";
import { postNewsArticle } from "@/api/posts.ts";
import { generateSlug } from "@/composables/utils.ts";
import { uploadToCloudinary } from "@/api/images.ts";
import { useRouter } from "vue-router";
import MarketSelectionModal, {
  type MarketSelection,
} from "./MarketSelectionModal.vue";
import { composeNewsWorkflowContent } from "@/utils/newsWorkflowContent";

const router = useRouter();
const queryClient = useQueryClient();

const initialValues = {
  title: "",
  slug: "",
  predictionUrl: "",
  predictionEventTitle: "",
  predictionMarketId: "",
  predictionMarketSlug: "",
  predictionMarketQuestion: "",
  predictionOutcome: "Yes" as "Yes" | "No",
  predictionTokenId: "",
  tlgp: "",
  rulesAnalysis: "",
  fullAnalysis: "",
  imageUrl: "",
  polymarketImage: "",
};

const form = useForm({
  validationSchema: toTypedSchema(formSchema[0]),
  initialValues,
});

const { setFieldValue, setFieldTouched, validate, values } = form;

const titleWordCount = computed(() => getWordCount(values.title || ""));
const tlgpWordCount = computed(() => getWordCount(values.tlgp || ""));
const rulesAnalysisWordCount = computed(() =>
  getWordCount(values.rulesAnalysis || ""),
);
const fullAnalysisWordCount = computed(() =>
  getWordCount(values.fullAnalysis || ""),
);
const rulesAnalysisCharacterCount = computed(() =>
  getTextLength(values.rulesAnalysis || ""),
);
const fullAnalysisCharacterCount = computed(() =>
  getTextLength(values.fullAnalysis || ""),
);

// --- Auto-generate slug from title ---
watch(
  () => values.title,
  (newTitle) => {
    if (newTitle !== undefined) {
      const slug = generateSlug(newTitle || "");
      setFieldValue("slug", slug);
    }
  },
);

// --- Prediction selection ---
const predictionSelection = ref<MarketSelection | null>(null);
const predictionModalOpen = ref(false);

function openPredictionModal() {
  predictionModalOpen.value = true;
}

function onPredictionConfirm(selection: MarketSelection) {
  predictionSelection.value = selection;
  setFieldValue("predictionUrl", selection.url);
  setFieldValue("predictionEventTitle", selection.eventTitle);
  setFieldValue("predictionMarketId", selection.marketId);
  setFieldValue("predictionMarketSlug", selection.marketSlug);
  setFieldValue("predictionMarketQuestion", selection.marketQuestion);
  setFieldValue("predictionOutcome", selection.outcome);
  setFieldValue("predictionTokenId", selection.tokenId);
  setFieldTouched("predictionUrl", true);

  setFieldValue("polymarketImage", selection.image || "");
  if (selection.image && !values.imageUrl) {
    usePolymarketImage.value = true;
  }
}

function clearPrediction() {
  predictionSelection.value = null;
  setFieldValue("predictionUrl", "");
  setFieldValue("predictionEventTitle", "");
  setFieldValue("predictionMarketId", "");
  setFieldValue("predictionMarketSlug", "");
  setFieldValue("predictionMarketQuestion", "");
  setFieldValue("predictionOutcome", "Yes");
  setFieldValue("predictionTokenId", "");
  setFieldValue("polymarketImage", "");
  usePolymarketImage.value = false;
}

// --- Cover image ---
const hiddenImageInput = ref<HTMLInputElement | null>(null);
const imageUploading = ref(false);
const imageUploadError = ref("");
const usePolymarketImage = ref(false);

const polymarketImage = computed(() => values.polymarketImage || "");
const imageUrl = computed(() => values.imageUrl || "");

function selectPolymarketImage() {
  usePolymarketImage.value = true;
}

function selectUploadedImage() {
  usePolymarketImage.value = false;
}

function triggerImageSelect() {
  imageUploadError.value = "";
  hiddenImageInput.value?.click();
}

async function onImageFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // Size constraint: 2MB
  if (file.size > 2 * 1024 * 1024) {
    imageUploadError.value = "Image must be under 2MB.";
    if (target) target.value = "";
    return;
  }

  imageUploading.value = true;
  imageUploadError.value = "";
  try {
    const url = await uploadToCloudinary(file);
    setFieldValue("imageUrl", url);
    setFieldTouched("imageUrl", true);
    usePolymarketImage.value = false;
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

// --- Publish ---
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

    // Reset form
    predictionSelection.value = null;
    usePolymarketImage.value = false;
    form.resetForm();
    form.setValues(initialValues);
  },
});

async function onSubmit() {
  const result = await validate();
  if (!result.valid) return;

  const v = result.values ?? {};
  const prediction = predictionSelection.value;
  if (!prediction) return;

  const title = (v.title as string)?.trim() || "Untitled Article";
  const slug = (v.slug as string)?.trim() || generateSlug(title);

  // Prediction is stored separately so it stays immutable in article edits.
  const content = composeNewsWorkflowContent({
    tlgp: (v.tlgp as string) || "",
    rulesAnalysis: (v.rulesAnalysis as string) || "",
    fullAnalysis: (v.fullAnalysis as string) || "",
  });

  // Description = TLGP
  const description = (v.tlgp as string)?.trim() || "";

  // Keep both image choices available and publish the explicitly selected one.
  const polymarketImg = (v.polymarketImage as string) || "";
  const uploadedImg = (v.imageUrl as string) || "";
  const finalImageUrl = usePolymarketImage.value
    ? polymarketImg
    : uploadedImg || polymarketImg;

  // Source URL = prediction market URL
  const sourceUrl = prediction.url;

  const finalData = {
    title,
    slug,
    content,
    categories: ["news"],
    is_external: true,
    source_url: sourceUrl,
    source_name: "Polymarket",
    url_to_image: finalImageUrl,
    author: "Unknown",
    description,
    prediction: {
      url: prediction.url,
      event_title: prediction.eventTitle,
      market_id: prediction.marketId,
      market_slug: prediction.marketSlug,
      market_question: prediction.marketQuestion,
      outcome: prediction.outcome,
      token_id: prediction.tokenId,
      image: prediction.image,
      tags: prediction.tags,
    },
  };
  publishMutation.mutate(finalData as NewPostType);
}
</script>

<style scoped>
* {
  font-family: Lato, serif;
}
</style>
