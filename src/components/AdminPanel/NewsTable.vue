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
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
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
  <Dialog v-model:open="previewDialogOpen">
    <DialogContent class="w-[90vw] max-w-[625px] max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Article Preview</DialogTitle>
        <DialogDescription>
          Preview of the article before taking any action.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <h2 class="text-xl font-semibold">{{ selectedPost?.title }}</h2>
          <p class="text-sm text-muted-foreground">
            By {{ selectedPost?.author || "Unknown" }} |
            {{ selectedPost?.source_name || "Unknown Source" }} |
            {{ formatDate(selectedPost?.created_at || "") }}
          </p>
          <div v-if="selectedPost?.url_to_image" class="my-4">
            <img
              :src="selectedPost?.url_to_image"
              alt="Article image"
              class="w-full max-h-64 object-cover rounded-md"
            />
          </div>
          <p class="text-sm">{{ selectedPost?.description }}</p>
          <div class="mt-4">
            <p>{{ selectedPost?.content }}</p>
          </div>
        </div>
      </div>
      <DialogFooter class="flex-col-reverse sm:flex-row sm:gap-1 md:gap-2">
        <Button @click="previewDialogOpen = false">Close</Button>
        <Button
          v-if="selectedPost?.source_url"
          variant="outline"
          @click="openOriginalArticle"
        >
          View Original
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Edit Dialog -->
  <Dialog v-model:open="editDialogOpen">
    <DialogContent class="max-h-[85vh] md:max-w-[85vw] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Article</DialogTitle>
        <DialogDescription>
          Make changes to the article. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="title">Title</Label>
          <Input id="title" v-model="editForm.title" />
        </div>
        <div class="grid gap-2">
          <Label for="author">Author</Label>
          <Input id="author" v-model="editForm.author" />
        </div>
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="editForm.description" />
        </div>
        <div class="grid gap-2">
          <Label for="content">Content</Label>
          <Textarea id="content" v-model="editForm.content" rows="5" />
        </div>
        <div class="grid gap-2">
          <Label for="imageUrl">Image URL</Label>
          <Input id="imageUrl" v-model="editForm.url_to_image" />
        </div>
        <div class="grid gap-2">
          <Label for="source_name">Source Name</Label>
          <Input id="source_name" v-model="editForm.source_name" />
        </div>
        <div class="grid gap-2">
          <Label for="source_url">Source URL</Label>
          <Input id="source_url" v-model="editForm.source_url" />
        </div>
      </div>
      <DialogFooter class="flex-col-reverse sm:flex-row sm:gap-1 md:gap-2">
        <Button variant="outline" @click="editDialogOpen = false"
          >Cancel</Button
        >
        <Button type="submit" @click="handleSaveEdit">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Delete Dialog -->
  <Dialog v-model:open="deleteDialogOpen">
    <DialogContent class="w-[90vw] max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete Article</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this article? This action cannot be
          undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex-col-reverse sm:flex-row sm:gap-1 md:gap-2">
        <Button variant="outline" @click="deleteDialogOpen = false"
          >Cancel</Button
        >
        <Button variant="destructive" @click="handleConfirmDelete"
          >Delete</Button
        >
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type {
  ColumnDef,
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

import SortCircle from "@/assets/icons/sort-circle.svg";
import ChevronDown from "@/assets/icons/chevron-down.svg";
import ExternalLink from "@/assets/icons/external-link.svg";

import { computed, h, ref } from "vue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  patchNewsArticle,
} from "@/api/posts.ts";
import type { NewPostType, Post, FetchPostsType } from "@/models/Posts";

import { useQueryClient } from "@tanstack/vue-query";

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
  mutationFn: async (postId: number) => {
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
    postId: number;
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

const tableData = computed(() => data.value?.data ?? []);

// State for dialogs
const previewDialogOpen = ref(false);
const editDialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const selectedPost = ref<Post | null>(null);
const editForm = ref<Partial<Post>>({});

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
  editForm.value = { ...post };
  editDialogOpen.value = true;
}

function handleSaveEdit() {
  updatePost({
    postId: selectedPost.value?.id || 0,
    article: {
      title: editForm.value.title || "",
      author: editForm.value.author || "",
      description: editForm.value.description || "",
      url_to_image: editForm.value.url_to_image || "",
      source_name: editForm.value.source_name || "",
      source_url: editForm.value.source_url || "",
      content: editForm.value.content || "",
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
    deletePost(selectedPost.value.id);
  }
  deleteDialogOpen.value = false;
}

const ActionsDropdown = ({ row }: { row: { original: Post } }) => {
  const post = row.original;

  return h(
    DropdownMenu,
    { class: "text-end" },
    {
      default: () => [
        h(
          DropdownMenuTrigger,
          { asChild: true, class: "bg-gray-100 cursor-pointer float-end" },
          {
            default: () =>
              h(
                Button,
                { variant: "ghost", class: "h-8 w-8 p-0" },
                {
                  default: () => [
                    h("span", { class: "sr-only" }, "Open menu"),
                    h(ChevronDown, { class: "h-4 w-4" }),
                  ],
                }
              ),
          }
        ),
        h(
          DropdownMenuContent,
          { align: "end", class: "w-48 text-center" },
          {
            default: () => [
              h(
                DropdownMenuItem,
                {
                  onClick: () => handlePreview(post),
                  class: "flex items-center",
                },
                { default: () => "Preview" }
              ),
              h(
                DropdownMenuItem,
                {
                  onClick: () => window.open(`/post/${post.id}`, "_blank"),
                  class: "flex items-center justify-between",
                },
                {
                  default: () => [
                    "Open in new tab",
                    h(ExternalLink, { class: "h-3 w-3 ml-1" }),
                  ],
                }
              ),
              h(
                DropdownMenuItem,
                { onClick: () => handleEdit(post), class: "flex items-center" },
                { default: () => "Edit" }
              ),
              h(DropdownMenuSeparator),
              h(
                DropdownMenuItem,
                {
                  onClick: () => handleDelete(post),
                  class:
                    "text-destructive focus:text-destructive flex items-center",
                },
                { default: () => "Delete" }
              ),
            ],
          }
        ),
      ],
    }
  );
};

// Define the columns for the table
const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => h("div", {}, row.getValue("id")),
    size: 60,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Title", h(SortCircle, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) =>
      h(
        "div",
        {
          class:
            "font-medium truncate max-w-[200px] md:max-w-[300px] lg:max-w-xs",
        },
        row.getValue("title")
      ),
    minSize: 150,
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) =>
      h(
        "div",
        { class: "capitalize truncate max-w-[120px]" },
        row.getValue("author") || "Unknown"
      ),
    size: 120,
  },
  {
    accessorKey: "source_name",
    header: "Source",
    cell: ({ row }) =>
      h(
        "div",
        { class: "truncate max-w-[120px]" },
        row.getValue("source_name") || "Unknown"
      ),
    size: 120,
  },
  {
    accessorKey: "created_at",
    header: () => h("div", { class: "text-right" }, "Date"),
    cell: ({ row }) => {
      const dateVal = row.getValue("created_at") as string;
      return h(
        "div",
        { class: "text-right font-medium whitespace-nowrap" },
        formatDate(dateVal)
      );
    },
    size: 110,
  },
  {
    id: "actions",
    cell: ({ row }) => ActionsDropdown({ row }),
    enableHiding: false,
    size: 70,
  },
];

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});

const table = useVueTable({
  data: tableData,
  columns,
  getCoreRowModel: getCoreRowModel(),
  // Remove client-side pagination as we're using server-side pagination
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  manualPagination: true, // Tell the table we're handling pagination manually
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
