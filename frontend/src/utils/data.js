import {
  LuLayoutDashboard,
  LuBookOpen,
  LuClipboardList,
  LuCalendar,
  LuLogOut,
  LuChartColumn,
  LuBell,
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
    label: "Assignments",
    icon: LuClipboardList,
    path: "/assignments",
  },
  {
    id: "03",
    label: "Grades",
    icon: LuChartColumn,
    path: "/grades",
  },
  {
    id: "04",
    label: "Courses",
    icon: LuBookOpen,
    path: "/courses",
  },
  {
    id: "05",
    label: "Notifications",
    icon: LuBell,
    path: "/notifications",
  },
];
