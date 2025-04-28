const claudeConfig = {
  apiUrl: "https://api.anthropic.com/v1/messages",
  model: "claude-3-opus-20240229",
  maxTokens: 5000,
  apiVersion: "2023-06-01",
  timeout: 60000, // 60 seconds
};

module.exports = claudeConfig;
