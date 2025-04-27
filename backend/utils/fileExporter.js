const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const htmlPdf = require("html-pdf");
const ejs = require("ejs");

/**
 * Export data to CSV file
 * @param {Array} data - Data to export
 * @param {String} filename - Output filename
 * @returns {String} - Path to the exported file
 */
const exportToCsv = (data, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const exportDir = path.join(__dirname, "../exports");

      // Create exports directory if it doesn't exist
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Generate CSV file path
      const timestamp = Date.now();
      const filePath = path.join(exportDir, `${filename}-${timestamp}.csv`);

      // Extract fields from first data item
      const fields = data.length > 0 ? Object.keys(data[0]) : [];
      const opts = { fields };

      // Parse JSON to CSV
      const parser = new Parser(opts);
      const csv = parser.parse(data);

      // Write to file
      fs.writeFileSync(filePath, csv);

      resolve(filePath);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export report to PDF
 * @param {Object} report - Report data
 * @param {String} filename - Output filename
 * @returns {String} - Path to the exported file
 */
const exportToPdf = (report, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const exportDir = path.join(__dirname, "../exports");

      // Create exports directory if it doesn't exist
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Generate PDF file path
      const timestamp = Date.now();
      const filePath = path.join(exportDir, `${filename}-${timestamp}.pdf`);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      // Pipe document to output stream
      doc.pipe(stream);

      // Add report content to PDF

      // Title
      doc.fontSize(25).text(report.name, {
        align: "center",
      });

      doc.moveDown();
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, {
        align: "center",
      });

      doc.moveDown();
      doc.fontSize(12).text(`Dataset: ${report.dataset.name}`);

      // Insights
      doc.moveDown(2);
      doc.fontSize(16).text("Insights");
      doc.moveDown();

      report.insights.forEach((insight, index) => {
        doc.fontSize(14).text(`${index + 1}. ${insight.title}`);
        doc.moveDown(0.5);
        doc.fontSize(12).text(insight.content);
        doc.moveDown();
      });

      // Visualizations
      doc.moveDown(2);
      doc.fontSize(16).text("Visualizations");
      doc.moveDown();

      report.visualizations.forEach((viz, index) => {
        doc.fontSize(14).text(`${index + 1}. ${viz.title}`);
        doc.moveDown(0.5);

        // Add visualization image if available
        if (viz.imageData) {
          try {
            // Remove data URL prefix
            const base64Data = viz.imageData.replace(
              /^data:image\/\w+;base64,/,
              ""
            );
            const buffer = Buffer.from(base64Data, "base64");

            // Calculate dimensions (max width 500)
            const maxWidth = 500;
            let width = 500;
            let height = 300;

            doc.image(buffer, {
              width,
              align: "center",
            });

            doc.moveDown();
          } catch (error) {
            console.error("Error adding image to PDF:", error);
          }
        }

        // Add visualization description
        if (viz.description) {
          doc.fontSize(12).text(viz.description);
          doc.moveDown();
        }
      });

      // Finalize PDF
      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export report to HTML
 * @param {Object} report - Report data
 * @param {String} filename - Output filename
 * @returns {String} - Path to the exported file
 */
const exportToHtml = (report, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const exportDir = path.join(__dirname, "../exports");

      // Create exports directory if it doesn't exist
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Generate HTML file path
      const timestamp = Date.now();
      const filePath = path.join(exportDir, `${filename}-${timestamp}.html`);

      // Load HTML template
      const templatePath = path.join(
        __dirname,
        "../templates/report-template.ejs"
      );
      const template = fs.readFileSync(templatePath, "utf8");

      // Render template with report data
      const html = ejs.render(template, {
        report,
        currentDate: new Date().toLocaleDateString(),
        currentTime: new Date().toLocaleTimeString(),
      });

      // Write to file
      fs.writeFileSync(filePath, html);

      resolve(filePath);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export raw data to JSON
 * @param {Object} data - Data to export
 * @param {String} filename - Output filename
 * @returns {String} - Path to the exported file
 */
const exportToJson = (data, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const exportDir = path.join(__dirname, "../exports");

      // Create exports directory if it doesn't exist
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Generate JSON file path
      const timestamp = Date.now();
      const filePath = path.join(exportDir, `${filename}-${timestamp}.json`);

      // Convert data to JSON string with proper formatting
      const jsonString = JSON.stringify(data, null, 2);

      // Write to file
      fs.writeFileSync(filePath, jsonString);

      resolve(filePath);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export visualization to image
 * @param {String} base64Image - Base64 encoded image data
 * @param {String} filename - Output filename
 * @returns {String} - Path to the exported file
 */
const exportVisualizationToImage = (base64Image, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const exportDir = path.join(__dirname, "../exports");

      // Create exports directory if it doesn't exist
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Generate image file path
      const timestamp = Date.now();
      const filePath = path.join(exportDir, `${filename}-${timestamp}.png`);

      // Remove data URL prefix
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Write to file
      fs.writeFileSync(filePath, buffer);

      resolve(filePath);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Convert HTML report to PDF
 * @param {String} htmlFilePath - Path to HTML file
 * @param {String} filename - Output filename
 * @returns {String} - Path to the exported file
 */
const convertHtmlToPdf = (htmlFilePath, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const exportDir = path.join(__dirname, "../exports");

      // Create exports directory if it doesn't exist
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Generate PDF file path
      const timestamp = Date.now();
      const filePath = path.join(exportDir, `${filename}-${timestamp}.pdf`);

      // Read HTML file
      const html = fs.readFileSync(htmlFilePath, "utf8");

      // Options for PDF generation
      const options = {
        format: "Letter",
        border: {
          top: "1cm",
          right: "1cm",
          bottom: "1cm",
          left: "1cm",
        },
        footer: {
          height: "1cm",
          contents: {
            default:
              '<div style="text-align: center; font-size: 10px;">Page {{page}} of {{pages}}</div>',
          },
        },
      };

      // Convert HTML to PDF
      htmlPdf.create(html, options).toFile(filePath, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.filename);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  exportToCsv,
  exportToPdf,
  exportToHtml,
  exportToJson,
  exportVisualizationToImage,
  convertHtmlToPdf,
};
