import type { ColumnDef } from "@tanstack/vue-table";
import { h } from "vue";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SortCircle from "@/assets/icons/sort-circle.svg";
import DropdownAction from "../DropdownAction.vue";
import type { Role, UserType } from "@/models/Auth";

export function createUserTableColumns(
  handleEdit: (user: UserType) => void,
  handleDeactivate: (user: UserType) => void
): ColumnDef<UserType>[] {
  return [
    {
      id: "select",
      header: ({ table }) =>
        h(Checkbox, {
          modelValue:
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate"),
          "onUpdate:modelValue": (value) =>
            table.toggleAllPageRowsSelected(!!value),
          ariaLabel: "Select all",
        }),
      cell: ({ row }) =>
        h(Checkbox, {
          modelValue: row.getIsSelected(),
          "onUpdate:modelValue": (value) => row.toggleSelected(!!value),
          ariaLabel: "Select row",
        }),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "username",
      header: ({ column }) => {
        return h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          },
          () => ["Username", h(SortCircle, { class: "ml-2 h-4 w-4" })]
        );
      },
      cell: ({ row }) =>
        h(
          "div",
          { class: "capitalize font-medium truncate max-w-[150px]" },
          row.getValue("username")
        ),
      size: 150,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) =>
        h(
          "div",
          { class: "capitalize truncate max-w-[120px]" },
          (row.getValue("role") as Role).name
        ),
      size: 120,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          },
          () => ["Email", h(SortCircle, { class: "ml-2 h-4 w-4" })]
        );
      },
      cell: ({ row }) =>
        h(
          "div",
          { class: "lowercase truncate max-w-[200px] md:max-w-[300px]" },
          row.getValue("email")
        ),
      minSize: 150,
    },
    {
      accessorKey: "created_at",
      header: () => h("div", { class: "text-right" }, "Created at"),
      cell: ({ row }) => {
        const dateVal = row.getValue("created_at") as string;
        const date = new Date(dateVal);

        const formatted = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(date);

        return h(
          "div",
          { class: "text-right font-medium whitespace-nowrap" },
          formatted
        );
      },
      size: 110,
    },
    {
      id: "actions",
      enableHiding: false,
      size: 70,
      cell: ({ row }) => {
        const user = row.original;

        return h(DropdownAction, {
          user,
          onExpand: row.toggleExpanded,
          onEdit: handleEdit,
          onDeactivate: handleDeactivate,
        });
      },
    },
  ];
}
