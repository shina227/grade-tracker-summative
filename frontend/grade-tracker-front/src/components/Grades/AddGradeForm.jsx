import React, { useState, useMemo } from "react";
import Input from "../Inputs/Input";

const AddGradeForm = ({ courses = [], assignments = [], onAddGrade }) => {
  const [grade, setGrade] = useState({
    courseId: "",
    assignmentId: "",
    score: "",
    weight: "",
  });

  const handleChange = (key, value) => setGrade({ ...grade, [key]: value });

  // Filter assignments based on selected course
  const filteredAssignments = useMemo(() => {
    if (!grade.courseId) return [];
    return assignments.filter((a) => a.courseId?._id === grade.courseId);
  }, [grade.courseId, assignments]);

  const handleSubmit = () => {
    onAddGrade({
      ...grade,
      score: Number(grade.score) || 0,
      weight: Number(grade.weight) || 0,
    });
  };

  return (
    <div>
      {/* Select Course */}
      <label className="text-[13px] text-slate-800 block mb-2">Course</label>
      <select
        value={grade.courseId}
        onChange={({ target }) => {
          handleChange("courseId", target.value);
          handleChange("assignmentId", ""); // reset assignment
        }}
        className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none"
      >
        <option value="">Select Course</option>
        {courses.map((course) => (
          <option key={course._id} value={course._id}>
            {course.courseName}
          </option>
        ))}
      </select>

      {/* Select Assignment */}
      <label className="text-[13px] text-slate-800 block mb-2 mt-4">
        Assignment
      </label>
      <select
        value={grade.assignmentId}
        onChange={({ target }) => handleChange("assignmentId", target.value)}
        disabled={!grade.courseId}
        className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none disabled:opacity-50"
      >
        <option value="">
          {grade.courseId ? "Select Assignment" : "Select a course first"}
        </option>

        {filteredAssignments.map((assignment) => (
          <option key={assignment._id} value={assignment._id}>
            {assignment.title}
          </option>
        ))}
      </select>

      {/* Score */}
      <Input
        value={grade.score}
        onChange={({ target }) => handleChange("score", target.value)}
        label="Score"
        placeholder="Enter score (0-100)"
        type="number"
        min="0"
        max="100"
      />

      {/* Weight */}
      <Input
        value={grade.weight}
        onChange={({ target }) => handleChange("weight", target.value)}
        label="Weight"
        placeholder="Enter weight (0-100)"
        type="number"
        min="0"
        max="100"
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
        >
          Add Grade
        </button>
      </div>
    </div>
  );
};

export default AddGradeForm;
