<template>
  <!-- Step 1: Select Article -->
  <!-- TEMPORARYLY NOT NEEDED -->
  <!-- <template v-if="stepIndex === 1">
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Select a News Article</h2>

      <div v-if="isLoadingNews" class="flex justify-center py-8">
        <component :is="LoaderIcon" class="size-8 animate-spin" />
        <span class="ml-2">Loading articles...</span>
      </div>

      <FormField v-slot="{ componentField }" name="selectedArticleIndex">
        <FormItem>
          <FormControl>
            <div
              class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <Card
                v-for="(article, index) in articles"
                :key="index"
                class="cursor-pointer transition-all hover:shadow-md pt-0"
                :class="[selectedArticle === article && 'ring-2 ring-primary']"
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
                    {{ article.description || "No description available." }}
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
  </template> -->

  <!-- Step 2: Generate Summary -->
  <!-- TEMPORARILY NOT NEEDED -->
  <!-- <template v-if="stepIndex === 2">
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Generate AI Summary</h2>

      <div class="space-y-2">
        <Button
          type="button"
          :disabled="summaryMutation.isPending.value || !selectedArticle"
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

        <div v-if="generatedSummary.length" class="p-4 bg-muted rounded-lg">
          <h3 class="font-medium mb-2">Generated Summary:</h3>
          <p class="text-sm">{{ generatedSummary }}</p>
        </div>
      </div>
    </div>
  </template> -->
  <div></div>
</template>
<script>
// const { data: newsData, isLoading: isLoadingNews } = useQuery<{
//   data: NewsApiResponse;
// }>({
//   queryKey: ["newsApiData"],
//   queryFn: fetchNewsApi,
//   refetchOnWindowFocus: false,
//   refetchOnMount: false,
// });

// function handleArticleSelect(index: number) {
//   selectedArticle.value = articles.value[index];
// }

// function handleGenerateSummary() {
//   if (selectedArticle.value?.url) {
//     generatedSummary.value = "";
//     summaryMutation.mutate(selectedArticle.value.url);
//   } else {
//     toast.error("No article selected or missing URL.");
//   }
// }

// Summary generation mutation
// const summaryMutation = useMutation({
//   mutationFn: async (articleUrl: string) => {
//     const summary = await generateSummary(articleUrl);
//     return summary;
//   },
//   onSuccess: (data) => {
//     generatedSummary.value = data;
//     form.setFieldValue("content", data);
//     toast.success("Summary generated successfully!");
//   },
//   onError: () => {
//     toast.error("Failed to generate summary");
//   },
// });
// const articles = computed(() => newsData.value?.data.articles ?? []);
</script>
