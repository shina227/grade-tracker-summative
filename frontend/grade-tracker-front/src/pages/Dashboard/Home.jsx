import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { InfoCard } from "../../components/Cards/InfoCard";
import UpcomingAssignments from "../../components/Dashboard/UpcomingAssignments";
import AssignmentsOverview from "../../components/Dashboard/AssignmentsOverview";
import AssignmentDetails from "../../components/Dashboard/AssignmentDetails";

import { LuClipboardList, LuBookOpen, LuGraduationCap } from "react-icons/lu";
import { IoMdCard } from "react-icons/io";

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.DASHBOARD.GET_DATA}`
      );

      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<LuBookOpen size={26} />}
            label="Courses Enrolled"
            value={dashboardData?.totalCourses || 0}
            color="bg-primary"
          />
          <InfoCard
            icon={<LuClipboardList size={26} />}
            label="Assignments Completed"
            value={dashboardData?.completedAssignments || 0}
            color="bg-sky-600"
          />
          <InfoCard
            icon={<LuGraduationCap size={26} />}
            label="Average Grade"
            value={dashboardData?.averageGrade || 0}
            color="bg-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Upcoming Assignments List */}
          <UpcomingAssignments
            assignments={dashboardData?.UpcomingAssignments}
            onSeeMore={() => navigate("/Assignments")}
          />

          {/* Assignments Overview Chart */}
          <AssignmentsOverview
            completedAssignments={dashboardData?.completedAssignments || 0}
            pendingAssignments={dashboardData?.pendingAssignments || 0}
            overdueAssignments={dashboardData?.overdueAssignments || 0}
          />

          {/* Assignment Details*/}
          <AssignmentDetails
            assignments={dashboardData?.last30DaysAssignments?.assignments}
            onSeeMore={() => navigate("/assignments")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Home;
