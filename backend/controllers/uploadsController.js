const path = require("path");
const { upload, CONTEXT_RULES } = require("../middleware/uploadMiddleware");

// ─── POST /v1/uploads ────────────────────────────────────────────────────────

/**
 * Handles multipart/form-data file uploads.
 * Expects fields: `file` (the file) and `context` (submission | avatar | lesson-asset).
 *
 * Flow:
 *  1. multer runs: validates context + MIME type, writes file to disk
 *  2. Controller enforces per-context size limit
 *  3. Returns the spec-compliant 201 response
 */
exports.uploadFile = [
  // Step 1: run multer — handles multipart parsing, file filter, and disk write
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (!err) return next();

      // Multer-level errors
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          message: "The uploaded file exceeds the maximum allowed size.",
          code: "FILE_TOO_LARGE",
        });
      }
      if (err.code === "UNSUPPORTED_FILE_TYPE") {
        return res.status(400).json({
          message: "This file type is not allowed for the selected context.",
          code: "UNSUPPORTED_FILE_TYPE",
        });
      }
      if (err.code === "INVALID_CONTEXT") {
        return res.status(400).json({
          message: "context must be one of: submission, avatar, lesson-asset.",
          code: "VALIDATION_ERROR",
          fields: { context: "Must be one of: submission, avatar, lesson-asset." },
        });
      }

      return res.status(400).json({ message: err.message, code: "UPLOAD_ERROR" });
    });
  },

  // Step 2: controller logic
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "No file was provided.",
        code: "VALIDATION_ERROR",
        fields: { file: "A file is required." },
      });
    }

    const { context } = req.body;

    // Per-context size enforcement (multer's global limit is 500 MB;
    // tighter limits for submission and avatar are checked here)
    const rules = CONTEXT_RULES[context];
    if (req.file.size > rules.maxBytes) {
      return res.status(413).json({
        message: `File exceeds the ${rules.maxBytes / (1024 * 1024)} MB limit for context "${context}".`,
        code: "FILE_TOO_LARGE",
      });
    }

    // Build the public URL using the server's base URL env var (or a fallback)
    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
    const relativePath = req.file.path.replace(/\\/g, "/"); // normalise Windows paths
    const url = `${baseUrl}/${relativePath}`;

    return res.status(201).json({
      url,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      context,
    });
  },
];
