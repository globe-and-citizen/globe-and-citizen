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
        <div class="text-2xl font-bold">{{ usersCount?.data }}</div>
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
        <p class="text-xs text-muted-foreground">Toatl news published</p>
      </CardContent>
    </Card>
    <Card class="mt-2 lg:mt-5">
      <CardHeader
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <CardTitle class="text-sm font-medium"> Total Ads </CardTitle>
        <component :is="Advertisement" class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">101</div>
        <p class="text-xs text-muted-foreground">+20.1% from last month</p>
      </CardContent>
    </Card>
    <Card class="mt-2 lg:mt-5">
      <CardHeader
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <CardTitle class="text-sm font-medium"> Total Users </CardTitle>
        <component :is="UsersIcon" class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">101</div>
        <p class="text-xs text-muted-foreground">+20.1% from last month</p>
      </CardContent>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { fetchPostsCount } from "@/api/posts";
import { fetchUsersCount } from "@/api/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/vue-query";

import UsersIcon from "@/assets/icons/users.svg";
import JournalsIcon from "@/assets/icons/journals.svg";
import Advertisement from "@/assets/icons/advertisement.svg";

const { data: postsCount } = useQuery<{ data: number }>({
  queryKey: ["postsCount"],
  queryFn: fetchPostsCount,
  refetchOnWindowFocus: true,
});

const { data: usersCount } = useQuery<{ data: number }>({
  queryKey: ["usersCount"],
  queryFn: fetchUsersCount,
  refetchOnWindowFocus: true,
});
</script>
