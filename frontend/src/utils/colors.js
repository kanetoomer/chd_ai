export const generateChartColors = (count) => {
  const baseColors = [
    "#4285F4", // Blue
    "#34A853", // Green
    "#FBBC05", // Yellow
    "#EA4335", // Red
    "#8F44AD", // Purple
    "#16A085", // Teal
    "#F39C12", // Orange
    "#D35400", // Deep Orange
    "#27AE60", // Emerald
    "#2980B9", // Blue
    "#E74C3C", // Red
    "#8E44AD", // Purple
    "#2C3E50", // Navy
    "#F1C40F", // Yellow
    "#1ABC9C", // Turquoise
    "#3498DB", // Light Blue
  ];

  // If we need more colors than in our base set, generate them
  if (count > baseColors.length) {
    const additionalColors = [];

    for (let i = 0; i < count - baseColors.length; i++) {
      // Generate random hex color
      const randomColor =
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");
      additionalColors.push(randomColor);
    }

    return [...baseColors, ...additionalColors];
  }

  // Otherwise return the required number of base colors
  return baseColors.slice(0, count);
};

export const createGradient = (color, opacity = 0.5) => {
  return (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(
      0,
      color.replace(")", `, ${opacity})`).replace("rgb", "rgba")
    );
    gradient.addColorStop(1, color.replace(")", ", 0)").replace("rgb", "rgba"));
    return gradient;
  };
};

export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const transparentize = (color, alpha) => {
  const { r, g, b } = hexToRgb(color) || { r: 0, g: 0, b: 0 };
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const generateHeatmapColors = (steps = 10) => {
  const colors = [];

  // Generate color gradient from blue (cool) to red (hot)
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);

    // Calculate RGB values for gradient
    const r = Math.round(255 * ratio);
    const g = Math.round(255 * (1 - Math.abs(2 * ratio - 1)));
    const b = Math.round(255 * (1 - ratio));

    colors.push(`rgb(${r}, ${g}, ${b})`);
  }

  return colors;
};

export const getColorForValue = (value, min, max) => {
  // Normalize value to range [0, 1]
  const normalizedValue = (value - min) / (max - min);

  // Get color from heatmap palette
  const heatmapColors = generateHeatmapColors();
  const colorIndex = Math.min(
    Math.floor(normalizedValue * heatmapColors.length),
    heatmapColors.length - 1
  );

  return heatmapColors[colorIndex];
};

export const generateCategoryColors = (categories) => {
  const colors = generateChartColors(categories.length);

  const colorMap = {};
  categories.forEach((category, index) => {
    colorMap[category] = colors[index];
  });

  return colorMap;
};
