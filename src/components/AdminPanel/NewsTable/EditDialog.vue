<template>
  <Dialog
    :open="isOpen"
    @update:open="(open: boolean) => !open && emit('close')"
  >
    <DialogContent
      class="flex max-h-[95dvh] w-[calc(100vw-1rem)] max-w-[1300px] flex-col overflow-hidden p-4 sm:w-[calc(100vw-2rem)] sm:p-6"
    >
      <DialogHeader class="border-b pb-3">
        <DialogTitle>Edit Post</DialogTitle>
        <DialogDescription>
          Update the article using the same sections as Write Prediction.
        </DialogDescription>
      </DialogHeader>

      <form
        class="min-h-0 flex-1 overflow-y-auto pr-1"
        @submit.prevent="handleSave"
      >
        <div class="space-y-6 py-4">
          <section class="space-y-3">
            <h2 class="text-lg font-semibold">Title &amp; Slug</h2>

            <div class="grid gap-2">
              <Label for="edit-title">Title</Label>
              <Input
                id="edit-title"
                :model-value="formData.title"
                :maxlength="100"
                placeholder="Enter article title (max 20 words, 100 characters)"
                :aria-invalid="Boolean(errors.title)"
                @update:model-value="onTitleChange"
              />
              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
              >
                <p class="text-xs text-muted-foreground">
                  {{ titleWordCount }} / 20 words ·
                  {{ formData.title.length }} / 100 characters
                </p>
                <p v-if="errors.title" class="text-sm text-destructive">
                  {{ errors.title }}
                </p>
              </div>
            </div>

            <div class="grid gap-2">
              <Label for="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                v-model="formData.slug"
                readonly
                class="cursor-not-allowed bg-muted/50"
                :aria-invalid="Boolean(errors.slug)"
              />
              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
              >
                <p class="text-xs text-muted-foreground">
                  Auto-generated when the title changes.
                </p>
                <p v-if="errors.slug" class="text-sm text-destructive">
                  {{ errors.slug }}
                </p>
              </div>
            </div>
          </section>

          <PostPredictionSection
            v-if="currentPrediction"
            :prediction="currentPrediction"
            action-label="Change Prediction"
            @action="predictionModalOpen = true"
          />
          <PostPredictionSection
            v-if="currentHedge"
            :prediction="currentHedge"
            title="Hedge"
            action-label="Change Hedge"
            @action="hedgeModalOpen = true"
          />

          <section class="space-y-3">
            <h2 class="text-lg font-semibold">
              TLGP
              <span class="text-sm font-normal text-muted-foreground">
                (Too Long Give Prediction)
              </span>
            </h2>
            <p class="text-sm text-muted-foreground">
              A summary of your prediction. Maximum 100 words, 650 characters.
            </p>
            <div class="grid gap-2">
              <Label for="edit-tlgp">Prediction summary</Label>
              <Textarea
                id="edit-tlgp"
                v-model="formData.tlgp"
                rows="5"
                :maxlength="650"
                placeholder="Summarize your prediction here..."
                :aria-invalid="Boolean(errors.tlgp)"
              />
              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
              >
                <p class="text-xs text-muted-foreground">
                  {{ tlgpWordCount }} / 100 words · {{ formData.tlgp.length }} /
                  650 characters
                </p>
                <p v-if="errors.tlgp" class="text-sm text-destructive">
                  {{ errors.tlgp }}
                </p>
              </div>
            </div>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold">Rules Analysis</h2>
            <p class="text-sm text-muted-foreground">
              Analyze the rules of the selected market to avoid gotchas. Maximum
              400 words, 2600 characters.
            </p>
            <div class="grid gap-2">
              <Label>Market rules analysis</Label>
              <TipTap
                v-model="formData.rulesAnalysis"
                min-height="200px"
                placeholder="Analyze the market rules and potential gotchas..."
              />
              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
              >
                <p class="text-xs text-muted-foreground">
                  {{ rulesAnalysisWordCount }} / 400 words ·
                  {{ rulesAnalysisCharacterCount }} / 2600 characters
                </p>
                <p v-if="errors.rulesAnalysis" class="text-sm text-destructive">
                  {{ errors.rulesAnalysis }}
                </p>
              </div>
            </div>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold">Full Analysis</h2>
            <p class="text-sm text-muted-foreground">
              Write the full details of your prediction and explain the logic of
              your bet. Maximum 1000 words, 6500 characters.
            </p>
            <div class="grid gap-2">
              <Label>Prediction analysis</Label>
              <TipTap
                v-model="formData.fullAnalysis"
                min-height="300px"
                placeholder="Write your full analysis here..."
              />
              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
              >
                <p class="text-xs text-muted-foreground">
                  {{ fullAnalysisWordCount }} / 1000 words ·
                  {{ fullAnalysisCharacterCount }} / 6500 characters
                </p>
                <p v-if="errors.fullAnalysis" class="text-sm text-destructive">
                  {{ errors.fullAnalysis }}
                </p>
              </div>
            </div>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold">Cover Image</h2>
            <p class="text-sm text-muted-foreground">
              Use the persisted Polymarket thumbnail or upload your own image.
            </p>

            <div class="space-y-4">
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
                  class="h-20 w-20 rounded-lg border object-cover"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium">Polymarket Thumbnail</p>
                  <p class="text-xs text-muted-foreground">
                    From the selected prediction market
                  </p>
                </div>
                <Button
                  type="button"
                  :variant="usePolymarketImage ? 'default' : 'outline'"
                  size="sm"
                  @click="usePolymarketImage = true"
                >
                  {{ usePolymarketImage ? "Selected" : "Use This" }}
                </Button>
              </div>

              <div
                class="flex flex-col items-start gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:gap-4"
                :class="
                  !usePolymarketImage && formData.imageUrl
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                "
              >
                <div
                  v-if="formData.imageUrl"
                  class="h-20 w-20 shrink-0 overflow-hidden rounded-lg border"
                >
                  <img
                    :src="formData.imageUrl"
                    alt="Uploaded cover"
                    class="h-full w-full object-cover"
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
                    v-if="formData.imageUrl && usePolymarketImage"
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="usePolymarketImage = false"
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
                      class="mr-2 size-4 animate-spin"
                    />
                    {{
                      imageUploading
                        ? "Uploading..."
                        : formData.imageUrl
                          ? "Replace"
                          : "Upload"
                    }}
                  </Button>
                  <Button
                    v-if="formData.imageUrl"
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

              <p v-if="imageUploadError" class="text-sm text-destructive">
                {{ imageUploadError }}
              </p>
              <p v-if="errors.imageUrl" class="text-sm text-destructive">
                {{ errors.imageUrl }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{
                  usePolymarketImage
                    ? "Using Polymarket thumbnail."
                    : formData.imageUrl
                      ? "Using uploaded image."
                      : "No cover image selected."
                }}
              </p>
            </div>
          </section>

          <section v-if="!post?.prediction" class="space-y-3">
            <h2 class="text-lg font-semibold">Legacy Source</h2>
            <p class="text-sm text-muted-foreground">
              This article predates structured predictions, so its original
              source remains editable.
            </p>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="grid min-w-0 gap-2">
                <Label for="edit-source-name">Source Name</Label>
                <Input id="edit-source-name" v-model="formData.sourceName" />
              </div>
              <div class="grid min-w-0 gap-2">
                <Label for="edit-source-url">Source URL</Label>
                <Input
                  id="edit-source-url"
                  v-model="formData.sourceUrl"
                  type="url"
                />
              </div>
            </div>
          </section>
        </div>
      </form>

      <DialogFooter class="border-t pt-4">
        <Button type="button" variant="outline" @click="emit('close')">
          Cancel
        </Button>
        <Button
          type="button"
          :disabled="isSaving || imageUploading"
          @click="handleSave"
        >
          <component
            :is="LoaderIcon"
            v-if="isSaving"
            class="size-4 animate-spin"
          />
          {{ isSaving ? "Saving..." : "Save changes" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <MarketSelectionModal
    v-model:open="predictionModalOpen"
    title="Change Prediction Market"
    @confirm="onPredictionConfirm"
    @cancel="predictionModalOpen = false"
  />
  <MarketSelectionModal
    v-model:open="hedgeModalOpen"
    title="Change Hedge Market"
    @confirm="onHedgeConfirm"
    @cancel="hedgeModalOpen = false"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TipTap from "@/components/Editor/TipTap.vue";
import PostPredictionSection from "@/components/PostPredictionSection.vue";
import MarketSelectionModal, {
  type MarketSelection,
} from "@/components/AdminPanel/NewsStepper/MarketSelectionModal.vue";
import LoaderIcon from "@/assets/icons/loader.svg";
import { uploadToCloudinary } from "@/api/images.ts";
import type { Post, PostPrediction } from "@/models/Posts";
import { generateSlug } from "@/composables/utils.ts";
import {
  editPostSchema,
  getTextLength,
  getWordCount,
  type EditPostValues,
} from "@/components/AdminPanel/NewsStepper/types";
import {
  composeNewsWorkflowContent,
  parseNewsWorkflowContent,
} from "@/utils/newsWorkflowContent";
import { withoutEmbeddedPrediction } from "@/utils/postPrediction";

type EditFormData = EditPostValues & {
  sourceName: string;
  sourceUrl: string;
};

type FieldErrors = Partial<Record<keyof EditPostValues, string>>;

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    post: Post | null;
    isSaving?: boolean;
  }>(),
  {
    isSaving: false,
  },
);

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", formData: Partial<Post>): void;
}>();

