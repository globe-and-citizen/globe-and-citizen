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
                      v-if="opinionsLoading"
                      class="flex justify-center items-center py-4"
                    >
                      <div
                        class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"
                      ></div>
                    </div>

                    <!-- No opinions -->
                    <div
                      v-else-if="opinions.length === 0"
                      class="text-center py-4 text-gray-500"
                    >
                      No related opinions found.
                    </div>

                    <!-- Opinions table -->
                    <div v-else class="border rounded-md bg-white">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-100">
                          <tr>
                            <th
                              class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Title
                            </th>
                            <th
                              class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Author
                            </th>
                            <th
                              class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date
                            </th>
                            <th
                              class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr
                            v-for="opinion in opinions"
                            :key="opinion.id"
                            class="hover:bg-gray-50"
                          >
                            <td class="px-3 py-2 whitespace-nowrap">
                              <div
                                class="truncate max-w-[200px] md:max-w-[300px] lg:max-w-xs"
                              >
                                {{ opinion.title }}
                              </div>
                            </td>
                            <td class="px-3 py-2 whitespace-nowrap">
                              {{ opinion.author || "Unknown" }}
                            </td>
                            <td class="px-3 py-2 whitespace-nowrap">
                              {{ formatDate(opinion.created_at) }}
                            </td>
                            <td
                              class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium"
                            >
                              <div class="flex space-x-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  class="h-8 w-8 p-0"
                                  @click="handleOpinionPreview(opinion)"
                                >
                                  <span class="sr-only">Preview</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  >
                                    <path
                                      d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                                    />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  class="h-8 w-8 p-0"
                                  @click="handleOpinionEdit(opinion)"
                                >
                                  <span class="sr-only">Edit</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  >
                                    <path
                                      d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
                                    />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  class="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  @click="handleOpinionDelete(opinion)"
                                >
                                  <span class="sr-only">Delete</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  >
                                    <path d="M3 6h18" />
                                    <path
                                      d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                                    />
                                    <path
                                      d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                                    />
                                  </svg>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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
  <Dialog v-model:open="previewDialogOpen">
    <DialogContent
      class="max-h-[85vh] overflow-y-auto no-scrollbar max-w-max w-[90vw]"
    >
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
          <div
            className="ql-editor mt-4 !h-fit"
            v-html="sanitizedContent"
          ></div>
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
    <DialogContent
      class="max-h-[95vh] md:max-w-[80vw] overflow-y-auto no-scrollbar"
    >
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
          <Label for="slug">Slug</Label>
          <Input id="slug" v-model="editForm.slug" />
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
          <QuillEditor
            id="content"
            content-type="html"
            theme="snow"
            style="min-height: 200px"
            :content="editForm.content || ''"
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
            @update:content="(content) => (editForm.content = content)"
          />
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

  <!-- Opinion View Dialog -->
  <Dialog v-model:open="opinionViewDialogOpen">
    <DialogContent
      class="max-h-[85vh] overflow-y-auto no-scrollbar max-w-max w-[90vw]"
    >
      <DialogHeader>
        <DialogTitle>Opinion Preview</DialogTitle>
        <DialogDescription>
          Full details of the selected opinion.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <h2 class="text-xl font-semibold">{{ selectedOpinion?.title }}</h2>
          <p class="text-sm text-muted-foreground">
            By {{ selectedOpinion?.author || "Unknown" }} |
            {{ formatDate(selectedOpinion?.created_at || "") }}
          </p>
          <div v-if="selectedOpinion?.url_to_image" class="my-4">
            <img
              :src="selectedOpinion?.url_to_image"
              alt="Opinion image"
              class="w-full max-h-64 object-cover rounded-md"
            />
          </div>
          <p class="text-sm">{{ selectedOpinion?.description }}</p>
          <div
            className="ql-editor mt-4 !h-fit"
            v-html="sanitizeContent(selectedOpinion?.content)"
          ></div>
        </div>
      </div>
      <DialogFooter>
        <Button @click="opinionViewDialogOpen = false">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Opinion Edit Dialog -->
  <Dialog v-model:open="opinionEditDialogOpen">
    <DialogContent
      class="max-h-[95vh] md:max-w-[80vw] overflow-y-auto no-scrollbar"
    >
      <DialogHeader>
        <DialogTitle>Edit Opinion</DialogTitle>
        <DialogDescription>
          Make changes to the opinion. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="title">Title</Label>
          <Input id="title" v-model="opinionEditForm.title" />
        </div>
        <div class="grid gap-2">
          <Label for="slug">Slug</Label>
          <Input id="slug" v-model="opinionEditForm.slug" />
        </div>
        <div class="grid gap-2">
          <Label for="author">Author</Label>
          <Input id="author" v-model="opinionEditForm.author" />
        </div>
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="opinionEditForm.description" />
        </div>
        <div class="grid gap-2">
          <Label for="content">Content</Label>
          <QuillEditor
            id="content"
            content-type="html"
            theme="snow"
            style="min-height: 200px"
            :content="opinionEditForm.content || ''"
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
            @update:content="(content) => (opinionEditForm.content = content)"
          />
        </div>
        <div class="grid gap-2">
          <Label for="imageUrl">Image URL</Label>
          <Input id="imageUrl" v-model="opinionEditForm.url_to_image" />
        </div>
      </div>
      <DialogFooter class="flex-col-reverse sm:flex-row sm:gap-1 md:gap-2">
        <Button variant="outline" @click="opinionEditDialogOpen = false"
          >Cancel</Button
        >
        <Button type="submit" @click="handleSaveOpinionEdit"
          >Save changes</Button
        >
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Opinion Delete Dialog -->
  <Dialog v-model:open="opinionDeleteDialogOpen">
    <DialogContent class="w-[90vw] max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete Opinion</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this opinion? This action cannot be
          undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex-col-reverse sm:flex-row sm:gap-1 md:gap-2">
        <Button variant="outline" @click="opinionDeleteDialogOpen = false"
          >Cancel</Button
        >
        <Button variant="destructive" @click="handleConfirmOpinionDelete"
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
import ChevronRight from "@/assets/icons/chevron-right.svg";
import ExternalLink from "@/assets/icons/external-link.svg";

