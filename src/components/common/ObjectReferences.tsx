// @ts-nocheck
"use client";
import { getDependency, getUsage } from "@/lib/Salesforce";
import { useEffect, useState, useCallback } from "react";

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

import ObjectNode from "../nodeTypes/ObjectNode";

import dagre from "dagre"; // Require to arrange nodes by determining position of the nodes
import {
  Download,
  FileImage,
  LayoutGrid,
  Loader,
  TableProperties,
} from "lucide-react";
import { getObjectName } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Button } from "../ui/button";
import { MetaDataRecord } from "@/types/Common.types";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const nodeTypes = { defaultNode: ObjectNode, default: ObjectNode };

type Props = {
  objectInfo: any;
  type?: "Dependency" | "Usage";
};
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 20;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { layoutNodes: nodes, layoutEdges: edges };
};

function ObjectReferences({ objectInfo, type = "Dependency" }: Props) {
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
        const result =
          type === "Dependency"
            ? await getDependency(objectInfo.Id)
            : await getUsage(objectInfo.Id);

        console.log(
          "ObjectReferences: getDataFromServer:",
          result,
          result.result.length
        );

        setData(result.result[0]);

        // if there are no dependencies, then add the node anyways
        if (result.result?.length == 0) {
          result.nodes.push({
            id: objectInfo.Id,
            // type: objectInfo.attributes?.type,
            name: getObjectName(objectInfo),
            data: {
              id: objectInfo.Id,
              label: getObjectName(objectInfo),
              type: objectInfo.attributes?.type,
            },
            position: { x: 0, y: 0 },
          });
        }
        // console.log("result from getDependenciesFromServer", result);
        const { layoutNodes, layoutEdges } = getLayoutedElements(
          result.nodes,
          result.edges,
          "TB"
        );
        setNodes([...layoutNodes]);
        setEdges([...layoutEdges]);
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

    a.setAttribute("download", type + ".png");
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
      XLSX.utils.book_append_sheet(workbook, worksheet, type);
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const dataBlob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(dataBlob, type + ".xlsx");
    }
  };

  // const onConnect = useCallback((connection) =>
  //   setEdges((eds) => addEdge(connection, eds))
  // );

  return (
    // <div style={{ width: "calc(100vw-250px)", height: "calc(100vh-50px)" }}>
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
              fitViewOptions={fitViewOptions}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
            />
          ) : (
            <div className="flex justify-center">
              <div className="">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        Component Name
                      </TableHead>
                      <TableHead className="w-[200px]">
                        Component Type
                      </TableHead>
                      <TableHead className="w-[200px]">
                        Ref. Component Name
                      </TableHead>
                      <TableHead className="w-[200px]">
                        Ref. Component Type
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data &&
                      data?.map((Item: MetaDataRecord, ItemIndex: number) => {
                        return (
                          <TableRow
                            key={ItemIndex}
                            className=" hover: bg-secondary"
                          >
                            <TableCell className="font-medium">
                              {Item.MetadataComponentName}
                            </TableCell>
                            <TableCell className="font-medium">
                              {Item.MetadataComponentType}
                            </TableCell>
                            <TableCell className="font-medium">
                              {Item.RefMetadataComponentName}
                            </TableCell>
                            <TableCell className="font-medium">
                              {Item.RefMetadataComponentType}
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

export default ObjectReferences;
