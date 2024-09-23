import {
  getFieldUsageForCustomFields,
  getMetaDataById,
  getObjectDescription,
  getObjectRelationships,
} from "@/lib/Salesforce";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  TableBody,
  TableRow,
  Table,
  TableHead,
  TableCell,
  TableFooter,
} from "../ui/table";
import { Download, Loader, Loader2 } from "lucide-react";
import { DescribeSObjectResult } from "jsforce";

type Props = {
  objectInfo: any;
};

function ObjectFields({ objectInfo }: Props) {
  const [data, setData] = useState<any | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getDataFromServer() {
      setIsLoading(true);
      try {
        let relationships: any = await getObjectRelationships(objectInfo);
        let fields: any = await getObjectDescription(
          objectInfo.attributes.type,
          objectInfo.Id
        );
        // objectInfo.attributes.type === "sobject"
        //   ? await getObjectDescription(objectInfo.Id)
        //   : await getFieldUsageForCustomFields(objectInfo.Id);
        console.log("fields", fields);
        console.log("ObjectFields: getDataFromServer:", relationships?.result);

        const defaultField = {
          aggregatable: false,
          aiPredictionField: false,
          autoNumber: false,
          byteLength: 0,
          calculated: false,
          calculatedFormula: null,
          cascadeDelete: false,
          caseSensitive: false,
          compoundFieldName: null,
          controllerName: null,
          createable: false,
          custom: false,
          defaultValue: null,
          defaultValueFormula: null,
          defaultedOnCreate: false,
          dependentPicklist: false,
          deprecatedAndHidden: false,
          digits: 0,
          displayLocationInDecimal: false,
          encrypted: false,
          externalId: false,
          filterable: false,
          filteredLookupInfo: null,
          formulaTreatNullNumberAsZero: false,
          groupable: false,
          highScaleNumber: false,
          htmlFormatted: false,
          idLookup: false,
          inlineHelpText: null,
          length: 0,
          mask: null,
          maskType: null,
          nameField: false,
          namePointing: false,
          nillable: false,
          permissionable: false,
          picklistValues: [],
          polymorphicForeignKey: false,
          precision: 0,
          queryByDistance: false,
          referenceTargetField: null,
          referenceTo: [],
          relationshipOrder: null,
          restrictedDelete: false,
          restrictedPicklist: false,
          scale: 0,
          searchPrefilterable: false,
          soapType: "",
          sortable: false,
          type: "",
          unique: false,
          updateable: false,
          writeRequiresMasterRead: false,
        };

        //merge the results
        const result = relationships?.result.map((relationship: any) => {
          // if Fields info did not get retrieved from description
          if (fields.fields) {
            const field = fields.fields.find(
              (desc: any) => desc.name === relationship.DeveloperName
            );

            if (field) {
              return {
                ...relationship,
                ...field,
              };
            } else {
              return {
                ...relationship,
                ...defaultField,
              };
            }
          } else {
            return {
              ...relationship,
              ...defaultField,
            };
          }
        });
        console.log("Merge Result", result);
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", JSON.stringify(error));
      } finally {
        setIsLoading(false);
      }
    }

    getDataFromServer();
  }, [objectInfo]);

  const onDownload = () => {
    //Creating a new excel file
    const workbook = XLSX.utils.book_new();
    //Storing the data to excel sheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fields");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    //Saving the file as "Field Details of <sObject Name>.xlsx"
    saveAs(dataBlob, "Field Details of " + objectInfo.name + ".xlsx");
  };

  if (isLoading) {
    return <Loader className="h-8 w-8 animate-spin duration-9000" />;
  }

  const yesCounts = data?.reduce(
    (counts: any, field: any) => {
      if (field.IsNillable) {
        counts.IsNillable++;
      }
      if (field.unique) {
        counts.unique++;
      }
      if (field.updateable) {
        counts.updateable++;
      }
      counts.total++; // Increment total count for each field
      return counts;
    },
    {
      IsNillable: 0,
      unique: 0,
      updateable: 0,
      total: 0,
    }
  );

  return (
    <div>
      <div className="flex flex-row  ">
        <span className="flex-1  align-middle">
          Fields for {objectInfo.DeveloperName}
        </span>
        <Button
          variant="ghost"
          onClick={onDownload}
          className="justify-end pb-2"
        >
          <Download />
        </Button>
      </div>
      <Table>
        <TableRow>
          <TableHead>Field Name</TableHead>
          <TableHead>Data Type</TableHead>
          <TableHead>Is Nillable</TableHead>
          <TableHead>Unique</TableHead>
          <TableHead>Updateable</TableHead>
        </TableRow>

        <TableBody>
          {data?.map((field: any) => (
            <TableRow key={field.Id}>
              <TableCell>{field.DeveloperName}</TableCell>
              <TableCell>{field.DataType}</TableCell>
              <TableCell>{field.IsNillable ? "Yes" : "No"}</TableCell>
              <TableCell>{field.unique ? "Yes" : "No"}</TableCell>
              <TableCell>{field.updateable ? "Yes" : "No"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Fields:{yesCounts?.total}</TableCell>
            {/* Empty cell for alignment */}
            <TableCell />
            <TableCell>Nillable: {yesCounts?.IsNillable}</TableCell>
            <TableCell>Unique: {yesCounts?.unique}</TableCell>
            <TableCell>Updateable: {yesCounts?.updateable}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

export default ObjectFields;
