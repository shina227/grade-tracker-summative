import React, { useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import CalendarView from "../../components/Calendar/CalendarView";
import AssignmentDetailsModal from "../../components/Calendar/AssignmentDetailsModal";
import EditAssignmentForm from "../../components/Assignments/EditAssignmentForm";
import DeleteAlert from "../../components/DeleteAlert";

const Calendar = () => {
  useUserAuth();

  const [assignmentsData, setAssignmentsData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

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

  // Handle Assignment Click
  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
    setOpenDetailsModal(true);
  };

  // Handle Edit
  const handleEdit = () => {
    setOpenDetailsModal(false);
    setOpenEditModal(true);
  };

  // Handle Update Assignment
  const handleUpdateAssignment = async (updatedAssignment) => {
    const { courseId, title, dueDate, weight, grade, status } =
      updatedAssignment;

    // Validation Checks
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
      await axiosInstance.put(
        API_PATHS.ASSIGNMENTS.UPDATE_ASSIGNMENT(selectedAssignment._id),
        {
          courseId,
          title,
          dueDate,
          weight,
          grade,
          status,
        }
      );

      setOpenEditModal(false);
      setSelectedAssignment(null);
      toast.success("Assignment updated successfully!");
      fetchAssignmentsDetails();
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
      setOpenDetailsModal(false);
      setSelectedAssignment(null);
      toast.success("Assignment deleted successfully");
      fetchAssignmentsDetails();
    } catch (error) {
      console.error(
        "Error deleting assignment:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchAssignmentsDetails();
    fetchCoursesDetails();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Calendar">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Calendar View */}
          <CalendarView
            assignments={assignmentsData}
            courses={coursesData}
            onAssignmentClick={handleAssignmentClick}
          />
        </div>

        {/* Assignment Details Modal */}
        <Modal
          isOpen={openDetailsModal}
          onClose={() => {
            setOpenDetailsModal(false);
            setSelectedAssignment(null);
          }}
          title="Assignment Details"
        >
          {selectedAssignment && (
            <AssignmentDetailsModal
              assignment={selectedAssignment}
              onEdit={handleEdit}
              onDelete={() => {
                setOpenDetailsModal(false);
                setOpenDeleteAlert({
                  show: true,
                  data: selectedAssignment._id,
                });
              }}
            />
          )}
        </Modal>

        {/* Edit Assignment Modal */}
        <Modal
          isOpen={openEditModal}
          onClose={() => {
            setOpenEditModal(false);
            setSelectedAssignment(null);
          }}
          title="Edit Assignment"
        >
          {selectedAssignment && (
            <EditAssignmentForm
              assignment={selectedAssignment}
              courses={coursesData}
              onUpdateAssignment={handleUpdateAssignment}
            />
          )}
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

export default Calendar;
