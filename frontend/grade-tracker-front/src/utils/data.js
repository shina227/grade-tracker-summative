import {
  LuLayoutDashboard,
  LuBookOpen, // Courses
  LuClipboardList, // Assignments
  LuGraduationCap, // Grades
  LuChartBar, // Reports
  LuBell, // Notifications
  LuLogOut,
} from "react-icons/lu";

export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "02",
    label: "Courses",
    icon: LuBookOpen,
    path: "/courses",
  },
  {
    id: "03",
    label: "Assignments",
    icon: LuClipboardList,
    path: "/assignments",
  },
  {
    id: "04",
    label: "Grades",
    icon: LuGraduationCap,
    path: "/grades",
  },
  {
    id: "05",
    label: "Reports",
    icon: LuChartBar,
    path: "/reports",
  },
  {
    id: "06",
    label: "Notifications",
    icon: LuBell,
    path: "/notifications",
  },
  {
    id: "07",
    label: "Logout",
    icon: LuLogOut,
    path: "logout",
  },
];
