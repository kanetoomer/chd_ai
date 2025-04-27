/**
 * Custom parser for .data files
 * Handles various data file formats
 */
const parse = (fileContent) => {
  // Split the content by lines
  const lines = fileContent
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  // Check if there's a header row
  const hasHeader = !lines[0].split(/[,\t]/).some((val) => {
    const trimmed = val.trim();
    return !isNaN(parseFloat(trimmed)) && isFinite(trimmed);
  });

  const delimiter = detectDelimiter(lines[0]);
  let headers = [];
  let startIndex = 0;

  if (hasHeader) {
    headers = lines[0].split(delimiter).map((h) => h.trim());
    startIndex = 1;
  } else {
    // If no headers, generate column names
    const columnCount = lines[0].split(delimiter).length;
    headers = Array.from({ length: columnCount }, (_, i) => `Column${i + 1}`);
  }

  // Process data rows
  const data = [];
  for (let i = startIndex; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map((v) => v.trim());
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // Try to convert to number if possible
        row[header] = isNumeric(value) ? parseFloat(value) : value;
      });
      data.push(row);
    }
  }

  return data;
};

/**
 * Detect the delimiter used in the data file
 */
const detectDelimiter = (line) => {
  const delimiters = [",", "\t", ";", "|"];
  let maxCount = 0;
  let detectedDelimiter = ","; // default

  for (const delimiter of delimiters) {
    const count = (line.match(new RegExp(delimiter, "g")) || []).length;
    if (count > maxCount) {
      maxCount = count;
      detectedDelimiter = delimiter;
    }
  }

  return detectedDelimiter;
};

/**
 * Check if a string value can be converted to a number
 */
const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

module.exports = {
  parse,
};
