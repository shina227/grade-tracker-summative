import React, { useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const Assignments = () => {
  useUserAuth();

  const [assignmentData, setAssignmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddAssignmentModal, setOpenAddAssignmentModal] = useState(false);

  // Get All Assignment Details
  const fetchAssignmentDetails = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.ASSIGNMENTS.ASSIGNMENTS}`
      );

      if (response.data) {
        setAssignmentData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
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
      toast.error("Weight must be 0 and 100.");
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

  // Handle Update Course
  const handleUpdateAssignment = async () => {};

  // Delete Course
  const deleteAssignment = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.ASSIGNMENTS.DELETE_ASSIGNMENT(id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Assignment details deleted successfully");
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

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Assignments">
      <div className="my-5 mx-auto"></div>
    </DashboardLayout>
  );
};

export default Assignments;
