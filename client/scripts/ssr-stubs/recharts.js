// Stand-in for recharts when rendering pages in Node.
//
// recharts measures its container through the SVG DOM and reads deviceXDPI off
// it, so it throws in Node before producing any markup. The charts themselves
// are not what this harness is checking: the question is whether the page
// component mounts and renders around them.
//
// Each component renders a labelled placeholder, so the page's layout and
// surrounding copy are still exercised rather than collapsing to nothing.
//
// ESM, not CommonJS: Vite inlines this module, so `require` is not defined
// here. The first version used require and took every chart page down.

import React from "react";

const Box = ({ label, height = 240 }) =>
  React.createElement(
    "div",
    {
      "data-recharts-stub": label,
      style: {
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
      },
    },
    label,
  );

const passthrough = (name) => {
  const C = (props) => Box({ label: name, height: props?.height });
  C.displayName = name;
  return C;
};

const nullComponent = (name) => {
  const C = () => null;
  C.displayName = name;
  return C;
};

export const ResponsiveContainer = ({ children }) =>
  React.createElement(
    "div",
    { style: { width: "100%", height: 300 } },
    typeof children === "function"
      ? children({ width: 800, height: 300 })
      : children,
  );

export const ComposedChart = passthrough("ComposedChart");
export const LineChart = passthrough("LineChart");
export const BarChart = passthrough("BarChart");
export const AreaChart = passthrough("AreaChart");
export const PieChart = passthrough("PieChart");
export const RadarChart = passthrough("RadarChart");
export const ScatterChart = passthrough("ScatterChart");

export const XAxis = nullComponent("XAxis");
export const YAxis = nullComponent("YAxis");
export const ZAxis = nullComponent("ZAxis");
export const CartesianGrid = nullComponent("CartesianGrid");
export const Tooltip = nullComponent("Tooltip");
export const Legend = nullComponent("Legend");
export const ReferenceLine = nullComponent("ReferenceLine");
export const ReferenceArea = nullComponent("ReferenceArea");
export const Cell = nullComponent("Cell");
export const Line = nullComponent("Line");
export const Bar = nullComponent("Bar");
export const Area = nullComponent("Area");
export const Pie = nullComponent("Pie");
export const Radar = nullComponent("Radar");
export const Scatter = nullComponent("Scatter");
export const LabelList = nullComponent("LabelList");

export default {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  AreaChart,
  PieChart,
  RadarChart,
  ScatterChart,
};