const createEmptyForm = (): EditFormData => ({
  title: "",
  slug: "",
  tlgp: "",
  rulesAnalysis: "",
  fullAnalysis: "",
  imageUrl: "",
  sourceName: "",
  sourceUrl: "",
});

const formData = ref<EditFormData>(createEmptyForm());
const errors = ref<FieldErrors>({});
const hiddenImageInput = ref<HTMLInputElement | null>(null);
const imageUploading = ref(false);
const imageUploadError = ref("");
const usePolymarketImage = ref(false);
const predictionSelection = ref<MarketSelection | null>(null);
const hedgeSelection = ref<MarketSelection | null>(null);
const predictionModalOpen = ref(false);
const hedgeModalOpen = ref(false);

const polymarketImage = computed(() => predictionSelection.value?.image || "");
const currentPrediction = computed(() =>
  predictionSelection.value
    ? toPostPrediction(predictionSelection.value)
    : null,
);
const currentHedge = computed(() =>
  hedgeSelection.value ? toPostPrediction(hedgeSelection.value) : null,
);
const titleWordCount = computed(() => getWordCount(formData.value.title));
const tlgpWordCount = computed(() => getWordCount(formData.value.tlgp));
const rulesAnalysisWordCount = computed(() =>
  getWordCount(formData.value.rulesAnalysis),
);
const rulesAnalysisCharacterCount = computed(() =>
  getTextLength(formData.value.rulesAnalysis),
);
const fullAnalysisWordCount = computed(() =>
  getWordCount(formData.value.fullAnalysis),
);
const fullAnalysisCharacterCount = computed(() =>
  getTextLength(formData.value.fullAnalysis),
);

