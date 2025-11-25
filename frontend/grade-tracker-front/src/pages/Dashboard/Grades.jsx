import React, { useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import GradesOverview from "../../components/Grades/GradesOverview";
import GradesList from "../../components/Grades/GradesList";
import AddGradeForm from "../../components/Grades/AddGradeForm";
import EditGradeForm from "../../components/Grades/EditGradeForm";
import DeleteAlert from "../../components/DeleteAlert";

const Grades = () => {
  useUserAuth();

  const [gradesData, setGradesData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [assignmentsData, setAssignmentsData] = useState([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [openAddGradeModal, setOpenAddGradeModal] = useState(false);
  const [openEditGradeModal, setOpenEditGradeModal] = useState({
    show: false,
    data: null,
  });
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  // Fetch All Grades
  const fetchGradesDetails = async () => {
    if (gradesLoading) return;

    setGradesLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.GRADES.GET_ALL_GRADES}`
      );

      if (response.data) {
        setGradesData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setGradesLoading(false);
    }
  };

  // Fetch All Courses
  const fetchCoursesDetails = async () => {
    if (coursesLoading) return;

    setCoursesLoading(true);

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
      setCoursesLoading(false);
    }
  };

  // Fetch All Assignments
  const fetchAssignmentsDetails = async () => {
    if (assignmentsLoading) return;

    setAssignmentsLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.ASSIGNMENTS.GET_ALL_ASSIGNMENTS}`
      );

      if (response.data) {
        setAssignmentsData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  // Handle Add Grade
  const handleAddGrade = async (grade) => {
    const { courseId, assignmentId, score, weight } = grade;

    // Validation Checks
    if (!courseId) {
      toast.error("Course is required.");
      return;
    }

    if (!assignmentId) {
      toast.error("Assignment is required.");
      return;
    }

    if (score < 0 || score > 100) {
      toast.error("Score must be between 0 and 100.");
      return;
    }

    if (weight < 0 || weight > 100) {
      toast.error("Weight must be between 0 and 100.");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.GRADES.ADD_GRADE, {
        courseId,
        assignmentId,
        score,
        weight,
      });

      setOpenAddGradeModal(false);
      toast.success("Grade added successfully!");
      fetchGradesDetails();
    } catch (error) {
      console.error(
        "Error adding grade:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to add grade. Please try again.");
    }
  };

  // Handle Update Grade
  const handleUpdateGrade = async (updatedGrade) => {
    const { courseId, assignmentId, score, weight } = updatedGrade;

    // Validation Checks
    if (!courseId) {
      toast.error("Course is required.");
      return;
    }

    if (!assignmentId) {
      toast.error("Assignment is required.");
      return;
    }

    if (score < 0 || score > 100) {
      toast.error("Score must be between 0 and 100.");
      return;
    }

    if (weight < 0 || weight > 100) {
      toast.error("Weight must be between 0 and 100.");
      return;
    }

    try {
      await axiosInstance.put(
        API_PATHS.GRADES.UPDATE_GRADE(openEditGradeModal.data._id),
        {
          courseId,
          assignmentId,
          score,
          weight,
        }
      );

      setOpenEditGradeModal({ show: false, data: null });
      toast.success("Grade updated successfully!");
      fetchGradesDetails();
    } catch (error) {
      console.error(
        "Error updating grade:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to update grade. Please try again.");
    }
  };

  // Delete Grade
  const deleteGrade = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.GRADES.DELETE_GRADE(id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Grade deleted successfully");
      fetchGradesDetails();
    } catch (error) {
      console.error(
        "Error deleting grade:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchGradesDetails();
    fetchCoursesDetails();
    fetchAssignmentsDetails();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Grades">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Grades Overview with GPA and Chart */}
          <GradesOverview
            grades={gradesData}
            onAddGrade={() => setOpenAddGradeModal(true)}
          />

          {/* Grades List */}
          <GradesList
            grades={gradesData}
            onEdit={(grade) =>
              setOpenEditGradeModal({ show: true, data: grade })
            }
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
          />
        </div>

        {/* Add Grade Modal */}
        <Modal
          isOpen={openAddGradeModal}
          onClose={() => setOpenAddGradeModal(false)}
          title="Add Grade"
        >
          <AddGradeForm
            courses={coursesData}
            assignments={assignmentsData}
            onAddGrade={handleAddGrade}
          />
        </Modal>

        {/* Edit Grade Modal */}
        <Modal
          isOpen={openEditGradeModal.show}
          onClose={() => setOpenEditGradeModal({ show: false, data: null })}
          title="Edit Grade"
        >
          <EditGradeForm
            grade={openEditGradeModal.data}
            courses={coursesData}
            assignments={assignmentsData}
            onUpdateGrade={handleUpdateGrade}
          />
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Grade"
        >
          <DeleteAlert
            content="Are you sure you want to delete this grade?"
            onDelete={() => deleteGrade(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Grades;
