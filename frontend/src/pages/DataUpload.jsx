import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { HiUpload, HiX, HiDocumentText, HiCheckCircle } from "react-icons/hi";
import toast from "react-hot-toast";

import PageHeader from "../components/layout/PageHeader";
import { useDataset } from "../context/DatasetContext";
import { formatBytes } from "../utils/formatters";

const DataUpload = () => {
  const { uploadDataset } = useDataset();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState("");

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    // Filter for valid file types
    const validFiles = acceptedFiles.filter((file) => {
      const extension = file.name.split(".").pop().toLowerCase();
      return ["csv", "data"].includes(extension);
    });

    // Show error if invalid files were rejected
    if (validFiles.length !== acceptedFiles.length) {
      toast.error(
        "Some files were rejected. Only CSV and .data files are allowed."
      );
    }

    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "text/plain": [".data"],
    },
    multiple: true,
  });

  // Remove file from list
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      if (description) {
        formData.append("description", description);
      }

      // Upload files
      const result = await uploadDataset(formData, (progress) => {
        setUploadProgress(progress);
      });

      // Success
      if (result && result.length > 0) {
        toast.success(
          `${files.length} file${
            files.length > 1 ? "s" : ""
          } uploaded successfully`
        );

        // Navigate to the first dataset if only one was uploaded
        if (result.length === 1) {
          navigate(`/datasets/${result[0].id}`);
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Upload Health Data"
        description="Upload CSV or .data files to analyze your health data. You can upload multiple files at once."
      />

      {/* Dropzone */}
      <div className="max-w-4xl mx-auto mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <HiUpload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-900">
            {isDragActive
              ? "Drop the files here..."
              : "Drag and drop files here, or click to select files"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported file types: CSV, .data
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="max-w-4xl mx-auto mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Selected Files ({files.length})
          </h3>
          <ul className="border rounded-md divide-y divide-gray-200">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between py-3 px-4"
              >
                <div className="flex items-center">
                  <HiDocumentText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <HiX className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Description */}
      <div className="max-w-4xl mx-auto mb-6">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-3"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
          className="p-2 block w-full rounded-md border-gray-300 shadow-md focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="Enter a description for your dataset..."
        />
      </div>

      {/* Actions */}
      <div className="max-w-4xl mx-auto flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          disabled={uploading}
          className="btn p-2 rounded-md text-gray-700 border border-gray-300 hover:bg-red-500 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="btn p-2 rounded-md flex items-center hover:bg-blue-600 hover:text-white"
        >
          {uploading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Uploading {uploadProgress}%
            </>
          ) : (
            <>
              <HiUpload className="mr-2 h-5 w-5" />
              Upload Files
            </>
          )}
        </button>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="max-w-4xl mx-auto mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-500 text-center">
            Uploading and processing your data...
          </p>
        </div>
      )}
    </div>
  );
};

export default DataUpload;
