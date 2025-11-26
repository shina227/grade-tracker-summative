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

// Prepare Grades bar chart data - Group by course and calculate average score
export const prepareGradesBarChartData = (grades = []) => {
  if (!Array.isArray(grades) || grades.length === 0) return [];

  // Group grades by course
  const groupedByCourse = {};

  grades.forEach((grade) => {
    const courseName = grade.courseId?.courseName || "Unknown Course";

    if (!groupedByCourse[courseName]) {
      groupedByCourse[courseName] = {
        scores: [],
        weights: [],
      };
    }

    groupedByCourse[courseName].scores.push(Number(grade.score) || 0);
    groupedByCourse[courseName].weights.push(Number(grade.weight) || 0);
  });

  // Calculate weighted average for each course
  const chartData = Object.entries(groupedByCourse).map(
    ([courseName, data]) => {
      const totalWeightedScore = data.scores.reduce((sum, score, idx) => {
        return sum + score * data.weights[idx];
      }, 0);

      const totalWeight = data.weights.reduce((sum, weight) => sum + weight, 0);

      const weightedAverage =
        totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      return {
        label: courseName,
        value: Math.round(weightedAverage * 100) / 100, // Round to 2 decimals
      };
    }
  );

  // Sort by course name
  return chartData.sort((a, b) => a.label.localeCompare(b.label));
};

// Calculate Weighted GPA and statistics based on assignment grades
export const calculateWeightedGPA = (grades = []) => {
  if (!Array.isArray(grades) || grades.length === 0) {
    return {
      weightedAverage: 0,
      totalGrades: 0,
      averageScore: 0,
    };
  }

  // Calculate weighted average across all grades
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let totalScore = 0;

  grades.forEach((grade) => {
    const score = Number(grade.score) || 0;
    const weight = Number(grade.weight) || 0;

    totalWeightedScore += (score * weight) / 100;
    totalWeight += weight;
    totalScore += score;
  });

  const weightedAverage =
    totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
  const averageScore = grades.length > 0 ? totalScore / grades.length : 0;

  return {
    weightedAverage: weightedAverage,
    totalGrades: grades.length,
    averageScore: averageScore,
  };
};

// Generate consistent colors for courses
export const generateCourseColors = (courses = []) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-cyan-500",
  ];

  const courseColors = {};
  courses.forEach((course, index) => {
    courseColors[course._id] = colors[index % colors.length];
  });

  return courseColors;
};
