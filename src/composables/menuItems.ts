import userIcon from "@/assets/icons/user.svg";
import settings from "@/assets/icons/settings.svg";
// import password from "@/assets/icons/lock.svg";
// import saved from "@/assets/icons/saved.svg";
// import plus from "@/assets/icons/plus.svg";
// import notification from "@/assets/icons/notifications.svg";
import articles from "@/assets/icons/articles.svg";
// import comments from "@/assets/icons/comments.svg";

export const menuItems = [
  {
    section: "Profile",
    icon: userIcon,
    title: "Public view",
    url: "/public-view",
  },
  {
    section: "Profile",
    icon: settings,
    title: "Profile settings",
    url: "/profile-settings",
  },
  // {
  //   section: "Profile",
  //   icon: password,
  //   title: "Password",
  //   url: "/change-password",
  // },
  // {
  //   section: "My Activity",
  //   icon: saved,
  //   title: "Saved Articles",
  //   url: "/saved-articles",
  // },
  // {
  //   section: "My Activity",
  //   icon: plus,
  //   title: "Subscriptions",
  //   url: "/subscriptions",
  // },
  // {
  //   section: "My Activity",
  //   icon: notification,
  //   title: "Notifications",
  //   url: "/notifications",
  // },
  {
    section: "Studio",
    icon: articles,
    title: "Create Article",
    url: "/create",
  },
  {
    section: "Studio",
    icon: articles,
    title: "My Articles",
    url: "/articles",
  },
  {
    section: "Studio",
    icon: articles,
    title: "My Viewpoints",
    url: "/my-articles",
  },
  // {
  //   section: "My Activity",
  //   icon: comments,
  //   title: "My Comments",
  //   url: "/my-comments",
  // },
];
