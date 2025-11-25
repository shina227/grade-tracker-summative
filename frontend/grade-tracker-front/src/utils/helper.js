import moment from "moment";

// Email regex
export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// Get initials
export const getInitials = (name) => {
  if (!name) return "";

  const words = name.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }

  return initials.toUpperCase();
};

// Prepare Data for Grades Over Time Bar Chart
export const prepareGradesBarChartData = (grades = []) => {
  if (!Array.isArray(grades)) return [];

  return grades.map((item) => ({
    label: moment(item.date), // x-axis
    value: Number(item.grade) || 0, // y-axis
  }));
};

// Prepare Courses bar chart data
// groupBy: "term" or "year"
export const prepareCoursesBarChartData = (courses = [], groupBy = "term") => {
  if (!Array.isArray(courses)) return [];

  const group = {};

  courses.forEach((course) => {
    let key =
      groupBy === "term" ? `${course.term} ${course.year}` : `${course.year}`;
    group[key] = (group[key] || 0) + 1; // counting number of courses
  });

  // Convert grouped data to chart format { label, value }
  const chartData = Object.entries(group)
    .sort(([a], [b]) => (groupBy === "year" ? a - b : a.localeCompare(b)))
    .map(([label, value]) => ({ label, value }));

  return chartData;
};
