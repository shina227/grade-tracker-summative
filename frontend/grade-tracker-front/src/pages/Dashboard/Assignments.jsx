import React, { useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import AddAssignmentForm from "../../components/Assignments/AddAssignmentForm";
import EditAssignmentForm from "../../components/Assignments/EditAssignmentForm";
import Modal from "../../components/Modal.jsx";
import AssignmentsList from "../../components/Assignments/AssignmentsList.jsx";
import DeleteAlert from "../../components/DeleteAlert";
import { LuPlus } from "react-icons/lu";

const Assignments = () => {
  useUserAuth();

  const [assignmentsData, setAssignmentsData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddAssignmentModal, setOpenAddAssignmentModal] = useState(false);
  const [openEditAssignmentModal, setOpenEditAssignmentModal] = useState({
    show: false,
    data: null,
  });

  // Get All Assignment Details
  const fetchAssignmentDetails = async () => {
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

  // Get All Courses
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

  // Handle Add Assignment
  const handleAddAssignment = async (assignment) => {
    const { courseId, title, dueDate, weight, grade, status } = assignment;

    //Validation Checks
    if (!courseId) {
      toast.error("Course is required.");
      return;
    }

    if (!title.trim()) {
      toast.error("Assignment title is required.");
      return;
    }

    if (weight < 0 || weight > 100) {
      toast.error("Weight must be between 0 and 100.");
      return;
    }

    if (grade < 0 || grade > 100) {
      toast.error("Grade must be between 0 and 100.");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.ASSIGNMENTS.ADD_ASSIGNMENT, {
        courseId,
        title,
        dueDate,
        weight,
        grade,
        status,
      });

      setOpenAddAssignmentModal(false);
      toast.success("Assignment added successfully!");
      fetchAssignmentDetails();
    } catch (error) {
      console.error(
        "Error adding assignment:",
        error.response?.data?.message || error.message
      );
    }
  };

  // Handle Update Assignment
  const handleUpdateAssignment = async (updatedAssignment) => {
    const currentAssignment = openEditAssignmentModal.data;
    if (!currentAssignment || !currentAssignment?._id) {
      toast.error("Cannot update: assignment ID missing.");
      return;
    }

    const payload = {
      courseId: updatedAssignment.courseId || currentAssignment.courseId,
      title: updatedAssignment.title || currentAssignment.title,
      description:
        updatedAssignment.description ?? currentAssignment.description,
      dueDate: updatedAssignment.dueDate ?? currentAssignment.dueDate,
      weight:
        updatedAssignment.weight !== undefined
          ? Number(updatedAssignment.weight)
          : currentAssignment.weight,
      grade:
        updatedAssignment.grade !== undefined
          ? Number(updatedAssignment.grade)
          : currentAssignment.grade,
      status: updatedAssignment.status || currentAssignment.status,
    };

    if (payload.weight < 0 || payload.weight > 100) {
      toast.error("Weight must be between 0 and 100.");
      return;
    }

    if (payload.grade < 0 || payload.grade > 100) {
      toast.error("Grade must be between 0 and 100.");
      return;
    }

    try {
      await axiosInstance.put(
        API_PATHS.ASSIGNMENTS.UPDATE_ASSIGNMENT(currentAssignment._id),
        payload
      );

      setOpenEditAssignmentModal({ show: false, data: null });
      toast.success("Assignment updated successfully!");
      fetchAssignmentDetails();
    } catch (error) {
      console.error(
        "Error updating assignment:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to update assignment. Please try again.");
    }
  };

  // Delete Assignment
  const deleteAssignment = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.ASSIGNMENTS.DELETE_ASSIGNMENT(id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Assignment deleted successfully");
      fetchAssignmentDetails();
    } catch (error) {
      console.error(
        "Error deleting assignment:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchAssignmentDetails();
    fetchCoursesDetails();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Assignments">
      <div className="my-5 mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h5 className="text-lg">Assignments Overview</h5>
            <p className="text-xs text-gray-600">
              Keep track of all your assignments
            </p>
          </div>

          <button
            className="add-btn"
            onClick={() => setOpenAddAssignmentModal(true)}
          >
            <LuPlus className="text-lg" /> Add Assignment
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Assignments List */}
          <AssignmentsList
            assignments={assignmentsData}
            onAddAssignment={() => setOpenAddAssignmentModal(true)}
            onEdit={(assignment) =>
              setOpenEditAssignmentModal({ show: true, data: assignment })
            }
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
          />
        </div>

        {/* Add Assignment Modal */}
        <Modal
          isOpen={openAddAssignmentModal}
          onClose={() => setOpenAddAssignmentModal(false)}
          title="Add Assignment"
        >
          <AddAssignmentForm
            courses={coursesData}
            onAddAssignment={handleAddAssignment}
          />
        </Modal>

        {/* Edit Assignment Modal */}
        <Modal
          isOpen={openEditAssignmentModal.show}
          onClose={() =>
            setOpenEditAssignmentModal({ show: false, data: null })
          }
          title="Edit Assignment"
        >
          <EditAssignmentForm
            assignment={openEditAssignmentModal.data}
            courses={coursesData}
            onUpdateAssignment={handleUpdateAssignment}
          />
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Assignment"
        >
          <DeleteAlert
            content="Are you sure you want to delete this assignment?"
            onDelete={() => deleteAssignment(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
