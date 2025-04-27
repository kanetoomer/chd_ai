/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - Is valid file type
 */
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {boolean} - Is valid file size
 */
export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

/**
 * Validate CSV file structure
 * @param {string} csvContent - CSV content
 * @returns {boolean} - Is valid CSV structure
 */
export const isValidCsvStructure = (csvContent) => {
  // Simple validation: check for comma-delimited content
  const lines = csvContent.trim().split("\n");

  if (lines.length < 2) {
    return false; // Need at least header and one data row
  }

  const headerColumns = lines[0].split(",").length;

  // Check if all rows have the same number of columns
  return lines.every((line) => line.split(",").length === headerColumns);
};
