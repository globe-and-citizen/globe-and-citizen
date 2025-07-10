import { h } from "vue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChevronDown from "@/assets/icons/chevron-down.svg";
import ExternalLink from "@/assets/icons/external-link.svg";
import type { Post } from "@/models/Posts";

interface ActionsDropdownProps {
  row: { original: Post };
  onPreview: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

export const ActionsDropdown = ({
  row,
  onPreview,
  onEdit,
  onDelete,
}: ActionsDropdownProps) => {
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
                  onClick: () => onPreview(post),
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
                { onClick: () => onEdit(post), class: "flex items-center" },
                { default: () => "Edit" }
              ),
              h(DropdownMenuSeparator),
              h(
                DropdownMenuItem,
                {
                  onClick: () => onDelete(post),
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
