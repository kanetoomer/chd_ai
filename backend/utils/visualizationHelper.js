/**
 * Visualization helper functions for generating chart data
 */

/**
 * Generate data for a bar chart
 * @param {Array} data - The dataset
 * @param {String} categoryField - Field to use as categories (x-axis)
 * @param {String} valueField - Field to measure (y-axis)
 * @param {String} aggregation - Aggregation method (sum, avg, count, min, max)
 * @returns {Object} - Formatted data for a bar chart
 */
const generateBarChartData = (
  data,
  categoryField,
  valueField,
  aggregation = "sum"
) => {
  // Validate inputs
  if (!data || !data.length || !categoryField || !valueField) {
    return { error: "Invalid input parameters" };
  }

  // Group data by category
  const groupedData = {};

  data.forEach((row) => {
    const category = row[categoryField];
    const value = parseFloat(row[valueField]);

    if (category && !isNaN(value)) {
      if (!groupedData[category]) {
        groupedData[category] = {
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
          values: [],
        };
      }

      groupedData[category].count += 1;
      groupedData[category].sum += value;
      groupedData[category].min = Math.min(groupedData[category].min, value);
      groupedData[category].max = Math.max(groupedData[category].max, value);
      groupedData[category].values.push(value);
    }
  });

  // Calculate aggregated values based on selected method
  const chartData = Object.keys(groupedData).map((category) => {
    const group = groupedData[category];
    let aggregatedValue;

    switch (aggregation) {
      case "sum":
        aggregatedValue = group.sum;
        break;
      case "avg":
        aggregatedValue = group.sum / group.count;
        break;
      case "count":
        aggregatedValue = group.count;
        break;
      case "min":
        aggregatedValue = group.min;
        break;
      case "max":
        aggregatedValue = group.max;
        break;
      default:
        aggregatedValue = group.sum;
    }

    return {
      category,
      value: aggregatedValue,
    };
  });

  return {
    chartType: "bar",
    data: chartData,
    xAxis: categoryField,
    yAxis: `${aggregation} of ${valueField}`,
  };
};

/**
 * Generate data for a line chart
 * @param {Array} data - The dataset
 * @param {String} timeField - Field to use as time series (x-axis)
 * @param {Array} valueFields - Fields to measure (multiple y-axis values)
 * @param {String} aggregation - Aggregation method (sum, avg)
 * @returns {Object} - Formatted data for a line chart
 */
const generateLineChartData = (
  data,
  timeField,
  valueFields,
  aggregation = "avg"
) => {
  // Validate inputs
  if (
    !data ||
    !data.length ||
    !timeField ||
    !valueFields ||
    !valueFields.length
  ) {
    return { error: "Invalid input parameters" };
  }

  // Sort data by time field
  const sortedData = [...data].sort((a, b) => {
    const timeA = new Date(a[timeField]);
    const timeB = new Date(b[timeField]);
    return timeA - timeB;
  });

  // Group data by time period
  const groupedData = {};

  sortedData.forEach((row) => {
    const timePeriod = row[timeField];

    if (!groupedData[timePeriod]) {
      groupedData[timePeriod] = {
        count: 0,
        values: {},
      };

      // Initialize value fields
      valueFields.forEach((field) => {
        groupedData[timePeriod].values[field] = {
          sum: 0,
          count: 0,
        };
      });
    }

    groupedData[timePeriod].count += 1;

    // Accumulate values for each field
    valueFields.forEach((field) => {
      const value = parseFloat(row[field]);
      if (!isNaN(value)) {
        groupedData[timePeriod].values[field].sum += value;
        groupedData[timePeriod].values[field].count += 1;
      }
    });
  });

  // Format data for line chart
  const chartData = Object.keys(groupedData).map((timePeriod) => {
    const result = {
      timePeriod,
    };

    valueFields.forEach((field) => {
      const { sum, count } = groupedData[timePeriod].values[field];
      result[field] = aggregation === "avg" && count > 0 ? sum / count : sum;
    });

    return result;
  });

  return {
    chartType: "line",
    data: chartData,
    xAxis: timeField,
    yAxis: valueFields,
    aggregation,
  };
};

