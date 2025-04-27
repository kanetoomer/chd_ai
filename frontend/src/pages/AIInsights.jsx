import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineLightningBolt,
  HiOutlineDocumentReport,
  HiLightBulb,
  HiClipboardCheck,
  HiOutlineSave,
  HiRefresh,
  HiPlusCircle,
} from "react-icons/hi";
import toast from "react-hot-toast";

import PageHeader from "../components/layout/PageHeader";
import Loading from "../components/layout/Loading";
import ErrorDisplay from "../components/layout/ErrorDisplay";
import { useDataset } from "../context/DatasetContext";
import { apiService } from "../services/apiService";

const AIInsights = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchDatasetById, currentDataset, loading, error } = useDataset();

  const [insights, setInsights] = useState([]);
  const [savedInsights, setSavedInsights] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customInsight, setCustomInsight] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchDatasetById(id);
    };
    loadData();
  }, [fetchDatasetById, id]);

  const generateInsights = async () => {
    if (!currentDataset) {
      toast.error("Dataset not available");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          const next = prev + Math.random() * 15;
          return next >= 90 ? 90 : next;
        });
      }, 800);

      const response = await apiService.post("/claude/analyze", {
        datasetId: id,
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (response && response.analysis) {
        const sections = response.analysis.split(/\d+\.\s+/).filter(Boolean);

        const generated = sections.map((text, idx) => ({
          id: `insight-${Date.now()}-${idx}`,
          title: text.split("\n")[0].trim(),
          content: text.replace(text.split("\n")[0], "").trim(),
          source: "claude",
          timestamp: new Date().toISOString(),
        }));

        setInsights(generated);
        toast.success("AI insights generated!");
      } else {
        toast.error("Failed to generate insights.");
      }
    } catch (err) {
      console.error("Error generating insights:", err);
      toast.error("Failed to generate insights.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveInsight = (insight) => {
    if (savedInsights.some((item) => item.id === insight.id)) {
      toast.error("Already saved");
      return;
    }
    setSavedInsights((prev) => [...prev, insight]);
    toast.success("Insight saved!");
  };

  const removeSavedInsight = (id) => {
    setSavedInsights((prev) => prev.filter((insight) => insight.id !== id));
    toast.success("Insight removed!");
  };

  const handleCustomInsightChange = (e) => {
    const { name, value } = e.target;
    setCustomInsight((prev) => ({ ...prev, [name]: value }));
  };

  const addCustomInsight = () => {
    if (!customInsight.title || !customInsight.content) {
      toast.error("Both title and content required");
      return;
    }

    const newInsight = {
      id: `custom-${Date.now()}`,
      title: customInsight.title,
      content: customInsight.content,
      source: "user",
      timestamp: new Date().toISOString(),
    };

    setInsights((prev) => [newInsight, ...prev]);
    setSavedInsights((prev) => [newInsight, ...prev]);
    setCustomInsight({ title: "", content: "" });
    setShowCustomForm(false);
    toast.success("Custom insight added!");
  };

  const createReport = async () => {
    if (savedInsights.length === 0) {
      toast.error("Save at least one insight");
      return;
    }

    try {
      const reportName = `${currentDataset.name} - Insights Report`;

      const payload = {
        datasetId: id,
        name: reportName,
        insights: savedInsights.map((insight) => ({
          title: insight.title,
          content: insight.content,
          source: insight.source || "user",
          timestamp: insight.timestamp,
        })),
        visualizations: [], // (optional for now — we'll populate later)
      };

      const response = await apiService.post("/reports", payload);

      if (response.success) {
        toast.success("Report created!");
        navigate(`/reports/${response.reportId}`);
      } else {
        throw new Error(response.message || "Failed to create report");
      }
    } catch (err) {
      console.error("Create report error:", err);
      toast.error(err.message || "Failed to create report");
    }
  };

  if (loading && !currentDataset)
    return <Loading message="Loading dataset..." />;
  if (error && !currentDataset)
    return (
      <ErrorDisplay error={error} resetError={() => fetchDatasetById(id)} />
    );
  if (!currentDataset)
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Dataset not found</h2>
        <p className="mt-2 text-gray-500">
          The dataset you're looking for doesn't exist.
        </p>
        <button onClick={() => navigate("/")} className="mt-4 btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );

  return (
    <div>
      <PageHeader
        title="AI-Powered Insights"
        description={`Analyzing "${currentDataset.name}" using Claude AI`}
        actions={
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/datasets/${id}`)}
              className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center rounded-md p-2"
            >
              <HiOutlineArrowLeft className="mr-2 h-5 w-5" /> Back
            </button>
            <button
              onClick={generateInsights}
              disabled={isGenerating}
              className={`btn bg-purple-500 text-white hover:bg-purple-600 flex items-center rounded-md p-2 ${
                isGenerating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-white rounded-md p-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <HiOutlineLightningBolt className="mr-2 h-5 w-5" /> Generate
                </>
              )}
            </button>
            <button
              onClick={createReport}
              disabled={savedInsights.length === 0}
              className={`btn btn-primary flex items-center ${
                savedInsights.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <HiOutlineDocumentReport className="mr-2 h-5 w-5" /> Create Report
            </button>
          </div>
        }
      />

      {/* Progress bar during generation */}
      {isGenerating && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full"
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Insights Panel */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Generated Insights
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCustomForm((prev) => !prev)}
                  className="text-primary-600 hover:text-primary-800 flex items-center text-sm"
                >
                  <HiPlusCircle className="h-4 w-4 mr-1" />
                  {showCustomForm ? "Cancel" : "Add Custom"}
                </button>
                <button
                  onClick={generateInsights}
                  disabled={isGenerating}
                  className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
                >
                  <HiRefresh
                    className={`h-4 w-4 mr-1 ${
                      isGenerating ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* Custom Insight Form */}
            {showCustomForm && (
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <input
                  type="text"
                  name="title"
                  value={customInsight.title}
                  onChange={handleCustomInsightChange}
                  className="w-full mb-3 rounded-md border-gray-300"
                  placeholder="Insight Title"
                />
                <textarea
                  name="content"
                  value={customInsight.content}
                  onChange={handleCustomInsightChange}
                  rows="4"
                  className="w-full mb-3 rounded-md border-gray-300"
                  placeholder="Insight Description"
                ></textarea>
                <button onClick={addCustomInsight} className="btn btn-primary">
                  Add Insight
                </button>
              </div>
            )}

            {/* Insights List */}
            {insights.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <HiLightBulb className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No insights yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Click "Generate" to analyze your data
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="card p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-md font-medium">{insight.title}</h4>
                        <p className="mt-1 text-gray-600">{insight.content}</p>
                      </div>
                      <button
                        onClick={() => saveInsight(insight)}
                        disabled={savedInsights.some(
                          (s) => s.id === insight.id
                        )}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <HiOutlineSave className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Saved Insights Panel */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Saved Insights
            </h3>
            {savedInsights.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <HiClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="text-sm text-gray-900 mt-2">
                  No saved insights yet
                </h3>
              </div>
            ) : (
              <div className="space-y-4">
                {savedInsights.map((insight) => (
                  <div key={insight.id} className="p-3 bg-gray-100 rounded-md">
                    <h4 className="text-sm font-medium">{insight.title}</h4>
                    <button
                      onClick={() => removeSavedInsight(insight.id)}
                      className="text-gray-500 hover:text-gray-700 text-xs mt-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