import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

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
  fetchPostById,
  patchNewsArticle,
} from "@/api/posts.ts";
import type { NewPostType, Post, FetchPostsType } from "@/models/Posts";
import "@/quill.css";

import { useQueryClient } from "@tanstack/vue-query";
import DOMPurify from "dompurify";
import { patchOpinion, type OpinionPatchPayload } from "@/api/opinions";

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

// State for expandable rows and opinions
const expandedRowId = ref<number | null>(null);
const opinionsLoading = ref(false);
const opinions = ref<Post[]>([]);
const selectedOpinion = ref<Post | null>(null);
const opinionViewDialogOpen = ref(false);
const opinionEditDialogOpen = ref(false);
const opinionDeleteDialogOpen = ref(false);
const opinionEditForm = ref<Partial<Post>>({});

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

const sanitizedContent = computed(() => {
  if (!selectedPost.value || !selectedPost.value.content) return "";
  return DOMPurify.sanitize(selectedPost.value.content);
});

// Helper function to sanitize HTML content
function sanitizeContent(content: string | undefined): string {
  if (!content) return "";
  return DOMPurify.sanitize(content);
}

function handleSaveEdit() {
  updatePost({
    postId: selectedPost.value?.slug || "",
    article: {
      title: editForm.value.title || "",
      slug: editForm.value.slug || "",
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
    deletePost(selectedPost.value.slug);
  }
  deleteDialogOpen.value = false;
}

// Function to toggle row expansion and load opinions
async function toggleRowExpansion(rowId: number) {
  if (expandedRowId.value === rowId) {
    expandedRowId.value = null;
  } else {
    expandedRowId.value = rowId;
    await loadOpinions(rowId);
  }
}

// Function to load opinions for a news article
async function loadOpinions(postId: number) {
  try {
    opinionsLoading.value = true;
    const post = tableData.value.find((post) => post.id === postId);

    if (!post) return;

    const postWithEntries = await fetchPostById(post.slug);

    if (postWithEntries && Array.isArray(postWithEntries.entries)) {
      opinions.value = postWithEntries.entries;
    } else {
      opinions.value = [];
    }
  } catch (error) {
    console.error("Error loading opinions:", error);
    opinions.value = [];
  } finally {
    opinionsLoading.value = false;
  }
}

// Opinion actions
function handleOpinionPreview(opinion: Post) {
  selectedOpinion.value = opinion;
  opinionViewDialogOpen.value = true;
}

function handleOpinionEdit(opinion: Post) {
  selectedOpinion.value = opinion;
  opinionEditForm.value = { ...opinion };
  opinionEditDialogOpen.value = true;
}

function handleOpinionDelete(opinion: Post) {
  selectedOpinion.value = opinion;
  opinionDeleteDialogOpen.value = true;
}

function handleSaveOpinionEdit() {
  updateOpinion({
    opinionId: selectedOpinion.value?.slug || "",
    opinion: {
      title: opinionEditForm.value.title || "",
      author: opinionEditForm.value.author || "",
      url_to_image: opinionEditForm.value.url_to_image || "",
      content: opinionEditForm.value.content || "",
    },
  });
  opinionEditDialogOpen.value = false;

  // Refresh opinions
  if (expandedRowId.value !== null) {
    loadOpinions(expandedRowId.value);
  }
}

function handleConfirmOpinionDelete() {
  if (selectedOpinion.value) {
    deletePost(selectedOpinion.value.slug);
  }
  opinionDeleteDialogOpen.value = false;

  // Refresh opinions
  if (expandedRowId.value !== null) {
    loadOpinions(expandedRowId.value);
  }
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
                  onClick: () => window.open(`/post/${post.slug}`, "_blank"),
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
    id: "expander",
    header: "",
    cell: ({ row }) => {
      const post = row.original;
      return h(
        Button,
        {
          variant: "ghost",
          class: "p-0 h-8 w-8",
          onClick: () => toggleRowExpansion(post.id),
        },
        () => [
          h(expandedRowId.value === post.id ? ChevronDown : ChevronRight, {
            class: "h-4 w-4",
          }),
        ]
      );
    },
    enableHiding: false,
    size: 40,
  },
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
