const PDFDocument = require("pdfkit");
const Grades = require("../models/Grades");
const Courses = require("../models/Courses");
const Assignments = require("../models/Assignments");

// Add Grade
exports.addGrade = async (req, res) => {
  const userId = req.user.id;

  try {
    const { courseId, assignmentId, score, weight } = req.body;

    if (
      !courseId ||
      !assignmentId ||
      score === undefined ||
      weight === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if course and assignment exist
    const course = await Courses.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const assignment = await Assignments.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    // Create new grade
    const newGrade = new Grades({
      userId,
      courseId,
      assignmentId,
      score,
      weight,
    });

    await newGrade.save();
    res.status(200).json(newGrade);
  } catch (error) {
    console.error("Error adding grade:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Grades for a User
exports.getAllGrades = async (req, res) => {
  const userId = req.user.id;

  try {
    const grades = await Grades.find({ userId })
      .populate("courseId", "courseName")
      .populate("assignmentId", "title")
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (error) {
    console.error("Error getting grades:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Grade
exports.updateGrade = async (req, res) => {
  const userId = req.user.id;
  const gradeId = req.params.id;

  try {
    const grade = await Grades.findById(gradeId);
    if (!grade) return res.status(404).json({ message: "Grade not found" });

    // Only owner can update
    if (grade.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this grade" });
    }

    const updates = {};
    const allowedFields = ["score", "weight", "courseId", "assignmentId"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedGrade = await Grades.findByIdAndUpdate(gradeId, updates, {
      new: true,
    });

    res.json(updatedGrade);
  } catch (error) {
    console.error("Error updating grade:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Grade
exports.deleteGrade = async (req, res) => {
  try {
    await Grades.findByIdAndDelete(req.params.id);
    res.json({ message: "Grade deleted successfully" });
  } catch (error) {
    console.error("Error deleting grade:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Export pdf report
exports.generateGradesPDF = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch user grades + courses
    const grades = await Grades.find({ userId })
      .populate("courseId", "courseName")
      .populate("assignmentId", "title")
      .sort({ createdAt: -1 });

    const courses = await Courses.find({ userId });

    // Create the PDF
    const doc = new PDFDocument({ margin: 40 });

    // Set headers so browser knows it's a PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=grades_report.pdf"
    );

    // Pipe PDF to the response
    doc.pipe(res);

    // Title
    doc.fontSize(22).text("Academic Grades Report", { align: "center" });
    doc.moveDown();

    // Summary section
    doc.fontSize(14).text(`Generated on: ${new Date().toDateString()}`);
    doc.text(`Total Courses: ${courses.length}`);
    doc.text(`Total Graded Assignments: ${grades.length}`);
    doc.moveDown();

    doc.fontSize(18).text("Course Breakdown");
    doc.moveDown(0.5);

    // Table-ish output
    courses.forEach((course) => {
      doc.fontSize(14).text(`${course.courseName}`, { underline: true });
      doc.moveDown(0.5);

      const courseGrades = grades.filter(
        (g) => g.courseId?._id?.toString() === course._id.toString()
      );

      if (courseGrades.length === 0) {
        doc.fontSize(12).text("No grades recorded yet.");
        doc.moveDown();
        return;
      }

      courseGrades.forEach((g) => {
        doc
          .fontSize(12)
          .text(
            `• ${g.assignmentId?.title}: ${g.score}% (weight ${g.weight}%)`
          );
      });

      doc.moveDown();
    });

    // End PDF
    doc.end();
  } catch (error) {
    console.error("PDF error:", error);
    res.status(500).json({ message: "Failed to generate PDF." });
  }
};
