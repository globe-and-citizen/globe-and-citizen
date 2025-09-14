import { h } from "vue";
import { useRouter } from "vue-router"; // Import useRouter
import type { ColumnDef } from "@tanstack/vue-table";
import { Button } from "@/components/ui/button";
import SortCircle from "@/assets/icons/sort-circle.svg";
import ChevronDown from "@/assets/icons/chevron-down.svg";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import { ActionsDropdown } from "./tableActions";
import type { Post } from "@/models/Posts";
import type { Ref } from "vue";

interface ColumnConfigOptions {
  expandedRowId: Ref<number | null>;
  toggleRowExpansion: (rowId: number) => void;
  formatDate: (dateString: string) => string;
  handlePreview: (post: Post) => void;
  handleEdit: (post: Post) => void;
  handleDelete: (post: Post) => void;
}

export const createTableColumns = ({
  expandedRowId,
  toggleRowExpansion,
  formatDate,
  handlePreview,
  handleEdit,
  handleDelete,
}: ColumnConfigOptions): ColumnDef<Post>[] => {
  const router = useRouter(); // Initialize the router

  return [
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
      header: () => {
        return h("div", { class: "flex items-center" }, () => [
          "Title",
          h(SortCircle, { class: "ml-2 h-4 w-4" }),
        ]);
      },
      cell: ({ row }) => {
        const post = row.original;
        return h(
          "div",
          {
            class:
              "font-medium truncate max-w-[200px] md:max-w-[300px] lg:max-w-xs cursor-pointer",
            onClick: () => {
              // Navigate to the post's title page using the slug
              router.push({ name: "PostView", params: { id: post.slug } });
            },
          },
          row.getValue("title")
        );
      },
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
      cell: ({ row }) =>
        ActionsDropdown({
          row,
          onPreview: handlePreview,
          onEdit: handleEdit,
          onDelete: handleDelete,
        }),
      enableHiding: false,
      size: 70,
    },
  ];
};
