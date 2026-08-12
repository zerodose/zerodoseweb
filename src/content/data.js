import { LayoutDashboard, Users, MapPin, Settings } from "lucide-react";

export const dashboardSidebar = [
  // =====================================================
  // Dashboard
  // =====================================================

  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  // =====================================================
  // Users
  // =====================================================

  {
    title: "Users",
    icon: Users,
    children: [
      {
        title: "All Users",
        href: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Add User",
        href: "/dashboard/users/create",
        icon: Users,
      },
    ],
  },

  // =====================================================
  // Locations
  // =====================================================

  {
    title: "Districts",
    href: "/dashboard/districts",
    icon: MapPin,
  },

  {
    title: "Towns",
    href: "/dashboard/towns",
    icon: MapPin,
  },

  {
    title: "Union Councils",
    href: "/dashboard/union-councils",
    icon: MapPin,
  },

  // =====================================================
  // Settings
  // =====================================================

  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
