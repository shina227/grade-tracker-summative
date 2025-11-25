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
    return assignments.filter((a) => a.courseId === grade.courseId);
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
          handleChange("assignmentId", "");
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
        className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
      {grade.courseId && filteredAssignments.length === 0 && (
        <p className="text-xs text-orange-600 mt-1">
          No assignments found for this course
        </p>
      )}

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

      {/* Preview Weighted Score */}
      {grade.score && grade.weight && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-blue-700 font-medium mb-1">
            Weighted Score Preview
          </p>
          <p className="text-lg font-bold text-blue-900">
            {((Number(grade.score) * Number(grade.weight)) / 100).toFixed(2)}%
          </p>
        </div>
      )}

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
