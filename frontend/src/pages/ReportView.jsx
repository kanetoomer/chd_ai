import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiDownload,
  HiPrinter,
  HiLightBulb,
  HiChartBar,
  HiChartPie,
  HiChartSquareBar,
  HiViewGrid,
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
import { apiService } from "../services/apiService";
import { formatDate } from "../utils/formatters";
import { generateChartColors } from "../utils/colors";

const ReportView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Report state
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch report on component mount
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);

      try {
        const response = await apiService.get(`/reports/${id}`);

        if (response && response.report) {
          setReport(response.report);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        setError(error);

        // Mock data for development/demo
        const mockReport = {
          _id: id,
          name: "Monthly Health Metrics Analysis",
          createdAt: "2025-03-15T10:30:00.000Z",
          dataset: {
            _id: "dataset1",
            name: "Health Metrics Feb 2025",
          },
          visualizations: [
            {
              type: "bar",
              title: "Age Distribution by Region",
              description:
                "This chart shows the distribution of patient ages across different regions.",
              data: {
                columns: ["age", "region"],
                config: { xAxis: "region", yAxis: "age", aggregation: "avg" },
              },
              chartData: [
                { name: "North", value: 42 },
                { name: "South", value: 39 },
                { name: "East", value: 45 },
                { name: "West", value: 41 },
              ],
            },
            {
              type: "line",
              title: "Blood Pressure Trends Over Time",
              description:
                "This chart shows the average systolic blood pressure trends over time.",
              data: {
                columns: ["date", "systolic"],
                config: {
                  xAxis: "date",
                  yAxis: "systolic",
                  aggregation: "avg",
                },
              },
              chartData: [
                { name: "Jan", value: 130 },
                { name: "Feb", value: 128 },
                { name: "Mar", value: 132 },
                { name: "Apr", value: 129 },
                { name: "May", value: 127 },
              ],
            },
            {
              type: "pie",
              title: "Distribution of Health Conditions",
              description:
                "This chart shows the distribution of different health conditions in the dataset.",
              data: {
                columns: ["condition", "count"],
                config: { category: "condition", value: "count" },
              },
              chartData: [
                { name: "Hypertension", value: 35 },
                { name: "Diabetes", value: 25 },
                { name: "Asthma", value: 18 },
                { name: "Obesity", value: 22 },
              ],
            },
          ],
          insights: [
            {
              id: "insight1",
              title: "Correlation between BMI and Blood Pressure",
              content:
                "Analysis shows a significant correlation (r=0.72) between BMI and systolic blood pressure. For every 5-point increase in BMI, systolic blood pressure increases by approximately 8-10 mmHg on average.",
              source: "claude",
              timestamp: "2025-03-15T10:35:00.000Z",
            },
            {
              id: "insight2",
              title: "Age Distribution Analysis",
              content:
                "The age distribution in this dataset shows a bimodal pattern with peaks around 35-40 and 55-60 years. This suggests two distinct population groups that may have different health needs and outcomes.",
              source: "claude",
              timestamp: "2025-03-15T10:36:00.000Z",
            },
            {
              id: "insight3",
              title: "Regional Healthcare Access Disparities",
              content:
                "The East region shows 15% higher healthcare utilization rates but 23% lower preventive care metrics compared to other regions. This suggests potential barriers to preventive care access despite overall healthcare engagement.",
              source: "user",
              timestamp: "2025-03-15T11:20:00.000Z",
            },
          ],
        };

        setReport(mockReport);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Export report
  const handleExport = async (format) => {
    try {
      // Initiate download
      window.open(
        `${import.meta.env.VITE_API_URL}/reports/${id}/export/${format}`,
        "_blank"
      );
      toast.success(`Exporting report as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  // Render chart based on type
  const renderChart = (visualization) => {
    if (
      !visualization ||
      !visualization.chartData ||
      visualization.chartData.length === 0
    ) {
      return (
        <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg">
          <div className="text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Chart data missing for "{visualization?.title || "Untitled Chart"}
              "
            </h3>
          </div>
        </div>
      );
    }

    switch (visualization.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={visualization.chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                label={{
                  value: visualization.data?.config?.xAxis || "Category",
                  position: "bottom",
                  offset: 0,
                  dy: 20,
                }}
              />
              <YAxis
                label={{
                  value: visualization.data?.config?.yAxis || "Value",
                  angle: -90,
                  position: "insideLeft",
                  dx: -10,
                }}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="value"
                name={visualization.data?.config?.yAxis || "Value"}
                fill="#4a80f0"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={visualization.chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                label={{
                  value: visualization.data?.config?.xAxis || "Category",
                  position: "bottom",
                  offset: 0,
                  dy: 20,
                }}
              />
              <YAxis
                label={{
                  value: visualization.data?.config?.yAxis || "Value",
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
                name={visualization.data?.config?.yAxis || "Value"}
                stroke="#4a80f0"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={visualization.chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {visualization.chartData.map((entry, index) => (
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
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="x"
                name={visualization.data?.config?.xAxis || "X"}
                label={{
                  value: visualization.data?.config?.xAxis || "X",
                  position: "bottom",
                  offset: 0,
                  dy: 20,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={visualization.data?.config?.yAxis || "Y"}
                label={{
                  value: visualization.data?.config?.yAxis || "Y",
                  angle: -90,
                  position: "insideLeft",
                  dx: -10,
                }}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                name="Data Points"
                data={visualization.chartData}
                fill="#4a80f0"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg">
            <div className="text-center">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Chart preview not available
              </h3>
            </div>
          </div>
        );
    }
  };

  // Render loading state
  if (loading) {
    return <Loading message="Loading report..." />;
  }

  // Render error state
  if (error) {
    return (
      <ErrorDisplay error={error} resetError={() => window.location.reload()} />
    );
  }

  // Render no data state
  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Report not found</h2>
        <p className="mt-2 text-gray-500">
          The report you're looking for doesn't exist or was deleted.
        </p>
        <button
          onClick={() => navigate("/reports")}
          className="mt-4 btn btn-primary"
        >
          View All Reports
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={report.name}
        description={`Generated on ${formatDate(report.createdAt)} · Based on ${
          report.dataset.name
        }`}
        actions={
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/reports")}
              className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center rounded-md p-2"
            >
              <HiOutlineArrowLeft className="mr-2 h-5 w-5" />
              Back to Reports
            </button>
            {/* <div className="relative">
              <button
                className="btn bg-purple-500 text-white hover:bg-purple-600 flex items-center rounded-md p-2"
                onClick={() => {
                  const dropdown = document.getElementById("export-dropdown");
                  dropdown.classList.toggle("hidden");
                }}
              >
                <HiDownload className="mr-2 h-5 w-5" />
                Export
              </button>
              <div
                id="export-dropdown"
                className="absolute right-0 z-10 mt-2 hidden w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleExport("pdf")}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                </div>
              </div>
            </div> */}
          </div>
        }
      />

      {/* Print-only header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{report.name}</h1>
        <p className="mt-2 text-gray-500">
          Generated on {formatDate(report.createdAt)} · Dataset:{" "}
          {report.dataset.name}
        </p>
      </div>

      {/* Report Content */}
      <div className="space-y-8 print:space-y-10">
        {/* Visualizations Section */}
        {/* <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 print:text-2xl">
            Visualizations
          </h2>

          <div className="space-y-6 print:space-y-8">
            {report.visualizations.map((visualization, index) => (
              <div
                key={visualization._id || index}
                className="card print:border print:p-4 print:break-inside-avoid"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {visualization.title}
                </h3>

                {visualization.description && (
                  <p className="text-sm text-gray-500 mb-4">
                    {visualization.description}
                  </p>
                )}

                <div className="bg-white border border-gray-200 rounded-md p-4 print:p-2">
                  {renderChart(visualization)}
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Insights Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 print:text-2xl">
            Key Insights
          </h2>

          <div className="space-y-4 print:space-y-6">
            {report.insights.map((insight) => (
              <div
                key={insight._id || insight.id || index}
                className="card print:border print:p-4 print:break-inside-avoid"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <HiLightBulb
                      className={`h-5 w-5 ${
                        insight.source === "claude"
                          ? "text-purple-500"
                          : "text-green-500"
                      }`}
                    />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">
                      {insight.title}
                    </h4>
                    <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                      {insight.content}
                    </div>
                    <div className="mt-2 print:hidden flex items-center text-xs text-gray-400">
                      <span>
                        {insight.source === "claude"
                          ? "Generated by Claude AI"
                          : "Custom Insight"}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(insight.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dataset Info Section */}
        <div className="print:mt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 print:text-2xl">
            Dataset Information
          </h2>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {report.dataset.name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Report Generated
                </h4>
                <p className="text-sm text-gray-900">
                  {formatDate(report.createdAt)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Source Dataset
                </h4>
                <p className="text-sm text-gray-900">
                  <Link
                    to={`/datasets/${report.dataset._id}`}
                    className="text-primary-600 hover:text-primary-800 print:text-gray-900 print:no-underline"
                  >
                    {report.dataset.name}
                  </Link>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Total Visualizations
                </h4>
                <p className="text-sm text-gray-900">
                  {report.visualizations.length}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Total Insights
                </h4>
                <p className="text-sm text-gray-900">
                  {report.insights.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block text-center text-xs text-gray-500 mt-10 pt-4 border-t border-gray-200">
          <p>Generated by Community Health Dashboard</p>
          <p>
            © {new Date().getFullYear()} Kane Toomer - Grand Canyon University
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
