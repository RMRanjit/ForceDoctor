"use client";
import { Suspense, cache, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Progress } from "@/components/ui/progress";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getTopic } from "@/lib/Salesforce";
import {
  Download,
  Info,
  LayoutGrid,
  Search,
  TableProperties,
  Loader,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { LicenseConfigItem, licenseConfig } from "@/config/licenses.config";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ToggleItem } from "@/types/Common.types";
import Link from "next/link";

interface License {
  id: string;
  topic?: string;
  MasterLabel?: string;
  TotalLicenses?: number;
  UsedLicenses?: number;
  Remaining?: number;
  UsedPercentage?: string;
}

const toggleItems: ToggleItem[] = [
  { key: "TotalLicenses", value: "Total" },
  { key: "UsedLicenses", value: "Used" },
  { key: "Remaining", value: "Remaining" },
  { key: "UsedPercentage", value: "Used Percentage" },
];

function LicensesPage() {
  const [selectedType, setSelectedType] = useState<
    "TotalLicenses" | "UsedLicenses" | "Remaining" | "UsedPercentage"
  >("TotalLicenses");
  const [selectedDisplayType, setSelectedDisplayType] = useState<
    "Grid" | "Table"
  >("Grid");
  const [licenses, setLicenses] = useState<License[] | null>(null);
  const [allData, setAllData] = useState<any | undefined>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<
    LicenseConfigItem[] | undefined
  >(licenseConfig);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getLatestFeatureMetrics() {
      const featureMetrics: any[] = await getTopic("featureLicenses");
      const latestMetrics = new Map<string, any>();

      // console.log("FeatureMetrics", featureMetrics);

      for (const metric of featureMetrics[0].records) {
        const currentLatest = latestMetrics.get(metric.FeatureType);
        //if there is no current latest, or if this metric is more recent, update the map
        if (
          !currentLatest ||
          new Date(metric.MetricsDate) > new Date(currentLatest.MetricsDate)
        ) {
          latestMetrics.set(metric.FeatureType, metric);
        }
      }
      // Convert the map values back to an array
      featureMetrics[0].records = Array.from(latestMetrics.values());
      return featureMetrics;
    }

    const getLicensesFromServer = cache(async () => {
      let arrLicenses: any[] = [];
      setIsLoading(true);

      try {
        // Unify the data for display by getting the values of total and used counts. Need to treat
        // featureLicenses differently, as they have multiple dates. Either solve it in the SOQL or
        // filter it down here, to show only the latest records.
        Promise.all([
          getTopic("UserLicenses"),
          getTopic("usageEntitlements"),
          getTopic("permissionSetLicenses"),
          getLatestFeatureMetrics(),
        ]).then((values) => {
          setAllData(values);
          for (const value of values) {
            const data = value[0].records;
            const redactedLicenses = data.map((item: any) => ({
              id: item.Id,
              topic:
                item.LicenseDefinitionKey ||
                item.DeveloperName ||
                item.FeatureType ||
                item.Setting,
              MasterLabel: item.MasterLabel || item.FeatureType,
              TotalLicenses:
                item.TotalLicenses |
                item.TotalLicenseCount |
                item.CurrentAmountAllowed,
              //item.UsedLicenses | item.AssignedUserCount,
              UsedLicenses:
                item.UsedLicenses |
                item.AssignedUserCount |
                item.AmountUsed |
                0,
              Remaining:
                (item.TotalLicenses |
                  item.TotalLicenseCount |
                  item.CurrentAmountAllowed) -
                (item.UsedLicenses |
                  item.AssignedUserCount |
                  item.AmountUsed |
                  0),
              UsedPercentage: `${((item.TotalLicenses |
                item.TotalLicenseCount |
                item.CurrentAmountAllowed) >
              0
                ? ((item.UsedLicenses |
                    item.AssignedUserCount |
                    item.AmountUsed |
                    0) /
                    (item.TotalLicenses |
                      item.TotalLicenseCount |
                      item.CurrentAmountAllowed)) *
                  100
                : 0
              ).toFixed(2)}%`,
            }));

            // console.log(value[0].objectName, redactedLicenses);

            arrLicenses = [...arrLicenses, ...redactedLicenses];
          }
          // console.log("License useEffect", arrLicenses);
          setLicenses(arrLicenses);
        });
      } catch (error) {
        console.log("Error in Licenses: useEffect", error);
      } finally {
        setIsLoading(false);
      }
    });

    getLicensesFromServer();
  }, []);

  const onSearch = (value: string) => {
    const filteredList = licenseConfig.filter(
      (licenseConfig) =>
        licenseConfig.header.toLowerCase().includes(value.toLowerCase()) ||
        licenseConfig.body.toLowerCase().includes(value.toLowerCase()) ||
        licenseConfig.group?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredLicenses(filteredList);
  };

  const onDownload = () => {
    // Logic to download the data
    // console.log("LicensePage: onDownload: Download data", allData);

    const workbook = XLSX.utils.book_new();

    // console.log("LicensePage: onDownload: Download data", allData);

    for (let index = 0; index < allData.length; index++) {
      const data = allData[index][0];
      console.log(allData);
      console.log(data);
      console.log(index);
      const SheetData = data.records;
      if (data.objectName === "usageEntitlements") {
        console.log(SheetData);
        const sortedData = SheetData.toSorted(
          (SheetData: any, SheetDataB: any) =>
            SheetData.MasterLabel.localeCompare(SheetDataB.MasterLabel)
        );
        console.log(sortedData);
        const worksheet = XLSX.utils.json_to_sheet(sortedData);
        XLSX.utils.book_append_sheet(workbook, worksheet, data.objectName);
      }
      // console.log("LicensePage: onDownload: Processing", data);
      // Convert the data to a worksheet
      if (data.objectName != "usageEntitlements") {
        const worksheet = XLSX.utils.json_to_sheet(data.records);
        XLSX.utils.book_append_sheet(workbook, worksheet, data.objectName);
      }
    }

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "LicenseData.xlsx");
  };

  // if (licenses?.error) return <div>{licenses?.error}</div>;

  if (isLoading)
    return (
      <div className="flex items-center justify-center">
        <Loader className="animate-spin duration-9000 h-8 w-8 " />
      </div>
    );

  return (
    <>
      <div className="flex flex-row justify-between">
        <div className="relative md:grow-0">
          {/* //className="relative ml-auto flex-1 md:grow-0 pr-10" */}
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            onChange={(event) => {
              onSearch(event.target.value);
              // console.log(event.target.value);
            }}
          />
        </div>
        <div className="justify-end pb-2">
          <ToggleGroup
            type="single"
            defaultValue={selectedType}
            value={selectedType}
            // onValueChange={(value) => click(value)}
            onValueChange={(value: any) => {
              if (value) setSelectedType(value);
            }}
            // className="justify-end pb-2"
          >
            {toggleItems.map((toggleItem) => {
              return (
                <ToggleGroupItem
                  value={toggleItem.key}
                  key={toggleItem.key}
                  className={"text-center"}
                >
                  {toggleItem.value}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>
      </div>
      <div className="flex flex-row justify-end pb-2">
        {/* <span className="text-xs">Display As:</span> */}
        <ToggleGroup
          type="single"
          defaultValue={selectedDisplayType}
          value={selectedType}
          onValueChange={(value: any) => {
            if (value) setSelectedDisplayType(value);
          }}
        >
          <ToggleGroupItem value="Grid">
            <LayoutGrid />
          </ToggleGroupItem>
          <ToggleGroupItem value="Table">
            <TableProperties />
          </ToggleGroupItem>
        </ToggleGroup>
        <Button variant="ghost" onClick={onDownload}>
          <Download />
        </Button>
      </div>

      {selectedDisplayType === "Grid" ? (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {licenses &&
            filteredLicenses?.map(
              (licenseItem: LicenseConfigItem, licenseItemIndex: number) => {
                const value = licenses.filter(
                  (item) => item.topic === licenseItem.topic
                );
                return (
                  <Card
                    key={licenseItem.topic + licenseItemIndex}
                    className=" rounded-md  w-96 shadow-xl flex flex-col hover:shadow-2xl hover:border-primary"
                  >
                    <CardHeader>
                      <span className="uppercase tracking-widest text-xs line-clamp-1 ">
                        {licenseItem.group}
                      </span>
                      <CardTitle className="h-10 text-md">
                        {licenseItem.header}
                      </CardTitle>
                      <CardDescription className="pt-1 text-xs line-clamp-3 h-15">
                        {licenseItem.body}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center ">
                      <span className="text-3xl self-center lining-nums ">
                        {value[0] && value[0].TotalLicenses ? (
                          <>
                            {value[0].TotalLicenses > 0
                              ? value[0][selectedType]
                              : 0}
                          </>
                        ) : (
                          0
                        )}
                        {/* {value[0][selectedType]} */}
                      </span>
                      <span className="text-sm uppercase widest self-center ">
                        {
                          toggleItems.filter(
                            (item) => item.key === selectedType
                          )[0]?.value
                        }
                      </span>
                    </CardContent>
                    <CardFooter className="p-1">
                      <div className="flex flex-row w-full">
                        <div className="flex-1">
                          <Progress
                            value={
                              value[0] &&
                              value[0].UsedLicenses &&
                              value[0].TotalLicenses &&
                              value[0].TotalLicenses > 0
                                ? value[0].UsedLicenses / value[0].TotalLicenses
                                : 0
                            }
                          />
                        </div>
                        <div className="text-xs pl-2">
                          {value[0] &&
                          value[0].UsedLicenses &&
                          value[0].TotalLicenses &&
                          value[0].TotalLicenses > 0
                            ? (
                                value[0].UsedLicenses / value[0].TotalLicenses
                              ).toString()
                            : 0}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                );
              }
            )}
        </div>
      ) : (
        <div
          className="flex justify-center"
          // style={{
          //   display: "flex",
          //   justifyContent: "center",
          //   alignItems: "center",
          // }}
        >
          <div className="sm:w-full md:w-1/2  ">
            <Table>
              <TableCaption>
                A list of your licenses and entitlements.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Group</TableHead>
                  <TableHead className="w-[300px]">Name</TableHead>
                  <TableHead className="text-right">
                    {
                      toggleItems.filter((item) => item.key == selectedType)[0]
                        .value
                    }
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses &&
                  filteredLicenses?.map((item) => {
                    const value = licenses.filter(
                      (filterItem) => filterItem.topic === item.topic
                    );

                    return (
                      <TableRow
                        key={item.group + item.topic}
                        className=" hover: bg-secondary"
                      >
                        <TableCell className="font-medium">
                          {item.group}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.header}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block mx-2 -my-1">
                                  <Info className="h-4 w-4" strokeWidth={1} />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="w-56" side="right">
                                {item.body}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>

                        <TableCell className="text-right">
                          {value[0] ? value[0][selectedType] : "0"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}

export default LicensesPage;
