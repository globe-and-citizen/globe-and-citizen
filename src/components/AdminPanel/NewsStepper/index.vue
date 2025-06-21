<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { Check, Circle, Dot, Loader2 } from "lucide-vue-next";
import { ref, computed, watchEffect } from "vue";

import { useQuery, useMutation } from "@tanstack/vue-query";
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
    toast.success("Summary generated successfully!");
  },
  onError: () => {
    toast.error("Failed to generate summary");
  },
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function onSubmit(values: Record<string, unknown>) {
  console.log(values);
  if (stepIndex.value === 4 && selectedArticle.value) {
    // Create a new object with only the properties we want
    const finalData = {
      title: selectedArticle.value.title || "Untitled Article",
      content: generatedSummary.value,
      categories: ["news"],
      is_external: true,
      source_url: selectedArticle.value.url || "",
      source_name: selectedArticle.value.source?.name || "",
      url_to_image: selectedArticle.value.urlToImage || "",
      author: selectedArticle.value.author ?? "Unknown",
      description: selectedArticle.value.description ?? "",
    };
    publishMutation.mutate(finalData);
  }
}

function handleArticleSelect(index: number) {
  selectedArticle.value = articles.value[index];
}

function handleGenerateSummary() {
  if (selectedArticle.value?.url) {
    summaryMutation.mutate(selectedArticle.value.url);
  }
}

const { setValues } = useForm();
watchEffect(() => {
  if (stepIndex.value === 3 && selectedArticle.value) {
    setValues({
      title: selectedArticle.value.title || "",
      description: selectedArticle.value.description || "",
      content: generatedSummary.value || selectedArticle.value.content || "",
      author: selectedArticle.value.author || "Unknown",
      source: selectedArticle.value.source?.name || "Unknown",
      imageUrl: selectedArticle.value.urlToImage || "",
      // publishedAt: selectedArticle.value.publishedAt
      //   ? new Date(selectedArticle.value.publishedAt).toISOString().slice(0, 16)
      //   : "",
    });
  }
});

const form = useForm({
  validationSchema: toTypedSchema(formSchema[stepIndex.value - 1]),
});

console.log(generatedSummary.value);
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
                  <Check v-if="state === 'completed'" class="size-5" />
                  <Circle v-if="state === 'active'" />
                  <Dot v-if="state === 'inactive'" />
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
                  <Loader2 class="size-8 animate-spin" />
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
                    <Loader2
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
                      <Textarea
                        v-bind="componentField"
                        rows="6"
                        :default-value="generatedSummary || ''"
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
                <h2 class="text-xl font-semibold">Review & Approve</h2>

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
                    <p class="text-sm">
                      {{ generatedSummary }}
                    </p>
                  </CardContent>
                </Card>

                <FormField v-slot="{ value, handleChange }" name="approved">
                  <FormItem
                    class="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <input
                        type="checkbox"
                        :checked="!!value"
                        class="mt-1"
                        @change="
                          handleChange(
                            $event.target && 'checked' in $event.target
                              ? ($event.target as HTMLInputElement).checked
                              : false
                          )
                        "
                      />
                    </FormControl>
                    <div class="space-y-1 leading-none">
                      <FormLabel class="text-sm font-medium">
                        I approve this article for publication
                      </FormLabel>
                      <p class="text-xs text-muted-foreground">
                        This will save the article to the database and publish
                        it on the website.
                      </p>
                    </div>
                  </FormItem>
                  <FormMessage />
                </FormField>
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
                <Loader2
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
</style>
