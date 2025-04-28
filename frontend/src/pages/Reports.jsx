// src/pages/Reports.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiDocumentReport,
  HiOutlineDocumentAdd,
  HiTrash,
  HiEye,
  HiSearch,
  HiOutlineFilter,
  HiChartBar,
} from "react-icons/hi";
import toast from "react-hot-toast";

import PageHeader from "../components/layout/PageHeader";
import Loading from "../components/layout/Loading";
import ErrorDisplay from "../components/layout/ErrorDisplay";
import EmptyState from "../components/layout/EmptyState";
import { apiService } from "../services/apiService";
import { formatDate } from "../utils/formatters";

const Reports = () => {
  const navigate = useNavigate();

  // Reports state
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Fetch reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);

      try {
        const response = await apiService.get("/reports");

        if (response && response.reports) {
          setReports(response.reports);
          setFilteredReports(response.reports);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        setError(error);

        // Mock data for development/demo
        const mockReports = [
          {
            _id: "report1",
            name: "Monthly Health Metrics Analysis",
            createdAt: "2025-03-15T10:30:00.000Z",
            dataset: {
              _id: "dataset1",
              name: "Health Metrics Feb 2025",
            },
            visualizations: [
              { type: "bar", title: "Age Distribution by Region" },
              { type: "line", title: "Blood Pressure Trends" },
            ],
            insights: [
              { title: "Correlation between BMI and Blood Pressure" },
              { title: "Age Distribution Analysis" },
            ],
          },
          {
            _id: "report2",
            name: "Quarterly Community Health Status",
            createdAt: "2025-03-10T14:20:00.000Z",
            dataset: {
              _id: "dataset2",
              name: "Community Survey Q1 2025",
            },
            visualizations: [
              { type: "pie", title: "Health Condition Distribution" },
              { type: "bar", title: "Access to Healthcare by Demographic" },
            ],
            insights: [
              { title: "Healthcare Access Disparities" },
              { title: "Preventive Care Adoption Patterns" },
              { title: "Exercise Frequency Analysis" },
            ],
          },
          {
            _id: "report3",
            name: "Annual Nutrition Report",
            createdAt: "2025-02-28T09:15:00.000Z",
            dataset: {
              _id: "dataset3",
              name: "Nutrition Survey 2024-2025",
            },
            visualizations: [
              { type: "bar", title: "Nutrient Intake by Age Group" },
              { type: "line", title: "Dietary Trends Over Time" },
            ],
            insights: [
              { title: "Dietary Patterns Analysis" },
              { title: "Correlation Between Diet and Health Outcomes" },
            ],
          },
        ];

        setReports(mockReports);
        setFilteredReports(mockReports);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filter reports when search term or sort changes
  useEffect(() => {
    const filtered = reports.filter(
      (report) =>
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.dataset &&
          report.dataset.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortField === "createdAt") {
        return sortDirection === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }

      if (sortField === "insights") {
        return sortDirection === "asc"
          ? a.insights.length - b.insights.length
          : b.insights.length - a.insights.length;
      }

      return 0;
    });

    setFilteredReports(sorted);
  }, [reports, searchTerm, sortField, sortDirection]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle sort direction
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Delete report
  const handleDelete = async (reportId, reportName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${reportName}"? This action cannot be undone.`
      )
    ) {
      try {
        await apiService.delete(`/reports/${reportId}`);

        // Update local state
        setReports((prev) => prev.filter((report) => report._id !== reportId));
        toast.success("Report deleted successfully");
      } catch (error) {
        console.error("Error deleting report:", error);
        toast.error("Failed to delete report");
      }
    }
  };

  // Export report
  const handleExport = async (reportId, format) => {
    try {
      // Initiate download
      window.open(
        `${import.meta.env.VITE_API_URL}/reports/${reportId}/export/${format}`,
        "_blank"
      );
      toast.success(`Exporting report as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  // Render loading state
  if (loading) {
    return <Loading message="Loading reports..." />;
  }

  // Render error state
  if (error) {
    return (
      <ErrorDisplay error={error} resetError={() => window.location.reload()} />
    );
  }

  // Render empty state
  if (!loading && reports.length === 0) {
    return (
      <EmptyState
        title="No reports found"
        description="Create your first report by analyzing a dataset"
        icon={<HiDocumentReport className="w-full h-full" />}
        actionText="Create Report"
        onAction={() => navigate("/")}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Health Reports"
        description="View, manage, and export your health data reports"
        actions={
          <Link to="/" className="btn btn-primary flex items-center">
            <HiOutlineDocumentAdd className="mr-2 h-5 w-5" />
            Create New Report
          </Link>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Search reports..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <div className="relative inline-flex">
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split("-");
                setSortField(field);
                setSortDirection(direction);
              }}
              className="rounded-md border-gray-300 py-1 pl-3 pr-8 text-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="createdAt-desc">Newest first</option>
              <option value="createdAt-asc">Oldest first</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="insights-desc">Most insights</option>
              <option value="insights-asc">Least insights</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <div
            key={report._id}
            className="card border border-black rounded-md p-2 hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="flex items-center justify-between">
              {/* <span className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {report.visualizations.length} chart
                {report.visualizations.length !== 1 ? "s" : ""}
              </span> */}
              <span className="inline-flex items-center rounded-md bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                {report.insights.length} insight
                {report.insights.length !== 1 ? "s" : ""}
              </span>
            </div>

            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {report.name}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Based on: {report.dataset?.name || "Unknown Dataset"}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Created: {formatDate(report.createdAt)}
            </p>

            {/* Preview of visualizations/insights */}
            {report.visualizations.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visualizations
                </h4>
                <ul className="mt-1 space-y-1">
                  {report.visualizations.slice(0, 2).map((viz, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-center"
                    >
                      {viz.type === "bar" ? (
                        <HiChartBar className="mr-1 h-4 w-4 text-gray-400" />
                      ) : viz.type === "line" ? (
                        <svg
                          className="mr-1 h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                          />
                        </svg>
                      ) : viz.type === "pie" ? (
                        <svg
                          className="mr-1 h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="mr-1 h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      )}
                      {viz.title}
                    </li>
                  ))}
                  {report.visualizations.length > 2 && (
                    <li className="text-xs text-gray-500">
                      +{report.visualizations.length - 2} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between">
              <Link
                to={`/reports/${report._id}`}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
              >
                <HiEye className="mr-1 h-4 w-4" />
                View Report
              </Link>

              <div className="flex space-x-2">
                <div className="relative">
                  {/* <button
                    className="text-gray-400 hover:text-gray-600"
                    title="Export"
                    onClick={() => {
                      const dropdown = document.getElementById(
                        `export-dropdown-${report._id}`
                      );
                      dropdown.classList.toggle("hidden");
                    }}
                  >
                    <HiDownload className="h-5 w-5" />
                  </button> */}

                  <div
                    id={`export-dropdown-${report._id}`}
                    className="absolute right-0 z-10 mt-2 hidden w-24 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => handleExport(report._id, "pdf")}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport(report._id, "html")}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => handleExport(report._id, "json")}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        JSON
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(report._id, report.name)}
                  className="text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <HiTrash className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <HiOutlineFilter className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No matching reports
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSortField("createdAt");
                setSortDirection("desc");
              }}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
