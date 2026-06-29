const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// ─── Per-context constraints ─────────────────────────────────────────────────

const CONTEXT_RULES = {
  submission: {
    allowedMimes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ],
    maxBytes: 20 * 1024 * 1024, // 20 MB
  },
  avatar: {
    allowedMimes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 2 * 1024 * 1024, // 2 MB
  },
  "lesson-asset": {
    allowedMimes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ],
    maxBytes: 500 * 1024 * 1024, // 500 MB
  },
};

const VALID_CONTEXTS = Object.keys(CONTEXT_RULES);

// ─── Storage ─────────────────────────────────────────────────────────────────

/**
 * Disk storage: files land in uploads/<context>/
 * Filename is a random hex string to avoid collisions and path-traversal risks.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const context = req.body.context;
    // Fallback to "misc" if context hasn't been validated yet —
    // the file filter below will reject invalid contexts before this matters.
    const folder = VALID_CONTEXTS.includes(context) ? context : "misc";
    cb(null, path.join("uploads", folder));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    cb(null, uniqueName);
  },
});

// ─── File filter ──────────────────────────────────────────────────────────────

const fileFilter = (req, file, cb) => {
  const context = req.body.context;

  if (!context || !VALID_CONTEXTS.includes(context)) {
    return cb(
      Object.assign(new Error("Invalid or missing context."), { code: "INVALID_CONTEXT" }),
      false
    );
  }

  const rules = CONTEXT_RULES[context];
  if (!rules.allowedMimes.includes(file.mimetype)) {
    return cb(
      Object.assign(new Error("File type not allowed for this context."), {
        code: "UNSUPPORTED_FILE_TYPE",
      }),
      false
    );
  }

  cb(null, true);
};

// ─── Multer instance ──────────────────────────────────────────────────────────

/**
 * Max file size is set to the largest allowed context (500 MB for lesson-asset).
 * Per-context size enforcement is done in the controller after the upload,
 * since multer's limits.fileSize applies globally — not per context.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

module.exports = { upload, CONTEXT_RULES };
