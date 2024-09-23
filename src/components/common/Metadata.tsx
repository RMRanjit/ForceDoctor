"use client";
import { useState, useEffect, cache } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMetaDataById, getTopic } from "@/lib/Salesforce";
import { convertToDatetimeAndFormat, getObjectName } from "@/lib/utils";
import { TriggerInfo } from "./TriggerInfo";
import { Switch } from "../ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { metaDataSupportedObjectTypes } from "@/types/Salesforce.types";

import { Loader } from "lucide-react";

type Props = {
  objectInfo: any;
};

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
    const functionName = summaryTypes[summaryType] || summaryType.toUpperCase();
    return `${functionName}(${columnName})`;
  }

  return input;
}

function extractFieldsFromTemplate(text: string): string[] {
  const regex = /\{!(.*?)\}/g;
  // console.log("extractFieldsFromTemplate", text);
  const matches = text.match(regex);
  if (!matches) {
    // console.log("No fields found in the template");
    return [];
  }
  const fieldArray = matches.map((match) => match.slice(2, -1));
  // console.log("Fields extracted from template", fieldArray);
  return fieldArray;
}

function extractTemplateFields(input: string): string[] {
  const fieldPatterns = [/\{!([^{}]+)\}/g, /\{!(.*?)\}/g, /\[([A-Z_]+)\]/g];
  const fields = new Set<string>();

  fieldPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(input)) !== null) {
      const field = match[1];
      if (
        !field.startsWith("CASE(") &&
        !field.startsWith("IF(") &&
        !field.includes("(")
      ) {
        fields.add(field);
      }
    }
  });

  return Array.from(fields);
}

function extractFields(input: string): string[] {
  const fields = new Set<string>();
  const regex = /\{!([^{}]+)\}|\[([A-Z_]+)\]/g;
  let match;
  let depth = 0;
  let currentField = "";

  while ((match = regex.exec(input)) !== null) {
    const field = match[1] || match[2];

    for (let i = 0; i < field.length; i++) {
      if (field[i] === "(") {
        depth++;
      } else if (field[i] === ")") {
        depth--;
      }

      currentField += field[i];

      if (depth === 0 && (i === field.length - 1 || field[i] === ",")) {
        if (
          !currentField.startsWith("CASE") &&
          !currentField.startsWith("IF") &&
          !currentField.startsWith("VALUE") &&
          !currentField.startsWith("DATETIMEVALUE")
        ) {
          fields.add(currentField.trim());
        }
        currentField = "";
      }
    }

    if (depth === 0 && currentField) {
      fields.add(currentField.trim());
      currentField = "";
    }
  }

  return Array.from(fields);
}

