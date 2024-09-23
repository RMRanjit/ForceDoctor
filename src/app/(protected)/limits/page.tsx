"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { limitsConfig, type LimitConfigItem } from "./limits.config";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getTopic } from "@/lib/Salesforce";
import { Suspense, cache, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Download,
  LayoutGrid,
  TableProperties,
  InfoIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import lodash from "lodash";
import { ToggleItem } from "@/types/Common.types";
import Link from "next/link";

type Props = {};

const toggleItems: ToggleItem[] = [
  { key: "Max", value: "Maximum Allowed" },
  { key: "Used", value: "Used" },
  { key: "Remaining", value: "Remaining" },
  { key: "UsedPercentage", value: "Used Percentage" },
];
enum DisplayType {
  Grid,
  Table,
}

export default function LimitsPage({}: Props) {
  // get the limits
  const [selectedDisplayType, setSelectedDisplayType] = useState<
    "Grid" | "Table"
  >("Grid");
  const [selectedLimitType, setSelectedLimitType] = useState<string>("Max");
  const [limits, setLimits] = useState<any | null>(null);
  const [filteredLimits, setFilteredLimits] = useState<
    LimitConfigItem[] | undefined
  >(limitsConfig);

  useEffect(() => {
    const getLimitInfo = cache(async () => {
      const data = await getTopic("limits");
      // console.log("LimitsPage: getLimitInfo: Data", data);
      setLimits(data[0]);
    });

    getLimitInfo();
  }, []);

  /**
   * Converts a nested object of Salesforce limits into an array of objects.
   * Limits do not come in as an array, and this function handles both standard
   * and nested limit structures.
   *
   * @param {Object} inputObj - The input object containing Salesforce limits data.
   * @returns {Array} An array of objects, each representing a limit or sub-limit.
   *
   * Each resulting object in the array has a 'Name' property and may include:
   * - For top-level limits: Max, Remaining, Used, and UsedPercentage.
   * - For nested limits (e.g., tool-specific limits): properties specific to that limit.
   *
   */
  function convertToObjectArray(inputObj: Record<string, any>): Array<any> {
    return Object.entries(inputObj).flatMap(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        const baseProperties: {
          Max: number;
          Remaining: number;
          Used: number;
          UsedPercentage: number;
        } = {
          Max: value.Max,
          Remaining: value.Remaining,
          Used: value.Used,
          UsedPercentage: value.UsedPercentage,
        };

        // const result = [{ Name: key, ...baseProperties }];
        const result: {
          Name: string;
          Max?: number;
          Remaining?: number;
          Used?: number;
          UsedPercentage?: number;
          Value?: any;
        }[] = [{ Name: key, ...baseProperties }];

        for (const [subKey, subValue] of Object.entries(value)) {
          if (typeof subValue === "object" && subValue !== null) {
            // Check for existence of expected properties in nested objects (optional)
            // const hasSubRequiredProps =
            //   typeof subValue.Max === "number" &&
            //   typeof subValue.Remaining === "number";

            result.push({
              Name: `${key}: ${subKey}`,
              // @ts-ignore
              Max: subValue.Max,
              // @ts-ignore
              Remaining: subValue.Remaining,
              // @ts-ignore
              Used: subValue.Max - subValue.Remaining,

              UsedPercentage:
                // @ts-ignore
                subValue.Max > 0
                  ? // @ts-ignore
                    (subValue.Remaining / subValue.Max) * 100
                  : 0,
            });
          }
        }

        return result;
      } else {
        return [{ Name: key, Value: value }];
      }
    });
  }

  const onDownload = () => {
    // Convert limits to an objectArray
    const flattenedData = convertToObjectArray(limits);

    // console.log("LimitsPage: OnDownload: Data", limits, flattenedData);

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Limits");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "LimitData.xlsx");
  };

  const click = (value: string) => {
    {
      setSelectedLimitType(value);
    }
  };

  const onSearch = (value: string) => {
    const filteredList = limitsConfig.filter(
      (limit) =>
        limit.header.toLowerCase().includes(value.toLowerCase()) ||
        limit.body.toLowerCase().includes(value.toLowerCase()) ||
        limit.group?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredLimits(filteredList);
  };

  // console.log("Limits page", limits);
  if (limits?.error) return <div>{limits?.error}</div>;
  else
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
                console.log(event.target.value);
              }}
            />
          </div>
          <div className="justify-end pb-2">
            <ToggleGroup
              type="single"
              defaultValue={selectedLimitType}
              value={selectedLimitType}
              // onValueChange={(value) => click(value)}
              onValueChange={(value) => {
                if (value) setSelectedLimitType(value);
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
          <ToggleGroup
            type="single"
            defaultValue={selectedDisplayType}
            value={selectedLimitType}
            onValueChange={(value) => {
              // @ts-ignore
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

          <Link
            href="https://developer.salesforce.com/docs/atlas.en-us.salesforce_app_limits_cheatsheet.meta/salesforce_app_limits_cheatsheet/salesforce_app_limits_overview.htm"
            className="text-xs"
            passHref
            legacyBehavior
          >
            <a target="_blank">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="mt-2">
                      Salesforce Developer Limits and Allocations Quick
                      Reference
                    </InfoIcon>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Click to Learn more about Salesforce Developer Limits and
                      Allocations
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </a>
          </Link>
        </div>

        {selectedDisplayType === "Grid" ? (
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {/* <div className=" flex flex-row flex-wrap justify-between gap-10 mx-auto items-center"> */}
            {limits &&
              filteredLimits?.map(
                (limitItem: LimitConfigItem, limitItemIndex: number) => {
                  // Proceed only if the item exists in the result that we have from the server
                  if (limits[limitItem.topic])
                    return (
                      <Card
                        key={limitItem.topic + limitItemIndex}
                        className=" rounded-md  w-96 shadow-xl flex flex-col hover:shadow-2xl hover:border-primary"
                      >
                        <CardHeader>
                          <span className="uppercase tracking-widest text-xs line-clamp-1 ">
                            {/* border-b-2  */}
                            {limitItem.group}
                          </span>
                          <CardTitle className="h-10 text-md">
                            {limitItem.header}
                          </CardTitle>
                          <CardDescription className="pt-1 text-xs line-clamp-3 h-15">
                            {limitItem.body}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-center ">
                          <span className="text-3xl self-center lining-nums ">
                            {limits[limitItem.topic]?.[selectedLimitType]}
                          </span>
                          <span className="text-sm uppercase widest self-center ">
                            {
                              toggleItems.filter(
                                (item) => item.key === selectedLimitType
                              )[0]?.value
                            }
                          </span>
                          {/* <span className="text-xl ">
                                {limits[limitItem.topic]?.Max -
                                  limits[limitItem.topic]?.Remaining}
                                /
                              </span>
        
                              <span className="text-xl  tracking-widest text-red-400">
                                {limits[limitItem.topic]?.Max}
                              </span> */}
                        </CardContent>
                        <CardFooter className="p-2">
                          <div className="flex flex-row w-full">
                            <div className="flex-1">
                              <Progress
                                value={
                                  limits[limitItem.topic] &&
                                  limits[limitItem.topic].Max > 0
                                    ? limits[limitItem.topic].Used /
                                      limits[limitItem.topic].Max
                                    : 0
                                }
                              />
                            </div>
                            <div className="text-xs pl-2">
                              {limits[limitItem.topic].Used} /
                              {limits[limitItem.topic].Max}
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    );
                }
              )}
            {/* </div> */}
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
            <div className="md:w-1/2  ">
              <Table>
                <TableCaption>A list of your limits.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Group</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">
                      {
                        toggleItems.filter(
                          (item) => item.key == selectedLimitType
                        )[0].value
                      }
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {limits &&
                    filteredLimits?.map(
                      (limitItem: LimitConfigItem, limitItemIndex: number) => {
                        // Proceed only if the item exists in the result that we have from the server
                        if (limits[limitItem.topic])
                          return (
                            <TableRow
                              key={limitItem.topic + limitItemIndex}
                              className=" hover: bg-secondary"
                            >
                              <TableCell className="font-medium">
                                {limitItem.group}
                              </TableCell>
                              <TableCell className="font-medium">
                                {limitItem.header}
                              </TableCell>

                              <TableCell className="text-right">
                                {limits[limitItem.topic]?.[selectedLimitType]}
                              </TableCell>
                            </TableRow>
                          );
                      }
                    )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </>
    );
}
