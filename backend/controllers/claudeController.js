const axios = require("axios");
const DatasetModel = require("../models/Dataset");
const DatasetRowModel = require("../models/DatasetRow");

const analyzeDataset = async (req, res) => {
  try {
    const { datasetId } = req.body;

    // Get dataset metadata
    const dataset = await DatasetModel.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    // Get a sample of rows from DatasetRowModel
    const datasetSampleDocs = await DatasetRowModel.find({ datasetId })
      .limit(100)
      .lean();

    const datasetSample = datasetSampleDocs.map((doc) => doc.row);

    if (datasetSample.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Dataset has no data to analyze",
      });
    }

    // Extract summary statistics
    const { summary } = dataset.metadata;

    // Generate a prompt for Claude
    const prompt = `
      I have a health dataset with approximately ${
        datasetSample.length
      } rows and the following columns: 
      ${Object.keys(datasetSample[0]).join(", ")}. 
      
      Here are some statistics about the dataset:
      ${JSON.stringify(summary, null, 2)}
      
      Here's a sample of the data:
      ${JSON.stringify(datasetSample, null, 2)}
      
      Please analyze this health dataset and provide:
      1. A summary of the key observations
      2. Any patterns or trends you notice
      3. Potential health insights or implications
      4. Suggestions for further analysis
    `;

    // Call Claude AI API
    const claudeResponse = await callClaudeAPI(prompt);

    res.status(200).json({
      success: true,
      analysis: claudeResponse,
    });
  } catch (error) {
    console.error("Error in analyzeDataset:", error.message);
    res.status(500).json({
      success: false,
      message: "Error analyzing dataset",
      error: error.message,
    });
  }
};

const generateInsights = async (req, res) => {
  try {
    const { datasetId, visualizationData } = req.body;

    // Get dataset
    const dataset = await DatasetModel.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    // Prepare prompt for Claude based on visualization data
    const prompt = `
      I have a health dataset visualization with the following data:
      ${JSON.stringify(visualizationData, null, 2)}
      
      Please generate healthcare insights from this visualization data including:
      1. Key observations from the visualization
      2. Potential implications for public health
      3. Recommendations based on these findings
      4. Limitations or caveats to consider
    `;

    // Call Claude AI API
    const claudeResponse = await callClaudeAPI(prompt);

    res.status(200).json({
      success: true,
      insights: claudeResponse,
    });
  } catch (error) {
    console.error("Error in generateInsights:", error.message);
    res.status(500).json({
      success: false,
      message: "Error generating insights",
      error: error.message,
    });
  }
};

const explainVisualization = async (req, res) => {
  try {
    const { visualization, context } = req.body;

    // Prepare prompt for Claude
    const prompt = `
      Please explain this health data visualization in simple terms:
      
      Visualization type: ${visualization.type}
      Visualization title: ${visualization.title}
      Data context: ${context}
      
      Data details:
      ${JSON.stringify(visualization.data, null, 2)}
      
      Please provide:
      1. A simple explanation of what this visualization shows
      2. Key takeaways for a non-technical audience
      3. How this information could be used to improve public health
    `;

    // Call Claude AI API
    const claudeResponse = await callClaudeAPI(prompt);

    res.status(200).json({
      success: true,
      explanation: claudeResponse,
    });
  } catch (error) {
    console.error("Error in explainVisualization:", error.message);
    res.status(500).json({
      success: false,
      message: "Error explaining visualization",
      error: error.message,
    });
  }
};

const callClaudeAPI = async (prompt) => {
  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        timeout: 60000,
      }
    );

    return response.data.content?.[0]?.text || "No response from Claude.";
  } catch (error) {
    console.error(
      "Error calling Claude API:",
      error.response?.data || error.message
    );
    throw new Error("Failed to get response from Claude AI");
  }
};

module.exports = {
  analyzeDataset,
  generateInsights,
  explainVisualization,
};
