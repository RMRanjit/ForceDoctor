// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import ReactFlow, {
  addEdge,
  FitViewOptions,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  DefaultEdgeOptions,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Position,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
// import "reactflow/dist/style.css";
import "reactflow/dist/base.css";
import { toPng } from "html-to-image";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getObjectRelationships } from "@/lib/Salesforce";
import {
  Download,
  FileImage,
  LayoutGrid,
  Loader,
  TableProperties,
} from "lucide-react";
import FieldNode from "../nodeTypes/FieldNode";
import { getObjectName } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Button } from "../ui/button";

type Props = {
  objectInfo: any;
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
const nodeWidth = 250;
const nodeHeight = 20;

const nodeTypes = { Field: FieldNode };

// dagreGraph.setDefaultEdgeLabel(() => ({}));

// const getLayoutedElements = (
//   nodes: Node[],
//   edges: Edge[],
//   direction = "TB"
// ) => {
//   const isHorizontal = direction === "LR";
//   dagreGraph.setGraph({ rankdir: direction });

//   nodes.forEach((node) => {
//     dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
//   });

//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   dagre.layout(dagreGraph);

//   nodes.forEach((node) => {
//     const nodeWithPosition = dagreGraph.node(node.id);
//     node.targetPosition = isHorizontal ? Position.Left : Position.Top;
//     node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

//     // We are shifting the dagre node position (anchor=center center) to the top left
//     // so it matches the React Flow node anchor point (top left).
//     node.position = {
//       x: nodeWithPosition.x - nodeWidth / 2,
//       y: nodeWithPosition.y - nodeHeight / 2,
//     };

//     return node;
//   });

//   return { layoutNodes: nodes, layoutEdges: edges };
// };

function ObjectRelationships({ objectInfo }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [data, setData] = useState<any | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDisplayType, setSelectedDisplayType] = useState<
    "Image" | "Table"
  >("Image");

  useEffect(() => {
    async function getDataFromServer() {
      setIsLoading(true);
      setNodes([]);
      setEdges([]);
      try {
        const result = await getObjectRelationships(objectInfo);

        //console.log("ObjectRelationships: getDataFromServer:", result);
        setData(result?.result);
        setNodes(result.nodes);
        setEdges(result.edges);
      } catch (error) {
        setNodes([]);
        setEdges([]);
      } finally {
        setIsLoading(false);
      }
    }

    getDataFromServer();
  }, [objectInfo]);

  function downloadImage(dataUrl) {
    const a = document.createElement("a");

    a.setAttribute("download", "Relationship.png");
    a.setAttribute("href", dataUrl);
    a.click();
  }

  const onDownload = () => {
    const IMAGE_WIDTH = 768;
    const IMAGE_HEIGHT = 1024;
    if (selectedDisplayType == "Image") {
      // const { getNodes } = useReactFlow();
      const nodesBounds = getRectOfNodes(nodes);
      const transform = getTransformForBounds(
        nodesBounds,
        IMAGE_HEIGHT,
        IMAGE_WIDTH,
        0.5,
        2,
        0
      );
      // get the ViewPort of react flow

      const reactViewPort = document.querySelector(
        ".react-flow__viewport"
      )! as HTMLElement;

      if (reactViewPort)
        toPng(reactViewPort, {
          // backgroundColor: "#1a365d",
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
          style: {
            width: IMAGE_WIDTH.toString(),
            height: IMAGE_HEIGHT.toString(),
            transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
          },
        }).then(downloadImage);
    } else {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "relationships");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const dataBlob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(dataBlob, "ObjectRelationships.xlsx");
    }
  };

  return (
    <div style={{ width: "70vw", height: "70vh" }}>
      {isLoading ? (
        <Loader className="flex items-center justify-center animate-spin duration-1000 h-12 w-12" />
      ) : (
        <>
          <div className="flex flex-row justify-end pb-2">
            <ToggleGroup
              type="single"
              defaultValue={selectedDisplayType}
              value={selectedDisplayType}
              onValueChange={(value) => {
                if (value) setSelectedDisplayType(value);
              }}
            >
              <ToggleGroupItem value="Image">
                <FileImage />
              </ToggleGroupItem>
              <ToggleGroupItem value="Table">
                <TableProperties />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button variant="ghost" onClick={onDownload}>
              <Download />
            </Button>
          </div>
          {selectedDisplayType === "Image" ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              // onConnect={onConnect}
              fitView
              //   fitViewOptions={fitViewOptions}
              nodeTypes={nodeTypes}
              //   defaultEdgeOptions={defaultEdgeOptions}
            />
          ) : (
            <div className="flex justify-center">
              <div className="">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Field Name</TableHead>
                      <TableHead className="w-[200px]">Label</TableHead>
                      <TableHead className="w-[200px]">
                        Relationship Name
                      </TableHead>
                      <TableHead className="w-[200px]">Reference To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data &&
                      data?.map((Item: any, ItemIndex: number) => {
                        return (
                          <TableRow
                            key={ItemIndex}
                            className=" hover: bg-secondary"
                          >
                            <TableCell className="font-medium">
                              {Item.DeveloperName}
                            </TableCell>
                            <TableCell className="font-medium">
                              {Item.Label}
                            </TableCell>
                            <TableCell className="font-medium">
                              {Item.RelationshipName}
                            </TableCell>
                            <TableCell className="font-medium">
                              {Item.ReferenceTargetField || Item.referenceTo}
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
      )}
    </div>
  );
}

export default ObjectRelationships;
