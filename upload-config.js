/**
 * upload-config.js
 * ─────────────────────────────────────────────────────────────────
 * Centralised file-upload configuration.
 *
 * ALLOWED_MIME_TYPES
 *   A Map whose keys are the canonical MIME type strings accepted by
 *   the application and whose values are human-readable labels.
 *
 * ALLOWED_EXTENSIONS
 *   A Set of lower-cased file extensions (with leading dot) that mirror
 *   the MIME types above.  Both lists MUST be kept in sync so that
 *   client-side validation can check either the browser-reported
 *   file.type OR the filename suffix as a fallback.
 *
 * MAX_FILE_SIZE_BYTES
 *   Hard upper limit (in bytes) applied to every selected file.
 *   Default: 50 MB.
 *
 * UPLOAD_ENDPOINT
 *   The relative (or absolute) URL that the upload widget POSTs to.
 *   Override per-environment via the data-endpoint attribute on the
 *   <input> element, or swap the value here at build time.
 */

'use strict';

/** @type {Map<string, string>} */
const ALLOWED_MIME_TYPES = new Map([
  // ── Images ───────────────────────────────────────────────────────
  ['image/jpeg',                                                         'JPEG image'],
  ['image/png',                                                          'PNG image'],
  ['image/gif',                                                          'GIF image'],
  ['image/webp',                                                         'WebP image'],
  ['image/svg+xml',                                                      'SVG image'],

  // ── Documents ────────────────────────────────────────────────────
  ['application/pdf',                                                    'PDF document'],

  // ── Microsoft Word ───────────────────────────────────────────────
  ['application/msword',                                                 'Word document (.doc)'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                                                         'Word document (.docx)'],

  // ── Microsoft Excel ──────────────────────────────────────────────
  ['application/vnd.ms-excel',                                           'Excel spreadsheet (.xls)'],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  'Excel spreadsheet (.xlsx)'],

  // ── Microsoft PowerPoint ─────────────────────────────────────────
  ['application/vnd.ms-powerpoint',                                      'PowerPoint presentation (.ppt)'],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation',
                                                                         'PowerPoint presentation (.pptx)'],

  // ── Plain text ───────────────────────────────────────────────────
  ['text/plain',                                                         'Plain text file'],

  // ── Archives ─────────────────────────────────────────────────────
  ['application/zip',                                                    'ZIP archive'],
  ['application/x-zip-compressed',                                       'ZIP archive'],
]);

/** @type {Set<string>} */
const ALLOWED_EXTENSIONS = new Set([
  // Images
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',

  // Documents
  '.pdf',

  // Microsoft Word
  '.doc',
  '.docx',

  // Microsoft Excel
  '.xls',
  '.xlsx',

  // Microsoft PowerPoint
  '.ppt',
  '.pptx',   // ← PowerPoint Open XML presentation

  // Plain text
  '.txt',

  // Archives
  '.zip',
]);

/** Maximum individual file size: 50 MB */
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/** Default upload endpoint — override per deployment */
const UPLOAD_ENDPOINT = '/api/upload';

// ── CommonJS / ES-module dual export ─────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ALLOWED_MIME_TYPES,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE_BYTES,
    UPLOAD_ENDPOINT,
  };
}
