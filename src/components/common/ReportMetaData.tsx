// @ts-nocheck
import { getMetaDataforReports } from "@/lib/Salesforce";
import { getObjectName } from "@/lib/utils";
import { cache, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  objectInfo: any;
};

// const initialTree = { name: "", id: "Initial", parent: null, children: [] };
// function getTreeStructure(data: any) {
//   console.log("ReportMetaData: getTreeStructure: start Function ", data);

//   if (!data) return initialTree;

//   //reset the treeObject if it exists

//   const treeObject = lodash.cloneDeep(initialTree);

//   // console.log("CodeParser: getTreeStructure: initialize ", treeObject);

//   try {
//     //Loop through the dataElements. There could be multiple Definitions
//     const item = data;
//     try {
//       const reportMetaData = item.attributes;
//       // if the reportMetaData is not defined, break
//       if (!reportMetaData) {
//         //   console.log('Metadata not defined for item ', item.reportName);
//         throw new Error("Metadata not defined for item: " + item.reportName);
//       }

//       // Create the root object for the Class name
//       const id = reportMetaData.reportId;
//       const itemObject = {
//         id: reportMetaData.reportId,
//         parent: "Initial",
//         name: reportMetaData.reportName,
//         children: [] as any,
//       };
//       // Add it to the root
//       //@ts-ignore
//       treeObject.children.push(itemObject);

//       //Loop through the items in the itemObject and parse them
//       Object.keys(item).forEach((key, index) => {
//         if (item[key] && item[key] != null) {
//           console.log("key ", key, "KeyType", typeof item[key]);
//           // if the attribute is an array then we need to add a header and then add the values to the header
//           if (Array.isArray(item[key]) && item[key].length > 0) {
//             parseChildren(itemObject, item[key], key);
//           }

//           // If it is an object, loop through the attributes and parse them if they are arrays. We are not processing objects eg. Location
//           if (typeof item[key] === "object" && !Array.isArray(item[key])) {
//             Object.keys(item[key]).forEach((child, childIndex) => {
//               // if (
//               //   Array.isArray(item[key][child]) &&
//               //   item[key][child].length > 0
//               // )
//               {
//                 parseChildren(itemObject, item[key][child], child);
//               }
//             });
//           }
//         }
//       });
//     } catch (error: any) {
//       console.error("Report Metadata Error: ", error.message);
//     }
//   } catch (error: any) {
//     console.error("Error in parsing object: ", error.message);
//   }
//   // console.info("ReportMetaData: getTreeStructure: return", treeObject);

//   return treeObject;
// }

// function parseChildren(itemObject: any, child: any, key: any) {
//   // console.log("ReportMetaData: parseChildren:key", key);
//   // console.log("ReportMetaData: parseChildren:child", child);
//   // console.log(
//   //   "ReportMetaData: parseChildren:itemObject",
//   //   JSON.stringify(itemObject)
//   // );

//   const RootId = itemObject.id + "-" + key;
//   const headerNode = {
//     id: RootId,
//     parent: itemObject.id,
//     name: key,
//     isBranch: true,
//     metadata: { type: key, lineNumber: itemObject.location?.line },
//     children: [],
//   };
//   itemObject.children.push(headerNode);

//   // add items in the key item
//   child.map((property: any, index: number) => {
//     const childId = RootId + "-" + index;

//     const childNode = {
//       id: childId,
//       parent: RootId,
//       name: property.name || property,
//       metadata: { type: key, lineNumber: property.location?.line },
//       children: [],
//     };
//     headerNode.children.push(childNode);
//     if (typeof property === "object") {
//       // Loop through the attributes in the object
//       Object.keys(property).forEach((childKey, childKeyIndex) => {
//         childNode.name =
//           property.name + (property.type ? ":::" + property.type : "");
//         if (
//           Array.isArray(property[childKey]) &&
//           property[childKey].length > 0
//         ) {
//           parseChildren(childNode, property[childKey], childKey);
//         }
//       });
//     }
//   });
// }

