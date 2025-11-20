import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import CoursesOverview from "../../components/Courses/CoursesOverview";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Modal from "../../components/Modal";
import AddCourseForm from "../../components/Courses/AddCourseForm";
import toast from "react-hot-toast";
import CoursesList from "../../components/Courses/CoursesList";
import DeleteAlert from "../../components/DeleteAlert";
import { useUserAuth } from "../../hooks/useUserAuth";

const Courses = () => {
  useUserAuth();

  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddCourseModal, setOpenAddCourseModal] = useState(false);

  // Get All Courses Details
  const fetchCoursesDetails = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.COURSES.GET_ALL_COURSES}`
      );

      if (response.data) {
        setCoursesData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Course
  const handleAddCourse = async (course) => {
    const { courseName, term, year } = course;

    //Validation Checks
    if (!courseName.trim()) {
      toast.error("Course Name is required.");
      return;
    }

    if (!term) {
      toast.error("Term is required.");
      return;
    }

    if (!year || year < 2000 || year > 2100) {
      toast.error("Please enter a valid year between 2000 and 2100.");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.COURSES.ADD_COURSE, {
        courseName,
        term,
        year,
      });

      setOpenAddCourseModal(false);
      toast.success("Course added successfully!");
      fetchCoursesDetails();
    } catch (error) {
      console.error(
        "Error adding course:",
        error.response?.data?.message || error.message
      );
    }
  };

  // Handle Update Course
  const handleUpdateCourse = async () => {};

  // Delete Course
  const deleteCourse = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.COURSES.DELETE_COURSE(id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Course details deleted successfully");
      fetchCoursesDetails();
    } catch (error) {
      console.error(
        "Error deleting course:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchCoursesDetails();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Courses">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            {/* Courses Overview Graph */}
            <CoursesOverview
              courses={coursesData}
              onAddCourse={() => setOpenAddCourseModal(true)}
            />
          </div>

          {/* Courses List */}
          <CoursesList
            courses={coursesData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
          />
        </div>

        {/* Add Course Modal */}
        <Modal
          isOpen={openAddCourseModal}
          onClose={() => setOpenAddCourseModal(false)}
          title="Add Course"
        >
          <AddCourseForm onAddCourse={handleAddCourse} />
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Course"
        >
          <DeleteAlert
            content="Are you sure you want to delete this course?"
            onDelete={() => deleteCourse(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
