import React, { useMemo } from "react";
import { ResponsiveCalendar } from "@nivo/calendar";
import { useTheme } from "next-themes";

interface CalendarProps<T> {
  data: T[];
  dateColumn: string;
  valueColumn?: string;
  from?: string;
  to?: string;
}

interface CalendarTooltipProps {
  day: string;
  value: number;
  color: string;
}

interface CalendarDataItem {
  day: string;
  value: number;
}

export function Calendar<T extends Record<string, any>>({
  data,
  dateColumn,
  valueColumn,
  from,
  to,
}: CalendarProps<T>) {
  const { theme } = useTheme();

  const { formattedData, calculatedFrom, calculatedTo, stats } = useMemo(() => {
    let formattedData: CalendarDataItem[];
    let max = -Infinity;
    let min = Infinity;
    let sum = 0;

    const getValue = (item: T, key: string) => {
      const keys = key.split(".");
      return keys.reduce((obj, k) => obj && obj[k], item as any);
    };

    const formatDate = (dateString: string) => {
      let date: Date;
      if (dateString.includes("T")) {
        // ISO format
        date = new Date(dateString);
      } else if (dateString.length === 17) {
        // YYYYMMDDHHMMSS.sss format
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);
        const hour = dateString.slice(8, 10);
        const minute = dateString.slice(10, 12);
        const second = dateString.slice(12, 14);
        const millisecond = dateString.slice(15);
        date = new Date(
          `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}Z`
        );
      } else {
        // Invalid format
        return null;
      }
      return date.toISOString().split("T")[0];
    };

    if (valueColumn) {
      // Use the provided value column
      formattedData = data.reduce((acc: CalendarDataItem[], item) => {
        const day = formatDate(getValue(item, dateColumn));
        const value = Number(getValue(item, valueColumn));

        if (day && !isNaN(value)) {
          max = Math.max(max, value);
          min = Math.min(min, value);
          sum += value;
          acc.push({ day, value });
        }
        return acc;
      }, []);
    } else {
      // Count occurrences by date
      const countByDate: Record<string, number> = {};
      data.forEach((item) => {
        const day = formatDate(getValue(item, dateColumn));
        if (day) {
          countByDate[day] = (countByDate[day] || 0) + 1;
        }
      });

      formattedData = Object.entries(countByDate).map(([day, value]) => {
        max = Math.max(max, value);
        min = Math.min(min, value);
        sum += value;
        return { day, value };
      });
    }

    // Sort the data by date
    formattedData.sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
    );

    // Calculate from and to if not provided
    const calculatedFrom = from || formattedData[0]?.day;
    const calculatedTo = to || formattedData[formattedData.length - 1]?.day;

    const avg = formattedData.length > 0 ? sum / formattedData.length : 0;

    return {
      formattedData,
      calculatedFrom,
      calculatedTo,
      stats: { max, min, avg: Number(avg.toFixed(2)) },
    };
  }, [data, dateColumn, valueColumn, from, to]);

  // If there's no data, return null or a placeholder
  if (formattedData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className="h-full w-full min-h-[300px] relative">
      <ResponsiveCalendar
        data={formattedData}
        from={calculatedFrom}
        to={calculatedTo}
        emptyColor={theme === "dark" ? "#333333" : "#eeeeee"}
        colors={["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"]}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        yearSpacing={20}
        monthSpacing={20}
        monthBorderColor={theme === "dark" ? "#555555" : "#ffffff"}
        dayBorderWidth={0.5}
        monthBorderWidth={0.5}
        dayBorderColor={theme === "dark" ? "#555555" : "#ffffff"}
        legends={[
          {
            anchor: "bottom-right",
            direction: "row",
            translateY: 36,
            itemCount: 4,
            itemWidth: 42,
            itemHeight: 36,
            itemsSpacing: 14,
            itemDirection: "right-to-left",
          },
        ]}
        //@ts-ignore
        tooltip={(n: CalendarTooltipProps) => {
          if (n.value === undefined) return null;
          return (
            <div
              className={`bg-secondary text-xs p-2 rounded ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              {n.value} {valueColumn ? "Value" : "Events"} on{" "}
              {new Date(n.day).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              <br />
              Max: {stats.max}, Min: {stats.min}, Avg: {stats.avg}
            </div>
          );
        }}
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
      />
    </div>
  );
}
