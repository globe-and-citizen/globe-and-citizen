<template>
  <div class="w-full max-w-full">
    <h1 class="text-2xl font-bold mb-4 uppercase">News Articles</h1>

    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-3"
    >
      <Input
        class="w-full sm:max-w-sm"
        placeholder="Filter by title..."
        :model-value="table.getColumn('title')?.getFilterValue() as string"
        @update:model-value="table.getColumn('title')?.setFilterValue($event)"
      />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            Columns <component :is="ChevronDown" class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            v-for="column in table
              .getAllColumns()
              .filter((column) => column.getCanHide())"
            :key="column.id"
            class="capitalize"
            :model-value="column.getIsVisible()"
            @update:model-value="
              (value) => {
                column.toggleVisibility(!!value);
              }
            "
          >
            {{ column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="rounded-md border overflow-x-auto">
      <Table class="">
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow>
              <TableCell :colspan="columns.length" class="h-24 text-center">
                <div class="flex justify-center items-center">
                  Loading articles...
                </div>
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="table.getRowModel().rows?.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <!-- Regular row -->
              <TableRow :data-state="row.getIsSelected() && 'selected'">
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </TableCell>
              </TableRow>

              <!-- Expanded opinion section -->
              <TableRow v-if="expandedRowId === row.original.id">
                <TableCell :colspan="columns.length" class="p-0 border-t-0">
                  <div class="bg-gray-50 p-4 rounded-md my-2">
                    <h3 class="text-lg font-semibold mb-3">Related Opinions</h3>

                    <!-- Loading state -->
                    <div
                      v-if="isOpinionLoading"
                      class="flex justify-center items-center py-4"
                    >
                      <div
                        class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"
                      ></div>
                    </div>

                    <!-- No opinions -->
                    <div
                      v-else-if="
                        !opinionsByPostId?.entries ||
                        opinionsByPostId.entries.length === 0
                      "
                      class="text-center py-4 text-gray-500"
                    >
                      No related opinions found.
                    </div>

                    <!-- Opinions table -->
                    <OpinionsTable
                      v-else
                      :opinions="opinionsByPostId.entries"
                      @preview="handleOpinionPreview"
                      @edit="handleOpinionEdit"
                      @delete="handleOpinionDelete"
                    />
                  </div>
                </TableCell>
              </TableRow>
            </template>
          </template>
          <TableRow v-else>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>

  <div
    class="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 py-4"
  >
    <div class="text-sm text-muted-foreground">
      {{ table.getFilteredSelectedRowModel().rows.length }} of
      {{ table.getFilteredRowModel().rows.length }} row(s) selected.
    </div>
    <div class="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="isLoading || currentPage === 1"
        @click="currentPage--"
      >
        Previous
      </Button>
      <span class="text-sm mx-2"> Page {{ currentPage }} </span>
      <Button
        variant="outline"
        size="sm"
        :disabled="isLoading || (data?.data && data.data.length < pageSize)"
        @click="currentPage++"
      >
        Next
      </Button>
    </div>
  </div>

  <!-- Preview Dialog -->
  <PreviewDialog
    :is-open="previewDialogOpen"
    :post="selectedPost"
    @close="previewDialogOpen = false"
    @view-original="openOriginalArticle"
  />

  <!-- Edit Dialog -->
  <EditDialog
    :is-open="editDialogOpen"
    :post="selectedPost"
    @close="editDialogOpen = false"
    @save="handleSaveEdit"
  />

  <!-- Delete Dialog -->
  <DeleteDialog
    :is-open="deleteDialogOpen"
    item-type="Article"
    @close="deleteDialogOpen = false"
    @confirm="handleConfirmDelete"
  />

  <!-- Opinion View Dialog -->
  <OpinionViewDialog
    :is-open="opinionViewDialogOpen"
    :opinion="selectedOpinion"
    @close="opinionViewDialogOpen = false"
  />

  <!-- Opinion Edit Dialog -->
  <OpinionEditDialog
    :is-open="opinionEditDialogOpen"
    :opinion="selectedOpinion"
    @close="opinionEditDialogOpen = false"
    @save="handleSaveOpinionEdit"
  />

  <!-- Opinion Delete Dialog -->
  <DeleteDialog
    :is-open="opinionDeleteDialogOpen"
    item-type="Opinion"
    @close="opinionDeleteDialogOpen = false"
    @confirm="handleConfirmOpinionDelete"
  />
</template>

<script setup lang="ts">
import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";

import ChevronDown from "@/assets/icons/chevron-down.svg";

import { computed, ref } from "vue";
import { Button } from "@/components/ui/button";
import OpinionsTable from "./OpinionsTable.vue";
import PreviewDialog from "./PreviewDialog.vue";
import EditDialog from "./EditDialog.vue";
import DeleteDialog from "./DeleteDialog.vue";
import OpinionViewDialog from "./OpinionViewDialog.vue";
import OpinionEditDialog from "./OpinionEditDialog.vue";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createTableColumns } from "./utils/tableColumns";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { valueUpdater } from "@/components/ui/table/utils.ts";
import { useMutation, useQuery } from "@tanstack/vue-query";
import {
  deleteNewsArticle,
  fetchAllPosts,
  fetchPostById,
  patchNewsArticle,
} from "@/api/posts.ts";
import type { NewPostType, Post, FetchPostsType } from "@/models/Posts";
import "@/quill.css";

import { useQueryClient } from "@tanstack/vue-query";
import { deleteOpinion, patchOpinion } from "@/api/opinions";
import type { OpinionPatchPayload } from "@/models/Opinions";

const queryClient = useQueryClient();

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);

