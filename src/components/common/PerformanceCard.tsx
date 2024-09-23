import { type PerformanceItem, metric } from "@/config/Performance.config";
import { Card, CardContent } from "@/components/ui/card";
import { SalesforceEventType } from "@/types/Salesforce.types";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { PerformanceItems } from "@/config/Performance.config";
import { getEventLogs } from "@/lib/Salesforce";
import { useState, useEffect } from "react";
import { Download, FileImage, Loader, TableProperties } from "lucide-react";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTimeFromTimeStamp } from "@/lib/utils";
import { Calendar } from "../chart/Calendar";

enum DisplayType {
  Image = "Image",
  Table = "Table",
}

export function PerformanceCard({
  data,
  content,
  objectInfo,
}: {
  data: any[];
  content: PerformanceItem;
  objectInfo?: any;
}) {
  function CalculateMetricValue(metric: string | metric) {
    const columnData = data.map((record: any) => record[content.key] * 1); // Want to convert this to a number
    switch (metric) {
      case "Max":
        return Math.max(...columnData);
      case "Min":
        return Math.min(...columnData);
      case "Avg":
        return (
          columnData.reduce((acc: number, val: number) => acc + val, 0) /
          columnData.length
        ).toFixed(2);
      default:
        const formula = typeof metric === "object" ? metric.formula : metric;
        const filterFunction = new Function("item", `return ${formula}`);
        return data.filter((item) => filterFunction(item)).length;
    }
  }

  return (
    <Card
      key={content.key}
      className="md:w-1/6 sm:w-1/4 min-w-60 hover:shadow-2xl    hover:border-primary"
    >
      <CardContent className="p-0 m-0">
        <div className="flex flex-col">
          {/* <div className="size-10 bg-secondary rounded">10</div> */}
          <span className="text-sm font-semibold">{content.header}</span>
          <span className="text-xs line-clamp-4" style={{ height: "4lh" }}>
            {content.description}
          </span>
          <div className="flex flex-row justify-between bg-secondary">
            {content.metrics.map((metric) => (
              <div className="text-sm ">
                <span className="font-semibold mr-2">
                  {
                    //@ts-ignore
                    metric.name || metric
                  }
                  :
                </span>
                {CalculateMetricValue(metric)}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceMetrics({
  eventType,
}: {
  eventType: SalesforceEventType | null;
}) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); //setting the loader true by default
  const [selectedDisplayType, setSelectedDisplayType] = useState<DisplayType>(
    DisplayType.Image
  );

  useEffect(() => {
    async function getDataFromServer() {
      if (eventType) {
        setIsLoading(true);
        const res = await getEventLogs(eventType);
        console.log("PerformanceMetrics: UseEffect : Response", res);
        setData(res);
        setIsLoading(false);
      }
    }

    getDataFromServer();
  }, [eventType]);

  const onDownload = () => {};

  if (isLoading) {
    return <Loader className="h-8 w-8 animate-spin" />;
  } else if (data && data.records.length <= 0)
    return (
      <span className="text-xs font-semibold text-destructive">
        No Events Found
      </span>
    );
  else
    return (
      <div className="flex flex-col w-full">
        {/* Show the view and download options only if there is data*/}
        {data && data.records.length > 0 && (
          <div className="flex-row">
            <div className="text-xs font-semibold ">
              {data.records.length} events found!
            </div>
            <div className="flex flex-row justify-end pb-2">
              <ToggleGroup
                type="single"
                defaultValue={selectedDisplayType}
                value={selectedDisplayType}
                onValueChange={(value) => {
                  if (value) setSelectedDisplayType(value as DisplayType);
                }}
              >
                <ToggleGroupItem value={DisplayType.Image}>
                  <FileImage />
                </ToggleGroupItem>
                <ToggleGroupItem value={DisplayType.Table}>
                  <TableProperties />
                </ToggleGroupItem>
              </ToggleGroup>
              <Button variant="ghost" onClick={onDownload}>
                <Download />
              </Button>
            </div>
            {selectedDisplayType == DisplayType.Image ? (
              <div className="flex flex-col">
                <div className="h-[275px] w-full">
                  <Calendar
                    data={data.records}
                    dateColumn="TIMESTAMP_DERIVED"
                  />
                </div>
                <div className="grid grid-flow-row md:grid-cols-4 gap-5">
                  {Object.keys(data.records[0]).map((column) => {
                    // Check if this item is in the performance list that we are measuring
                    // if yes, do the calculations and send the data across
                    // Contemplation: Do we send all the data to the component and perform the
                    // computation there?

                    const item = PerformanceItems.filter((performanceItem) => {
                      return (
                        performanceItem.key === column &&
                        performanceItem.active === true
                      );
                    });

                    // Lets perform the calculations based on the metrics provided

                    if (item.length > 0) {
                      // get the column out of the data.records

                      const columnData = data.records.map(
                        (record: any) => record[column]
                      );
                      const max = Math.max(...columnData);
                      const min = Math.min(...columnData);
                      const avg = (
                        columnData.reduce(
                          (acc: number, val: number) => acc + val,
                          0
                        ) / columnData.length
                      ).toFixed(2);

                      //console.log("Calculations for column", column, max, min, avg);
                    }

                    return item.length > 0 ? (
                      <PerformanceCard
                        data={data.records}
                        key={column}
                        content={item[0]}
                      />
                    ) : (
                      <></>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(data.records[0]).map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.records.map((item: any, index: number) => (
                      <TableRow key={index}>
                        {Object.keys(data.records[0]).map((column) => (
                          <TableCell key={column}>
                            {column === "TIMESTAMP"
                              ? // column.includes("TIMESTAMP")
                                formatDateTimeFromTimeStamp(
                                  item[column] as string
                                )
                              : item[column]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
    );
}
