import React, { useState, useMemo } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuCalendar,
  LuList,
} from "react-icons/lu";
import { generateCourseColors } from "../../utils/helper";

const CalendarView = ({ assignments, courses, onAssignmentClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // "month" or "week"
  const [courseFilter, setCourseFilter] = useState("");

  // Generate colors for courses
  const courseColors = useMemo(() => generateCourseColors(courses), [courses]);

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  // Get week dates
  const getWeekDates = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const sunday = new Date(date.setDate(diff));

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(sunday);
      currentDay.setDate(sunday.getDate() + i);
      weekDates.push(currentDay);
    }
    return weekDates;
  };

  // Get assignments for a specific date
  const getAssignmentsForDate = (date) => {
    return assignments.filter((assignment) => {
      if (!assignment.dueDate) return false;

      const dueDate = new Date(assignment.dueDate);
      const matchesDate =
        dueDate.getDate() === date.getDate() &&
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getFullYear() === date.getFullYear();

      const matchesCourse = courseFilter
        ? assignment.courseId?._id === courseFilter
        : true;

      return matchesDate && matchesCourse;
    });
  };

  // Navigation
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Render Month View
  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } =
      getDaysInMonth(currentDate);
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[100px] bg-gray-50"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayAssignments = getAssignmentsForDate(date);
      const today = isToday(date);

      days.push(
        <div
          key={day}
          className={`min-h-[100px] border border-gray-200 p-2 ${
            today ? "bg-blue-50 border-blue-300" : "bg-white"
          }`}
        >
          <div
            className={`text-sm font-medium mb-2 ${
              today ? "text-blue-600" : "text-gray-700"
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {dayAssignments.slice(0, 3).map((assignment) => {
              const color =
                courseColors[assignment.courseId?._id] || "bg-gray-500";
              return (
                <div
                  key={assignment._id}
                  onClick={() => onAssignmentClick(assignment)}
                  className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${color} text-white truncate`}
                  title={assignment.title}
                >
                  {assignment.title}
                </div>
              );
            })}
            {dayAssignments.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayAssignments.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  // Render Week View
  const renderWeekView = () => {
    const weekDates = getWeekDates(new Date(currentDate));

    return weekDates.map((date, index) => {
      const dayAssignments = getAssignmentsForDate(date);
      const today = isToday(date);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      return (
        <div
          key={index}
          className={`border border-gray-200 p-3 ${
            today ? "bg-blue-50 border-blue-300" : "bg-white"
          }`}
        >
          <div className="mb-3">
            <div className="text-xs text-gray-500">{dayNames[index]}</div>
            <div
              className={`text-lg font-semibold ${
                today ? "text-blue-600" : "text-gray-700"
              }`}
            >
              {date.getDate()}
            </div>
          </div>
          <div className="space-y-2">
            {dayAssignments.map((assignment) => {
              const color =
                courseColors[assignment.courseId?._id] || "bg-gray-500";
              return (
                <div
                  key={assignment._id}
                  onClick={() => onAssignmentClick(assignment)}
                  className={`text-sm p-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${color} text-white`}
                >
                  <div className="font-medium truncate">{assignment.title}</div>
                  <div className="text-xs opacity-90">
                    {assignment.courseId?.courseName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="card">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h5 className="text-lg">Assignment Calendar</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            View all your assignment deadlines
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Course Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-transparent border border-gray-300 rounded px-3 py-2 text-sm outline-none"
          >
            <option value="">All Courses</option>
            {courses?.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseName}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                view === "month"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LuCalendar className="inline mr-1" size={16} />
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                view === "week"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LuList className="inline mr-1" size={16} />
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            view === "month" ? navigateMonth(-1) : navigateWeek(-1)
          }
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <LuChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={goToToday}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
        </div>

        <button
          onClick={() =>
            view === "month" ? navigateMonth(1) : navigateWeek(1)
          }
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <LuChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      {view === "month" ? (
        <>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200">
            {renderMonthView()}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-7 gap-3">{renderWeekView()}</div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 mb-2 font-medium">Course Legend:</p>
        <div className="flex flex-wrap gap-3">
          {courses?.map((course) => {
            const color = courseColors[course._id] || "bg-gray-500";
            return (
              <div key={course._id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${color}`}></div>
                <span className="text-xs text-gray-700">
                  {course.courseName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