const { data, isLoading } = useQuery<FetchPostsType>({
  queryKey: ["allPosts", currentPage, pageSize],
  queryFn: () => fetchAllPosts(pageSize.value, currentPage.value),
  refetchOnWindowFocus: true,
});

const { mutate: deletePost } = useMutation({
  mutationFn: async (postId: string) => {
    await deleteNewsArticle(postId);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["allPosts"] });
  },
  onError: (error) => {
    console.error("Failed to delete post:", error);
  },
});

const { mutate: updatePost } = useMutation({
  mutationFn: async ({
    postId,
    article,
  }: {
    postId: string;
    article: Partial<NewPostType>;
  }) => {
    await patchNewsArticle(postId, article);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["allPosts"] });
  },
  onError: (error) => {
    console.error("Failed to update post:", error);
  },
});

const { mutate: updateOpinion } = useMutation({
  mutationFn: async (payload: OpinionPatchPayload) => {
    await patchOpinion(payload);
  },
  onSuccess: () => {
    // Invalidate the specific post query to refresh the post and its opinions
    const postSlug = tableData.value.find(
      (post) => post.id === expandedRowId.value
    )?.slug;
    if (postSlug) {
      queryClient.invalidateQueries({
        queryKey: ["post", postSlug],
      });
    }
    // Also invalidate all posts to ensure consistent data
    queryClient.invalidateQueries({
      queryKey: ["allPosts"],
    });
  },
  onError: (error) => {
    console.error("Failed to update opinion:", error);
  },
});

const { mutate: deleteOpinionMutation } = useMutation({
  mutationFn: async (opinionId: string) => {
    await deleteOpinion(opinionId);
  },
  onSuccess: () => {
    // Invalidate the specific post query to refresh the post and its opinions
    const postSlug = tableData.value.find(
      (post) => post.id === expandedRowId.value
    )?.slug;
    if (postSlug) {
      queryClient.invalidateQueries({
        queryKey: ["post", postSlug],
      });
    }
    // Also invalidate all posts to ensure consistent data
    queryClient.invalidateQueries({
      queryKey: ["allPosts"],
    });
  },
  onError: (error) => {
    console.error("Failed to delete opinion:", error);
  },
});

