import React, { useState } from "react";
import Input from "../Inputs/Input";

const AddCourseForm = ({ onAddCourse }) => {
  const [course, setCourse] = useState({
    courseName: "",
    term: "",
    year: "",
  });

  const handleChange = (key, value) => setCourse({ ...course, [key]: value });
  return (
    <div>
      <Input
        value={course.courseName}
        onChange={({ target }) => handleChange("courseName", target.value)}
        label="Course Name"
        placeholder="Add your course name"
        type="text"
      />
      <label className="text-[13px] text-slate-800 block mb-2">Term </label>
      <select
        value={course.term}
        onChange={({ target }) => handleChange("term", target.value)}
        className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none placeholder:text-slate-500"
      >
        <option value="">Select Term</option>
        <option value="January">January</option>
        <option value="May">May</option>
        <option value="September">September</option>
      </select>
      <Input
        value={course.year}
        onChange={({ target }) => handleChange("year", target.value)}
        label="Year"
        placeholder="Add the year"
        type="number"
        min="2000"
        max="2100"
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onAddCourse(course)}
        >
          Add Course
        </button>
      </div>
    </div>
  );
};

export default AddCourseForm;
