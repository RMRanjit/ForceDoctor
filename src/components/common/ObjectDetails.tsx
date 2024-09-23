import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DOMPurify from "dompurify";

import Metadata from "./Metadata";

import ObjectReferences from "./ObjectReferences";

import ObjectDocumentation from "./ObjectDocumentation";
import ObjectParser from "./ObjectParser";
import { getObjectName } from "@/lib/utils";
import TriggerData from "./TriggerData";
import ObjectRelationships from "./ObjectRelationships";
import ObjectScanner from "./ObjectScanner";
import ReportMetaData from "./ReportMetaData";
import LoginHistoryData from "./LoginHistory";
import ObjectConversion from "./ObjectConversion";
import FlowVisualizer from "./FlowVisualizer";
import { AuraDefinitionEditor } from "./ObjectCodeViewer";
import ObjectFields from "./ObjectFields";
import ObjectHistory from "./ObjectHistory";

type Props = { data: any };

function ObjectDetails({ data }: Props) {
  console.log("ObjectDetails: Props recieved", data);

  return (
    <Tabs defaultValue="details" className="w-full " activationMode="manual">
      <TabsList className="w-full flex flex-row justify-start">
        <TabsTrigger value="details">Details</TabsTrigger>
        {
          <>
            {(data.attributes.type === "ApexClass" ||
              data.attributes.type === "ApexTrigger" ||
              data.attributes.type === "ApexPageInfo" ||
              data.attributes.type === "AuraDefinitionBundle" ||
              data.attributes.type === "Flow") && (
              <>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
              </>
            )}

            {/* show the tabs only if there is code available to display*/}
            {data.LengthWithoutComments > 0 ? (
              <>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="problems">Problems</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
                <TabsTrigger value="conversion">Conversion</TabsTrigger>
              </>
            ) : (
              <></>
            )}

            {data.attributes.type === "Flow" && (
              <>
                <TabsTrigger value="flowVisualizer">Flow</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
              </>
            )}
            {(data.attributes.type === "CustomObject" ||
              data.attributes.type === "sobject") && (
              <>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="triggers"> Triggers </TabsTrigger>
                <TabsTrigger value="relationships">Relationships</TabsTrigger>
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </>
            )}
            {/* {(data.attributes.type === "CustomField") && (
              <>
                <TabsTrigger value="history">History</TabsTrigger>
              </>
            )} */}
            {data.attributes.type === "EmailTemplate" ? (
              <TabsTrigger value="template"> Template </TabsTrigger>
            ) : (
              <></>
            )}
            {data.attributes.type === "User" ? (
              <TabsTrigger value="LoginHistory"> Login History </TabsTrigger>
            ) : (
              <></>
            )}
            {data.attributes.type === "AuraDefinitionBundle" ? (
              <TabsTrigger value="AuraDefinitionBundle"> Code </TabsTrigger>
            ) : (
              <></>
            )}
          </>
        }
      </TabsList>
      <TabsContent value="details">
        <Metadata objectInfo={data} />
      </TabsContent>
      <TabsContent value="dependencies">
        <Card>
          <CardHeader>
            <CardTitle>Dependencies</CardTitle>
            <CardDescription>
              Dependencies for {getObjectName(data)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ObjectReferences type="Dependency" objectInfo={data} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="usage">
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Usage for {getObjectName(data)}</CardDescription>
          </CardHeader>
          <CardContent>
            <ObjectReferences type="Usage" objectInfo={data} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="code">
        <Card>
          <CardHeader>
            <CardTitle>Code Analysis</CardTitle>
            <CardDescription>Understand the code here</CardDescription>
            <CardContent>
              <ObjectParser objectInfo={data} />
            </CardContent>
          </CardHeader>
        </Card>
      </TabsContent>
      <TabsContent value="AuraDefinitionBundle">
        <Card>
          <CardHeader>
            <CardTitle>Code </CardTitle>
            <CardContent>
              <AuraDefinitionEditor objectInfo={data} />
            </CardContent>
          </CardHeader>
        </Card>
      </TabsContent>
      <TabsContent value="problems">
        <Card>
          <CardHeader>
            <CardTitle>Scan </CardTitle>
            <CardDescription>Scan to find problems</CardDescription>
          </CardHeader>
          <CardContent>
            <ObjectScanner objectInfo={data} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="flowVisualizer">
        <Card>
          <CardHeader>
            <CardTitle>Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <FlowVisualizer objectInfo={data} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="documentation">
        <Card>
          <CardContent>
            <ObjectDocumentation objectInfo={data} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="performance">
        <Card>
          <CardHeader>
            <CardTitle>Performance for {getObjectName(data)} </CardTitle>
          </CardHeader>
          <CardContent>
            To display error logs, DB Time, CPU Time , Last Execution time etc
            <span className="text-xs destructive">
              TODO: Filter the Logs by the objectName/Id. The logs donot have
              the ID/Name as a column. So putting this on hold
            </span>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="LoginHistory">
        <LoginHistoryData objectInfo={data} />
        {/* <Card>
          <CardHeader>
            <CardTitle>Login History For {getObjectName(data)} </CardTitle>
          </CardHeader>
          <CardContent>
           
          </CardContent>
        </Card> */}
      </TabsContent>

      <TabsContent value="triggers">
        Triggers List
        <div className="w-96 h-svh overflow-auto">
          <TriggerData objectInfo={data} />
        </div>
      </TabsContent>
      <TabsContent value="relationships">
        <ObjectRelationships objectInfo={data} />
      </TabsContent>

      <TabsContent value="template">
        {data.Body ? (
          <div className="p-5 m-5 shadow-xl bg-secondary rounded-md">
            {data.Body}
          </div>
        ) : (
          <div
            className="p-5 m-5 shadow-xl bg-secondary rounded-md"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(data.HtmlValue),
            }}
          ></div>
        )}
      </TabsContent>
      <TabsContent value="reportDetails">
        <ReportMetaData objectInfo={data} />
      </TabsContent>
      <TabsContent value="conversion">
        <ObjectConversion objectInfo={data} />
      </TabsContent>
      <TabsContent value="fields">
        <ObjectFields objectInfo={data} />
      </TabsContent>
      <TabsContent value="history">
        <ObjectHistory objectInfo={data} />
      </TabsContent>
    </Tabs>
  );
}

export default ObjectDetails;
