import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { apiService } from "../services/apiService";

// Create context
const DatasetContext = createContext();

// Hook to use the dataset context
export const useDataset = () => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error("useDataset must be used within a DatasetProvider");
  }
  return context;
};

// Provider component
export const DatasetProvider = ({ children }) => {
  const [datasets, setDatasets] = useState([]);
  const [currentDataset, setCurrentDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all datasets
  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.get("/datasets");
      setDatasets(response.datasets);
    } catch (err) {
      setError(err.message || "Failed to fetch datasets");
      toast.error("Failed to fetch datasets");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dataset by ID
  const fetchDatasetById = useCallback(async (id) => {
    if (!id) {
      console.error("No ID provided to fetchDatasetById");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Calling GET /datasets/" + id);
      const response = await apiService.get(`/datasets/${id}`);
      console.log("Fetched dataset:", response);

      setCurrentDataset(response.dataset);
      return response.dataset;
    } catch (err) {
      console.error("Error fetching dataset:", err);
      setError(err.message || "Failed to fetch dataset");
      toast.error("Failed to fetch dataset");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload dataset
  const uploadDataset = useCallback(async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post("/datasets/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Uploaded datasets:", response.datasets);

      if (response.datasets && response.datasets.length > 0) {
        setDatasets((prev) => [...prev, ...response.datasets]);
        return response.datasets;
      } else {
        throw new Error("No datasets returned");
      }
    } catch (err) {
      setError(err.message || "Failed to upload dataset");
      toast.error(err.message || "Failed to upload dataset");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clean dataset
  const cleanDataset = useCallback(
    async (id, cleaningOptions) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.post(
          `/datasets/${id}/clean`,
          cleaningOptions
        );

        // Update current dataset if it's the one being cleaned
        if (currentDataset && currentDataset._id === id) {
          setCurrentDataset((prev) => ({
            ...prev,
            data: response.data,
            rowCount: response.rowCount,
          }));
        }

        toast.success("Dataset cleaned successfully");
        return response;
      } catch (err) {
        setError(err.message || "Failed to clean dataset");
        toast.error("Failed to clean dataset");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentDataset]
  );

  // Delete dataset
  const deleteDataset = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        await apiService.delete(`/datasets/${id}`);

        // Remove deleted dataset from state
        setDatasets((prev) => prev.filter((dataset) => dataset._id !== id));

        // Clear current dataset if it's the one being deleted
        if (currentDataset && currentDataset._id === id) {
          setCurrentDataset(null);
        }

        toast.success("Dataset deleted successfully");
        return true;
      } catch (err) {
        setError(err.message || "Failed to delete dataset");
        toast.error("Failed to delete dataset");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentDataset]
  );

  // Get dataset statistics
  const getDatasetStatistics = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.get(`/datasets/${id}/statistics`);
      return response.statistics;
    } catch (err) {
      setError(err.message || "Failed to fetch dataset statistics");
      toast.error("Failed to fetch dataset statistics");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Download dataset
  const downloadDataset = useCallback(async (id, filename) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.get(`/datasets/${id}/download`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename || "dataset"}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Dataset downloaded successfully");
      return true;
    } catch (err) {
      setError(err.message || "Failed to download dataset");
      toast.error("Failed to download dataset");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load datasets when component mounts
  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  // Context value
  const value = {
    datasets,
    currentDataset,
    loading,
    error,
    fetchDatasets,
    fetchDatasetById,
    uploadDataset,
    cleanDataset,
    deleteDataset,
    getDatasetStatistics,
    downloadDataset,
    clearError,
  };

  return (
    <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>
  );
};
