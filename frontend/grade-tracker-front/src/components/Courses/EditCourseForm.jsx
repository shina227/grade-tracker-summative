import React, { useState, useEffect } from "react";
import Input from "../Inputs/Input";

const EditCourseForm = ({ course, onUpdateCourse }) => {
  const [formData, setFormData] = useState({
    courseName: "",
    term: "",
    year: new Date().getFullYear(),
    status: "In Progress",
  });

  useEffect(() => {
    if (course) {
      setFormData({
        courseName: course.courseName || "",
        term: course.term || "",
        year: course.year || new Date().getFullYear(),
        status: course.status || "In Progress",
      });
    }
  }, [course]);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = () => {
    onUpdateCourse({
      ...formData,
      year: Number(formData.year),
    });
  };

  return (
    <div>
      {/* Course Name */}
      <Input
        value={formData.courseName}
        onChange={({ target }) => handleChange("courseName", target.value)}
        label="Course Name"
        placeholder="e.g., Computer Science 101"
        type="text"
      />

      {/* Term */}
      <label className="text-[13px] text-slate-800 block mb-2 mt-4">Term</label>
      <select
        value={formData.term}
        onChange={({ target }) => handleChange("term", target.value)}
        className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none"
      >
        <option value="">Select Term</option>
        <option value="Fall">Fall</option>
        <option value="Winter">Winter</option>
        <option value="Spring">Spring</option>
        <option value="Summer">Summer</option>
      </select>

      {/* Year */}
      <Input
        value={formData.year}
        onChange={({ target }) => handleChange("year", target.value)}
        label="Year"
        placeholder="2024"
        type="number"
        min="2000"
        max="2100"
      />

      {/* Status */}
      <label className="text-[13px] text-slate-800 block mb-2 mt-4">
        Status
      </label>
      <select
        value={formData.status}
        onChange={({ target }) => handleChange("status", target.value)}
        className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none"
      >
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
        >
          Update Course
        </button>
      </div>
    </div>
  );
};

export default EditCourseForm;
