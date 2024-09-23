// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { getTriggerList } from "@/lib/Salesforce";
import { Loader } from "lucide-react";
import { TriggerInfo } from "./TriggerInfo";
import { Separator } from "../ui/separator";

type Props = {
  objectInfo: any;
};

export default function TriggerData({ objectInfo }: Props) {
  const [data, setData] = useState<any | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getTriggersFromServer = async () => {
      setIsLoading(true);
      setData(undefined);
      const response = await getTriggerList(objectInfo);
      const result = JSON.parse(response);
      console.log("TriggerData: useEffect", result);
      setData(result);
      setIsLoading(false);
    };
    getTriggersFromServer();
  }, [objectInfo]);

  return isLoading ? (
    <div className="flex items-center justify-center">
      <Loader className="animate-spin duration-9000 h-8 w-8 " />
    </div>
  ) : (
    <div>
      {data && data.records && data.records.length > 0 ? (
        <div className="w-screen ">
          {data.records.map((triggerInfo: any) => (
            <div className="my-4 ">
              <TriggerInfo objectInfo={triggerInfo} showHeader={true} />
              <Separator />
            </div>
          ))}
        </div>
      ) : (
        "No Triggers"
      )}
    </div>
  );
}
