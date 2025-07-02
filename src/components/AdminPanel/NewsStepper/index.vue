<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import CircleIcon from "@/assets/icons/circle.svg";
import LoaderIcon from "@/assets/icons/loader.svg";
import CheckIcon from "@/assets/icons/check.svg";
import DotIcon from "@/assets/icons/dot.svg";
import { ref, computed, watchEffect } from "vue";

import { useQuery, useMutation } from "@tanstack/vue-query";
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
import { toast } from "vue-sonner";
import { fetchNewsApi } from "../../../api/news.ts";
import type { NewsApiResponse, NewsApiArticle } from "../../../models/News";
import { useForm } from "vee-validate";
import { formSchema } from "./types";
import { generateSummary, postNewsArticle } from "../../../api/posts";

const stepIndex = ref(1);
const selectedArticle = ref<NewsApiArticle | null>(null);
const generatedSummary = ref<string>("");

const steps = [
  {
    step: 1,
    title: "Select Article",
  },
  {
    step: 2,
    title: "Generate Summary",
  },
  {
    step: 3,
    title: "Edit Details",
  },
  {
    step: 4,
    title: "Approve & Publish",
  },
];

// Fetch news data
const { data: newsData, isLoading: isLoadingNews } = useQuery<{
  data: NewsApiResponse;
}>({
  queryKey: ["newsApiData"],
  queryFn: fetchNewsApi,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});

const articles = computed(() => newsData.value?.data.articles ?? []);

// Publish article mutation
const publishMutation = useMutation({
  mutationFn: postNewsArticle,
  onSuccess: () => {
    toast.success("Article published successfully!");
    // Reset form or redirect
  },
  onError: () => {
    toast.error("Failed to publish article");
  },
});

// Summary generation mutation
const summaryMutation = useMutation({
  mutationFn: async (articleUrl: string) => {
    const summary = await generateSummary(articleUrl);
    return summary;
  },
  onSuccess: (data) => {
    generatedSummary.value = data;
    form.setFieldValue("content", data);
    toast.success("Summary generated successfully!");
  },
  onError: () => {
    toast.error("Failed to generate summary");
  },
});

function onSubmit(values: Record<string, unknown>) {
  console.log("Form values:", values);
  console.log("Content from editor:", values.content);
  console.log("Generated summary:", generatedSummary.value);

  if (stepIndex.value === 4 && selectedArticle.value) {
    // Create a new object with only the properties we want
    const finalData = {
      title:
        (values.title as string) ||
        selectedArticle.value.title ||
        "Untitled Article",
      content: (values.content as string) || generatedSummary.value,
      categories: ["news"],
      is_external: true,
      source_url: selectedArticle.value.url || "",
      source_name:
        (values.source as string) || selectedArticle.value.source?.name || "",
      url_to_image:
        (values.imageUrl as string) || selectedArticle.value.urlToImage || "",
      author:
        (values.author as string) ||
        (selectedArticle.value.author ?? "Unknown"),
      description:
        (values.description as string) ||
        (selectedArticle.value.description ?? ""),
    };

    console.log("Final data being sent:", finalData);
    publishMutation.mutate(finalData);
  }
}

function handleArticleSelect(index: number) {
  selectedArticle.value = articles.value[index];
}

function handleGenerateSummary() {
  if (selectedArticle.value?.url) {
    generatedSummary.value = "";
    summaryMutation.mutate(selectedArticle.value.url);
  } else {
    toast.error("No article selected or missing URL.");
  }
}

const { setValues } = useForm();

// Initialize the form
const form = useForm({
  validationSchema: toTypedSchema(formSchema[0]),
});

watchEffect(() => {
  if (stepIndex.value === 3 && selectedArticle.value) {
    const content =
      generatedSummary.value || selectedArticle.value.content || "";

    setValues({
      title: selectedArticle.value.title || "",
      description: selectedArticle.value.description || "",
      content: content,
      author: selectedArticle.value.author || "Unknown",
      source: selectedArticle.value.source?.name || "Unknown",
      imageUrl: selectedArticle.value.urlToImage || "",
    });

    setTimeout(() => {
      form.setFieldValue("content", content);
    }, 0);
  }
});

console.log(generatedSummary);
</script>

