"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ObjectList from "@/components/common/ObjectList";
import ObjectDetails from "@/components/common/ObjectDetails";

import { Suspense, useState } from "react";

function TopicPage({ params }: { params: { topic?: string[] } }) {
  const [topic, setTopic] = useState<string>();
  const [object, setObject] = useState<any>(undefined);
  const [isLoading, setLoading] = useState<boolean>(false);

  function selectObject(selectedObject: any) {
    if(selectedObject.attributes){
    if (!selectedObject.id) {
      switch (selectedObject.attributes.type) {
        case "ApexPageInfo":
          selectedObject.Id = selectedObject.ApexPageId;
          break;

        default:
          const urlParts = selectedObject.attributes.url.split("/");
          selectedObject.Id = urlParts[urlParts.length - 1];
      }
    }
  }
    setObject(selectedObject);
  }

  function selectTopic(selectedTopic: string) {
    setTopic(selectedTopic);
    setObject(undefined); //reset the selected Object, once the topic changes, so that the details are not retained
  }

  function changeLoading(loading: boolean) {
    setLoading(loading);
  }
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-screen w-screen rounded-lg border-0"
    >
      {/* <div className="flex flex-row"> 
        <div className="h-[50px]">*/}
      <ResizablePanel defaultSize={14}>
        <ObjectList
          objectType={
            params.topic && params.topic?.length > 0
              ? params.topic[0]
              : undefined
          }
          onSelect={(selectedObject: any) => selectObject(selectedObject)}
          onTopicSelect={(selectedTopic: string) => selectTopic(selectedTopic)}
          onLoading={(isLoading: boolean) => changeLoading(isLoading)}
        />
      </ResizablePanel>
      {/* </div> */}
      <ResizableHandle />
      <ResizablePanel defaultSize={86}>
        {object ? (
          <ObjectDetails data={object} />
        ) : (
          topic &&
          isLoading === false && (
            <span className="text-sm px-5 text-destructive">
              Please select an Object
            </span>
          )
        )}
      </ResizablePanel>
      {/* </div> */}
    </ResizablePanelGroup>
  );
}

export default TopicPage;
