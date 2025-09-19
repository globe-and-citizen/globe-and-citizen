<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card class="mt-2 lg:mt-5">
      <CardHeader
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <CardTitle class="text-sm font-medium"> Total Users </CardTitle>
        <component :is="UsersIcon" class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ users?.data.totalCount }}</div>
      </CardContent>
    </Card>
    <Card class="mt-2 lg:mt-5">
      <CardHeader
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <CardTitle class="text-sm font-medium"> Total posts </CardTitle>
        <component :is="JournalsIcon" class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ postsCount?.data }}</div>
        <p class="text-xs text-muted-foreground">Total news published</p>
      </CardContent>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { fetchPostsCount } from "@/api/posts";
import { fetchAllUsers } from "@/api/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/vue-query";
import UsersIcon from "@/assets/icons/users.svg";
import JournalsIcon from "@/assets/icons/journals.svg";
import type { UserType } from "@/models/Auth";

const { data: postsCount } = useQuery<{ data: number }>({
  queryKey: ["postsCount"],
  queryFn: fetchPostsCount,
  refetchOnWindowFocus: true,
});

const { data: users } = useQuery<{
  data: { totalCount: number; list: UserType[] };
}>({
  queryKey: ["allUsers", 1, 10],
  queryFn: () => fetchAllUsers(10, 1, ""),
  refetchOnWindowFocus: true,
});
</script>
