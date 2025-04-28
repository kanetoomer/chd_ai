import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentReport,
  HiChartBar,
  HiChartPie,
  HiChartSquareBar,
  HiViewGrid,
  HiOutlineRefresh,
  HiDownload,
} from "react-icons/hi";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import toast from "react-hot-toast";

import PageHeader from "../components/layout/PageHeader";
import Loading from "../components/layout/Loading";
import ErrorDisplay from "../components/layout/ErrorDisplay";
import { useDataset } from "../context/DatasetContext";
import { generateChartColors, transparentize } from "../utils/colors";

const Visualizations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const { fetchDatasetById, currentDataset, loading, error } = useDataset();

  // Chart configuration
  const [chartType, setChartType] = useState("bar");
  const [chartConfig, setChartConfig] = useState({
    title: "",
    xAxis: "",
    yAxis: "",
    aggregation: "sum",
    colorScheme: "default",
  });

  // Chart data
  const [chartData, setChartData] = useState([]);

  // Available columns for visualization
  const [columns, setColumns] = useState({
    all: [],
    numeric: [],
    categorical: [],
  });

  // Fetch dataset on component mount
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDatasetById(id);

      if (data && data.data && data.data.length > 0) {
        // Categorize columns
        const allColumns = Object.keys(data.data[0]);

        const numericColumns = allColumns.filter(
          (key) => typeof data.data[0][key] === "number"
        );

        const categoricalColumns = allColumns.filter(
          (key) => typeof data.data[0][key] === "string"
        );

        setColumns({
          all: allColumns,
          numeric: numericColumns,
          categorical: categoricalColumns,
        });

        // Set default chart config based on available columns
        if (numericColumns.length > 0 && categoricalColumns.length > 0) {
          setChartConfig((prev) => ({
            ...prev,
            xAxis: categoricalColumns[0],
            yAxis: numericColumns[0],
          }));
        }
      }
    };

    loadData();
  }, [fetchDatasetById, id]);

  // Update chart config
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setChartConfig((prev) => ({ ...prev, [name]: value }));
  };

  // Update chart type
  const handleChartTypeChange = (type) => {
    setChartType(type);

    // Reset config based on chart type
    if (
      type === "pie" &&
      columns.numeric.length > 0 &&
      columns.categorical.length > 0
    ) {
      setChartConfig((prev) => ({
        ...prev,
        xAxis: columns.categorical[0],
        yAxis: columns.numeric[0],
      }));
    } else if (type === "scatter" && columns.numeric.length > 1) {
      setChartConfig((prev) => ({
        ...prev,
        xAxis: columns.numeric[0],
        yAxis: columns.numeric[1],
      }));
    }
  };

  // Generate chart data based on config
  const generateChartData = () => {
    if (
      !currentDataset ||
      !currentDataset.data ||
      currentDataset.data.length === 0
    ) {
      return [];
    }

    const { xAxis, yAxis, aggregation } = chartConfig;

    if (!xAxis || !yAxis) {
      return [];
    }

    try {
      if (chartType === "bar" || chartType === "line") {
        // Group by xAxis
        const groupedData = {};

        currentDataset.data.forEach((row) => {
          const category = row[xAxis];
          const value = parseFloat(row[yAxis]);

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
            groupedData[category].min = Math.min(
              groupedData[category].min,
              value
            );
            groupedData[category].max = Math.max(
              groupedData[category].max,
              value
            );
            groupedData[category].values.push(value);
          }
        });

        // Calculate aggregated values
        return Object.keys(groupedData).map((category) => {
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
            name: category,
            value: aggregatedValue,
          };
        });
      } else if (chartType === "pie") {
        const groupedData = {};

        currentDataset.data.forEach((row) => {
          const category = row[xAxis];
          const value = parseFloat(row[yAxis]);

          if (category && !isNaN(value)) {
            if (!groupedData[category]) {
              groupedData[category] = 0;
            }

            groupedData[category] += value;
          }
        });

        return Object.keys(groupedData).map((category) => ({
          name: category,
          value: groupedData[category],
        }));
      } else if (chartType === "scatter") {
        return currentDataset.data
          .filter((row) => {
            const x = parseFloat(row[xAxis]);
            const y = parseFloat(row[yAxis]);
            return !isNaN(x) && !isNaN(y);
          })
          .map((row) => ({
            x: parseFloat(row[xAxis]),
            y: parseFloat(row[yAxis]),
            name: row[columns.categorical[0]] || "",
          }));
      }

      return [];
    } catch (error) {
      console.error("Error generating chart data:", error);
      toast.error("Error generating chart. Please check your configuration.");
      return [];
    }
  };

  // Generate chart when config changes
  const handleGenerateChart = () => {
    const data = generateChartData();
    setChartData(data);
  };

  // Save chart as image
  const handleSaveChart = () => {
    if (!chartRef.current) {
      toast.error("Chart not available for export");
      return;
    }

    try {
      // Get SVG element
      const svgElement = chartRef.current.container.children[0];

      // Convert SVG to string
      const svgString = new XMLSerializer().serializeToString(svgElement);

      // Create canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Create image
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convert to data URL and download
        const dataURL = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.download = `${currentDataset.name}-${chartType}-chart.png`;
        link.href = dataURL;
        link.click();

        toast.success("Chart saved as image");
      };

      // Load SVG into image
      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgString)));
    } catch (error) {
      console.error("Error saving chart:", error);
      toast.error("Failed to save chart as image");
    }
  };

  // Render the selected chart type
  const renderChart = () => {
    const colors = generateChartColors(chartData.length);

    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
          <div className="text-center">
            <HiChartBar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No chart data
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure your chart and click "Generate Chart"
            </p>
          </div>
        </div>
      );
    }

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              ref={chartRef}
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                label={{
                  value: chartConfig.xAxis,
                  position: "bottom",
                  offset: 0,
                  dy: 30,
                }}
              />
              <YAxis
                label={{
                  value: `${chartConfig.aggregation} of ${chartConfig.yAxis}`,
                  angle: -90,
                  position: "insideLeft",
                  dx: -10,
                }}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="value"
                name={`${chartConfig.aggregation} of ${chartConfig.yAxis}`}
                fill="#4a80f0"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              ref={chartRef}
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                label={{
                  value: chartConfig.xAxis,
                  position: "bottom",
                  offset: 0,
                  dy: 30,
                }}
              />
              <YAxis
                label={{
                  value: `${chartConfig.aggregation} of ${chartConfig.yAxis}`,
                  angle: -90,
                  position: "insideLeft",
                  dx: -10,
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name={`${chartConfig.aggregation} of ${chartConfig.yAxis}`}
                stroke="#4a80f0"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart ref={chartRef}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toFixed(2)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              ref={chartRef}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="x"
                name={chartConfig.xAxis}
                label={{
                  value: chartConfig.xAxis,
                  position: "bottom",
                  offset: 0,
                  dy: 30,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={chartConfig.yAxis}
                label={{
                  value: chartConfig.yAxis,
                  angle: -90,
                  position: "insideLeft",
                  dx: -10,
                }}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Data Points" data={chartData} fill="#4a80f0" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "histogram":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={visualization.chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4a80f0" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "correlation":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Variable X" />
              <YAxis type="number" dataKey="y" name="Variable Y" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                name="Correlation Points"
                data={visualization.chartData}
                fill="#82ca9d"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg">
            <div className="text-center">
              <HiChartBar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Chart type "{visualization.type}" not supported
              </h3>
            </div>
          </div>
        );
    }
  };

  // Render loading state
  if (loading && !currentDataset) {
    return <Loading message="Loading dataset..." />;
  }

  // Render error state
  if (error && !currentDataset) {
    return (
      <ErrorDisplay error={error} resetError={() => fetchDatasetById(id)} />
    );
  }

  // Render no data state
  if (!currentDataset) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Dataset not found</h2>
        <p className="mt-2 text-gray-500">
          The dataset you're looking for doesn't exist or was deleted.
        </p>
        <button onClick={() => navigate("/")} className="mt-4 btn btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Data Visualization"
        description={`Create visual representations of "${currentDataset.name}"`}
        actions={
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/datasets/${id}`)}
              className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center rounded-md p-2"
            >
              <HiOutlineArrowLeft className="mr-2 h-5 w-5" />
              Back to Data
            </button>
            <button
              onClick={handleSaveChart}
              disabled={chartData.length === 0}
              className={`btn bg-purple-500 text-white hover:bg-purple-600 flex items-center rounded-md p-2 ${
                chartData.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <HiDownload className="mr-2 h-5 w-5" />
              Save Chart
            </button>
            <button
              onClick={() => navigate(`/reports/${response.reportId}`)}
              className="btn btn-primary flex items-center"
            >
              <HiOutlineDocumentReport className="mr-2 h-5 w-5" />
              Create Report
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart Configuration */}
        <div className="card md:col-span-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Chart Configuration
          </h3>

          {/* Chart Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChartTypeChange("bar")}
                className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium ${
                  chartType === "bar"
                    ? "bg-primary-100 border-primary-300 text-primary-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <HiChartBar className="mr-2 h-5 w-5" />
                Bar Chart
              </button>
              <button
                type="button"
                onClick={() => handleChartTypeChange("line")}
                className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium ${
                  chartType === "line"
                    ? "bg-primary-100 border-primary-300 text-primary-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <HiChartSquareBar className="mr-2 h-5 w-5" />
                Line Chart
              </button>
              <button
                type="button"
                onClick={() => handleChartTypeChange("pie")}
                className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium ${
                  chartType === "pie"
                    ? "bg-primary-100 border-primary-300 text-primary-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <HiChartPie className="mr-2 h-5 w-5" />
                Pie Chart
              </button>
              <button
                type="button"
                onClick={() => handleChartTypeChange("scatter")}
                className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium ${
                  chartType === "scatter"
                    ? "bg-primary-100 border-primary-300 text-primary-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <HiViewGrid className="mr-2 h-5 w-5" />
                Scatter Plot
              </button>
            </div>
          </div>

          {/* Chart Title */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Chart Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={chartConfig.title}
              onChange={handleConfigChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter chart title"
            />
          </div>

          {/* X-Axis Field */}
          <div className="mb-4">
            <label
              htmlFor="xAxis"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {chartType === "scatter"
                ? "X-Axis Field (Numeric)"
                : "Category Field"}
            </label>
            <select
              id="xAxis"
              name="xAxis"
              value={chartConfig.xAxis}
              onChange={handleConfigChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Select a field</option>
              {(chartType === "scatter" ? columns.numeric : columns.all).map(
                (column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Y-Axis Field */}
          <div className="mb-4">
            <label
              htmlFor="yAxis"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {chartType === "scatter"
                ? "Y-Axis Field (Numeric)"
                : "Value Field (Numeric)"}
            </label>
            <select
              id="yAxis"
              name="yAxis"
              value={chartConfig.yAxis}
              onChange={handleConfigChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Select a field</option>
              {columns.numeric.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation Function (for bar/line charts) */}
          {(chartType === "bar" || chartType === "line") && (
            <div className="mb-4">
              <label
                htmlFor="aggregation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Aggregation Method
              </label>
              <select
                id="aggregation"
                name="aggregation"
                value={chartConfig.aggregation}
                onChange={handleConfigChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="sum">Sum</option>
                <option value="avg">Average</option>
                <option value="count">Count</option>
                <option value="min">Minimum</option>
                <option value="max">Maximum</option>
              </select>
            </div>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGenerateChart}
              disabled={!chartConfig.xAxis || !chartConfig.yAxis}
              className={`btn btn-primary w-full ${
                !chartConfig.xAxis || !chartConfig.yAxis
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <HiOutlineRefresh className="mr-2 h-5 w-5" />
              Generate Chart
            </button>
          </div>
        </div>

        {/* Chart Display */}
        <div className="card md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {chartConfig.title ||
                `${
                  chartType.charAt(0).toUpperCase() + chartType.slice(1)
                } Chart`}
            </h3>
            <div className="text-sm text-gray-500">
              {chartData.length > 0
                ? `${chartData.length} data points`
                : "No data"}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-4">
            {renderChart()}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>
              {chartType === "scatter"
                ? `Showing the relationship between ${
                    chartConfig.xAxis || "X-Axis"
                  } and ${chartConfig.yAxis || "Y-Axis"}`
                : chartType === "pie"
                ? `Distribution of ${chartConfig.yAxis || "values"} across ${
                    chartConfig.xAxis || "categories"
                  }`
                : `${chartConfig.aggregation || "Sum"} of ${
                    chartConfig.yAxis || "values"
                  } by ${chartConfig.xAxis || "category"}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