const tableData = computed(() => data.value?.data ?? []);

// State for dialogs
const previewDialogOpen = ref(false);
const editDialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const selectedPost = ref<Post | null>(null);

// State for expandable rows
const expandedRowId = ref<number | null>(null);
const selectedOpinion = ref<Post | null>(null);
const opinionViewDialogOpen = ref(false);
const opinionEditDialogOpen = ref(false);
const opinionDeleteDialogOpen = ref(false);

// Function to format date
function formatDate(dateString: string): string {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

// Query for opinions by post ID
const { data: opinionsByPostId, isLoading: isOpinionLoading } = useQuery({
  queryKey: [
    "post",
    computed(() => {
      const post = tableData.value.find(
        (post) => post.id === expandedRowId.value
      );
      return post?.slug;
    }),
  ],
  queryFn: async ({ queryKey }) => {
    const [, postSlug] = queryKey;
    if (!postSlug) return null;
    return fetchPostById(postSlug);
  },
  enabled: computed(() => {
    const post = tableData.value.find(
      (post) => post.id === expandedRowId.value
    );
    return !!post?.slug;
  }),
  refetchOnWindowFocus: true,
});

// Function to open original article in new tab
function openOriginalArticle() {
  if (selectedPost.value?.source_url) {
    window.open(selectedPost.value.source_url, "_blank");
  }
}

// Function to handle preview action
function handlePreview(post: Post) {
  selectedPost.value = post;
  previewDialogOpen.value = true;
}

// Function to handle edit action
function handleEdit(post: Post) {
  selectedPost.value = post;
  editDialogOpen.value = true;
}

function handleSaveEdit(formData: Partial<Post>) {
  updatePost({
    postId: selectedPost.value?.slug || "",
    article: {
      title: formData.title || "",
      slug: formData.slug || "",
      author: formData.author || "",
      description: formData.description || "",
      url_to_image: formData.url_to_image || "",
      source_name: formData.source_name || "",
      source_url: formData.source_url || "",
      content: formData.content || "",
    },
  });
  editDialogOpen.value = false;
}

function handleDelete(post: Post) {
  selectedPost.value = post;
  deleteDialogOpen.value = true;
}

function handleConfirmDelete() {
  if (selectedPost.value) {
    deletePost(selectedPost.value.slug);
  }
  deleteDialogOpen.value = false;
}

// Function to toggle row expansion
function toggleRowExpansion(rowId: number) {
  if (expandedRowId.value === rowId) {
    expandedRowId.value = null;
  } else {
    expandedRowId.value = rowId;
  }
}

// Opinion actions
function handleOpinionPreview(opinion: Post) {
  selectedOpinion.value = opinion;
  opinionViewDialogOpen.value = true;
}

function handleOpinionEdit(opinion: Post) {
  selectedOpinion.value = opinion;
  opinionEditDialogOpen.value = true;
}

function handleOpinionDelete(opinion: Post) {
  selectedOpinion.value = opinion;
  opinionDeleteDialogOpen.value = true;
}

function handleSaveOpinionEdit(formData: Partial<Post>) {
  updateOpinion({
    opinionId: selectedOpinion.value?.slug || "",
    opinion: {
      title: formData.title || "",
      url_to_image: formData.url_to_image || "",
      content: formData.content || "",
    },
  });
  opinionEditDialogOpen.value = false;
}

function handleConfirmOpinionDelete() {
  if (selectedOpinion.value) {
    deleteOpinionMutation(selectedOpinion.value.slug);
  }
  opinionDeleteDialogOpen.value = false;
}

// Define the columns for the table
const columns = createTableColumns({
  expandedRowId,
  toggleRowExpansion,
  formatDate,
  handlePreview,
  handleEdit,
  handleDelete,
});

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});

const table = useVueTable({
  data: tableData,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  manualPagination: true,
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, rowSelection),
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
  },
});
</script>