watch(
  () => [props.post, props.isOpen] as const,
  ([post, isOpen]) => {
    if (!isOpen) return;
    errors.value = {};
    imageUploadError.value = "";
    if (!post) {
      formData.value = createEmptyForm();
      usePolymarketImage.value = false;
      predictionSelection.value = null;
      hedgeSelection.value = null;
      return;
    }

    const editableContent = withoutEmbeddedPrediction(
      post.content,
      post.prediction,
      post.hedge,
    );
    const sections = parseNewsWorkflowContent(
      editableContent,
      post.description,
    );
    const predictionImage = post.prediction?.image || "";
    const currentImage = post.url_to_image || "";
    usePolymarketImage.value = Boolean(
      predictionImage && (!currentImage || currentImage === predictionImage),
    );

    formData.value = {
      title: post.title || "",
      slug: post.slug || "",
      ...sections,
      imageUrl: usePolymarketImage.value ? "" : currentImage,
      sourceName: post.source_name || "",
      sourceUrl: post.source_url || "",
    };
    predictionSelection.value = toMarketSelection(post.prediction);
    hedgeSelection.value = toMarketSelection(post.hedge);
    predictionModalOpen.value = false;
    hedgeModalOpen.value = false;
  },
  { immediate: true },
);

function onTitleChange(value: string | number) {
  const title = String(value);
  formData.value.title = title;
  formData.value.slug = generateSlug(title);
}

