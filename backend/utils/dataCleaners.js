// Remove duplicate rows from a dataset
const removeDuplicates = (data) => {
  const uniqueMap = new Map();

  return data.filter((row) => {
    // Create a string key from all values in the row
    const key = JSON.stringify(row);

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, true);
      return true;
    }

    return false;
  });
};

const handleMissingValues = (data, strategy = "remove") => {
  if (!data.length) return [];

  if (strategy === "remove") {
    // Remove rows with any missing values
    return data.filter((row) => {
      return Object.values(row).every(
        (value) => value !== null && value !== undefined && value !== ""
      );
    });
  }

  // Get all column names
  const columns = Object.keys(data[0]);

  // Compute replacement values for each numeric column based on the strategy
  const replacementValues = {};

  columns.forEach((column) => {
    // Check if the column contains numeric values
    const numericValues = data
      .map((row) => row[column])
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !isNaN(parseFloat(value))
      )
      .map((value) => parseFloat(value));

    if (numericValues.length > 0) {
      let replacementValue;

      switch (strategy) {
        case "mean":
          replacementValue =
            numericValues.reduce((sum, val) => sum + val, 0) /
            numericValues.length;
          break;
        case "median":
          numericValues.sort((a, b) => a - b);
          const mid = Math.floor(numericValues.length / 2);
          replacementValue =
            numericValues.length % 2 === 0
              ? (numericValues[mid - 1] + numericValues[mid]) / 2
              : numericValues[mid];
          break;
        case "mode":
          // Find the most frequent value
          const frequency = {};
          numericValues.forEach((val) => {
            frequency[val] = (frequency[val] || 0) + 1;
          });
          let maxFreq = 0;
          for (const val in frequency) {
            if (frequency[val] > maxFreq) {
              maxFreq = frequency[val];
              replacementValue = parseFloat(val);
            }
          }
          break;
        case "zero":
          replacementValue = 0;
          break;
        default:
          replacementValue = null;
      }

      replacementValues[column] = replacementValue;
    }
  });

  // Replace missing values in the dataset
  return data.map((row) => {
    const newRow = { ...row };

    columns.forEach((column) => {
      const value = row[column];

      if (value === null || value === undefined || value === "") {
        if (replacementValues[column] !== undefined) {
          newRow[column] = replacementValues[column];
        }
      }
    });

    return newRow;
  });
};

const standardizeData = (data, columns) => {
  if (!data.length || !columns.length) return data;

  // Calculate mean and standard deviation for each column
  const stats = {};

  columns.forEach((column) => {
    const values = data
      .map((row) => row[column])
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !isNaN(parseFloat(value))
      )
      .map((value) => parseFloat(value));

    if (values.length > 0) {
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

      const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
      const variance =
        squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
      const stdDev = Math.sqrt(variance);

      stats[column] = { mean, stdDev };
    }
  });

  // Apply standardization (z-score) to each value
  return data.map((row) => {
    const newRow = { ...row };

    columns.forEach((column) => {
      if (
        stats[column] &&
        row[column] !== null &&
        row[column] !== undefined &&
        row[column] !== ""
      ) {
        const value = parseFloat(row[column]);
        if (!isNaN(value)) {
          const { mean, stdDev } = stats[column];
          newRow[column] = stdDev !== 0 ? (value - mean) / stdDev : 0;
        }
      }
    });

    return newRow;
  });
};

// Export clean data utilities
const cleanData = {
  removeDuplicates,
};

module.exports = {
  cleanData,
  handleMissingValues,
  standardizeData,
};
