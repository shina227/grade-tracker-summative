export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    GET_USER_INFO: "/api/v1/auth/getUser",
  },

  DASHBOARD: {
    GET_DATA: "/api/v1/dashboard",
  },

  COURSES: {
    ADD_COURSE: "/api/v1/courses/add",
    GET_ALL_COURSES: "/api/v1/courses/get",
    UPDATE_COURSE: (courseId) => `/api/v1/courses/${courseId}`,
    DELETE_COURSE: (courseId) => `/api/v1/courses/${courseId}`,
  },

  ASSIGNMENTS: {
    ADD_ASSIGNMENT: "/api/v1/assignments/add",
    GET_ALL_ASSIGNMENTS: "/api/v1/assignments/get",
    UPDATE_ASSIGNMENT: (assignmentId) => `/api/v1/assignments/${assignmentId}`,
    DELETE_ASSIGNMENT: (assignmentId) => `/api/v1/assignments/${assignmentId}`,
  },

  GRADES: {
    ADD_GRADE: "/api/v1/grades/add",
    GET_ALL_GRADES: "/api/v1/grades/get",
    UPDATE_GRADE: (gradeId) => `/api/v1/grades/${gradeId}`,
    DELETE_GRADE: (gradeId) => `/api/v1/grades/${gradeId}`,
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/v1/auth/upload-image",
  },
};
