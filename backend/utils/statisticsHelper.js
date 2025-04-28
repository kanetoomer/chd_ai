const generateSummaryStatistics = (data) => {
  if (!data || !data.length) return {};

  const columns = Object.keys(data[0]);
  const summary = {};

  columns.forEach((column) => {
    // Extract values for the column
    const values = data
      .map((row) => row[column])
      .filter((value) => value !== null && value !== undefined && value !== "");

    // Check if the column contains numeric values
    const numericValues = values
      .filter((value) => !isNaN(parseFloat(value)))
      .map((value) => parseFloat(value));

    const isNumeric = numericValues.length > 0;

    // Calculate basic statistics
    summary[column] = {
      count: values.length,
      missingCount: data.length - values.length,
      type: isNumeric ? "numeric" : "categorical",
    };

    if (isNumeric) {
      // Calculate numeric statistics
      numericValues.sort((a, b) => a - b);

      const min = numericValues[0];
      const max = numericValues[numericValues.length - 1];
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const mean = sum / numericValues.length;

      // Calculate median
      const midIndex = Math.floor(numericValues.length / 2);
      const median =
        numericValues.length % 2 === 0
          ? (numericValues[midIndex - 1] + numericValues[midIndex]) / 2
          : numericValues[midIndex];

      // Calculate standard deviation
      const squaredDiffs = numericValues.map((val) => Math.pow(val - mean, 2));
      const variance =
        squaredDiffs.reduce((acc, val) => acc + val, 0) / numericValues.length;
      const stdDev = Math.sqrt(variance);

      // Calculate quartiles
      const q1Index = Math.floor(numericValues.length * 0.25);
      const q3Index = Math.floor(numericValues.length * 0.75);
      const q1 = numericValues[q1Index];
      const q3 = numericValues[q3Index];

      // Calculate IQR and identify outliers
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      const outliers = numericValues.filter(
        (val) => val < lowerBound || val > upperBound
      );

      Object.assign(summary[column], {
        min,
        max,
        range: max - min,
        sum,
        mean,
        median,
        stdDev,
        variance,
        q1,
        q3,
        iqr,
        outlierCount: outliers.length,
      });
    } else {
      // Calculate categorical statistics
      const frequency = {};
      values.forEach((val) => {
        frequency[val] = (frequency[val] || 0) + 1;
      });

      // Find the most frequent value (mode)
      let maxFreq = 0;
      let mode = null;

      for (const val in frequency) {
        if (frequency[val] > maxFreq) {
          maxFreq = frequency[val];
          mode = val;
        }
      }

      // Get unique values
      const uniqueValues = Object.keys(frequency);

      Object.assign(summary[column], {
        uniqueCount: uniqueValues.length,
        mode,
        modeFrequency: maxFreq,
        modePercentage: (maxFreq / values.length) * 100,
        categories: frequency,
      });
    }
  });

  return summary;
};

module.exports = {
  generateSummaryStatistics,
};
