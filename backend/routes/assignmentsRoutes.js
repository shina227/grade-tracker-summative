const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

const {
  submitAssignmentWork,
  listAssignmentSubmissions,
  getSubmission,
  updateSubmissionStatus,
} = require("../controllers/submissionsController");

const router = express.Router();

router.use(protect);

// Assignment CRUD

/**
 * @swagger
 * /assignments:
 *   get:
 *     summary: List all assignments visible to the current user
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Assignment'
 *       401:
 *         description: Unauthorized
 */
router.get("/", getAssignments);

/**
 * @swagger
 * /assignments/{assignmentId}:
 *   get:
 *     summary: Get a single assignment by ID
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AssignmentId'
 *     responses:
 *       200:
 *         description: Assignment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignment'
 *       404:
 *         description: Assignment not found
 */
router.get("/:assignmentId", getAssignment);

/**
 * @swagger
 * /assignments/{assignmentId}:
 *   patch:
 *     summary: Update an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     description: Requires teacher or admin role.
 *     parameters:
 *       - $ref: '#/components/parameters/AssignmentId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignmentUpdateInput'
 *     responses:
 *       200:
 *         description: Updated assignment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignment'
 *       403:
 *         description: Forbidden — requires teacher or admin role
 *       404:
 *         description: Assignment not found
 */
router.patch("/:assignmentId", requireRole("teacher", "admin"), updateAssignment);

/**
 * @swagger
 * /assignments/{assignmentId}:
 *   delete:
 *     summary: Delete an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     description: Requires teacher or admin role.
 *     parameters:
 *       - $ref: '#/components/parameters/AssignmentId'
 *     responses:
 *       204:
 *         description: Assignment deleted successfully
 *       403:
 *         description: Forbidden — requires teacher or admin role
 *       404:
 *         description: Assignment not found
 */
router.delete("/:assignmentId", requireRole("teacher", "admin"), deleteAssignment);

// Submissions sub-routes

/**
 * @swagger
 * /assignments/{assignmentId}/submissions:
 *   post:
 *     summary: Submit work for an assignment
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     description: Requires student role.
 *     parameters:
 *       - $ref: '#/components/parameters/AssignmentId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmissionInput'
 *     responses:
 *       201:
 *         description: Submission created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       403:
 *         description: Forbidden — requires student role
 */
router.post("/:assignmentId/submissions", requireRole("student"), submitAssignmentWork);

/**
 * @swagger
 * /assignments/{assignmentId}/submissions:
 *   get:
 *     summary: List all submissions for an assignment
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     description: Requires teacher or admin role.
 *     parameters:
 *       - $ref: '#/components/parameters/AssignmentId'
 *     responses:
 *       200:
 *         description: List of submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Submission'
 *       403:
 *         description: Forbidden — requires teacher or admin role
 */
router.get("/:assignmentId/submissions", requireRole("teacher", "admin"), listAssignmentSubmissions);

/**
 * @swagger
 * /assignments/{assignmentId}/submissions/{submissionId}:
 *   get:
 *     summary: Get a single submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AssignmentId'
 *       - $ref: '#/components/parameters/SubmissionId'
 *     responses:
 *       200:
 *         description: Submission details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       404:
 *         description: Submission not found
 */
router.get("/:assignmentId/submissions/:submissionId", getSubmission);

/**
 * @swagger
 * /assignments/{assignmentId}/submissions/{submissionId}:
 *   patch:
 *     summary: Update a submission's status (e.g. grade, return for revision)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     description: Requires teacher or admin role.
 *     parameters:
 *       - $ref: '#/components/parameters/AssignmentId'
 *       - $ref: '#/components/parameters/SubmissionId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmissionStatusUpdateInput'
 *     responses:
 *       200:
 *         description: Updated submission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       403:
 *         description: Forbidden — requires teacher or admin role
 *       404:
 *         description: Submission not found
 */
router.patch("/:assignmentId/submissions/:submissionId", requireRole("teacher", "admin"), updateSubmissionStatus);

module.exports = router;