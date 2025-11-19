import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import CoursesOverview from "../../components/Courses/CoursesOverview";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Modal from "../../components/Modal";

const Courses = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddCourseModal, setOpenAddCourseModal] = useState(true);

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
  const handleAddCourse = async () => {};

  // Handle Update Course
  const handleUpdateCourse = async () => {};

  // Delete Course
  const deleteCourse = async () => {};

  useEffect(() => {
    fetchCoursesDetails();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Courses">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <CoursesOverview
              courses={coursesData}
              onAddCourse={() => setOpenAddCourseModal(true)}
            />
          </div>
        </div>

        <Modal
          isOpen={openAddCourseModal}
          onClose={() => setOpenAddCourseModal(false)}
          title="Add Course"
        >
          <div>Add Course Form</div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
