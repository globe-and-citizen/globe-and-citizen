<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Review & Publish</h2>

    <Card class="pt-0">
      <img
        v-if="reviewData.imageUrl"
        :src="reviewData.imageUrl"
        alt="Article image"
        class="w-full h-48 object-cover rounded-t-lg"
      />
      <CardHeader>
        <CardTitle>{{ reviewData.title }}</CardTitle>
        <CardDescription>
          By: {{ reviewData.author }} | Source:
          {{ reviewData.source || "Unknown" }}
        </CardDescription>
        <div class="text-xs text-muted-foreground mt-1">
          <span class="font-medium">Slug:</span> {{ reviewData.slug }}
        </div>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-muted-foreground mb-2">
          {{ reviewData.description }}
        </p>
        <div
          class="ql-editor text-sm prose prose-sm max-w-none"
          v-html="reviewData.content"
        ></div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
// reviewData props
defineProps<{
  reviewData: {
    title?: string | undefined;
    description?: string | undefined;
    content?: string | undefined;
    imageUrl?: string | undefined;
    author?: string | undefined;
    source?: string | undefined;
    slug?: string | undefined;
  };
}>();
</script>