<template>
  <h1 class="text-2xl font-bold mb-4 uppercase">News Processing Workflow</h1>
  <div class="w-full mx-auto p-6">
    <Form v-slot="{ meta, values, validate }" as="" :form="form" keep-values>
      <Stepper
        v-slot="{ isNextDisabled, isPrevDisabled, nextStep, prevStep }"
        v-model="stepIndex"
        class="block w-full"
      >
        <form
          @submit="
            (e) => {
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
            <!-- Step 1: Select Article -->
            <template v-if="stepIndex === 1">
              <div class="space-y-4">
                <h2 class="text-xl font-semibold">Select a News Article</h2>

                <div v-if="isLoadingNews" class="flex justify-center py-8">
                  <component :is="LoaderIcon" class="size-8 animate-spin" />
                  <span class="ml-2">Loading articles...</span>
                </div>

                <FormField
                  v-slot="{ componentField }"
                  name="selectedArticleIndex"
                >
                  <FormItem>
                    <FormControl>
                      <div
                        class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      >
                        <Card
                          v-for="(article, index) in articles"
                          :key="index"
                          class="cursor-pointer transition-all hover:shadow-md pt-0"
                          :class="[
                            selectedArticle === article &&
                              'ring-2 ring-primary',
                          ]"
                          @click="
                            () => {
                              handleArticleSelect(index);
                              componentField.onChange(index);
                            }
                          "
                        >
                          <img
                            v-if="article.urlToImage"
                            :src="article.urlToImage"
                            alt="Article image"
                            class="w-full h-48 object-cover rounded-t-lg"
                          />
                          <img
                            v-else
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDVPuMlKfGrFErmCt6hCuECLbbhekJF-GCtAJvPIZpHX5upTT-hABFlp8qZY8rkgaZ0DE&usqp=CAU"
                            alt="Placeholder image"
                            class="w-full h-48 object-cover rounded-t-lg"
                          />
                          <CardHeader class="pb-2">
                            <CardTitle class="text-sm line-clamp-2">
                              {{ article.title }}
                            </CardTitle>
                            <CardDescription
                              class="text-xs line-clamp-2 font-semibold underline"
                            >
                              {{ article.source.name || "Source unavailable." }}
                            </CardDescription>
                            <CardDescription class="text-xs line-clamp-2 bold">
                              {{
                                article.description ||
                                "No description available."
                              }}
                            </CardDescription>
                          </CardHeader>
                          <a
                            class="px-6 underline mt-auto text-sm"
                            target="_blank"
                            :href="article.url"
                            >Read full article</a
                          >
                        </Card>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </template>

            <!-- Step 2: Generate Summary -->
            <template v-if="stepIndex === 2">
              <div class="space-y-4">
                <h2 class="text-xl font-semibold">Generate AI Summary</h2>

                <div class="space-y-2">
                  <Button
                    type="button"
                    :disabled="
                      summaryMutation.isPending.value || !selectedArticle
                    "
                    class="w-full"
                    @click="handleGenerateSummary"
                  >
                    <component
                      :is="LoaderIcon"
                      v-if="summaryMutation.isPending.value"
                      class="size-4 animate-spin mr-2"
                    />
                    Generate Summary with AI
                  </Button>

                  <div
                    v-if="generatedSummary.length"
                    class="p-4 bg-muted rounded-lg"
                  >
                    <h3 class="font-medium mb-2">Generated Summary:</h3>
                    <p class="text-sm">{{ generatedSummary }}</p>
                  </div>
                </div>
              </div>
            </template>

            <!-- Step 3: Edit Details -->
            <template v-if="stepIndex === 3">
              <div class="space-y-4">
                <h2 class="text-xl font-semibold">Edit Article Details</h2>

                <FormField v-slot="{ componentField }" name="title">
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        v-bind="componentField"
                        :default-value="selectedArticle?.title || ''"
                      />
                    </FormControl>
                    <FormMessage />
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
                    <FormLabel>Generated content</FormLabel>
                    <FormControl>
                      <QuillEditor
                        content-type="html"
                        theme="snow"
                        :options="{
                          modules: {
                            toolbar: [
                              ['bold', 'italic', 'underline', 'strike'],
                              ['blockquote', 'code-block'],
                              [{ header: 1 }, { header: 2 }],
                              [{ list: 'ordered' }, { list: 'bullet' }],
                              [{ script: 'sub' }, { script: 'super' }],
                              [{ indent: '-1' }, { indent: '+1' }],
                              [{ direction: 'rtl' }],
                              [{ size: ['small', false, 'large', 'huge'] }],
                              [{ header: [1, 2, 3, 4, 5, 6, false] }],
                              [{ color: [] }, { background: [] }],
                              [{ font: [] }],
                              [{ align: [] }],
                              ['clean'],
                              ['link', 'image'],
                            ],
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
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        v-bind="componentField"
                        :default-value="selectedArticle?.urlToImage || ''"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <!-- <FormField v-slot="{ componentField }" name="publishedAt">
                  <FormItem>
                    <FormLabel>Published Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        v-bind="componentField"
                        :default-value="selectedArticle?.publishedAt || ''"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField> -->
              </div>
            </template>

            <!-- Step 4: Approve & Publish -->
            <template v-if="stepIndex === 4">
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
                      <!-- {{
                        values.publishedAt
                          ? formatDate(values.publishedAt)
                          : selectedArticle?.publishedAt
                          ? formatDate(selectedArticle.publishedAt)
                          : ""
                      }} -->
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
                v-if="stepIndex !== 4"
                :type="meta.valid ? 'button' : 'submit'"
                :disabled="
                  isNextDisabled || (stepIndex === 2 && !generatedSummary)
                "
                size="sm"
                @click="meta.valid && nextStep()"
              >
                Next
              </Button>
              <Button
                v-if="stepIndex === 4"
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
