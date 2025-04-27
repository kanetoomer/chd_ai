import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiUpload,
  HiDocumentText,
  HiTrash,
  HiDownload,
  HiEye,
} from "react-icons/hi";

import PageHeader from "../components/layout/PageHeader";
import EmptyState from "../components/layout/EmptyState";
import Loading from "../components/layout/Loading";
import { useDataset } from "../context/DatasetContext";
import { formatBytes, formatDate, truncateText } from "../utils/formatters";

const Dashboard = () => {
  const {
    datasets,
    loading,
    error,
    fetchDatasets,
    deleteDataset,
    downloadDataset,
  } = useDataset();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      await deleteDataset(id);
    }
  };

  const handleDownload = async (id, name) => {
    await downloadDataset(id, name);
  };

  // Render loading state
  if (loading && datasets.length === 0) {
    return <Loading message="Loading datasets..." />;
  }

  // Render empty state
  if (!loading && datasets.length === 0) {
    return (
      <EmptyState
        title="No datasets found"
        description="Upload a CSV or .data file to get started"
        icon={<HiDocumentText className="w-full h-full" />}
        actionText="Upload Data"
        onAction={() => navigate("/upload")}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Community Health Dashboard"
        description="Analyze and visualize health data with ease"
        actions={
          <Link to="/upload" className="btn btn-primary flex items-center">
            <HiUpload className="mr-2 h-5 w-5" />
            Upload Data
          </Link>
        }
      />

      {/* Recent Datasets */}
      <div className="mb-10">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Your Datasets
        </h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Size
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Rows
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {datasets.map((dataset) => (
                <tr
                  key={dataset._id}
                  dataset={dataset}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <HiDocumentText className="mr-2 h-5 w-5 text-gray-400" />
                      <div className="font-medium text-gray-900">
                        {truncateText(dataset.name, 30)}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {dataset.fileType === ".csv" ? "CSV" : ".data"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatBytes(dataset.fileSize)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(dataset.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {dataset.metadata?.rowCount || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/datasets/${dataset._id}`)}
                        className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                        title="View Dataset"
                      >
                        <HiEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(dataset._id, dataset.name)
                        }
                        className="rounded p-1 text-gray-400 hover:bg-purple-50 hover:text-purple-600"
                        title="Download Dataset"
                      >
                        <HiDownload className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dataset._id, dataset.name)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete Dataset"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
