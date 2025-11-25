import React, { useState, useEffect, useMemo } from "react";
import Input from "../Inputs/Input";
import toast from "react-hot-toast";

const EditGradeForm = ({
  grade,
  courses = [],
  assignments = [],
  onUpdateGrade,
}) => {
  const [form, setForm] = useState({
    courseId: "",
    assignmentId: "",
    score: "",
    weight: "",
  });

  useEffect(() => {
    if (grade) {
      setForm({
        courseId: grade.courseId?._id || grade.courseId || "",
        assignmentId: grade.assignmentId?._id || grade.assignmentId || "",
        score: grade.score || "",
        weight: grade.weight || "",
      });
    }
  }, [grade]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  // Filter assignments based on selected course
  const filteredAssignments = useMemo(() => {
    if (!form.courseId) return [];
    return assignments.filter(
      (a) => a.courseId?._id === form.courseId || a.courseId === form.courseId
    );
  }, [form.courseId, assignments]);

  const handleSubmit = () => {
    if (!form.courseId) {
      toast.error("Course is required.");
      return;
    }
    if (!form.assignmentId) {
      toast.error("Assignment is required.");
      return;
    }
    if (form.score < 0 || form.score > 100) {
      toast.error("Score must be between 0 and 100.");
      return;
    }
    if (form.weight < 0 || form.weight > 100) {
      toast.error("Weight must be between 0 and 100.");
      return;
    }

    onUpdateGrade({
      ...form,
      score: Number(form.score) || 0,
      weight: Number(form.weight) || 0,
    });
  };

  return (
    <div>
      {/* Select Course */}
      <label className="text-[13px] text-slate-800 block mb-2">Course</label>
      <select
        value={form.courseId}
        onChange={({ target }) => {
          handleChange("courseId", target.value);
          handleChange("assignmentId", ""); // reset assignment when course changes
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
        value={form.assignmentId}
        onChange={({ target }) => handleChange("assignmentId", target.value)}
        disabled={!form.courseId}
        className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">
          {form.courseId ? "Select Assignment" : "Select a course first"}
        </option>
        {filteredAssignments.map((assignment) => (
          <option key={assignment._id} value={assignment._id}>
            {assignment.title}
          </option>
        ))}
      </select>
      {form.courseId && filteredAssignments.length === 0 && (
        <p className="text-xs text-orange-600 mt-1">
          No assignments found for this course
        </p>
      )}

      {/* Score */}
      <Input
        value={form.score}
        onChange={({ target }) => handleChange("score", target.value)}
        label="Score"
        placeholder="Enter score (0-100)"
        type="number"
        min="0"
        max="100"
      />

      {/* Weight */}
      <Input
        value={form.weight}
        onChange={({ target }) => handleChange("weight", target.value)}
        label="Weight"
        placeholder="Enter weight (0-100)"
        type="number"
        min="0"
        max="100"
      />

      {/* Preview Weighted Score */}
      {form.score && form.weight && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-blue-700 font-medium mb-1">
            Weighted Score Preview
          </p>
          <p className="text-lg font-bold text-blue-900">
            {((Number(form.score) * Number(form.weight)) / 100).toFixed(2)}%
          </p>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
        >
          Update Grade
        </button>
      </div>
    </div>
  );
};

export default EditGradeForm;
