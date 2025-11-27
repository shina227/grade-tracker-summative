import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { UserContext } from "../../context/userContext";
import SideMenu from "./SideMenu";
import CharAvatar from "../Cards/CharAvatar";
import logo from "../../../../../assets/new-logo.svg";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  LuBell,
  LuCalendar,
  LuUser,
  LuSettings,
  LuLogOut,
} from "react-icons/lu";
import { getInitials } from "../../utils/helper";

const Navbar = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.ASSIGNMENTS.GET_ALL_ASSIGNMENTS
        );
        if (response.data) {
          setAssignments(response.data);
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get notification data
  const getNotifications = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const dueToday = [];
    const upcoming = [];
    const overdue = [];

    assignments
      .filter((a) => a.status === "Pending" && a.dueDate)
      .forEach((assignment) => {
        const dueDate = new Date(assignment.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          overdue.push(assignment);
        } else if (dueDate.getTime() === today.getTime()) {
          dueToday.push(assignment);
        } else if (dueDate <= threeDaysFromNow) {
          upcoming.push(assignment);
        }
      });

    return { dueToday, upcoming, overdue };
  };

  const { dueToday, upcoming, overdue } = getNotifications();
  const totalNotifications = dueToday.length + upcoming.length + overdue.length;

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <nav className="flex items-center justify-between bg-white border-b border-gray-200/50 backdrop-blur-xl py-4 px-6 sticky top-0 z-50">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          className="block lg:hidden text-black"
          onClick={() => setOpenSideMenu(!openSideMenu)}
        >
          {openSideMenu ? (
            <HiOutlineX className="text-2xl" />
          ) : (
            <HiOutlineMenu className="text-2xl" />
          )}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 h-8" />
          <h2 className="text-lg font-medium text-black">Grade Tracker</h2>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <LuBell size={20} className="text-gray-700" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                {totalNotifications > 9 ? "9+" : totalNotifications}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-[400px] overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {totalNotifications} pending assignment
                  {totalNotifications !== 1 ? "s" : ""}
                </p>
              </div>

              {totalNotifications === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  🎉 All caught up! No pending assignments.
                </div>
              ) : (
                <>
                  {/* Overdue */}
                  {overdue.length > 0 && (
                    <div className="px-4 py-2">
                      <p className="text-xs font-medium text-red-600 mb-2">
                        Overdue ({overdue.length})
                      </p>
                      {overdue.map((assignment) => (
                        <div
                          key={assignment._id}
                          className="mb-2 p-2 bg-red-50 border border-red-200 rounded cursor-pointer hover:bg-red-100 transition-colors"
                          onClick={() => {
                            setShowNotifications(false);
                            navigate("/calendar");
                          }}
                        >
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {assignment.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {assignment.courseId?.courseName}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            Due: {formatDate(assignment.dueDate)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Due Today */}
                  {dueToday.length > 0 && (
                    <div className="px-4 py-2">
                      <p className="text-xs font-medium text-orange-600 mb-2">
                        Due Today ({dueToday.length})
                      </p>
                      {dueToday.map((assignment) => (
                        <div
                          key={assignment._id}
                          className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded cursor-pointer hover:bg-orange-100 transition-colors"
                          onClick={() => {
                            setShowNotifications(false);
                            navigate("/calendar");
                          }}
                        >
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {assignment.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {assignment.courseId?.courseName}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upcoming */}
                  {upcoming.length > 0 && (
                    <div className="px-4 py-2">
                      <p className="text-xs font-medium text-blue-600 mb-2">
                        Upcoming ({upcoming.length})
                      </p>
                      {upcoming.map((assignment) => (
                        <div
                          key={assignment._id}
                          className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => {
                            setShowNotifications(false);
                            navigate("/calendar");
                          }}
                        >
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {assignment.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {assignment.courseId?.courseName}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Due: {formatDate(assignment.dueDate)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* View Calendar Link */}
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/calendar");
                      }}
                      className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 cursor-pointer"
                    >
                      <LuCalendar size={16} />
                      View Calendar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {user?.profileImageUrl ? (
              <img
                src={user?.profileImageUrl}
                alt="Profile Image"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <CharAvatar
                fullName={user?.fullName}
                width="w-8"
                height="h-8"
                style="text-sm"
              />
            )}

            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 px-2">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-800">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              {/* Menu Items */}
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center mt-2 gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                <LuUser size={18} />
                Profile
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                <LuSettings size={18} />
                Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Side menu */}
      {openSideMenu && (
        <div className="fixed top-[61px] -ml-4 bg-white">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
