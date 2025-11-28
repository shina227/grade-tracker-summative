import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import {
  LuBell,
  LuBellOff,
  LuTrash2,
  LuCheck,
  LuX,
  LuCircleAlert,
  LuClock,
  LuCalendar,
  LuCircleCheck,
} from "react-icons/lu";
import toast from "react-hot-toast";

const Notifications = () => {
  useUserAuth();
  const navigate = useNavigate();

  const [assignmentsData, setAssignmentsData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [categoryFilter, setCategoryFilter] = useState("all"); // all, overdue, upcoming, completed

  // Fetch assignments and generate notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.ASSIGNMENTS.GET_ALL_ASSIGNMENTS
        );
        if (response.data) {
          setAssignmentsData(response.data);
          generateNotifications(response.data);
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchData();
  }, []);

  // Generate notifications from assignments
  const generateNotifications = (assignments) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notifs = [];

    assignments.forEach((assignment) => {
      if (!assignment.dueDate) return;

      const dueDate = new Date(assignment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let category = "";
      let type = "";
      let message = "";
      let icon = null;
      let color = "";

      if (assignment.status === "Completed") {
        category = "completed";
        type = "success";
        message = `You completed "${assignment.title}"`;
        icon = <LuCircleCheck size={20} />;
        color = "text-green-600 bg-green-50 border-green-200";
      } else if (diffDays < 0) {
        // Overdue
        category = "overdue";
        type = "error";
        message = `"${assignment.title}" is overdue by ${Math.abs(
          diffDays
        )} day${Math.abs(diffDays) > 1 ? "s" : ""}`;
        icon = <LuCircleAlert size={20} />;
        color = "text-red-600 bg-red-50 border-red-200";
      } else if (diffDays === 0) {
        // Due today
        category = "upcoming";
        type = "warning";
        message = `"${assignment.title}" is due today`;
        icon = <LuClock size={20} />;
        color = "text-orange-600 bg-orange-50 border-orange-200";
      } else if (diffDays <= 3) {
        // Upcoming
        category = "upcoming";
        type = "info";
        message = `"${assignment.title}" is due in ${diffDays} day${
          diffDays > 1 ? "s" : ""
        }`;
        icon = <LuCalendar size={20} />;
        color = "text-blue-600 bg-blue-50 border-blue-200";
      }

      if (message) {
        notifs.push({
          id: assignment._id,
          message,
          type,
          category,
          icon,
          color,
          course: assignment.courseId?.courseName || "Unknown Course",
          dueDate: assignment.dueDate,
          isRead: false,
          timestamp: new Date(assignment.dueDate),
        });
      }
    });

    // Sort by timestamp (most recent first)
    notifs.sort((a, b) => b.timestamp - a.timestamp);
    setNotifications(notifs);
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    const matchesReadStatus =
      filter === "all" ||
      (filter === "unread" && !notif.isRead) ||
      (filter === "read" && notif.isRead);

    const matchesCategory =
      categoryFilter === "all" || notif.category === categoryFilter;

    return matchesReadStatus && matchesCategory;
  });

  // Mark as read/unread
  const toggleReadStatus = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: !notif.isRead } : notif
      )
    );
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    toast.success("Notification deleted");
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
    toast.success("All notifications marked as read");
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
      toast.success("All notifications cleared");
    }
  };

  // Get counts
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const overdueCount = notifications.filter(
    (n) => n.category === "overdue"
  ).length;
  const upcomingCount = notifications.filter(
    (n) => n.category === "upcoming"
  ).length;

  return (
    <DashboardLayout activeMenu="Notifications">
      <div className="my-5 mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-500 mt-1">
              Stay updated with your assignments and deadlines
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <LuCheck size={18} />
              Mark All Read
            </button>
            <button
              onClick={clearAllNotifications}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LuTrash2 size={18} />
              Clear All
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
                <LuBell size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg">
                <LuBellOff size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-lg">
                <LuCircleAlert size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overdueCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Read/Unread Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "all"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "unread"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter("read")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "read"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Read
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Category
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === "all"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCategoryFilter("overdue")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === "overdue"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Overdue
                </button>
                <button
                  onClick={() => setCategoryFilter("upcoming")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === "upcoming"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setCategoryFilter("completed")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`card ${
                  notif.isRead ? "opacity-60" : ""
                } hover:shadow-md transition-all`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-lg border ${notif.color}`}
                  >
                    {notif.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <p
                        className={`text-sm ${
                          notif.isRead
                            ? "text-gray-600"
                            : "text-gray-900 font-medium"
                        }`}
                      >
                        {notif.message}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{notif.course}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleReadStatus(notif.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        notif.isRead
                          ? "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      }`}
                      title={notif.isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {notif.isRead ? <LuX size={18} /> : <LuCheck size={18} />}
                    </button>
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <LuTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full">
                  <LuBell size={32} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-600 font-medium">
                    No notifications found
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    You're all caught up!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
