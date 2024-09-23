"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  dashboardConfig,
  type DashboardConfigItem,
} from "@/config/dashboard.config";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { getTopic } from "@/lib/Salesforce";
import lodash from "lodash";
import { Input } from "@/components/ui/input";

type Props = {};

export default function HomePage({}: Props) {
  const [filteredItems, setFilteredItems] = useState<
    DashboardConfigItem[] | undefined
  >(dashboardConfig);

  const onSearch = useCallback(
    (value: string) => {
      const filteredList = dashboardConfig?.filter(
        (item) =>
          item.header.toLowerCase().includes(value.toLowerCase()) ||
          item.body.toLowerCase().includes(value.toLowerCase())
      );
      console.log("Filtered Items", filteredList);
      // Always call setFilteredItems, even if filteredList is undefined
      setFilteredItems(filteredList);
    },
    [dashboardConfig]
  );
  return (
    <>
      <div className="grid grid-cols-2">
        <div className="relative md:grow-0 ">
          {/* //className="relative ml-auto flex-1 md:grow-0 pr-10" */}
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search... "
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            onChange={(event) => {
              // event.preventDefault();
              onSearch(event.target.value);
              // console.log(event.target.value);
            }}
          />
        </div>
        {/* Place holder for Filter by packages - */}
        <div className="flex justify-end pr-4 text-muted text-xs">
          <pre>{process.env.NODE_ENV}</pre>
        </div>
      </div>
      <div className="flex flex-row flex-wrap justify-between gap-10 mx-auto  items-center">
        {filteredItems?.map((item: any, itemIndex: number) => (
          <DashboardCard
            key={item.header + itemIndex}
            item={item}
            itemIndex={itemIndex}
          />
        ))}
      </div>
    </>
  );
}

function DashboardCard({
  item,
  itemIndex,
}: {
  item: DashboardConfigItem;
  itemIndex: number;
}) {
  const [showData, setShowData] = useState<boolean>(item.loaded);
  const [data, setData] = useState<any | null>(null);

  // when showData or Topic changes, then get the data
  useEffect(() => {
    async function getData() {
      const tempData = await getTopic(item.topic);
      setData(tempData[0]);
    }

    if (showData) {
      getData();
    }
  }, [showData, item.topic]);

  return (
    <Card
      key={item.header + itemIndex}
      className="md:w-1/6 sm:w-1/4 min-w-60 hover:shadow-2xl    hover:border-primary"
    >
      <CardHeader className="p-1 m-1">
        <CardTitle className="text-md ">{item.header}</CardTitle>
        <CardDescription
          className="text-xs line-clamp-3"
          style={{ height: "3lh" }}
        >
          {item.body}
        </CardDescription>
        <CardContent className="p-0 flex flex-col justify-center">
          {showData ? (
            <span className="text-2xl font-semibold self-center">
              {item.displayValue && item.displayValue != ""
                ? lodash.get(data, item.displayValue, "Loading...")
                : ""}
            </span>
          ) : (
            <span className="text-xs ">Click to load</span>
          )}

          {showData && item.detailsLink && item.detailsLink != "" ? (
            <Link
              href={{
                pathname: item.detailsLink + "/" + item.topic,
                // query: item.topic,
              }}
              className="flex flex-row mt-2 align-right text-sm"
            >
              View Details <ArrowRight size={20} />
            </Link>
          ) : (
            <div className="flex flex-row mt-2 text-sm"> </div>
          )}
          {!showData && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowData(true)}
            >
              Load Details
            </Button>
          )}
        </CardContent>
      </CardHeader>
    </Card>
  );
}
