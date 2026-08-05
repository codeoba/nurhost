/**
 * Filename Sanitation Engine (Master Prompt Section 3.7)
 * Ensures uploaded files are safe, clean, normalized, and predictable
 * across all storage backends (S3, Contabo, local disk, FTP).
 */

function sanitizeFilename(originalName = "unnamed_file") {
  if (!originalName || typeof originalName !== "string") {
    originalName = "unnamed_file";
  }

  // 1. Trim whitespace
  let cleanName = originalName.trim();

  // 2. Separate extension from base name
  const lastDotIndex = cleanName.lastIndexOf(".");
  let ext = "";
  let baseName = cleanName;

  if (lastDotIndex > 0) {
    baseName = cleanName.substring(0, lastDotIndex);
    ext = cleanName.substring(lastDotIndex + 1).toLowerCase();
  }

  // Dangerous multi-extension check (e.g. file.mp4.exe -> file.mp4)
  const dangerousExts = ["exe", "bat", "cmd", "sh", "php", "pl", "cgi", "vbs", "js", "jar"];
  if (dangerousExts.includes(ext) && baseName.includes(".")) {
    const prevDotIndex = baseName.lastIndexOf(".");
    ext = baseName.substring(prevDotIndex + 1).toLowerCase();
    baseName = baseName.substring(0, prevDotIndex);
  }

  // 3. Remove non-printable / unicode emoji characters
  baseName = baseName.replace(/[\u1000-\uFFFF\uD800-\uDBFF\uDC00-\uDFFF]/g, "");

  // 4. Replace illegal special characters with underscore
  // Forbidden: # % & { } \ < > * ? / $ ! ' " : @ + | =
  baseName = baseName.replace(/[#%&{}\\<>*?/$!'":@+|=]/g, "_");

  // 5. Convert multiple spaces / dashes to single underscore
  baseName = baseName.replace(/[\s\-_]+/g, "_");

  // 6. Remove leading and trailing dots, underscores, or dashes
  baseName = baseName.replace(/^[\.\-_]+|[\.\-_]+$/g, "");

  // 7. Fallback if baseName is empty after cleaning
  if (!baseName || baseName.length === 0) {
    baseName = `file_${Date.now()}`;
  }

  // 8. Limit length to 150 characters while preserving extension
  if (baseName.length > 150) {
    baseName = baseName.substring(0, 150);
  }

  const finalFilename = ext ? `${baseName}.${ext}` : baseName;
  return {
    cleanFilename: finalFilename,
    originalFilename: originalName,
    extension: ext,
  };
}

module.exports = { sanitizeFilename };