export default function Metadata({ objectInfo }: Props) {
  const [metaData, setMetaData] = useState<any | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [fieldUsageMetaData, setFieldUsageMetaData] = useState<
  //   any | undefined
  // >();

  // console.log("Metadata: objectInfo recieved ", objectInfo);

  useEffect(() => {
    const getMetadatafromServer = cache(async () => {
      let result;
      // let fieldUsageData;

      // console.log(
      //   "Metadata: useEffect: Triggered for ",
      //   objectInfo,
      //   objectInfo.attributes.type,
      //   "Included in Metadataypes",
      //   metaDataSupportedObjectTypes.includes(objectInfo.attributes.type)
      // );
      try {
        setIsLoading(true);
        // console.log(
        //   "Metadata : UseEffect: isType ",
        //   metaDataSupportedObjectTypes.includes(objectInfo.attributes.type) ||
        //     objectInfo.attributes.type == "Report"
        // );
        if (
          metaDataSupportedObjectTypes.includes(objectInfo.attributes.type) ||
          objectInfo.attributes.type == "Report"
        ) {
          const data = await getMetaDataById(
            objectInfo.attributes.type,
            objectInfo.Id
          );
          result = JSON.parse(data);
          console.log("Metadata: useEffect", result);
          // if (objectInfo.attributes.type == "CustomField") {
          //   fieldUsageData = await getTopic("getFieldUsageForCustomFields", {
          //     id: objectInfo.Id,
          //   });
          //   // fieldUsageData = await getFieldUsageForCustomFields(objectInfo.Id);
          //   // console.log(
          //   //   "Field USage Details for ",
          //   //   objectInfo.Id,
          //   //   fieldUsageData?.[0]?.Metadata
          //   // );
          // }
        }

        if (objectInfo.attributes.type === "EmailTemplate") {
          const extractedFields: { templateFields: any[] } = {
            templateFields: [], // initialize with an empty array
          };
          extractedFields.templateFields = extractFieldsFromTemplate(
            objectInfo.body || objectInfo.Body || objectInfo.HtmlValue
          );
          // console.log(
          //   "Template Fields",
          //   objectInfo.body || objectInfo.HtmlValue,
          //   extractedFields.templateFields
          // );
          result = extractedFields;
        }
        setMetaData(result);
        // if (objectInfo.attributes.type == "CustomField") {
        //   //@ts-ignore
        //   setFieldUsageMetaData(fieldUsageData[0].Metadata);
        // }

        setError(undefined);
      } catch (err) {
        setMetaData(undefined);
        // setFieldUsageMetaData(undefined);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    });
    getMetadatafromServer();
  }, [objectInfo]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Details
          {error && (
            <div className="text-xs  destructive">
              <code>{error.message}</code>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Details for {" " + getObjectName(objectInfo)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2  ">
        {isLoading ? (
          <Loader className="h-8 w-8 animate-spin duration-9000" />
        ) : (
          <div className="w-full flex sm: flex-col md:flex-row justify-between">
            <div>
              {metaData?.data ? (
                <MetadataCard
                  objectInfo={objectInfo}
                  metaData={metaData}
                  // fieldUsageMetaData={fieldUsageMetaData}
                />
              ) : (
                <ObjectInfo objectInfo={objectInfo} />
              )}
            </div>

            <div className="  h-svh overflow-auto">
              {objectInfo.attributes.type == "ApexTrigger" ? (
                // TriggerInfo(objectInfo)
                <TriggerInfo objectInfo={objectInfo} showHeader={false} />
              ) : (
                <div className="hidden"></div>
              )}
              {objectInfo.attributes.type == "CustomObject" &&
              metaData?.fields ? (
                <>
                  <span className="flex justify-start font-bold">
                    Field Information
                  </span>
                  <table className="text-sm  w-full border-collapse">
                    <colgroup>
                      <col className="w-1/3 "></col>
                      <col className="w-1/3 "></col>
                      <col className="w-1/3 "></col>
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="text-left">Name</th>
                        <th className="text-left"></th>
                        <th className="text-left">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metaData.fields && Array.isArray(metaData.fields) ? (
                        metaData.fields.map((field: any) => (
                          <tr
                            key={field.fullName}
                            className="hover:bg-accent border-y-2"
                          >
                            <td>{field.fullName}</td>
                            <td></td>
                            <td>{field.type}</td>
                          </tr>
                        ))
                      ) : (
                        <tr
                          key={metaData.fields.fullName}
                          className="hover:bg-accent border-y-2"
                        >
                          <td>{metaData.fields.fullName}</td>
                          <td></td>
                          <td>{metaData.fields.type}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="hidden"></div>
              )}
              {objectInfo.attributes.type == "ValidationRule" ? (
                <div className="mx-3">
                  <span className="flex justify-start font-bold">
                    Additional Info
                  </span>
                  <table className="text-sm  w-full border-collapse">
                    <colgroup>
                      <col className="w-1/3 "></col>
                      <col className="w-1/3 "></col>
                      <col className="w-1/3 "></col>
                    </colgroup>
                    <tbody>
                      <tr className="border-y-2">
                        <td>Active</td>
                        <td colSpan={2}>{objectInfo.Active ? "Yes" : "No"}</td>
                      </tr>
                      {/* <tr className="border-y-2">
                      <td>Description</td>
                      <td colSpan={2}>{objectInfo.Description}</td>
                    </tr> */}
                      <tr className="border-y-2">
                        <td>Master Label</td>
                        <td colSpan={2}>
                          {objectInfo.EntityDefinition.MasterLabel}
                        </td>
                      </tr>
                      <tr className="border-y-2">
                        <td>Error Message</td>
                        <td colSpan={2}>{objectInfo.ErrorMessage}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="hidden"></div>
              )}

              {objectInfo.attributes.type == "Report" && metaData ? (
                <div className="mx-3">
                  <span className="flex justify-start font-bold">
                    Information used
                  </span>
                  <Table className="text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.keys(
                        metaData[0].reportExtendedMetadata.detailColumnInfo
                      ).map((columnInfo, columnInfoIndex) => (
                        <TableRow key={columnInfoIndex}>
                          <TableCell>
                            {
                              metaData[0].reportExtendedMetadata
                                .detailColumnInfo[columnInfo].label
                            }
                          </TableCell>
                          <TableCell>
                            {
                              metaData[0].reportExtendedMetadata
                                .detailColumnInfo[columnInfo].entityColumnName
                            }
                          </TableCell>
                          <TableCell>Detail</TableCell>
                        </TableRow>
                      ))}
                      {metaData[0].reportMetadata.aggregates &&
                        Object.keys(metaData[0].reportMetadata.aggregates).map(
                          (columnInfo, columnInfoIndex) => (
                            <TableRow key={columnInfoIndex}>
                              <TableCell>
                                {metaData[0].reportMetadata.aggregates[
                                  columnInfo
                                ][1] == "!"
                                  ? metaData[0].reportMetadata.aggregates[
                                      columnInfo
                                    ].slice(2)
                                  : metaData[0].reportMetadata.aggregates[
                                      columnInfo
                                    ]}
                              </TableCell>
                              <TableCell>
                                {convertColumnRepresentation(
                                  metaData[0].reportMetadata.aggregates[
                                    columnInfo
                                  ]
                                )}
                              </TableCell>
                              <TableCell>Aggregate</TableCell>
                            </TableRow>
                          )
                        )}
                      {metaData[0].reportMetadata.customDetailFormula &&
                        Object.keys(
                          metaData[0].reportMetadata.customDetailFormula
                        ).map((columnInfo, columnInfoIndex) => (
                          <TableRow key={columnInfoIndex}>
                            <TableCell>
                              {
                                metaData[0].reportMetadata.customDetailFormula[
                                  columnInfo
                                ].label
                              }
                            </TableCell>
                            <TableCell>
                              {
                                metaData[0].reportMetadata.customDetailFormula[
                                  columnInfo
                                ].formula
                              }
                            </TableCell>
                            <TableCell>Custom Detail Formula</TableCell>
                          </TableRow>
                        ))}
                      {metaData[0].reportMetadata.customSummaryFormula &&
                        Object.keys(
                          metaData[0].reportMetadata.customSummaryFormula
                        ).map((columnInfo, columnInfoIndex) => (
                          <TableRow key={columnInfoIndex}>
                            <TableCell className="font-medium">
                              {
                                metaData[0].reportMetadata.customSummaryFormula[
                                  columnInfo
                                ].label
                              }
                            </TableCell>
                            <TableCell className="font-medium">
                              {
                                metaData[0].reportMetadata.customSummaryFormula[
                                  columnInfo
                                ].formula
                              }
                            </TableCell>
                            <TableCell className="font-medium">
                              Custom Summary Formula
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="hidden"></div>
              )}

              {objectInfo.attributes.type == "EmailTemplate" &&
              metaData &&
              metaData.templateFields ? (
                <div className="mx-3">
                  <span className="flex justify-start font-bold">
                    Information used
                  </span>
                  <Table className="text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metaData.templateFields.map(
                        (columnInfo: string, columnInfoIndex: number) => (
                          <TableRow key={columnInfoIndex}>
                            <TableCell>{columnInfo}</TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="hidden"></div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MetadataCard({
  objectInfo,
  metaData,
}: // fieldUsageMetaData,
{
  objectInfo: any;
  metaData: any;
  // fieldUsageMetaData: any;
}) {
  if (metaData) {
    return (
      <table className="text-sm border w-[700px]">
        <colgroup>
          <col className="w-[200px]"></col>
          <col className="pl-2"></col>
        </colgroup>
        <tbody>
          <tr>
            <td>Id:</td>
            <td>{objectInfo.Id}</td>
          </tr>

          <tr>
            <td>Full Name:</td>
            <td>{metaData.data?.fullName}</td>
          </tr>
          {metaData.description && (
            <tr>
              <td>Description:</td>
              <td>{metaData.description}</td>
            </tr>
          )}
          {metaData.inlineHelpText && (
            <tr>
              <td>Help Text:</td>
              <td>{metaData.inlineHelpText}</td>
            </tr>
          )}
          <tr>
            <td>State:</td>
            <td>{metaData.data?.manageableState}</td>
          </tr>
          <tr>
            <td>Created On:</td>
            <td>{convertToDatetimeAndFormat(metaData.data?.createdDate)}</td>
          </tr>
          <tr>
            <td>Created by:</td>
            <td>{metaData.data?.createdByName}</td>
          </tr>
          <tr>
            <td>Modified On:</td>
            <td>
              {convertToDatetimeAndFormat(metaData.data?.lastModifiedDate)}
            </td>
          </tr>
          <tr>
            <td>Modified By:</td>
            <td>{metaData.data?.lastModifiedByName}</td>
          </tr>
          {metaData.label && (
            <tr>
              <td>Label:</td>
              <td>{metaData.label}</td>
            </tr>
          )}
          {metaData.sharingModel && (
            <tr>
              <td>Sharing Model:</td>
              <td>{metaData.sharingModel}</td>
            </tr>
          )}
          {metaData.length && (
            <tr>
              <td>Length:</td>
              <td>{metaData.length}</td>
            </tr>
          )}
          {metaData.type && (
            <tr>
              <td>Type:</td>
              <td>{metaData.type}</td>
            </tr>
          )}

          {metaData.required && (
            <tr>
              <td>Is Required:</td>
              <td>{metaData.required === true ? "Yes" : "No"}</td>
            </tr>
          )}
          {metaData.unique && (
            <tr>
              <td>Is Unique:</td>
              <td>{metaData.unique === true ? "Yes" : "No"}</td>
            </tr>
          )}
          {/* {fieldUsageMetaData && (
            <tr>
              <td>Is Required Field: </td>
              {fieldUsageMetaData.required == true ? <td>Yes</td> : <td>No</td>}
            </tr>
          )}
          {fieldUsageMetaData && (
            <tr>
              <td>Is Read-Only Field: </td>
              {fieldUsageMetaData.readOnlyProxy == true ? (
                <td>Yes</td>
              ) : (
                <td>No</td>
              )}
            </tr>
          )}
          {fieldUsageMetaData && (
            <tr>
              <td>Is Unique Field: </td>
              {fieldUsageMetaData.unique == true ? <td>Yes</td> : <td>No</td>}
            </tr>
          )} */}
          {metaData.errorConditionFormula && (
            <tr>
              <td>Formula:</td>
              <td className="text-xs">{metaData.errorConditionFormula}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  } else <></>;
}

export function ObjectInfo({ objectInfo }: { objectInfo: any }) {
  if (objectInfo) {
    return (
      <table className="text-sm border w-[700px]">
        <colgroup>
          <col className="w-[200px]"></col>
          <col className="pl-2"></col>
        </colgroup>
        <tbody>
          {objectInfo.FullPhotoUrl &&
            objectInfo.FirstName &&
            objectInfo.LastName && (
              <tr>
                <td colSpan={1} className="self-center">
                  <Avatar>
                    {/* "/ProfilePic2.jpeg" */}
                    <AvatarImage
                      src={objectInfo.FullPhotoUrl}
                      alt="Profile Image"
                    />
                    <AvatarFallback delayMs={100}>
                      {objectInfo.FirstName[0] + objectInfo.LastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </td>
                <td className="flex flex-col">
                  <span className="font-semibold text-sm uppercase tracking-widest">
                    {objectInfo.FirstName}
                  </span>
                  <span>{objectInfo.LastName}</span>
                </td>
              </tr>
            )}
          <tr>
            <td>Id:</td>
            <td>{objectInfo.Id}</td>
          </tr>
          <tr>
            <td>Name:</td>
            <td>{getObjectName(objectInfo)}</td>
          </tr>
          {objectInfo.DeveloperName && (
            <tr>
              <td>Developer Name</td>
              <td>{objectInfo.DeveloperName}</td>
            </tr>
          )}
          {(objectInfo.Description || objectInfo.description) &&
            objectInfo.Description !== null && (
              <tr>
                <td>Description</td>
                <td>{objectInfo.Description || objectInfo.description}</td>
              </tr>
            )}
          {objectInfo.label && objectInfo.label !== null && (
            <tr>
              <td>Label</td>
              <td>{objectInfo.label}</td>
            </tr>
          )}
          {objectInfo.ControllerKey && (
            <tr>
              <td>Controller Key</td>
              <td>{objectInfo.ControllerKey}</td>
            </tr>
          )}
          {objectInfo.ControllerType && (
            <tr>
              <td>Controller Key</td>
              <td>{objectInfo.ControllerType}</td>
            </tr>
          )}
          {objectInfo.NamespacePrefix && (
            <tr>
              <td>Namespace Prefix</td>
              <td>{objectInfo.NamespacePrefix}</td>
            </tr>
          )}
          {objectInfo.Status && (
            <tr>
              <td>Status</td>
              <td>{objectInfo.Status}</td>
            </tr>
          )}
          {objectInfo.FolderName && (
            <tr>
              <td>Folder</td>
              <td>{objectInfo.FolderName}</td>
            </tr>
          )}
          {objectInfo.Format && (
            <tr>
              <td>Format</td>
              <td>{objectInfo.Format}</td>
            </tr>
          )}
          {objectInfo.LastReferencedDate && (
            <tr>
              <td>Last Referenced Date</td>
              <td>
                {convertToDatetimeAndFormat(objectInfo.LastReferencedDate)}
              </td>
            </tr>
          )}
          {objectInfo.LastRunDate && (
            <tr>
              <td>Last Run Date</td>
              <td>{convertToDatetimeAndFormat(objectInfo.LastRunDate)}</td>
            </tr>
          )}
          {objectInfo.LastViewedDate && (
            <tr>
              <td>Last Viewed Date</td>
              <td>{convertToDatetimeAndFormat(objectInfo.LastViewedDate)}</td>
            </tr>
          )}
          {objectInfo.OwnerId && (
            <tr>
              <td>Owner</td>
              <td>{objectInfo.Owner?.Name || objectInfo.OwnerId}</td>
            </tr>
          )}
          {objectInfo.StartUrl && (
            <tr>
              <td>Url</td>
              <td>{objectInfo.StartUrl}</td>
            </tr>
          )}
          {objectInfo.AccountId && (
            <tr>
              <td>Account Id</td>
              <td>{objectInfo.AccountId}</td>
            </tr>
          )}
          {objectInfo.LastLoginDate && (
            <tr>
              <td>Last Login Date</td>
              <td>{convertToDatetimeAndFormat(objectInfo.LastLoginDate)}</td>
            </tr>
          )}

          {/* {objectInfo.Username && (
            <tr>
              <td>MFA Enabled?</td>
              <td>
                <Switch checked={true} disabled={true} />
              </td>
            </tr>
          )}
          {objectInfo.Username && (
            <tr>
              <td>Number/Size of attachments Associated</td>
              <td></td>
            </tr>
          )} */}
          {objectInfo.Username && (
            <tr>
              <td>User Name</td>
              <td>{objectInfo.Username}</td>
            </tr>
          )}

          {objectInfo.SubscriberPackageVersion?.Name && (
            <tr>
              <td>Version Name</td>
              <td>{objectInfo.SubscriberPackageVersion.Name}</td>
            </tr>
          )}
          {objectInfo.SubscriberPackageVersion?.MajorVersion && (
            <tr>
              <td>Version Number</td>
              <td>
                {objectInfo.SubscriberPackageVersion.MajorVersion}.
                {objectInfo.SubscriberPackageVersion.MinorVersion}.
                {objectInfo.SubscriberPackageVersion.PatchVersion}.
                {objectInfo.SubscriberPackageVersion.BuildNumber}
              </td>
            </tr>
          )}
          {objectInfo.SubscriberPackageVersion?.InstallValidationStatus && (
            <tr>
              <td>Install Status</td>
              <td>
                {objectInfo.SubscriberPackageVersion.InstallValidationStatus}
              </td>
            </tr>
          )}
          {objectInfo.SubscriberPackageVersion?.IsManaged && (
            <tr>
              <td>Managed Package</td>
              <td>
                {objectInfo.SubscriberPackageVersion.IsManaged ? "Yes" : "No"}
              </td>
            </tr>
          )}

          {objectInfo.AllowedLicenses && (
            <tr>
              <td>Allowed Licenses</td>
              <td>{objectInfo.AllowedLicenses}</td>
            </tr>
          )}
          {objectInfo.UsedLicenses != undefined && (
            <tr>
              <td>Used Licenses</td>
              <td>{objectInfo.UsedLicenses}</td>
            </tr>
          )}

          {objectInfo.ExpirationDate && (
            <tr>
              <td>Expiration Date</td>
              <td>{convertToDatetimeAndFormat(objectInfo.ExpirationDate)}</td>
            </tr>
          )}

          {objectInfo.IsProvisioned && (
            <tr>
              <td>Provisioned</td>
              <td>{objectInfo.IsProvisioned}</td>
            </tr>
          )}

          {objectInfo.TableEnumOrId && (
            <tr>
              <td>TableEnumOrId</td>
              <td>{objectInfo.TableEnumOrId}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  } else <></>;
}
