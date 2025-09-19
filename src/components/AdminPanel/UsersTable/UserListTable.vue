<template>
  <div class="w-full max-w-full">
    <h1 class="text-2xl font-bold mb-4 uppercase">User management</h1>

    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-3"
    >
      <Input
        class="w-full sm:max-w-sm"
        placeholder="Filter by email..."
        :model-value="table.getColumn('email')?.getFilterValue() as string"
        @update:model-value="handleSearch as any"
      />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            Columns <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            v-for="column in table
              .getAllColumns()
              .filter((column: any) => column.getCanHide())"
            :key="column.id"
            class="capitalize"
            :model-value="column.getIsVisible()"
            @update:model-value="
              (value: boolean) => {
                column.toggleVisibility(!!value);
              }
            "
          >
            {{ column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="rounded-md border overflow-hidden">
      <div class="w-full overflow-x-auto">
        <Table class="min-w-full">
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
            <template v-if="table.getRowModel().rows?.length">
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
        <span class="text-sm mx-2">
          Page {{ currentPage }} of
          {{ Math.ceil((data?.data.totalCount ?? 0) / pageSize) }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="
            isLoading ||
            (data?.data && data.data.totalCount / pageSize < currentPage)
          "
          @click="currentPage++"
        >
          Next
        </Button>
      </div>
    </div>

    <!-- Edit User Dialog -->
    <Dialog v-model:open="editDialogOpen">
      <DialogContent
        class="w-[90vw] max-w-[625px] max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to the user details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="editForm.email" />
          </div>
          <!-- BIO UPDATE -->
          <div class="grid gap-2">
            <Label for="bio">Bio</Label>
            <Input
              id="bio"
              v-model="editForm.bio"
              placeholder="Enter user bio (optional)"
            />
          </div>
          <div class="grid gap-2">
            <Label for="profile_picture_url">Profile Picture URL</Label>
            <Input
              id="profile_picture_url"
              v-model="editForm.profile_picture_url"
              placeholder="Enter profile picture URL"
            />
          </div>
          <!-- NEED THE SAME FOR LOCATION, WEBSITE AND DATE OF BIRTY -->
          <div class="grid gap-2">
            <Label for="location">Location</Label>
            <Input
              id="location"
              v-model="editForm.location"
              placeholder="Enter user location (optional)"
            />
          </div>
          <div class="grid gap-2">
            <Label for="website">Website</Label>
            <Input
              id="website"
              v-model="editForm.website"
              placeholder="Enter user website (optional)"
            />
          </div>
          <div class="grid gap-2">
            <Label for="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              v-model="editForm.date_of_birth"
              type="date"
              placeholder="Enter user date of birth (optional)"
            />
          </div>
          <div class="grid gap-2">
            <Label for="role">Role</Label>
            <Select v-model="selectedRole">
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="role in availableRoles"
                    :key="role.id"
                    :value="role.id"
                  >
                    {{ role.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter class="flex-col-reverse sm:flex-row md:gap-2 sm:gap-0">
          <Button variant="outline" @click="editDialogOpen = false"
            >Cancel</Button
          >
          <Button type="submit" @click="handleSaveEdit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Deactivate User Dialog -->
    <Dialog v-model:open="deactivateDialogOpen">
      <DialogContent class="w-[90vw] max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deactivate User</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate this user? This action can be
            reversed later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" @click="deactivateDialogOpen = false"
            >Cancel</Button
          >
          <Button variant="destructive" @click="handleConfirmDeactivate"
            >Deactivate</Button
          >
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
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
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";

import { computed, ref, watch } from "vue";
import ChevronDown from "@/assets/icons/chevron-down.svg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { createUserTableColumns } from "./utils/tableColumns.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { fetchAllUsers, updateUser } from "@/api/user.ts";
import { useSearchStore } from "@/store/searchStore.ts";
import type { Role, UserType } from "@/models/Auth";

const searchStore = useSearchStore();
const currentPage = ref(1);
const pageSize = ref(10);

const { data } = useQuery<{ data: { totalCount: number; list: UserType[] } }>({
  queryKey: ["allUsers", currentPage, pageSize],
  queryFn: () =>
    fetchAllUsers(pageSize.value, currentPage.value, searchStore.query),
  refetchOnWindowFocus: true,
});
const tableData = computed(() => data.value?.data?.list ?? []);
const queryClient = useQueryClient();

const { mutate: updateUserMutation } = useMutation({
  mutationFn: (user: Partial<UserType>) =>
    updateUser(selectedUser.value!.username, user),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["allUsers"] });
  },
  onError: (error) => {
    console.error("Error updating user:", error);
  },
});
// State for dialogs
const editDialogOpen = ref(false);
const deactivateDialogOpen = ref(false);
const selectedUser = ref<UserType | null>(null);
const editForm = ref<Partial<UserType>>({});
const selectedRole = ref<number | null>(null);

// Available roles for dropdown
const availableRoles = ref<Role[]>([
  { id: 1, name: "Admin", description: "Administrator", level: 1 },
  { id: 2, name: "Editor", description: "Content Editor", level: 2 },
  { id: 3, name: "User", description: "Regular User", level: 3 },
]);

// Function to handle edit action
function handleEdit(user: UserType) {
  selectedUser.value = user;
  editForm.value = { ...user };
  selectedRole.value = user.role?.id || null;
  editDialogOpen.value = true;
}

// Function to handle save edit
function handleSaveEdit() {
  if (selectedRole.value) {
    editForm.value.role_id = selectedRole.value;
  }

  if (!editForm.value.id) {
    console.error("User ID is missing. Cannot update user.");
    return;
  }

  const updatedUser: Partial<UserType> = {
    id: editForm.value.id,
    email: editForm.value.email ?? "",
    role_id: editForm.value.role_id ?? editForm.value.role?.id ?? 0,
    bio: editForm.value.bio ?? "",
    profile_picture_url: editForm.value.profile_picture_url ?? "",
    location: editForm.value.location ?? "",
    website: editForm.value.website ?? "",
    date_of_birth: editForm.value.date_of_birth ?? "",
  };

  updateUserMutation(updatedUser);

  editDialogOpen.value = false;
}

function handleDeactivate(user: UserType) {
  selectedUser.value = user;
  deactivateDialogOpen.value = true;
}

function handleConfirmDeactivate() {
  deactivateDialogOpen.value = false;
}

const columns = createUserTableColumns(handleEdit, handleDeactivate);

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});

const table = useVueTable({
  data: tableData,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, rowSelection),
  initialState: {
    pagination: {
      pageSize: 10,
    },
    columnVisibility: {
      // Hide certain columns on small screens by default
      select: window.innerWidth > 640,
    },
  },
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

const handleSearch = (query: string) => {
  searchStore.setQuery(query);
};

watch(
  () => searchStore.query,
  () => {
    queryClient.invalidateQueries({ queryKey: ["allUsers"] });
  }
);
</script>
