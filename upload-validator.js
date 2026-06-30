/**
 * upload-validator.js
 * ─────────────────────────────────────────────────────────────────
 * Reusable file-upload validation logic.
 *
 * Depends on:  upload-config.js  (must be loaded first in the browser,
 *              or required/imported in a Node.js context).
 *
 * PUBLIC API
 * ──────────
 *  validateFile(file)          → ValidationResult
 *  validateFiles(fileList)     → ValidationResult[]
 *  buildAcceptAttribute()      → string   (for <input accept="…">)
 *  getHumanReadableTypes()     → string   (comma-separated labels)
 *
 * ValidationResult shape:
 *  {
 *    file    : File,
 *    valid   : boolean,
 *    errors  : string[]   // empty when valid === true
 *  }
 */

'use strict';

/* ── Resolve config (browser globals or CommonJS require) ─────── */
let _cfg;
if (typeof module !== 'undefined' && module.exports) {
  _cfg = require('./upload-config.js');
} else {
  /* In the browser both scripts are loaded via <script> tags;
     the config attaches its exports to the global scope only in
     Node.js, so we read directly from the named constants. */
  _cfg = {
    ALLOWED_MIME_TYPES,   // eslint-disable-line no-undef
    ALLOWED_EXTENSIONS,   // eslint-disable-line no-undef
    MAX_FILE_SIZE_BYTES,  // eslint-disable-line no-undef
  };
}

const { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES } = _cfg;

/* ── Helpers ────────────────────────────────────────────────────── */

/**
 * Extract the lower-cased extension from a filename, e.g. ".pptx".
 * Returns an empty string when no extension is present.
 * @param {string} filename
 * @returns {string}
 */
function getExtension(filename) {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) return '';
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Format a byte count as a human-readable string (e.g. "12.3 MB").
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes < 1024)            return `${bytes} B`;
  if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Core validation ────────────────────────────────────────────── */

/**
 * Validate a single File object against the upload configuration.
 *
 * Checks (in order):
 *  1. MIME type must appear in ALLOWED_MIME_TYPES.
 *  2. File extension must appear in ALLOWED_EXTENSIONS.
 *  3. File size must not exceed MAX_FILE_SIZE_BYTES.
 *
 * @param {File} file
 * @returns {{ file: File, valid: boolean, errors: string[] }}
 */
function validateFile(file) {
  const errors = [];

  /* 1 ── MIME type check ──────────────────────────────────────── */
  const mime = (file.type || '').toLowerCase();

  if (!mime) {
    errors.push(
      'Could not determine the file type. Please ensure the file is not corrupted.'
    );
  } else if (!ALLOWED_MIME_TYPES.has(mime)) {
    errors.push(
      `File type "${mime}" is not allowed. ` +
      `Accepted types: ${getHumanReadableTypes()}.`
    );
  }

  /* 2 ── Extension check (defence-in-depth / MIME spoofing guard) */
  const ext = getExtension(file.name);

  if (!ext) {
    errors.push(
      'The file has no extension. Please rename the file and include its extension (e.g. ".pptx").'
    );
  } else if (!ALLOWED_EXTENSIONS.has(ext)) {
    errors.push(
      `The file extension "${ext}" is not permitted. ` +
      `Allowed extensions: ${[...ALLOWED_EXTENSIONS].join(', ')}.`
    );
  }

  /* 3 ── Size check ───────────────────────────────────────────── */
  if (file.size > MAX_FILE_SIZE_BYTES) {
    errors.push(
      `File is too large (${formatBytes(file.size)}). ` +
      `Maximum allowed size is ${formatBytes(MAX_FILE_SIZE_BYTES)}.`
    );
  }

  return { file, valid: errors.length === 0, errors };
}

/**
 * Validate every file in a FileList (or plain array of File objects).
 * @param {FileList|File[]} fileList
 * @returns {Array<{ file: File, valid: boolean, errors: string[] }>}
 */
function validateFiles(fileList) {
  return Array.from(fileList).map(validateFile);
}

/* ── Utility helpers for the UI layer ──────────────────────────── */

/**
 * Build the value suitable for an <input type="file" accept="…"> attribute.
 * Combines every allowed MIME type and every allowed extension.
 * @returns {string}
 */
function buildAcceptAttribute() {
  const mimes = [...ALLOWED_MIME_TYPES.keys()];
  const exts  = [...ALLOWED_EXTENSIONS];
  return [...mimes, ...exts].join(',');
}

/**
 * Return a comma-separated, human-readable list of allowed file-type labels.
 * @returns {string}
 */
function getHumanReadableTypes() {
  return [...ALLOWED_MIME_TYPES.values()].join(', ');
}

/* ── Exports ────────────────────────────────────────────────────── */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateFile, validateFiles, buildAcceptAttribute, getHumanReadableTypes };
}
