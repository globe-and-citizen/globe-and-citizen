import userIcon from "@/assets/icons/user.svg";
import settings from "@/assets/icons/settings.svg";
import password from "@/assets/icons/lock.svg";
// import saved from "@/assets/icons/saved.svg";
// import plus from "@/assets/icons/plus.svg";
// import notification from "@/assets/icons/notifications.svg";
import articles from "@/assets/icons/articles.svg";
import journals from "@/assets/icons/journals.svg";
import analyticsGraph from "@/assets/icons/graph-analytics-business.svg";
import correlationGraph from "@/assets/icons/graph-correlation.svg";
import table from "@/assets/icons/table.svg";
import jupyter from "@/assets/icons/logo-jupyter.svg";
// import comments from "@/assets/icons/comments.svg";

export const profileMenuItems = [
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
  {
    section: "Profile",
    icon: password,
    title: "Change password",
    url: "/change-password",
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
  {
    section: "Tools",
    icon: analyticsGraph,
    title: "CSV Builder",
    url: "/csv-builder",
    summary: "Build downloadable CSV datasets from Polymarket market history.",
  },
  // {
  //     section: "Tools",
  //     icon: correlationGraph,
  //     title: "Polymarket correlation graph",
  //     url: "/correlation-graph",
  // },
  {
    section: "Tools",
    icon: correlationGraph,
    title: "Price Correlation graph",
    url: "/correlation-graph",
    summary: "Compare historical price relationships between selected Polymarket outcomes.",
  },
  {
    section: "Tools",
    icon: table,
    title: "Max contingency table",
    url: "/max-contingency-table",
    summary: "Analyze outcome combinations using maximum contingency table calculations.",
  },
  {
    section: "Tools",
    icon: jupyter,
    title: "Notebooks",
    url: "/notebooks",
    summary: "Open JupyterLite notebooks for deeper market data analysis.",
  },
];

export const serviceMenuItems = [
  {
    section: "Services",
    title: "CSV Builder",
    url: "/csv-builder",
  },
  // {
  //     section: "Services",
  //     title: "Polymarket correlation graph",
  //     url: "/correlation-graph",
  // },
  {
    section: "Services",
    title: "Polymarket correlation graph",
    url: "/correlation-graph",
  },
  {
    section: "Services",
    title: "Max contingency table",
    url: "/max-contingency-table",
  },
  {
    section: "Services",
    icon: journals,
    title: "Notebooks",
    url: "/notebooks",
  },
];

export const menuItems = [...profileMenuItems, ...serviceMenuItems];