/**
 * Generate data for a pie chart
 * @param {Array} data - The dataset
 * @param {String} categoryField - Field to use as categories
 * @param {String} valueField - Field to measure
 * @returns {Object} - Formatted data for a pie chart
 */
const generatePieChartData = (data, categoryField, valueField) => {
  // Validate inputs
  if (!data || !data.length || !categoryField || !valueField) {
    return { error: "Invalid input parameters" };
  }

  // Group data by category
  const groupedData = {};

  data.forEach((row) => {
    const category = row[categoryField];
    const value = parseFloat(row[valueField]);

    if (category && !isNaN(value)) {
      if (!groupedData[category]) {
        groupedData[category] = 0;
      }

      groupedData[category] += value;
    }
  });

  // Format data for pie chart
  const chartData = Object.keys(groupedData).map((category) => ({
    category,
    value: groupedData[category],
  }));

  // Calculate total for percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Add percentage to each slice
  const chartDataWithPercentage = chartData.map((item) => ({
    ...item,
    percentage: (item.value / total) * 100,
  }));

  return {
    chartType: "pie",
    data: chartDataWithPercentage,
    categoryField,
    valueField,
    total,
  };
};

/**
 * Generate data for a scatter plot
 * @param {Array} data - The dataset
 * @param {String} xField - Field for x-axis
 * @param {String} yField - Field for y-axis
 * @param {String} labelField - Field for data point labels (optional)
 * @param {String} sizeField - Field for data point size (optional)
 * @returns {Object} - Formatted data for a scatter plot
 */
const generateScatterPlotData = (
  data,
  xField,
  yField,
  labelField = null,
  sizeField = null
) => {
  // Validate inputs
  if (!data || !data.length || !xField || !yField) {
    return { error: "Invalid input parameters" };
  }

  // Extract data points
  const scatterData = data
    .filter((row) => {
      const x = parseFloat(row[xField]);
      const y = parseFloat(row[yField]);
      return !isNaN(x) && !isNaN(y);
    })
    .map((row) => {
      const result = {
        x: parseFloat(row[xField]),
        y: parseFloat(row[yField]),
      };

      // Add optional label
      if (labelField && row[labelField]) {
        result.label = row[labelField];
      }

      // Add optional size
      if (sizeField && !isNaN(parseFloat(row[sizeField]))) {
        result.size = parseFloat(row[sizeField]);
      }

      return result;
    });

  return {
    chartType: "scatter",
    data: scatterData,
    xAxis: xField,
    yAxis: yField,
  };
};

/**
 * Generate data for a heatmap
 * @param {Array} data - The dataset
 * @param {String} rowField - Field for row categories
 * @param {String} columnField - Field for column categories
 * @param {String} valueField - Field for cell values
 * @returns {Object} - Formatted data for a heatmap
 */
const generateHeatmapData = (data, rowField, columnField, valueField) => {
  // Validate inputs
  if (!data || !data.length || !rowField || !columnField || !valueField) {
    return { error: "Invalid input parameters" };
  }

  // Get unique row and column values
  const rowValues = [...new Set(data.map((item) => item[rowField]))];
  const columnValues = [...new Set(data.map((item) => item[columnField]))];

  // Create a 2D matrix for heatmap values
  const heatmapData = [];

  rowValues.forEach((row) => {
    const rowData = {
      [rowField]: row,
    };

    // Initialize all columns with null
    columnValues.forEach((col) => {
      rowData[col] = null;
    });

    // Fill in actual values
    data.forEach((item) => {
      if (item[rowField] === row && columnValues.includes(item[columnField])) {
        const value = parseFloat(item[valueField]);
        if (!isNaN(value)) {
          rowData[item[columnField]] = value;
        }
      }
    });

    heatmapData.push(rowData);
  });

  // Calculate min and max values for color scaling
  let minValue = Infinity;
  let maxValue = -Infinity;

  heatmapData.forEach((row) => {
    columnValues.forEach((col) => {
      const value = row[col];
      if (value !== null) {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    });
  });

  return {
    chartType: "heatmap",
    data: heatmapData,
    rows: rowValues,
    columns: columnValues,
    minValue,
    maxValue,
  };
};

module.exports = {
  generateBarChartData,
  generateLineChartData,
  generatePieChartData,
  generateScatterPlotData,
  generateHeatmapData,
};
