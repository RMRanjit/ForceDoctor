import { getMetaDataById, getTopic } from "@/lib/Salesforce";
import { Download, Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { convertToDatetimeAndFormat } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Props = { objectInfo: any };

function ObjectHistory({ objectInfo }: Props) {
  const [data, setData] = useState<any | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();

  /**
   * Fetches the history data for the given object from the server.
   * @returns A promise that resolves to the fetched data.
   * @throws An error if the data could not be fetched.
   */
  const getDataFromServer = async () => {
    setIsLoading(true);

    console.log;

    let objectName = objectInfo.Id;
    try {
      if (objectInfo.attributes.type === "CustomObject") {
        const resMetaData = await getMetaDataById(
          objectInfo.attributes.type,
          objectInfo.Id
        );
        const metaData = await JSON.parse(resMetaData);
        objectName = metaData.data?.fullName;
        if (metaData.enableHistory === true)
          throw new Error(
            "Please enable the Field History Tracking to get the data."
          );
        console.log("ObjectHistory: useEffect: metaData", metaData);
      }

      const topic =
        objectInfo.attributes.type === "CustomObject"
          ? "CustomObjectHistory"
          : "StandardObjectHistory";

      const res = await getTopic(topic, { objectName: objectName });
      console.log("ObjectHistory: useEffect: Data from Server", res);
      setData(res[0]);
      setError(undefined);
    } catch (error) {
      console.log("ObjectHistory: useEffect: error", error);
      setData(undefined);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDownload = () => {
    //Creating a new excel file
    const workbook = XLSX.utils.book_new();
    //Storing the data to excel sheet
    const worksheet = XLSX.utils.json_to_sheet(data.records);
    XLSX.utils.book_append_sheet(workbook, worksheet, "History");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    //Saving the file as "History of <Name>.xlsx"
    saveAs(
      dataBlob,
      "History of " + (objectInfo.DeveloperName || objectInfo.Id) + ".xlsx"
    );
  };

  useEffect(() => {
    getDataFromServer();
  }, [objectInfo]);

  if (isLoading) {
    return <Loader className="h-8 w-8 animate-spin duration-9000" />;
  }
  if (error) {
    return (
      <div className="text-destructive text-md">Error: {error.message}</div>
    );
  }

  if (!data || !data.records || data.records.length === 0 || data.error)
    return (
      <pre className="text-destructive font-xs">
        Please enable Field History Tracking to get data. No Data available now.
      </pre>
    );

  return (
    <div>
      <div className="flex flex-row">
        <span className="flex-1 align-middle">
          History for {objectInfo.DeveloperName || objectInfo.Id}
        </span>
        <div className="justify-end pb-2 grid grid-flow-col">
          {/* Selector for Time Duration */}
          <ToggleGroup type="single">
            <ToggleGroupItem value="3">03 Months</ToggleGroupItem>
            <ToggleGroupItem value="6">06 Months</ToggleGroupItem>
            <ToggleGroupItem value="12">12 Months</ToggleGroupItem>
            <ToggleGroupItem value="24">24 Months</ToggleGroupItem>
          </ToggleGroup>
          {/* Download button */}
          <Button
            variant="ghost"
            onClick={onDownload}
            className="justify-end pb-2"
          >
            <Download />
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Data Type</TableHead>
            <TableHead>Old Value</TableHead>
            <TableHead>New Value</TableHead>
            <TableHead>When</TableHead>
            <TableHead>By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.records.map((record: any) => (
            <TableRow key={record.Id} className=" hover: bg-secondary">
              <TableCell>{record.Field}</TableCell>
              <TableCell>{record.DataType}</TableCell>
              <TableCell>{record.OldValue}</TableCell>
              <TableCell>{record.NewValue}</TableCell>
              <TableCell>
                {convertToDatetimeAndFormat(record.CreatedDate)}
              </TableCell>
              <TableCell>{record.CreatedBy.Name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Count: {data?.totalSize}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

export default ObjectHistory;
