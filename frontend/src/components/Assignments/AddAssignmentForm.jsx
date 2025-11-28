import React, { useState } from "react";
import Input from "../Inputs/Input";

const AddAssignmentForm = ({ courses = [], onAddAssignment }) => {
  const [assignment, setAssignment] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    weight: "",
    grade: "",
    status: "Pending",
  });

  const handleChange = (key, value) =>
    setAssignment({ ...assignment, [key]: value });

  const handleSubmit = () => {
    // Convert weight and grade to numbers before submitting
    onAddAssignment({
      ...assignment,
      weight: Number(assignment.weight) || 0,
      grade: Number(assignment.grade) || 0,
    });
  };

  return (
    <div>
      <label className="text-[13px] text-slate-800 block mb-2">Course</label>
      <select
        value={assignment.courseId}
        onChange={({ target }) => handleChange("courseId", target.value)}
        className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none placeholder:text-slate-500"
      >
        <option value="">Select Course</option>
        {courses.map((course) => (
          <option key={course._id} value={course._id}>
            {course.courseName}
          </option>
        ))}
      </select>

      <Input
        value={assignment.title}
        onChange={({ target }) => handleChange("title", target.value)}
        label="Assignment Title"
        placeholder="Add your assignment title"
        type="text"
      />

      <Input
        value={assignment.description}
        onChange={({ target }) => handleChange("description", target.value)}
        label="Description"
        placeholder="Add a description"
        type="text"
      />

      <Input
        value={assignment.dueDate}
        onChange={({ target }) => handleChange("dueDate", target.value)}
        label="Due Date"
        placeholder="Select due date"
        type="date"
      />

      <Input
        value={assignment.weight}
        onChange={({ target }) => handleChange("weight", target.value)}
        label="Weight"
        placeholder="Enter weight (0-100)"
        type="number"
        min="0"
        max="100"
      />

      <Input
        value={assignment.grade}
        onChange={({ target }) => handleChange("grade", target.value)}
        label="Grade"
        placeholder="Enter grade (0-100)"
        type="number"
        min="0"
        max="100"
      />

      <label className="text-[13px] text-slate-800 block mb-2 mt-2">
        Status
      </label>
      <select
        value={assignment.status}
        onChange={({ target }) => handleChange("status", target.value)}
        className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none placeholder:text-slate-500"
      >
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
        >
          Add Assignment
        </button>
      </div>
    </div>
  );
};

export default AddAssignmentForm;
