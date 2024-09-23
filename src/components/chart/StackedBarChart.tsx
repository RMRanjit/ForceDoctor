import React, { useState, useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { useTheme } from "next-themes";

interface StackedBarChartProps {
  data: Record<string, any>;
  idKey?: string[] | undefined;
  valueKey?: string[] | undefined;
  showLegend?: boolean;
  title?: string;
}

interface ChartDataItem {
  category: string;
  Max: number;
  Remaining: number;
  Used: number;
}

export function StackedBarChart({
  data,
  idKey = [],
  valueKey = [],
  showLegend = false,
  title = "",
}: StackedBarChartProps) {
  const { theme } = useTheme();
  const [hoveredSegment, setHoveredSegment] = useState<ChartDataItem | null>(
    null
  );

  const chartData: ChartDataItem[] = useMemo(() => {
    return Object.entries(data)
      .map(([key, value]) => {
        const total = value.Max;
        if (idKey.length === 0 && value.Remaining > 0) {
          return {
            category: key,
            Remaining: (value.Remaining / total) * 100,
            Used: (value.Used / total) * 100,
          };
          //@ts-ignore
        } else if (idKey === key || idKey.includes(key)) {
          return {
            category: key,
            Remaining: (value.Remaining / total) * 100,
            Used: (value.Used / total) * 100,
          };
        }
      })
      .filter((item) => item !== undefined) as ChartDataItem[];
  }, [data]);

  console.log("ChartData", chartData);

  return (
    <div className="h-full w-full min-h-[300px] relative">
      <ResponsiveBar
        //@ts-ignore
        data={chartData}
        keys={["Used", "Remaining"]}
        indexBy="category"
        layout="horizontal" // Change layout to horizontal
        margin={{ top: 0, right: 40, bottom: showLegend ? 80 : 40, left: 120 }}
        padding={0.3}
        colors={{ scheme: "nivo" }}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        // borderRadius={5}
        animate={true}
        motionStiffness={120}
        axisTop={null}
        axisRight={null}
        // axisBottom={{
        //   tickSize: 5,
        //   tickPadding: 5,
        //   tickRotation: 0,
        //   legend: title,
        //   legendPosition: "middle",
        //   legendOffset: 32,
        //   // format: ".2f%", // Set format here for all bars
        // }}
        // axisLeft={{
        //   tickSize: 5,
        //   tickPadding: 5,
        //   tickRotation: 0,
        //   legend: "Percentage",
        //   legendPosition: "middle",
        //   legendOffset: -40,
        // }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        labels={(datum: any) => `${datum.id} `}
        // labelFormat={(d) => `${d.toFixed(2)}%`}
        valueFormat={(d) => `${d.toFixed(2)}%`}
        legends={
          showLegend
            ? [
                {
                  dataFrom: "keys",
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
            },
          },
        }}
        //@ts-ignore
        onMouseEnter={(data) => setHoveredSegment(data)}
        onMouseLeave={() => setHoveredSegment(null)}
      />
    </div>
  );
}