function toMarketSelection(
  prediction: PostPrediction | undefined,
): MarketSelection | null {
  if (!prediction) return null;
  return {
    url: prediction.url,
    eventTitle: prediction.event_title,
    marketId: prediction.market_id,
    marketSlug: prediction.market_slug,
    marketQuestion: prediction.market_question,
    outcome: prediction.outcome,
    tokenId: prediction.token_id,
    image: prediction.image,
    tags: prediction.tags ?? [],
  };
}

function toPostPrediction(selection: MarketSelection): PostPrediction {
  return {
    url: selection.url,
    event_title: selection.eventTitle,
    market_id: selection.marketId,
    market_slug: selection.marketSlug,
    market_question: selection.marketQuestion,
    outcome: selection.outcome,
    token_id: selection.tokenId,
    image: selection.image,
    tags: selection.tags,
  };
}

function onPredictionConfirm(selection: MarketSelection) {
  predictionSelection.value = selection;
  predictionModalOpen.value = false;
}

function onHedgeConfirm(selection: MarketSelection) {
  hedgeSelection.value = selection;
  hedgeModalOpen.value = false;
}

function triggerImageSelect() {
  imageUploadError.value = "";
  hiddenImageInput.value?.click();
}

async function onImageFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    imageUploadError.value = "Image must be under 2MB.";
    target.value = "";
    return;
  }

  imageUploading.value = true;
  imageUploadError.value = "";
  try {
    formData.value.imageUrl = await uploadToCloudinary(file);
    usePolymarketImage.value = false;
  } catch (error) {
    console.error(error);
    imageUploadError.value = "Failed to upload image. Please try again.";
  } finally {
    imageUploading.value = false;
    target.value = "";
  }
}

function removeUploadedImage() {
  formData.value.imageUrl = "";
  if (polymarketImage.value) {
    usePolymarketImage.value = true;
  }
}

function handleSave() {
  errors.value = {};
  const result = editPostSchema.safeParse(formData.value);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof EditPostValues | undefined;
      if (field && !errors.value[field]) {
        errors.value[field] = issue.message;
      }
    }
    return;
  }

  const values = result.data;
  const image = usePolymarketImage.value
    ? polymarketImage.value
    : values.imageUrl || polymarketImage.value;
  const payload: Partial<Post> = {
    title: values.title.trim(),
    slug: values.slug.trim(),
    description: values.tlgp.trim(),
    content: composeNewsWorkflowContent(values),
    url_to_image: image,
  };

  if (predictionSelection.value && hedgeSelection.value) {
    payload.prediction = toPostPrediction(predictionSelection.value);
    payload.hedge = toPostPrediction(hedgeSelection.value);
  }

  if (!props.post?.prediction) {
    payload.source_name = formData.value.sourceName;
    payload.source_url = formData.value.sourceUrl;
  }

  emit("save", payload);
}
</script>
