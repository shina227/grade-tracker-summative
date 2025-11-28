import React from "react";
import authGraph from "../../assets/images/auth-graph.png";
import { LuTrendingUpDown } from "react-icons/lu";
import logo from "../../../../../assets/new-logo.svg";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex">
      <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 h-8" />
          <h2 className="text-lg font-medium text-black">Grade Tracker</h2>
        </div>
        {children}
      </div>

      <div className="hidden md:block w-[40vw] h-screen bg-indigo-50 bg-auth-bg-img bg-cover bg-no-repeat bg-center overflow-hidden p-8 relative">
        <div className="w-48 h-48 rounded-[40px] bg-sky-800 absolute -top-16 -left-5" />
        <div className="w-48 h-48 rounded-[40px] bg-indigo-400 absolute -bottom-16 -right-5" />

        <div className="grid grid-cols-1 z-20">
          <StatsInfoCard
            icon={<LuTrendingUpDown />}
            label="Track Your Grades & Assignments"
            text="A+"
            color="bg-indigo-600"
          />
        </div>

        <img
          src={authGraph}
          className="w-64 lg:w-[90%] absolute bottom-10 rounded-2xl"
        />
      </div>
    </div>
  );
};

export default AuthLayout;

const StatsInfoCard = ({ icon, label, text, color }) => {
  return (
    <div className="flex gap-6 bg-white p-4 rounded-xl shadow-md shadow-indigo-400/10 border border-gray-200/50 z-30">
      <div
        className={`w-12 h-12 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
      >
        {icon}
      </div>
      <div className="flex flex-col justify-center">
        <h6 className="text-[13px] text-gray-500">{label}</h6>
        <p className="text-lg text-gray-700">{text}</p>
      </div>
    </div>
  );
};
