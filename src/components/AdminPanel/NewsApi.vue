<!-- <template>
  <div class="w-full">
    <h1 class="text-2xl font-bold mb-4 uppercase">News-Api latest posts</h1>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Card
        v-for="(article, index) in tableData"
        :key="index"
        class="flex flex-col justify-between h-full overflow-hidden pt-0"
      >
        <!-- Article Image -->
        <img
          v-if="article.urlToImage"
          :src="article.urlToImage"
          alt="Article image"
          class="w-full h-48 object-cover"
        />
        <div
          v-else
          class="w-full h-48 bg-gray-200 flex items-center justify-center text-sm text-gray-500"
        >
          No Image Available
        </div>

        <!-- Card Content -->
        <CardHeader>
          <CardTitle class="text-lg line-clamp-2">
            {{ article.title }}
          </CardTitle>
          <CardDescription class="text-sm text-muted-foreground line-clamp-3">
            {{ article.description || "No description available." }}
          </CardDescription>
        </CardHeader>

        <CardContent class="mt-auto space-y-2 text-sm text-muted-foreground">
          <p><strong>Author:</strong> {{ article.author || "Unknown" }}</p>
          <p>
            <strong>Source:</strong> {{ article.source?.name || "Unknown" }}
          </p>
          <p>
            <strong>Published:</strong> {{ formatDate(article.publishedAt) }}
          </p>
        </CardContent>

        <CardFooter>
          <a
            :href="article.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:underline"
          >
            Read more
          </a>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { fetchNewsApi } from "@/api/news.ts";
import type { NewsApiResponse } from "@/models/News";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const { data } = useQuery<{ data: NewsApiResponse }>({
  queryKey: ["newsApiData"],
  queryFn: fetchNewsApi,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});
const tableData = computed(() => data.value?.data.articles ?? []);

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
</script> -->