function ReportMetaData({ objectInfo }: Props) {
  const [data, setData] = useState<any | undefined>();
  const [error, setError] = useState<Error | undefined>();

  function convertColumnRepresentation(input: string): string {
    const summaryTypes: Record<string, string> = {
      a: "AVG",
      s: "SUM",
      m: "MIN",
      x: "MAX",
      u: "COUNT_DISTINCT",
    };

    const match = input.match(/^([asxmu])!(.+)$/);

    if (match) {
      const [, summaryType, columnName] = match;
      const functionName =
        summaryTypes[summaryType] || summaryType.toUpperCase();
      return `${functionName}(${columnName})`;
    }

    return input;
  }

  useEffect(() => {
    const getDataFromServer = cache(async () => {
      // async function getDataFromServer() {
      try {
        // const resData = await getMetaDataforReports(objectInfo.Id);
        const resData = await getTopic(
          "ReportMetaData",
          { id: objectInfo.Id },
          true
        );
        console.log("ReportMetaData: getDataFromServer", resData);
        // const treeData = getTreeStructure(resData);
        // const flattenedData = flattenTree(treeData);
        // console.log("Flattened Data", flattenedData);
        // setData(flattenedData);
        setData(resData);
        setError(undefined);
      } catch (err) {
        // console.log("ReportMetadata: Error", err);
        // console.log("ReportMetadata: ErrorJSON", JSON.stringify(err));

        setData(undefined);
        setError(err);
      }
    });

    // try {
    getDataFromServer();
    // } catch (err) {
    //   setData(undefined);
    //   setError(err);
    // }
  }, [objectInfo]);

  if (error)
    return (
      <div className="text-xs font-semibold destructive">
        <code>{error.message}</code>
      </div>
    );
  return (
    data && (
      <div className="w-full">
        ReportMetaData for {data.attributes.reportName}
        <div className="flex flex-col">
          {data.reportExtendedMetadata.detailColumnInfo && (
            <div className="flex flex-col text-xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Label</TableHead>
                    <TableHead className="w-[200px]">Source</TableHead>
                    <TableHead className="w-[200px]">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(
                    data.reportExtendedMetadata.detailColumnInfo
                  ).map((columnInfo, columnInfoIndex) => (
                    <TableRow key={columnInfoIndex}>
                      <TableCell className="font-sm">
                        {
                          data.reportExtendedMetadata.detailColumnInfo[
                            columnInfo
                          ].label
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        {
                          data.reportExtendedMetadata.detailColumnInfo[
                            columnInfo
                          ].entityColumnName
                        }
                      </TableCell>
                      <TableCell className="font-medium">Detail</TableCell>
                    </TableRow>
                  ))}
                  {data.reportMetadata.aggregates &&
                    Object.keys(data.reportMetadata.aggregates).map(
                      (columnInfo, columnInfoIndex) => (
                        <TableRow key={columnInfoIndex}>
                          <TableCell className="font-medium">
                            {data.reportMetadata.aggregates[columnInfo][1] ==
                            "!"
                              ? data.reportMetadata.aggregates[
                                  columnInfo
                                ].slice(2)
                              : data.reportMetadata.aggregates[columnInfo]}
                          </TableCell>
                          <TableCell className="font-medium">
                            {convertColumnRepresentation(
                              data.reportMetadata.aggregates[columnInfo]
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            Aggregate
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  {data.reportMetadata.customDetailFormula &&
                    Object.keys(data.reportMetadata.customDetailFormula).map(
                      (columnInfo, columnInfoIndex) => (
                        <TableRow key={columnInfoIndex}>
                          <TableCell className="font-sm">
                            {
                              data.reportMetadata.customDetailFormula[
                                columnInfo
                              ].label
                            }
                          </TableCell>
                          <TableCell className="font-medium">
                            {
                              data.reportMetadata.customDetailFormula[
                                columnInfo
                              ].formula
                            }
                          </TableCell>
                          <TableCell className="font-medium">
                            Custom Detail Formula
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  {data.reportMetadata.customSummaryFormula &&
                    Object.keys(data.reportMetadata.customSummaryFormula).map(
                      (columnInfo, columnInfoIndex) => (
                        <TableRow key={columnInfoIndex}>
                          <TableCell className="font-medium">
                            {
                              data.reportMetadata.customSummaryFormula[
                                columnInfo
                              ].label
                            }
                          </TableCell>
                          <TableCell className="font-medium">
                            {
                              data.reportMetadata.customSummaryFormula[
                                columnInfo
                              ].formula
                            }
                          </TableCell>
                          <TableCell className="font-medium">
                            Custom Summary Formula
                          </TableCell>
                        </TableRow>
                      )
                    )}
                </TableBody>
              </Table>
            </div>
          )}
          <div>Objects Used</div>
        </div>
      </div>
    )
  );
}

export default ReportMetaData;
