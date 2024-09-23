import React, { useState, useMemo } from "react";
import { ComputedDatum, ResponsivePie } from "@nivo/pie";
import { useTheme } from "next-themes";

interface DonutChartProps<T> {
  data: T[];
  idKey?: keyof T;
  valueKey?: keyof T;
  showLegend?: boolean;
  title?: string;
}

interface ChartDataItem {
  id: string;
  value: number;
}

interface PieDataItem extends ChartDataItem {
  formattedValue: number;
  color: string;
  label: string;
  [key: string]: any;
}

export function DonutChart<T>({
  data,
  idKey,
  valueKey,
  showLegend = false,
  title = "",
}: DonutChartProps<T>) {
  const { theme } = useTheme();
  const [hoveredSegment, setHoveredSegment] = useState<
    ComputedDatum<ChartDataItem> | PieDataItem | null
  >(null);

  const chartData: ChartDataItem[] = useMemo(() => {
    if (!idKey) {
      // If idKey is not provided, use the data as-is
      return data.map((item, index) => ({
        id: `Item ${index + 1}`,
        value: typeof item === "number" ? item : 1,
      }));
    }

    const summarizedData: { [key: string]: number } = {};

    data.forEach((item) => {
      let id = String(item[idKey]);

      // Handle empty or null idKeys
      if (id === "" || id === "null" || id === "undefined") {
        id = "Not defined";
      }

      if (valueKey) {
        const value = item[valueKey];
        if (typeof value !== "number") {
          console.warn(
            `Invalid value for ${id}: ${String(
              value
            )}. Expected a number. Skipping this item.`
          );
          return;
        }
        summarizedData[id] = (summarizedData[id] || 0) + value;
      } else {
        summarizedData[id] = (summarizedData[id] || 0) + 1;
      }
    });

    return Object.entries(summarizedData).map(([id, value]) => ({ id, value }));
  }, [data, idKey, valueKey]);

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const getPercentage = (value: number): string => {
    return ((value / total) * 100).toFixed(1) + "%";
  };

  const valueLabel = title ? title : valueKey ? "Total" : "Count";

  return (
    <div className="h-full w-full min-h-[300px] relative">
      {/* <text className="text-xs">{title}</text> */}
      <ResponsivePie
        data={chartData}
        margin={{ top: 40, right: 80, bottom: showLegend ? 80 : 40, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ scheme: "greys" }}
        borderWidth={1}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.2]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={theme === "dark" ? "#ffffff" : "#333333"}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 2]],
        }}
        onMouseEnter={(data) => setHoveredSegment(data)}
        onMouseLeave={() => setHoveredSegment(null)}
        // layers={[
        //   "arcs",
        //   "arcLabels",
        //   "arcLinkLabels",
        //   "legends",
        //   (props) => (
        //     <text
        //       x={props.centerX}
        //       y={props.centerY}
        //       textAnchor="middle"
        //       dominantBaseline="central"
        //       style={{
        //         fontSize: "24px",
        //         fontWeight: "semibold",
        //       }}
        //     >
        //       {hoveredSegment ? hoveredSegment.value : total}

        //     </text>
        //   ),
        // ]}
        legends={
          showLegend
            ? [
                {
                  anchor: "bottom",
                  direction: "row",
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: theme === "dark" ? "#ffffff" : "#333333",
                  itemDirection: "left-to-right",
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: "circle",
                },
              ]
            : []
        }
        theme={{
          text: {
            fill: theme === "dark" ? "#ffffff" : "#333333",
          },
          tooltip: {
            container: {
              background: theme === "dark" ? "#333333" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#333333",
            },
          },
        }}
      />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-xs font-semibold">
          {hoveredSegment ? hoveredSegment.id : valueLabel}
        </p>
        <p className="text-xs font-bold">
          {hoveredSegment ? hoveredSegment.value : chartData.length}
        </p>
        <p className="text-xs">
          {hoveredSegment ? getPercentage(hoveredSegment.value) : ""}
        </p>
      </div>
    </div>
  );
}

// onMouseEnter={(data) => setHovered(data as NamespaceData)}
// onMouseLeave={() => setHovered(null)}
// layers={[
//   "slices",
//   "sliceLabels",
//   "radialLabels",
//   "legends",
//   (props) => (
//     <text
//       x={props.centerX}
//       y={props.centerY}
//       textAnchor="middle"
//       dominantBaseline="central"
//       style={{
//         fontSize: "24px",
//         fontWeight: "bold",
//       }}
//     >
//       {hovered ? hovered.value : total}
//     </text>
//   ),
// ]}
