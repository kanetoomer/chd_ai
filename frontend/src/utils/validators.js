export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

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
