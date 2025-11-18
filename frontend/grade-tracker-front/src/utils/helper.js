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
    date: item.date, // x-axis
    grade: Number(item.grade) || 0, // y-axis
  }));
};
