<script setup lang="ts">
import UsersIcon from "@/assets/icons/users.svg";
import Advertisement from "@/assets/icons/advertisement.svg";
import HomeIcon from "@/assets/icons/home.svg";
import JournalsIcon from "@/assets/icons/journals.svg";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.svg";

const items = [
  {
    title: "Home",
    url: "/admin/home",
    icon: HomeIcon,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: UsersIcon,
  },
  {
    title: "News portal",
    url: "/admin/news-processor",
    icon: Advertisement,
  },
  {
    title: "Posted news",
    url: "/admin/posted-news",
    icon: JournalsIcon,
  },
];
</script>

<template>
  <Sidebar class="[&>div]:bg-[#f5f5f5]">
    <SidebarContent>
      <SidebarGroup>
        <RouterLink
          to="/"
          class="flex items-center space-x-1 mt-5 ext-lg font-semibold text-gray-800"
        >
          <component :is="logo" />
          <span class="font-medium text-xl tracking-[-1.5px]"
            >Globe & Citizen</span
          >
        </RouterLink>
        <SidebarGroupContent>
          <SidebarMenu class="mt-5">
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton as-child>
                <router-link
                  active-class="text-red-500 border-1 !border-red-500 hover:border-b-red-500"
                  :to="item.url"
                  class="flex items-center gap-2 text-[16px]"
                >
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>

<style scoped>
* {
  font-family: "Times New Roman", serif;
}
</style>
