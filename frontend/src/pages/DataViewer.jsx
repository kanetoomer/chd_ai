import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  HiChevronLeft,
  HiChevronRight,
  HiDownload,
  HiLightningBolt,
  HiTrash,
  HiSearch,
} from "react-icons/hi";

import PageHeader from "../components/layout/PageHeader";
import Loading from "../components/layout/Loading";
import ErrorDisplay from "../components/layout/ErrorDisplay";
import { useDataset } from "../context/DatasetContext";
import { formatBytes, formatDate } from "../utils/formatters";

const DataViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchDatasetById,
    deleteDataset,
    currentDataset,
    loading,
    error,
    downloadDataset,
  } = useDataset();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch dataset
  useEffect(() => {
    if (id) {
      console.log("Fetching dataset with ID:", id);
      fetchDatasetById(id, page, limit).catch((err) =>
        console.error("Error details:", err)
      );
    }
  }, [fetchDatasetById, id, page, limit]);

  // Filter data based on search term
  useEffect(() => {
    if (currentDataset?.data) {
      const search = searchTerm.trim().toLowerCase();
      const filtered = search
        ? currentDataset.data.filter((row) =>
            Object.values(row).some((value) =>
              String(value).toLowerCase().includes(search)
            )
          )
        : currentDataset.data;

      setFilteredData(filtered);
      setTotalPages(Math.ceil(filtered.length / limit) || 1);
    }
  }, [currentDataset, searchTerm, limit]);

  // Page change
  const handlePageChange = (newPage) => setPage(newPage);

  // Limit change
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  // Search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Download
  const handleDownload = async () => {
    if (currentDataset) {
      await downloadDataset(id, currentDataset.name);
    }
  };

  // Delete dataset
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this dataset?")) {
      const success = await deleteDataset(id);
      if (success) {
        navigate("/");
      }
    }
  };

  if (loading && !currentDataset)
    return <Loading message="Loading dataset..." />;
  if (error && !currentDataset)
    return (
      <ErrorDisplay error={error} resetError={() => fetchDatasetById(id)} />
    );
  if (!currentDataset) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Dataset not found</h2>
        <button onClick={() => navigate("/")} className="mt-4 btn btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={currentDataset.name}
        description={
          currentDataset.description ||
          `Uploaded on ${formatDate(currentDataset.createdAt)}`
        }
        actions={
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="btn bg-green-500 text-white hover:bg-green-600 flex items-center rounded-md p-2"
            >
              <HiDownload className="mr-2 h-5 w-5" />
              Download CSV
            </button>
            <Link
              to={`/datasets/${id}/insights`}
              className="btn bg-purple-500 text-white hover:bg-purple-600 flex items-center rounded-md p-2"
            >
              <HiLightningBolt className="mr-2 h-5 w-5" />
              Analyze Data
            </Link>
            <button
              onClick={handleDelete}
              className="btn bg-red-500 text-white hover:bg-red-600 flex items-center rounded-md p-2"
            >
              <HiTrash className="mr-2 h-5 w-5" />
              Delete Dataset
            </button>
          </div>
        }
      />

      {/* Dataset Info */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card">
          <p className="text-sm font-medium text-gray-500">File Type</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {currentDataset.fileType === ".csv" ? "CSV" : ".data"}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-500">File Size</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {formatBytes(currentDataset.fileSize)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-500">Total Rows</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {currentDataset.totalRows || "N/A"}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-500">Total Columns</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {currentDataset.data?.length > 0
              ? Object.keys(currentDataset.data[0]).length
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="limit" className="text-sm font-medium text-gray-700">
            Rows per page:
          </label>
          <select
            id="limit"
            value={limit}
            onChange={handleLimitChange}
            className="rounded-md border-gray-300 py-1 pl-3 pr-8 text-sm focus:border-primary-500 focus:ring-primary-500"
          >
            {[10, 25, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search data..."
            className="block w-full rounded-md border-gray-300 pl-10 sm:text-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {filteredData.length > 0 &&
                Object.keys(filteredData[0]).map((column) => (
                  <th
                    key={`header-${column}`}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {column}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredData.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="hover:bg-gray-50">
                {Object.entries(row).map(([colName, value]) => (
                  <td
                    key={`cell-${rowIndex}-${colName}`}
                    className="whitespace-nowrap px-6 py-4 text-sm text-gray-500"
                  >
                    {value !== null && value !== undefined
                      ? String(value)
                      : "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing page <span className="font-medium">{page}</span> of{" "}
          <span className="font-medium">{totalPages}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium ${
              page === 1
                ? "cursor-not-allowed text-gray-300"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <HiChevronLeft className="mr-1 h-5 w-5" />
            Previous
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium ${
              page === totalPages
                ? "cursor-not-allowed text-gray-300"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
            <HiChevronRight className="ml-1 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataViewer;
