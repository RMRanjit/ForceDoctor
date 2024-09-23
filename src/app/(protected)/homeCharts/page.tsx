"use client";

import { ResponsivePie } from "@nivo/pie";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { DonutChart } from "@/components/chart/DonutChart";
import { getTopic } from "@/lib/Salesforce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, type ChartConfigItem } from "@/config/charts.config";
import { StackedBarChart } from "@/components/chart/StackedBarChart";
import { Loader } from "lucide-react";

type Props = {};

export default function HomeCharts() {
  const [data, setData] = useState();
  const [filteredItems, setFilteredItems] = useState<
    ChartConfigItem[] | undefined
  >(ChartConfig);

  return (
    <>
      <div className="flex flex-wrap gap-5 mx-auto justify-evenly  ">
        {filteredItems
          ?.filter((filteredItem) => filteredItem.loaded == true)
          ?.map((item: ChartConfigItem, itemIndex: number) =>
            ChartCard(item, itemIndex)
          )}
      </div>
    </>
  );
}

function ChartCard(item: ChartConfigItem, itemIndex: number) {
  const [showData, setShowData] = useState<boolean>(item.loaded);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any | null>(null);
  useEffect(() => {
    setIsLoading(true);
    async function getData() {
      const res = await getTopic(item.topic);
      // console.log("homeCharts: getData", res);
      setData(res[0]);
    }

    if (showData) {
      getData();
    }
    setIsLoading(false);
  }, [showData, item.topic]);

  // if (!data) return "Loading";

  return (
    <Card
      key={item.header + itemIndex}
      className="w-full md:w-1/2 lg:w-1/4 p-2hover:shadow-2xl hover:border-primary"
    >
      <CardHeader className="p-1 m-1 text-sm dark:text-white font-bold">
        {item.header}
      </CardHeader>
      {!data ? (
        <CardContent>
          <div className="flex items-center justify-center">
            <Loader className="animate-spin duration-9000 h-8 w-8 " />
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-0 justify-center">
          <div style={{ height: "300px", width: "100%" }}>
            {item.displayType.includes("DonutChart") && data?.records && (
              <DonutChart
                data={data.records}
                idKey={item.idKey as string}
                title={item.typeDisplay || item.header}
                showLegend={true}
              />
            )}
            {item.displayType.includes("StackedBarChart") && data && (
              <StackedBarChart
                data={data}
                showLegend={true}
                title="Daily Usage Metrics"
                idKey={item.idKey as string[]}
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
